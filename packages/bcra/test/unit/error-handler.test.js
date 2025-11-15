/**
 * Unit tests for error handling utilities
 *
 * Tests the custom error classes and error formatting functions
 * in src/utils/error-handler.js
 */

import { describe, it, expect } from 'vitest';
import {
  BCRAValidationError,
  BCRACalculationError,
  formatValidationErrors,
  createUserFriendlyError,
  createUserFriendlyErrors,
  createValidationResult,
} from '../../src/utils/error-handler.js';

describe('BCRAValidationError', () => {
  describe('Error instantiation', () => {
    it('should create error with message', () => {
      const error = new BCRAValidationError('Invalid input');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BCRAValidationError);
      expect(error.name).toBe('BCRAValidationError');
      expect(error.message).toBe('Invalid input');
      expect(error.fieldErrors).toEqual({});
    });

    it('should create error with field errors', () => {
      const fieldErrors = {
        initialAge: 'Age must be between 20 and 89',
        race: 'Invalid race code',
      };

      const error = new BCRAValidationError('Validation failed', fieldErrors);

      expect(error.message).toBe('Validation failed');
      expect(error.fieldErrors).toEqual(fieldErrors);
    });

    it('should have stack trace', () => {
      const error = new BCRAValidationError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('BCRAValidationError');
    });
  });

  describe('toJSON method', () => {
    it('should serialize to JSON', () => {
      const fieldErrors = {
        initialAge: 'Age must be between 20 and 89',
      };

      const error = new BCRAValidationError('Validation failed', fieldErrors);
      const json = error.toJSON();

      expect(json.name).toBe('BCRAValidationError');
      expect(json.message).toBe('Validation failed');
      expect(json.fieldErrors).toEqual(fieldErrors);
      expect(json.stack).toBeDefined();
    });
  });

  describe('Error throwing and catching', () => {
    it('should be catchable as Error', () => {
      try {
        throw new BCRAValidationError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Test error');
      }
    });

    it('should be catchable as BCRAValidationError', () => {
      try {
        throw new BCRAValidationError('Test error', { field: 'error' });
      } catch (error) {
        if (error instanceof BCRAValidationError) {
          expect(error.fieldErrors).toEqual({ field: 'error' });
        } else {
          throw new Error('Should have caught BCRAValidationError');
        }
      }
    });
  });
});

describe('BCRACalculationError', () => {
  describe('Error instantiation', () => {
    it('should create error with message', () => {
      const error = new BCRACalculationError('Calculation failed');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BCRACalculationError);
      expect(error.name).toBe('BCRACalculationError');
      expect(error.message).toBe('Calculation failed');
      expect(error.details).toEqual({});
    });

    it('should create error with details', () => {
      const details = {
        function: 'calculateAbsoluteRisk',
        age: 45,
        hazard: 0,
      };

      const error = new BCRACalculationError('Division by zero', details);

      expect(error.message).toBe('Division by zero');
      expect(error.details).toEqual(details);
    });

    it('should have stack trace', () => {
      const error = new BCRACalculationError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('BCRACalculationError');
    });
  });

  describe('toJSON method', () => {
    it('should serialize to JSON', () => {
      const details = {
        function: 'calculateRelativeRisk',
        betaValue: NaN,
      };

      const error = new BCRACalculationError('Invalid beta coefficient', details);
      const json = error.toJSON();

      expect(json.name).toBe('BCRACalculationError');
      expect(json.message).toBe('Invalid beta coefficient');
      expect(json.details.function).toBe('calculateRelativeRisk');
      expect(json.stack).toBeDefined();
    });
  });
});

describe('formatValidationErrors', () => {
  it('should format array of errors as numbered list', () => {
    const errors = [
      'Missing required field: initialAge',
      'Race code must be between 1 and 11',
      'Age must be between 20 and 89',
    ];

    const formatted = formatValidationErrors(errors);

    expect(formatted).toBe(
      '1. Missing required field: initialAge\n' +
      '2. Race code must be between 1 and 11\n' +
      '3. Age must be between 20 and 89'
    );
  });

  it('should handle single error', () => {
    const errors = ['Single error'];
    const formatted = formatValidationErrors(errors);

    expect(formatted).toBe('1. Single error');
  });

  it('should handle empty array', () => {
    const formatted = formatValidationErrors([]);
    expect(formatted).toBe('No errors');
  });

  it('should handle null input', () => {
    const formatted = formatValidationErrors(null);
    expect(formatted).toBe('No errors');
  });

  it('should handle undefined input', () => {
    const formatted = formatValidationErrors(undefined);
    expect(formatted).toBe('No errors');
  });

  it('should handle non-array input', () => {
    const formatted = formatValidationErrors('not an array');
    expect(formatted).toBe('No errors');
  });
});

describe('createUserFriendlyError', () => {
  describe('Direct matches', () => {
    it('should map age validation error', () => {
      const technical = 'Current age must be between 20 and 89 years';
      const friendly = createUserFriendlyError(technical);

      expect(friendly).toBe('Age must be between 20 and 89 years for risk calculation.');
    });

    it('should map race validation error', () => {
      const technical = 'Invalid race code';
      const friendly = createUserFriendlyError(technical);

      expect(friendly).toBe('Please select a valid race/ethnicity option.');
    });

    it('should map projection age error', () => {
      const technical = 'Projection age must be greater than current age';
      const friendly = createUserFriendlyError(technical);

      expect(friendly).toBe('The future age must be greater than the current age.');
    });

    it('should map menarche age error', () => {
      const technical = 'Age at menarche cannot be greater than current age';
      const friendly = createUserFriendlyError(technical);

      expect(friendly).toBe('Age at first menstrual period cannot be greater than current age.');
    });

    it('should map first birth temporal error', () => {
      const technical = 'Age at first birth cannot be less than age at menarche';
      const friendly = createUserFriendlyError(technical);

      expect(friendly).toBe('Age at first birth must be after age at first menstrual period.');
    });
  });

  describe('Partial matches', () => {
    it('should match errors containing "must be a number"', () => {
      const technical = 'initialAge must be a number (got string)';
      const friendly = createUserFriendlyError(technical);

      expect(friendly).toBe('Please enter a valid number.');
    });

    it('should match errors containing "cannot be null or undefined"', () => {
      const technical = 'initialAge cannot be null or undefined';
      const friendly = createUserFriendlyError(technical);

      expect(friendly).toBe('This field is required.');
    });

    it('should match errors containing "cannot be negative"', () => {
      const technical = 'numBreastBiopsies cannot be negative';
      const friendly = createUserFriendlyError(technical);

      expect(friendly).toBe('Value cannot be negative.');
    });

    it('should match errors containing "Missing required field"', () => {
      const technical = 'Missing required field: initialAge';
      const friendly = createUserFriendlyError(technical);

      expect(friendly).toBe('Please fill in all required fields.');
    });
  });

  describe('No match - fallback', () => {
    it('should return original error when no mapping found', () => {
      const technical = 'Some very specific technical error';
      const friendly = createUserFriendlyError(technical);

      expect(friendly).toBe('Some very specific technical error');
    });

    it('should handle empty string', () => {
      const friendly = createUserFriendlyError('');
      expect(friendly).toBe('');
    });
  });
});

describe('createUserFriendlyErrors', () => {
  it('should map array of technical errors to user-friendly errors', () => {
    const technical = [
      'Invalid race code. Must be between 1 and 11',
      'Current age must be between 20 and 89 years',
      'Some unmapped error',
    ];

    const friendly = createUserFriendlyErrors(technical);

    expect(friendly).toHaveLength(3);
    expect(friendly[0]).toBe('Please select a valid race/ethnicity option.');
    expect(friendly[1]).toBe('Age must be between 20 and 89 years for risk calculation.');
    expect(friendly[2]).toBe('Some unmapped error'); // Fallback
  });

  it('should handle empty array', () => {
    const friendly = createUserFriendlyErrors([]);
    expect(friendly).toEqual([]);
  });

  it('should handle null input', () => {
    const friendly = createUserFriendlyErrors(null);
    expect(friendly).toEqual([]);
  });

  it('should handle undefined input', () => {
    const friendly = createUserFriendlyErrors(undefined);
    expect(friendly).toEqual([]);
  });

  it('should handle non-array input', () => {
    const friendly = createUserFriendlyErrors('not an array');
    expect(friendly).toEqual([]);
  });
});

describe('createValidationResult', () => {
  it('should create validation result with errors', () => {
    const errors = ['Error 1', 'Error 2'];
    const result = createValidationResult(errors);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(errors);
    expect(result.warnings).toEqual([]);
  });

  it('should create valid result with no errors', () => {
    const result = createValidationResult([]);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('should include warnings', () => {
    const errors = ['Error 1'];
    const warnings = ['Warning 1', 'Warning 2'];
    const result = createValidationResult(errors, warnings);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(errors);
    expect(result.warnings).toEqual(warnings);
  });

  it('should include metadata', () => {
    const errors = ['Error 1'];
    const warnings = ['Warning 1'];
    const metadata = {
      field: 'initialAge',
      value: 45,
    };

    const result = createValidationResult(errors, warnings, metadata);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(errors);
    expect(result.warnings).toEqual(warnings);
    expect(result.field).toBe('initialAge');
    expect(result.value).toBe(45);
  });

  it('should handle null errors', () => {
    const result = createValidationResult(null);

    expect(result.isValid).toBe(true); // No errors = valid
    expect(result.errors).toEqual([]);
  });
});
