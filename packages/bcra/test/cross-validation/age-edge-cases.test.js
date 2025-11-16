/**
 * Cross-Validation Tests: Age Edge Cases
 *
 * Validates correct numerical integration and age-dependent logic across edge cases:
 * - Minimum/maximum ages (20, 90)
 * - Age 50 threshold (different RR before/after)
 * - Fractional ages and partial intervals
 * - Single-year vs multi-year projections
 *
 * This is critical because:
 * 1. Relative risk changes at age 50 (adds interaction term)
 * 2. Numerical integration uses 1-year intervals
 * 3. Fractional ages require partial interval calculations
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
  filterByValidation,
  TOLERANCE,
} from '../utils/comparison-helpers.js';

// Load R reference data
import ageReferenceData from '../fixtures/r-reference/age-edge-cases.json';

describe('Cross-Validation: Age Edge Cases', () => {
  // Separate valid and error cases
  const validCases = filterByValidation(ageReferenceData, true);
  const errorCases = filterByValidation(ageReferenceData, false);

  describe('Test data validation', () => {
    it('should have age edge case test data', () => {
      expect(ageReferenceData.length).toBeGreaterThan(0);
    });

    it('should have both valid and error cases', () => {
      expect(validCases.length).toBeGreaterThan(0);
      expect(errorCases.length).toBeGreaterThan(0);
    });

    it('should cover minimum age (20.0)', () => {
      const minAgeCases = ageReferenceData.filter((r) => r.T1 === 20.0);
      expect(minAgeCases.length).toBeGreaterThan(0);
    });

    it('should cover age threshold (49.9, 50.0, 50.1)', () => {
      const thresholdCases = ageReferenceData.filter(
        (r) => r.T1 === 49.9 || r.T1 === 50.0 || r.T1 === 50.1
      );
      expect(thresholdCases.length).toBeGreaterThanOrEqual(3);
    });

    it('should cover near maximum age (89.9)', () => {
      const nearMaxCases = ageReferenceData.filter((r) => r.T1 === 89.9 || r.T2 === 90.0);
      expect(nearMaxCases.length).toBeGreaterThan(0);
    });

    it('should cover fractional ages', () => {
      const fractionalCases = ageReferenceData.filter(
        (r) => r.T1 % 1 !== 0 || r.T2 % 1 !== 0
      );
      expect(fractionalCases.length).toBeGreaterThan(0);
    });
  });

  describe('Minimum age boundary (20.0)', () => {
    const minAgeCases = validCases.filter((r) => r.T1 === 20.0);

    minAgeCases.forEach((rCase) => {
      it(makeTestName(rCase), () => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);
        const comparison = compareResults(jsResult, rCase);

        if (!comparison.pass) {
          console.error(formatComparisonReport(comparison));
        }

        expect(comparison.pass).toBe(true);
        expect(jsResult.success).toBe(true);
      });
    });
  });

  describe('Age 50 threshold behavior', () => {
    describe('Just before threshold (49.9)', () => {
      const beforeThresholdCases = validCases.filter((r) => r.T1 === 49.9);

      beforeThresholdCases.forEach((rCase) => {
        it(makeTestName(rCase), () => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);
          const comparison = compareResults(jsResult, rCase);

          expect(comparison.pass).toBe(true);

          // Verify projection uses both RR values (crosses threshold)
          expect(jsResult.relativeRiskUnder50).not.toBeNull();
          expect(jsResult.relativeRiskAtOrAbove50).not.toBeNull();
        });
      });
    });

    describe('Exactly at threshold (50.0)', () => {
      const atThresholdCases = validCases.filter((r) => r.T1 === 50.0);

      atThresholdCases.forEach((rCase) => {
        it(makeTestName(rCase), () => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);
          const comparison = compareResults(jsResult, rCase);

          expect(comparison.pass).toBe(true);

          // Starting exactly at 50 should use RR_Star2
          expect(jsResult.relativeRiskAtOrAbove50).not.toBeNull();
        });
      });
    });

    describe('Just after threshold (50.1)', () => {
      const afterThresholdCases = validCases.filter((r) => r.T1 === 50.1);

      afterThresholdCases.forEach((rCase) => {
        it(makeTestName(rCase), () => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);
          const comparison = compareResults(jsResult, rCase);

          expect(comparison.pass).toBe(true);
        });
      });
    });

    describe('Crossing threshold comparison', () => {
      it('should calculate both RR values for cases crossing threshold', () => {
        // Find cases crossing the threshold
        const crossingCases = validCases.filter((r) => r.T1 < 50 && r.T2 > 50);

        crossingCases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          if (jsResult.success) {
            // Both RR values should be calculated
            expect(jsResult.relativeRiskUnder50).not.toBeNull();
            expect(jsResult.relativeRiskAtOrAbove50).not.toBeNull();

            // RR_Star2 = RR_Star1 + (biopsy category * interaction coefficient)
            // So they may be different if biopsy category > 0 and interaction ≠ 0
            const rrDiff = Math.abs(jsResult.relativeRiskUnder50 - jsResult.relativeRiskAtOrAbove50);

            // Verify matches R reference
            const rDiff = Math.abs(rCase.RR_Star1 - rCase.RR_Star2);
            expect(Math.abs(rrDiff - rDiff)).toBeLessThan(0.001);
          }
        });
      });
    });
  });

  describe('Maximum age boundary (89.9, 90.0)', () => {
    const nearMaxCases = validCases.filter((r) => r.T1 >= 89 || r.T2 === 90);

    nearMaxCases.forEach((rCase) => {
      it(makeTestName(rCase), () => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);
        const comparison = compareResults(jsResult, rCase);

        if (!comparison.pass) {
          console.error(formatComparisonReport(comparison));
        }

        expect(comparison.pass).toBe(true);
        expect(jsResult.success).toBe(true);
      });
    });

    it('should reject T2 > 90', () => {
      const invalidCases = errorCases.filter((r) => r.T2 > 90);

      invalidCases.forEach((rCase) => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);

        // Should fail validation
        expect(jsResult.success).toBe(false);
        expect(jsResult.validation.isValid).toBe(false);

        // Should match R error indicator
        expect(rCase.Error_Ind).toBe(1);
      });
    });
  });

  describe('Fractional ages and partial intervals', () => {
    const fractionalCases = validCases.filter((r) => r.T1 % 1 !== 0 || r.T2 % 1 !== 0);

    fractionalCases.forEach((rCase) => {
      it(makeTestName(rCase), () => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);
        const comparison = compareResults(jsResult, rCase);

        if (!comparison.pass) {
          console.error(formatComparisonReport(comparison));
        }

        expect(comparison.pass).toBe(true);

        // Additional check: fractional ages should have absolute risk
        if (rCase.Error_Ind === 0) {
          expect(jsResult.absoluteRisk).toBeGreaterThan(0);
          expect(Math.abs(jsResult.absoluteRisk - rCase.AbsRisk)).toBeLessThanOrEqual(
            TOLERANCE.ABSOLUTE_RISK
          );
        }
      });
    });

    describe('Crossing threshold with fractional ages', () => {
      const crossingFractionalCases = fractionalCases.filter((r) => r.T1 < 50 && r.T2 > 50);

      it('should handle fractional ages crossing age 50 threshold', () => {
        crossingFractionalCases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          expect(jsResult.success).toBe(true);

          const comparison = compareResults(jsResult, rCase);
          expect(comparison.pass).toBe(true);
        });
      });
    });

    describe('Partial intervals at boundaries', () => {
      it('should correctly calculate risk for partial first interval', () => {
        // Cases like 45.5 → 50.5 (first interval is 0.5 years)
        const partialFirstCases = fractionalCases.filter((r) => r.T1 % 1 !== 0);

        partialFirstCases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          const comparison = compareResults(jsResult, rCase);
          expect(comparison.pass).toBe(true);
        });
      });

      it('should correctly calculate risk for partial last interval', () => {
        // Cases where T2 is fractional (last interval is partial)
        const partialLastCases = fractionalCases.filter((r) => r.T2 % 1 !== 0);

        partialLastCases.forEach((rCase) => {
          const jsInput = rToJsInput(rCase);
          const jsResult = calculateRisk(jsInput);

          const comparison = compareResults(jsResult, rCase);
          expect(comparison.pass).toBe(true);
        });
      });
    });
  });

  describe('Single year intervals', () => {
    const singleYearCases = validCases.filter((r) => {
      const interval = r.T2 - r.T1;
      return interval >= 0.9 && interval <= 1.1; // Allow for floating point
    });

    singleYearCases.forEach((rCase) => {
      it(makeTestName(rCase), () => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);
        const comparison = compareResults(jsResult, rCase);

        expect(comparison.pass).toBe(true);

        // Single year intervals should have lower absolute risk than longer intervals
        expect(jsResult.absoluteRisk).toBeLessThan(10); // Reasonable upper bound
      });
    });
  });

  describe('Long projection intervals', () => {
    const longIntervalCases = validCases.filter((r) => r.T2 - r.T1 > 20);

    longIntervalCases.forEach((rCase) => {
      it(makeTestName(rCase), () => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);
        const comparison = compareResults(jsResult, rCase);

        if (!comparison.pass) {
          console.error(formatComparisonReport(comparison));
        }

        expect(comparison.pass).toBe(true);

        // Long intervals should have higher absolute risk
        if (rCase.Error_Ind === 0) {
          expect(jsResult.absoluteRisk).toBeGreaterThan(1);
        }
      });
    });

    it('should handle lifetime risk projections (20 → 89.9)', () => {
      const lifetimeCases = validCases.filter((r) => r.T1 === 20 && r.T2 >= 89);

      lifetimeCases.forEach((rCase) => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);

        const comparison = compareResults(jsResult, rCase);
        expect(comparison.pass).toBe(true);

        // Lifetime risk should be substantial
        if (rCase.Error_Ind === 0) {
          expect(jsResult.absoluteRisk).toBeGreaterThan(5);
        }
      });
    });
  });

  describe('Age validation errors', () => {
    it('should reject initialAge < 20', () => {
      const tooYoungCases = errorCases.filter((r) => r.T1 < 20);

      tooYoungCases.forEach((rCase) => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);

        expect(jsResult.success).toBe(false);
        expect(jsResult.validation.isValid).toBe(false);
        expect(rCase.Error_Ind).toBe(1);

        // Should have age-related error message
        expect(
          jsResult.validation.errors.some((e) =>
            e.toLowerCase().includes('age')
          )
        ).toBe(true);
      });
    });

    it('should reject T2 <= T1', () => {
      const invalidIntervalCases = errorCases.filter((r) => r.T2 <= r.T1);

      invalidIntervalCases.forEach((rCase) => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);

        expect(jsResult.success).toBe(false);
        expect(jsResult.validation.isValid).toBe(false);
        expect(rCase.Error_Ind).toBe(1);
      });
    });
  });

  describe('Fractional ages across races', () => {
    const fractionalMultiRaceCases = validCases.filter(
      (r) => (r.T1 % 1 !== 0 || r.T2 % 1 !== 0) && r.Race !== 1
    );

    it('should handle fractional ages correctly for non-White races', () => {
      fractionalMultiRaceCases.forEach((rCase) => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);
        const comparison = compareResults(jsResult, rCase);

        expect(comparison.pass).toBe(true);
      });
    });
  });

  describe('Comprehensive age validation', () => {
    it('should match R results for all age edge cases', () => {
      let passed = 0;
      let failed = 0;
      const failures = [];

      validCases.forEach((rCase) => {
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
            t1: rCase.T1,
            t2: rCase.T2,
            comparison,
          });
        }
      });

      console.log(`\nAge Edge Cases Cross-Validation Summary:`);
      console.log(`  Total valid cases: ${validCases.length}`);
      console.log(`  Passed: ${passed} (${((passed / validCases.length) * 100).toFixed(1)}%)`);
      console.log(`  Failed: ${failed}`);

      if (failures.length > 0) {
        console.log(`\nFailures:`);
        failures.forEach((f, i) => {
          console.log(`  ${i + 1}. ID ${f.id} (${f.t1}→${f.t2}): ${f.description}`);
          console.log(formatComparisonReport(f.comparison));
        });
      }

      expect(failed).toBe(0);
      expect(passed).toBe(validCases.length);
    });

    it('should correctly identify all validation errors', () => {
      let errorMatches = 0;
      let errorMismatches = 0;

      errorCases.forEach((rCase) => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);

        const jsIsError = !jsResult.success || !jsResult.validation.isValid;
        const rIsError = rCase.Error_Ind === 1;

        if (jsIsError === rIsError) {
          errorMatches++;
        } else {
          errorMismatches++;
        }
      });

      console.log(`\nError Case Validation:`);
      console.log(`  Total error cases: ${errorCases.length}`);
      console.log(`  Matches: ${errorMatches}`);
      console.log(`  Mismatches: ${errorMismatches}`);

      expect(errorMismatches).toBe(0);
    });
  });
});
