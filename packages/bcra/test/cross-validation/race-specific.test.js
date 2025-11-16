/**
 * Cross-Validation Tests: Race-Specific Models
 *
 * Validates that the JavaScript implementation produces identical results to the R package
 * across all 11 race/ethnicity groups with race-specific beta coefficients and recoding rules.
 *
 * Test Coverage:
 * - All 11 race codes (White, African-American, Hispanic US/Foreign, Asian subgroups, Other)
 * - Race-specific recoding verification (e.g., African-American AgeMen grouping)
 * - High-risk, low-risk, and typical risk profiles per race
 * - Nulliparous, unknown values, and mixed scenarios
 *
 * Tolerance: ±0.01% for absolute risk, ±0.001 for relative risk
 */

import { describe, it, expect } from 'vitest';
import { calculateRisk } from '../../src/index.js';
import {
  rToJsInput,
  compareResults,
  formatComparisonReport,
  makeTestName,
  groupBy,
  TOLERANCE,
} from '../utils/comparison-helpers.js';

// Load R reference data
import raceReferenceData from '../fixtures/r-reference/race-specific.json';

describe('Cross-Validation: Race-Specific Models', () => {
  describe('All races: Basic validation', () => {
    it('should have 110 race-specific test cases', () => {
      expect(raceReferenceData).toHaveLength(110);
    });

    it('should cover all 11 race codes', () => {
      const races = new Set(raceReferenceData.map((r) => r.Race));
      expect(races.size).toBe(11);
      for (let race = 1; race <= 11; race++) {
        expect(races.has(race)).toBe(true);
      }
    });

    it('should have 10 test cases per race', () => {
      const byRace = groupBy(raceReferenceData, 'Race');
      Object.keys(byRace).forEach((race) => {
        expect(byRace[race]).toHaveLength(10);
      });
    });
  });

  describe('Race-by-race comparison', () => {
    // Group test cases by race for organized testing
    const byRace = groupBy(raceReferenceData, 'Race');

    Object.entries(byRace).forEach(([raceCode, testCases]) => {
      describe(`Race ${raceCode}: ${testCases[0]?.Race_label || 'Unknown'}`, () => {
        testCases.forEach((rCase) => {
          it(makeTestName(rCase), () => {
            // Convert R input to JS format
            const jsInput = rToJsInput(rCase);

            // Calculate risk with JS implementation
            const jsResult = calculateRisk(jsInput);

            // Compare with R reference
            const comparison = compareResults(jsResult, rCase);

            // Assert comparison passed
            if (!comparison.pass) {
              console.error(formatComparisonReport(comparison));
            }

            expect(comparison.pass).toBe(true);

            // Additional assertions for valid cases
            if (rCase.Error_Ind === 0) {
              expect(jsResult.success).toBe(true);
              expect(jsResult.validation.isValid).toBe(true);

              // Check absolute risk is within tolerance
              expect(Math.abs(jsResult.absoluteRisk - rCase.AbsRisk)).toBeLessThanOrEqual(
                TOLERANCE.ABSOLUTE_RISK
              );

              // Check relative risks are within tolerance
              expect(Math.abs(jsResult.relativeRiskUnder50 - rCase.RR_Star1)).toBeLessThanOrEqual(
                TOLERANCE.RELATIVE_RISK
              );
              expect(Math.abs(jsResult.relativeRiskAtOrAbove50 - rCase.RR_Star2)).toBeLessThanOrEqual(
                TOLERANCE.RELATIVE_RISK
              );

              // Check pattern number matches exactly
              expect(jsResult.patternNumber).toBe(rCase.PatternNumber);
            }
          });
        });
      });
    });
  });

  describe('Race-specific recoding rules', () => {
    describe('Race 2 (African-American)', () => {
      const africanAmericanCases = raceReferenceData.filter((r) => r.Race === 2);

      it('should eliminate age at first birth from model (AF_Cat always 0)', () => {
        africanAmericanCases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          if (jsResult.success && jsResult.recodedValues) {
            expect(jsResult.recodedValues.firstBirthCategory).toBe(0);
            expect(rCase.AF_Cat).toBe('0');
          }
        });
      });

      it('should group menarche category 2 with category 1', () => {
        // Find cases where raw menarche would be category 2 (age < 12)
        const earlyMenarcheCases = africanAmericanCases.filter(
          (r) => r.AgeMen !== 99 && r.AgeMen < 12
        );

        earlyMenarcheCases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          if (jsResult.success && jsResult.recodedValues) {
            // Should be grouped to category 1, not 2
            expect(jsResult.recodedValues.menarcheCategory).toBeLessThanOrEqual(1);
            expect(['0', '1']).toContain(rCase.AM_Cat);
          }
        });
      });
    });

    describe('Race 3 (Hispanic US Born)', () => {
      const hispanicUSCases = raceReferenceData.filter((r) => r.Race === 3);

      it('should eliminate age at menarche from model (AM_Cat always 0)', () => {
        hispanicUSCases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          if (jsResult.success && jsResult.recodedValues) {
            expect(jsResult.recodedValues.menarcheCategory).toBe(0);
            expect(rCase.AM_Cat).toBe('0');
          }
        });
      });

      it('should use special groupings for first birth', () => {
        // Age 25-29 should be grouped with 20-24 (category 1)
        const age25to29Cases = hispanicUSCases.filter(
          (r) => r.Age1st >= 25 && r.Age1st < 30
        );

        age25to29Cases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          if (jsResult.success && jsResult.recodedValues) {
            expect(jsResult.recodedValues.firstBirthCategory).toBe(1);
            expect(rCase.AF_Cat).toBe('1');
          }
        });
      });

      it('should group biopsies 2+ as category 1', () => {
        const multipleBiopsyCases = hispanicUSCases.filter(
          (r) => r.N_Biop >= 2 && r.N_Biop < 99
        );

        multipleBiopsyCases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          if (jsResult.success && jsResult.recodedValues) {
            expect(jsResult.recodedValues.biopsyCategory).toBe(1);
            expect(rCase.NB_Cat).toBe('1');
          }
        });
      });

      it('should group relatives 2+ as category 1', () => {
        const multipleRelativesCases = hispanicUSCases.filter(
          (r) => r.N_Rels >= 2 && r.N_Rels < 99
        );

        multipleRelativesCases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          if (jsResult.success && jsResult.recodedValues) {
            expect(jsResult.recodedValues.relativesCategory).toBe(1);
            expect(rCase.NR_Cat).toBe('1');
          }
        });
      });
    });

    describe('Race 5 (Hispanic Foreign Born)', () => {
      const hispanicForeignCases = raceReferenceData.filter((r) => r.Race === 5);

      it('should use different groupings than Hispanic US Born', () => {
        hispanicForeignCases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          // Compare recoding with Hispanic US Born equivalent
          if (jsResult.success && jsResult.recodedValues) {
            // Verify recoded values match R reference
            expect(jsResult.recodedValues.biopsyCategory.toString()).toBe(rCase.NB_Cat);
            expect(jsResult.recodedValues.menarcheCategory.toString()).toBe(rCase.AM_Cat);
            expect(jsResult.recodedValues.firstBirthCategory.toString()).toBe(rCase.AF_Cat);
            expect(jsResult.recodedValues.relativesCategory.toString()).toBe(rCase.NR_Cat);
          }
        });
      });
    });

    describe('Races 6-11 (Asian/Pacific Islander)', () => {
      const asianCases = raceReferenceData.filter((r) => r.Race >= 6 && r.Race <= 11);

      it('should group relatives category 2 with category 1', () => {
        const multipleRelativesCases = asianCases.filter(
          (r) => r.N_Rels >= 2 && r.N_Rels < 99
        );

        multipleRelativesCases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          if (jsResult.success && jsResult.recodedValues) {
            // Should be grouped to category 1, not 2
            expect(jsResult.recodedValues.relativesCategory).toBe(1);
            expect(rCase.NR_Cat).toBe('1');
          }
        });
      });

      it('should use same beta coefficients across all Asian races', () => {
        const asianRisks = {};

        asianCases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          if (jsResult.success) {
            const key = `${rCase.Description}`;
            if (!asianRisks[key]) {
              asianRisks[key] = [];
            }
            asianRisks[key].push({
              race: rCase.Race,
              rr1: jsResult.relativeRiskUnder50,
              rr2: jsResult.relativeRiskAtOrAbove50,
            });
          }
        });

        // For identical inputs, RR should be identical across Asian races
        Object.entries(asianRisks).forEach(([desc, risks]) => {
          if (risks.length > 1) {
            const firstRR1 = risks[0].rr1;
            const firstRR2 = risks[0].rr2;

            risks.forEach((risk) => {
              expect(Math.abs(risk.rr1 - firstRR1)).toBeLessThan(0.00001);
              expect(Math.abs(risk.rr2 - firstRR2)).toBeLessThan(0.00001);
            });
          }
        });
      });
    });
  });

  describe('High-risk profiles across races', () => {
    const highRiskCases = raceReferenceData.filter((r) =>
      r.Description.toLowerCase().includes('high risk')
    );

    it('should have high-risk cases for all 11 races', () => {
      expect(highRiskCases).toHaveLength(11);
    });

    it('should produce elevated absolute risks for high-risk profiles', () => {
      highRiskCases.forEach((rCase) => {
        if (rCase.Error_Ind === 0) {
          // High risk profiles should generally have >2% absolute risk
          expect(rCase.AbsRisk).toBeGreaterThan(1.5);

          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          expect(jsResult.success).toBe(true);
          expect(jsResult.absoluteRisk).toBeGreaterThan(1.5);
        }
      });
    });
  });

  describe('Low-risk profiles across races', () => {
    const lowRiskCases = raceReferenceData.filter((r) =>
      r.Description.toLowerCase().includes('low risk')
    );

    it('should have low-risk cases for all 11 races', () => {
      expect(lowRiskCases).toHaveLength(11);
    });

    it('should produce lower absolute risks for low-risk profiles', () => {
      lowRiskCases.forEach((rCase) => {
        if (rCase.Error_Ind === 0) {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          expect(jsResult.success).toBe(true);

          // Low risk should be lower than high risk for same race
          const highRiskCase = raceReferenceData.find(
            (r) =>
              r.Race === rCase.Race &&
              r.Description.toLowerCase().includes('high risk') &&
              r.Error_Ind === 0
          );

          if (highRiskCase) {
            expect(jsResult.absoluteRisk).toBeLessThan(highRiskCase.AbsRisk);
          }
        }
      });
    });
  });

  describe('Unknown values handling across races', () => {
    const unknownCases = raceReferenceData.filter((r) =>
      r.Description.toLowerCase().includes('unknown')
    );

    it('should handle unknown values correctly for all races', () => {
      unknownCases.forEach((rCase) => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);

        const comparison = compareResults(jsResult, rCase);
        expect(comparison.pass).toBe(true);
      });
    });
  });

  describe('Nulliparous women across races', () => {
    const nulliparousCases = raceReferenceData.filter((r) =>
      r.Description.toLowerCase().includes('nulliparous')
    );

    it('should handle nulliparous status correctly for all races', () => {
      nulliparousCases.forEach((rCase) => {
        expect(rCase.Age1st).toBe(98);

        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);

        const comparison = compareResults(jsResult, rCase);
        expect(comparison.pass).toBe(true);

        // Verify recoded value is appropriate for nulliparous
        if (jsResult.success && jsResult.recodedValues && rCase.Race !== 2 && rCase.Race !== 3) {
          // For non-African-American and non-Hispanic US Born
          expect(jsResult.recodedValues.firstBirthCategory).toBeGreaterThanOrEqual(2);
        }
      });
    });
  });

  describe('Comprehensive validation', () => {
    it('should match R results for all 110 race-specific test cases', () => {
      let passed = 0;
      let failed = 0;
      const failures = [];

      raceReferenceData.forEach((rCase) => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);
        const comparison = compareResults(jsResult, rCase);

        if (comparison.pass) {
          passed++;
        } else {
          failed++;
          failures.push({
            id: rCase.ID,
            description: rCase.Description,
            comparison,
          });
        }
      });

      console.log(`\nRace-Specific Cross-Validation Summary:`);
      console.log(`  Total: ${raceReferenceData.length}`);
      console.log(`  Passed: ${passed} (${((passed / raceReferenceData.length) * 100).toFixed(1)}%)`);
      console.log(`  Failed: ${failed}`);

      if (failures.length > 0) {
        console.log(`\nFailures:`);
        failures.forEach((f, i) => {
          console.log(`  ${i + 1}. ID ${f.id}: ${f.description}`);
          console.log(formatComparisonReport(f.comparison));
        });
      }

      expect(failed).toBe(0);
      expect(passed).toBe(raceReferenceData.length);
    });
  });
});
