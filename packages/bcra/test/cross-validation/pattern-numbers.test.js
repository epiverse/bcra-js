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


  describe('Individual pattern validation', () => {
    // Test a sample of patterns across the range
    const samplePatterns = [10, 20, 30, 40, 60, 70, 80, 90, 100, 108];

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
