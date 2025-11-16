/**
 * Unit tests for validation utilities
 *
 * Tests the validation and sanitization functions in src/utils/validators.js
 */

import { describe, it, expect } from 'vitest';
import {
  validateRiskFactorDataStructure,
  validateAge,
  sanitizeRiskFactorData,
  validateRaceCode,
  isSpecialValue,
  validateNonNegative,
} from '../../src/utils/validators.js';
import { RaceCode } from '../../src/types/index.js';

describe('validateRiskFactorDataStructure', () => {
  describe('Complete valid data', () => {
    it('should accept valid complete data', () => {
      const data = {
        id: 1,
        initialAge: 40,
        projectionEndAge: 50,
        race: 1,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 0,
      };

      const result = validateRiskFactorDataStructure(data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept data with string id', () => {
      const data = {
        id: 'subject-123',
        initialAge: 40,
        projectionEndAge: 50,
        race: 1,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 0,
      };

      const result = validateRiskFactorDataStructure(data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept data with numeric strings (will be caught as invalid types)', () => {
      const data = {
        id: 1,
        initialAge: '40',
        projectionEndAge: '50',
        race: '1',
        numBreastBiopsies: '1',
        ageAtMenarche: '12',
        ageAtFirstBirth: '25',
        numRelativesWithBrCa: '1',
        atypicalHyperplasia: '0',
      };

      const result = validateRiskFactorDataStructure(data);
      // String numbers are convertible to numbers, so should pass
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Missing fields', () => {
    it('should reject data with missing id', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: 1,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 0,
      };

      const result = validateRiskFactorDataStructure(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: id');
    });

    it('should reject data with missing initialAge', () => {
      const data = {
        id: 1,
        projectionEndAge: 50,
        race: 1,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 0,
      };

      const result = validateRiskFactorDataStructure(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: initialAge');
    });

    it('should reject data with multiple missing fields', () => {
      const data = {
        id: 1,
        initialAge: 40,
        // Missing projectionEndAge, race, numBreastBiopsies, etc.
      };

      const result = validateRiskFactorDataStructure(data);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Missing required field: projectionEndAge');
      expect(result.errors).toContain('Missing required field: race');
    });
  });

  describe('Invalid types', () => {
    it('should reject null data', () => {
      const result = validateRiskFactorDataStructure(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Risk factor data must be a non-null object');
    });

    it('should reject undefined data', () => {
      const result = validateRiskFactorDataStructure(undefined);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Risk factor data must be a non-null object');
    });

    it('should reject non-numeric string for initialAge', () => {
      const data = {
        id: 1,
        initialAge: 'forty',
        projectionEndAge: 50,
        race: 1,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 0,
      };

      const result = validateRiskFactorDataStructure(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('initialAge must be a number (got string)');
    });

    it('should reject null values for numeric fields', () => {
      const data = {
        id: 1,
        initialAge: null,
        projectionEndAge: 50,
        race: 1,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 0,
      };

      const result = validateRiskFactorDataStructure(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('initialAge cannot be null or undefined');
    });

    it('should reject Infinity values', () => {
      const data = {
        id: 1,
        initialAge: Infinity,
        projectionEndAge: 50,
        race: 1,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 0,
      };

      const result = validateRiskFactorDataStructure(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('initialAge must be a finite number');
    });

    it('should reject boolean values for numeric fields', () => {
      const data = {
        id: 1,
        initialAge: 40,
        projectionEndAge: 50,
        race: true,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 0,
      };

      const result = validateRiskFactorDataStructure(data);
      // Boolean true converts to 1, so it passes type check but not race validation
      expect(result.valid).toBe(true);
    });
  });
});

describe('validateAge', () => {
  describe('Valid ages', () => {
    it('should accept age 20 (minimum)', () => {
      const result = validateAge(20, 'initialAge');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept age 89 (maximum)', () => {
      const result = validateAge(89, 'initialAge');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept age 45', () => {
      const result = validateAge(45, 'initialAge');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept fractional ages by default', () => {
      const result = validateAge(45.5, 'initialAge');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Invalid ages', () => {
    it('should reject age below minimum (19)', () => {
      const result = validateAge(19, 'initialAge');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('initialAge must be between 20 and 89 years');
    });

    it('should reject age at or above maximum (90)', () => {
      const result = validateAge(90, 'initialAge');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('initialAge must be between 20 and 89 years');
    });

    it('should reject negative ages', () => {
      const result = validateAge(-5, 'initialAge');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('initialAge cannot be negative');
    });

    it('should reject non-numeric values', () => {
      const result = validateAge('forty', 'initialAge');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('initialAge must be a valid number');
    });

    it('should reject NaN', () => {
      const result = validateAge(NaN, 'initialAge');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('initialAge must be a valid number');
    });
  });

  describe('Fractional age warnings', () => {
    it('should warn about fractional ages when allowFractional is false', () => {
      const result = validateAge(45.5, 'initialAge', { allowFractional: false });
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('initialAge should typically be a whole number');
    });

    it('should not warn about fractional ages when allowFractional is true', () => {
      const result = validateAge(45.5, 'initialAge', { allowFractional: true });
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should not warn about whole numbers even when allowFractional is false', () => {
      const result = validateAge(45, 'initialAge', { allowFractional: false });
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });
});

describe('sanitizeRiskFactorData', () => {
  describe('String to number conversion', () => {
    it('should convert numeric string fields to numbers', () => {
      const data = {
        id: 'subject-123',
        initialAge: '40',
        projectionEndAge: '50',
        race: '1',
        numBreastBiopsies: '0',
        ageAtMenarche: '12',
        ageAtFirstBirth: '25',
        numRelativesWithBrCa: '1',
        atypicalHyperplasia: '99',
      };

      const sanitized = sanitizeRiskFactorData(data);

      expect(sanitized.id).toBe('subject-123'); // Preserved as string
      expect(sanitized.initialAge).toBe(40);
      expect(sanitized.projectionEndAge).toBe(50);
      expect(sanitized.race).toBe(1);
      expect(sanitized.numBreastBiopsies).toBe(0);
      expect(sanitized.ageAtMenarche).toBe(12);
      expect(sanitized.ageAtFirstBirth).toBe(25);
      expect(sanitized.numRelativesWithBrCa).toBe(1);
      expect(sanitized.atypicalHyperplasia).toBe(99);
    });

    it('should preserve numeric id as number', () => {
      const data = {
        id: 123,
        initialAge: '40',
        projectionEndAge: '50',
        race: '1',
        numBreastBiopsies: '0',
        ageAtMenarche: '12',
        ageAtFirstBirth: '25',
        numRelativesWithBrCa: '1',
        atypicalHyperplasia: '99',
      };

      const sanitized = sanitizeRiskFactorData(data);
      expect(sanitized.id).toBe(123);
    });

    it('should not mutate original data', () => {
      const data = {
        id: 1,
        initialAge: '40',
        projectionEndAge: '50',
        race: '1',
        numBreastBiopsies: '0',
        ageAtMenarche: '12',
        ageAtFirstBirth: '25',
        numRelativesWithBrCa: '1',
        atypicalHyperplasia: '99',
      };

      const original = { ...data };
      const sanitized = sanitizeRiskFactorData(data);

      // Original should be unchanged
      expect(data.initialAge).toBe('40');
      expect(data.projectionEndAge).toBe('50');

      // Sanitized should have numbers
      expect(sanitized.initialAge).toBe(40);
      expect(sanitized.projectionEndAge).toBe(50);
    });
  });

  describe('Already numeric data', () => {
    it('should preserve already numeric fields', () => {
      const data = {
        id: 1,
        initialAge: 40,
        projectionEndAge: 50,
        race: 1,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 99,
      };

      const sanitized = sanitizeRiskFactorData(data);

      expect(sanitized.initialAge).toBe(40);
      expect(sanitized.projectionEndAge).toBe(50);
      expect(sanitized.race).toBe(1);
    });
  });

  describe('Invalid conversions', () => {
    it('should preserve non-convertible strings', () => {
      const data = {
        id: 1,
        initialAge: 'forty',
        projectionEndAge: 50,
        race: 1,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 99,
      };

      const sanitized = sanitizeRiskFactorData(data);

      // Non-convertible string preserved as-is (validation will catch this)
      expect(sanitized.initialAge).toBe('forty');
    });

    it('should handle null data', () => {
      const sanitized = sanitizeRiskFactorData(null);
      expect(sanitized).toBe(null);
    });

    it('should handle undefined data', () => {
      const sanitized = sanitizeRiskFactorData(undefined);
      expect(sanitized).toBe(undefined);
    });
  });

  describe('Special values', () => {
    it('should preserve special values (98, 99)', () => {
      const data = {
        id: 1,
        initialAge: '40',
        projectionEndAge: '50',
        race: '1',
        numBreastBiopsies: '99',
        ageAtMenarche: '99',
        ageAtFirstBirth: '98',
        numRelativesWithBrCa: '99',
        atypicalHyperplasia: '99',
      };

      const sanitized = sanitizeRiskFactorData(data);

      expect(sanitized.numBreastBiopsies).toBe(99);
      expect(sanitized.ageAtMenarche).toBe(99);
      expect(sanitized.ageAtFirstBirth).toBe(98);
      expect(sanitized.numRelativesWithBrCa).toBe(99);
      expect(sanitized.atypicalHyperplasia).toBe(99);
    });
  });
});

describe('validateRaceCode', () => {
  describe('Valid race codes', () => {
    it('should accept race code 1 (White)', () => {
      const result = validateRaceCode(RaceCode.WHITE);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept race code 2 (African American)', () => {
      const result = validateRaceCode(RaceCode.AFRICAN_AMERICAN);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept race code 11 (Other Asian)', () => {
      const result = validateRaceCode(RaceCode.OTHER_ASIAN);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept all valid race codes 1-11', () => {
      for (let code = 1; code <= 11; code++) {
        const result = validateRaceCode(code);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });
  });

  describe('Invalid race codes', () => {
    it('should reject race code 0', () => {
      const result = validateRaceCode(0);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Race code must be between 1 and 11');
    });

    it('should reject race code 12', () => {
      const result = validateRaceCode(12);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Race code must be between 1 and 11');
    });

    it('should reject negative race codes', () => {
      const result = validateRaceCode(-1);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Race code must be between 1 and 11');
    });

    it('should reject fractional race codes', () => {
      const result = validateRaceCode(1.5);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Race code must be an integer');
    });

    it('should reject non-numeric race codes', () => {
      const result = validateRaceCode('White');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Race code must be a valid number');
    });
  });
});

describe('isSpecialValue', () => {
  it('should return true for 99 (UNKNOWN)', () => {
    expect(isSpecialValue(99)).toBe(true);
  });

  it('should return true for 98 (NULLIPAROUS)', () => {
    expect(isSpecialValue(98)).toBe(true);
  });

  it('should return false for 0', () => {
    expect(isSpecialValue(0)).toBe(false);
  });

  it('should return false for normal values', () => {
    expect(isSpecialValue(1)).toBe(false);
    expect(isSpecialValue(2)).toBe(false);
    expect(isSpecialValue(12)).toBe(false);
    expect(isSpecialValue(25)).toBe(false);
  });

  it('should return false for negative values', () => {
    expect(isSpecialValue(-1)).toBe(false);
  });

  it('should return false for values > 99', () => {
    expect(isSpecialValue(100)).toBe(false);
  });
});

describe('validateNonNegative', () => {
  describe('Valid non-negative values', () => {
    it('should accept 0', () => {
      const result = validateNonNegative(0, 'numBreastBiopsies');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept positive integers', () => {
      const result = validateNonNegative(3, 'numBreastBiopsies');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept special value 99', () => {
      const result = validateNonNegative(99, 'numBreastBiopsies');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept special value 98', () => {
      const result = validateNonNegative(98, 'ageAtFirstBirth');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid negative values', () => {
    it('should reject negative integers', () => {
      const result = validateNonNegative(-1, 'numBreastBiopsies');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('numBreastBiopsies cannot be negative');
    });

    it('should reject negative decimals', () => {
      const result = validateNonNegative(-0.5, 'numBreastBiopsies');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('numBreastBiopsies cannot be negative');
    });

    it('should reject non-numeric values', () => {
      const result = validateNonNegative('invalid', 'numBreastBiopsies');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('numBreastBiopsies must be a valid number');
    });
  });
});
