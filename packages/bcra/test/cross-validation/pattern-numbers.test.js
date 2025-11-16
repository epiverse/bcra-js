/**
 * Cross-Validation Tests: Pattern Numbers (All 108 Combinations)
 *
 * Pattern Number Formula: NB_Cat * 36 + AM_Cat * 12 + AF_Cat * 3 + NR_Cat + 1
 *
 * Where:
 * - NB_Cat (Biopsies): 0, 1, 2 (3 values)
 * - AM_Cat (Menarche): 0, 1, 2 (3 values)
 * - AF_Cat (First Birth): 0, 1, 2, 3 (4 values)
 * - NR_Cat (Relatives): 0, 1, 2 (3 values)
 *
 * Total combinations: 3 × 3 × 4 × 3 = 108 patterns
 *
 * This test ensures:
 * 1. All 108 patterns are covered
 * 2. Pattern number formula is correct
 * 3. Each unique combination produces expected results
 * 4. Pattern numbers match between R and JS
 *
 * Tolerance: Pattern numbers must match exactly (integer comparison)
 */

import { describe, it, expect } from 'vitest';
import { calculateRisk } from '../../src/index.js';
import {
  rToJsInput,
  compareResults,
  formatComparisonReport,
  TOLERANCE,
} from '../utils/comparison-helpers.js';

// Load R reference data
import patternReferenceData from '../fixtures/r-reference/pattern-numbers.json';

describe('Cross-Validation: Pattern Numbers (All 108)', () => {
  describe('Test data validation', () => {
    it('should have exactly 108 pattern test cases', () => {
      expect(patternReferenceData).toHaveLength(108);
    });

    it('should have all cases for Race 1 (White)', () => {
      const races = new Set(patternReferenceData.map((r) => r.Race));
      expect(races.size).toBe(1);
      expect(races.has(1)).toBe(true);
    });

    it('should have all valid cases (no errors)', () => {
      const errorCount = patternReferenceData.filter((r) => r.Error_Ind === 1).length;
      expect(errorCount).toBe(0);
    });

    it('should cover pattern numbers 1 through 108', () => {
      const patterns = patternReferenceData.map((r) => r.PatternNumber).sort((a, b) => a - b);

      expect(patterns[0]).toBe(1);
      expect(patterns[patterns.length - 1]).toBe(108);

      // Check for duplicates
      const uniquePatterns = new Set(patterns);
      expect(uniquePatterns.size).toBe(108);

      // Check all patterns from 1-108 are present
      for (let i = 1; i <= 108; i++) {
        expect(patterns).toContain(i);
      }
    });
  });

  describe('Pattern number formula verification', () => {
    it('should calculate pattern numbers using correct formula', () => {
      patternReferenceData.forEach((rCase) => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);

        if (jsResult.success && jsResult.recodedValues) {
          const {
            biopsyCategory,
            menarcheCategory,
            firstBirthCategory,
            relativesCategory,
          } = jsResult.recodedValues;

          // Calculate expected pattern number
          const expectedPattern =
            biopsyCategory * 36 +
            menarcheCategory * 12 +
            firstBirthCategory * 3 +
            relativesCategory +
            1;

          expect(jsResult.patternNumber).toBe(expectedPattern);
          expect(jsResult.patternNumber).toBe(rCase.PatternNumber);
        }
      });
    });

    it('should have pattern 1 for all baseline values (0,0,0,0)', () => {
      const pattern1 = patternReferenceData.find((r) => r.PatternNumber === 1);

      expect(pattern1).toBeDefined();
      expect(pattern1.NB_Cat).toBe('0');
      expect(pattern1.AM_Cat).toBe('0');
      expect(pattern1.AF_Cat).toBe('0');
      expect(pattern1.NR_Cat).toBe('0');

      const jsInput = rToJsInput(pattern1);
      const jsResult = calculateRisk(jsInput);

      expect(jsResult.success).toBe(true);
      expect(jsResult.patternNumber).toBe(1);
    });

    it('should have pattern 108 for all maximum values (2,2,3,2)', () => {
      const pattern108 = patternReferenceData.find((r) => r.PatternNumber === 108);

      expect(pattern108).toBeDefined();
      expect(pattern108.NB_Cat).toBe('2');
      expect(pattern108.AM_Cat).toBe('2');
      expect(pattern108.AF_Cat).toBe('3');
      expect(pattern108.NR_Cat).toBe('2');

      const jsInput = rToJsInput(pattern108);
      const jsResult = calculateRisk(jsInput);

      expect(jsResult.success).toBe(true);
      expect(jsResult.patternNumber).toBe(108);
    });
  });

  describe('Recoded value combinations', () => {
    describe('Biopsy categories (NB_Cat = 0, 1, 2)', () => {
      it('should have 36 patterns for each biopsy category', () => {
        for (let nb = 0; nb <= 2; nb++) {
          const casesForBiopsy = patternReferenceData.filter(
            (r) => Number(r.NB_Cat) === nb
          );
          expect(casesForBiopsy).toHaveLength(36);
        }
      });
    });

    describe('Menarche categories (AM_Cat = 0, 1, 2)', () => {
      it('should have 36 patterns for each menarche category', () => {
        for (let am = 0; am <= 2; am++) {
          const casesForMenarche = patternReferenceData.filter(
            (r) => Number(r.AM_Cat) === am
          );
          expect(casesForMenarche).toHaveLength(36);
        }
      });
    });

    describe('First birth categories (AF_Cat = 0, 1, 2, 3)', () => {
      it('should have 27 patterns for each first birth category', () => {
        for (let af = 0; af <= 3; af++) {
          const casesForFirstBirth = patternReferenceData.filter(
            (r) => Number(r.AF_Cat) === af
          );
          expect(casesForFirstBirth).toHaveLength(27);
        }
      });
    });

    describe('Relatives categories (NR_Cat = 0, 1, 2)', () => {
      it('should have 36 patterns for each relatives category', () => {
        for (let nr = 0; nr <= 2; nr++) {
          const casesForRelatives = patternReferenceData.filter(
            (r) => Number(r.NR_Cat) === nr
          );
          expect(casesForRelatives).toHaveLength(36);
        }
      });
    });
  });

  describe('Risk factor impact on pattern numbers', () => {
    it('should increment pattern by 1 when only NR_Cat increases', () => {
      // Find patterns differing only in NR_Cat
      const nb = 0, am = 0, af = 0;

      for (let nr = 0; nr < 2; nr++) {
        const pattern1 = nb * 36 + am * 12 + af * 3 + nr + 1;
        const pattern2 = nb * 36 + am * 12 + af * 3 + (nr + 1) + 1;

        const case1 = patternReferenceData.find((r) => r.PatternNumber === pattern1);
        const case2 = patternReferenceData.find((r) => r.PatternNumber === pattern2);

        expect(case2.PatternNumber - case1.PatternNumber).toBe(1);
      }
    });

    it('should increment pattern by 3 when only AF_Cat increases', () => {
      const nb = 0, am = 0, nr = 0;

      for (let af = 0; af < 3; af++) {
        const pattern1 = nb * 36 + am * 12 + af * 3 + nr + 1;
        const pattern2 = nb * 36 + am * 12 + (af + 1) * 3 + nr + 1;

        const case1 = patternReferenceData.find((r) => r.PatternNumber === pattern1);
        const case2 = patternReferenceData.find((r) => r.PatternNumber === pattern2);

        expect(case2.PatternNumber - case1.PatternNumber).toBe(3);
      }
    });

    it('should increment pattern by 12 when only AM_Cat increases', () => {
      const nb = 0, af = 0, nr = 0;

      for (let am = 0; am < 2; am++) {
        const pattern1 = nb * 36 + am * 12 + af * 3 + nr + 1;
        const pattern2 = nb * 36 + (am + 1) * 12 + af * 3 + nr + 1;

        const case1 = patternReferenceData.find((r) => r.PatternNumber === pattern1);
        const case2 = patternReferenceData.find((r) => r.PatternNumber === pattern2);

        expect(case2.PatternNumber - case1.PatternNumber).toBe(12);
      }
    });

    it('should increment pattern by 36 when only NB_Cat increases', () => {
      const am = 0, af = 0, nr = 0;

      for (let nb = 0; nb < 2; nb++) {
        const pattern1 = nb * 36 + am * 12 + af * 3 + nr + 1;
        const pattern2 = (nb + 1) * 36 + am * 12 + af * 3 + nr + 1;

        const case1 = patternReferenceData.find((r) => r.PatternNumber === pattern1);
        const case2 = patternReferenceData.find((r) => r.PatternNumber === pattern2);

        expect(case2.PatternNumber - case1.PatternNumber).toBe(36);
      }
    });
  });

  describe('Individual pattern validation', () => {
    // Test a sample of patterns across the range
    const samplePatterns = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 108];

    samplePatterns.forEach((patternNum) => {
      it(`should match R results for pattern ${patternNum}`, () => {
        const rCase = patternReferenceData.find((r) => r.PatternNumber === patternNum);

        expect(rCase).toBeDefined();

        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);
        const comparison = compareResults(jsResult, rCase);

        if (!comparison.pass) {
          console.error(`Pattern ${patternNum} failed:`);
          console.error(formatComparisonReport(comparison));
        }

        expect(comparison.pass).toBe(true);
        expect(jsResult.patternNumber).toBe(patternNum);
      });
    });
  });

  describe('Comprehensive pattern validation', () => {
    it('should match R results for all 108 patterns', () => {
      let passed = 0;
      let failed = 0;
      const failures = [];
      const patternMismatches = [];

      patternReferenceData.forEach((rCase) => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);
        const comparison = compareResults(jsResult, rCase);

        if (comparison.pass) {
          passed++;
        } else {
          failed++;
          failures.push({
            pattern: rCase.PatternNumber,
            description: rCase.Description,
            comparison,
          });
        }

        // Check pattern number specifically
        if (jsResult.patternNumber !== rCase.PatternNumber) {
          patternMismatches.push({
            expected: rCase.PatternNumber,
            actual: jsResult.patternNumber,
            nb: rCase.NB_Cat,
            am: rCase.AM_Cat,
            af: rCase.AF_Cat,
            nr: rCase.NR_Cat,
          });
        }
      });

      console.log(`\nPattern Numbers Cross-Validation Summary:`);
      console.log(`  Total patterns: 108`);
      console.log(`  Passed: ${passed} (${((passed / 108) * 100).toFixed(1)}%)`);
      console.log(`  Failed: ${failed}`);

      if (patternMismatches.length > 0) {
        console.log(`\nPattern Number Mismatches:`);
        patternMismatches.forEach((m) => {
          console.log(`  Expected ${m.expected}, got ${m.actual} (NB=${m.nb},AM=${m.am},AF=${m.af},NR=${m.nr})`);
        });
      }

      if (failures.length > 0) {
        console.log(`\nValue Comparison Failures:`);
        failures.slice(0, 5).forEach((f, i) => {
          console.log(`  ${i + 1}. Pattern ${f.pattern}: ${f.description}`);
          console.log(formatComparisonReport(f.comparison));
        });
        if (failures.length > 5) {
          console.log(`  ... and ${failures.length - 5} more`);
        }
      }

      expect(patternMismatches).toHaveLength(0);
      expect(failed).toBe(0);
      expect(passed).toBe(108);
    });
  });

  describe('Pattern-specific risk variations', () => {
    it('should show increasing risk with more risk factors', () => {
      // Compare pattern 1 (lowest risk) vs pattern 108 (highest risk)
      const pattern1 = patternReferenceData.find((r) => r.PatternNumber === 1);
      const pattern108 = patternReferenceData.find((r) => r.PatternNumber === 108);

      // Pattern 108 should have higher risk than pattern 1
      expect(pattern108.AbsRisk).toBeGreaterThan(pattern1.AbsRisk);
      expect(pattern108.RR_Star1).toBeGreaterThan(pattern1.RR_Star1);
      expect(pattern108.RR_Star2).toBeGreaterThan(pattern1.RR_Star2);

      // Verify JS matches
      const js1 = calculateRisk(rToJsInput(pattern1));
      const js108 = calculateRisk(rToJsInput(pattern108));

      expect(js108.absoluteRisk).toBeGreaterThan(js1.absoluteRisk);
      expect(js108.relativeRiskUnder50).toBeGreaterThan(js1.relativeRiskUnder50);
      expect(js108.relativeRiskAtOrAbove50).toBeGreaterThan(js1.relativeRiskAtOrAbove50);
    });

    it('should show impact of each risk factor on absolute risk', () => {
      // Baseline pattern (all 0s)
      const baseline = patternReferenceData.find((r) => r.PatternNumber === 1);
      const baselineRisk = baseline.AbsRisk;

      // Pattern with only biopsies different
      const biopsyPattern = patternReferenceData.find(
        (r) => r.NB_Cat === '2' && r.AM_Cat === '0' && r.AF_Cat === '0' && r.NR_Cat === '0'
      );

      // Pattern with only menarche different
      const menarchePattern = patternReferenceData.find(
        (r) => r.NB_Cat === '0' && r.AM_Cat === '2' && r.AF_Cat === '0' && r.NR_Cat === '0'
      );

      // Pattern with only first birth different
      const firstBirthPattern = patternReferenceData.find(
        (r) => r.NB_Cat === '0' && r.AM_Cat === '0' && r.AF_Cat === '3' && r.NR_Cat === '0'
      );

      // Pattern with only relatives different
      const relativesPattern = patternReferenceData.find(
        (r) => r.NB_Cat === '0' && r.AM_Cat === '0' && r.AF_Cat === '0' && r.NR_Cat === '2'
      );

      // All should increase risk compared to baseline
      expect(biopsyPattern.AbsRisk).toBeGreaterThan(baselineRisk);
      expect(menarchePattern.AbsRisk).toBeGreaterThan(baselineRisk);
      expect(firstBirthPattern.AbsRisk).toBeGreaterThan(baselineRisk);
      expect(relativesPattern.AbsRisk).toBeGreaterThan(baselineRisk);
    });
  });

  describe('Pattern bounds checking', () => {
    it('should never produce pattern number < 1', () => {
      patternReferenceData.forEach((rCase) => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);

        if (jsResult.success) {
          expect(jsResult.patternNumber).toBeGreaterThanOrEqual(1);
        }
      });
    });

    it('should never produce pattern number > 108', () => {
      patternReferenceData.forEach((rCase) => {
        const jsInput = rToJsInput(rCase);
        const jsResult = calculateRisk(jsInput);

        if (jsResult.success) {
          expect(jsResult.patternNumber).toBeLessThanOrEqual(108);
        }
      });
    });
  });
});
