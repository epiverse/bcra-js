/**
 * Validation utilities for BCRA risk factor data
 *
 * This module provides pre-flight validation and input sanitization functions
 * for risk factor data before it enters the calculation pipeline. These validators
 * check data structure integrity and perform type coercion, complementing the
 * domain validation logic in recode-check.js.
 *
 * @module utils/validators
 */

import { MIN_AGE, MAX_AGE } from '../constants/index.js';
import { SpecialValues } from '../types/index.js';

/**
 * Validates the structure and types of risk factor data.
 *
 * Performs pre-flight validation to ensure all required fields are present
 * and have the correct data types. This is a structural check that should
 * be performed before domain-specific validation in recode-check.js.
 *
 * @param {Object} data - Risk factor data to validate
 * @returns {Object} Validation result with valid flag and error messages
 * @returns {boolean} returns.valid - True if all checks pass
 * @returns {string[]} returns.errors - Array of error messages
 *
 * @example
 * const result = validateRiskFactorDataStructure({
 *   id: 1,
 *   initialAge: 40,
 *   // ... other fields
 * });
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 */
export function validateRiskFactorDataStructure(data) {
  const errors = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push('Risk factor data must be a non-null object');
    return { valid: false, errors };
  }

  // Define required fields
  const requiredFields = [
    'id',
    'initialAge',
    'projectionEndAge',
    'race',
    'numBreastBiopsies',
    'ageAtMenarche',
    'ageAtFirstBirth',
    'numRelativesWithBrCa',
    'atypicalHyperplasia',
  ];

  // Check for missing fields
  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // If missing required fields, return early
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Define numeric fields (all except id which can be string or number)
  const numericFields = [
    'initialAge',
    'projectionEndAge',
    'race',
    'numBreastBiopsies',
    'ageAtMenarche',
    'ageAtFirstBirth',
    'numRelativesWithBrCa',
    'atypicalHyperplasia',
  ];

  // Type checking for numeric fields
  for (const field of numericFields) {
    const value = data[field];

    // Check if value is present
    if (value === null || value === undefined) {
      errors.push(`${field} cannot be null or undefined`);
      continue;
    }

    // Check if value is numeric or can be converted to number
    const numValue = Number(value);
    if (isNaN(numValue)) {
      errors.push(`${field} must be a number (got ${typeof value})`);
      continue;
    }

    // Check for Infinity
    if (!isFinite(numValue)) {
      errors.push(`${field} must be a finite number`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates age values against acceptable ranges.
 *
 * Checks that age values fall within the valid range for risk calculation
 * (20-89 years). Optionally warns about fractional ages if strict integer
 * checking is desired.
 *
 * @param {number} age - Age value to validate
 * @param {string} fieldName - Name of the field being validated (for error messages)
 * @param {Object} [options] - Validation options
 * @param {boolean} [options.allowFractional=true] - Whether to allow fractional ages
 * @returns {Object} Validation result
 * @returns {boolean} returns.valid - True if age is valid
 * @returns {string[]} returns.errors - Array of error messages
 * @returns {string[]} returns.warnings - Array of warning messages
 *
 * @example
 * const result = validateAge(45.5, 'initialAge');
 * // { valid: true, errors: [], warnings: [] }
 *
 * const result2 = validateAge(15, 'initialAge');
 * // { valid: false, errors: ['initialAge must be between 20 and 89 years'], warnings: [] }
 */
export function validateAge(age, fieldName, options = {}) {
  const { allowFractional = true } = options;
  const errors = [];
  const warnings = [];

  // Check if age is a number
  const numAge = Number(age);
  if (isNaN(numAge)) {
    errors.push(`${fieldName} must be a valid number`);
    return { valid: false, errors, warnings };
  }

  // Check age range (20 <= age < 90)
  if (numAge < MIN_AGE || numAge >= MAX_AGE) {
    errors.push(
      `${fieldName} must be between ${MIN_AGE} and ${MAX_AGE - 1} years`
    );
  }

  // Check for fractional ages if strict integer checking is desired
  if (!allowFractional && numAge !== Math.floor(numAge)) {
    warnings.push(`${fieldName} should typically be a whole number`);
  }

  // Check for negative ages
  if (numAge < 0) {
    errors.push(`${fieldName} cannot be negative`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Sanitizes risk factor input data by performing type coercion.
 *
 * Converts string inputs to numbers, which is essential when processing
 * form data where all inputs are strings. This function ensures that
 * the data has the correct types before validation and calculation.
 *
 * The id field is preserved as-is since it can be either string or number.
 * All other fields are coerced to numbers.
 *
 * @param {Object} data - Risk factor data to sanitize
 * @returns {Object} Sanitized data with numeric types
 *
 * @example
 * // Form data with string values
 * const formData = {
 *   id: "subject-123",
 *   initialAge: "40",
 *   projectionEndAge: "50",
 *   race: "1",
 *   numBreastBiopsies: "0",
 *   ageAtMenarche: "12",
 *   ageAtFirstBirth: "25",
 *   numRelativesWithBrCa: "1",
 *   atypicalHyperplasia: "99"
 * };
 *
 * const sanitized = sanitizeRiskFactorData(formData);
 * // All fields except 'id' are now numbers
 * // sanitized.initialAge === 40 (number, not string)
 */
export function sanitizeRiskFactorData(data) {
  // If data is not an object, return as-is
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Create a shallow copy to avoid mutating the original
  const sanitized = { ...data };

  // Define numeric fields (all except id)
  const numericFields = [
    'initialAge',
    'projectionEndAge',
    'race',
    'numBreastBiopsies',
    'ageAtMenarche',
    'ageAtFirstBirth',
    'numRelativesWithBrCa',
    'atypicalHyperplasia',
  ];

  // Convert numeric fields to numbers
  for (const field of numericFields) {
    if (field in sanitized) {
      const value = sanitized[field];

      // Skip conversion for null or undefined (let validation catch these)
      if (value === null || value === undefined) {
        continue;
      }

      // Only convert if not already a number
      if (typeof value !== 'number') {
        const numValue = Number(value);

        // Preserve the original value if conversion fails
        // (validation will catch this later)
        if (!isNaN(numValue)) {
          sanitized[field] = numValue;
        }
      }
    }
  }

  // Preserve id as-is (can be string or number)
  // No conversion needed

  return sanitized;
}

/**
 * Validates a race code value.
 *
 * Checks that the race code is within the valid range (1-11).
 *
 * @param {number} race - Race code to validate
 * @returns {Object} Validation result
 * @returns {boolean} returns.valid - True if race code is valid
 * @returns {string[]} returns.errors - Array of error messages
 *
 * @example
 * const result = validateRaceCode(1);
 * // { valid: true, errors: [] }
 *
 * const result2 = validateRaceCode(15);
 * // { valid: false, errors: ['Race code must be between 1 and 11'] }
 */
export function validateRaceCode(race) {
  const errors = [];
  const numRace = Number(race);

  if (isNaN(numRace)) {
    errors.push('Race code must be a valid number');
  } else if (!Number.isInteger(numRace)) {
    errors.push('Race code must be an integer');
  } else if (numRace < 1 || numRace > 11) {
    errors.push('Race code must be between 1 and 11');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if a value is a special code (98 or 99).
 *
 * Special codes are used to indicate unknown values or special conditions
 * like nulliparous (no live births).
 *
 * @param {number} value - Value to check
 * @returns {boolean} True if value is a special code (98 or 99)
 *
 * @example
 * isSpecialValue(99);  // true (UNKNOWN)
 * isSpecialValue(98);  // true (NULLIPAROUS)
 * isSpecialValue(0);   // false
 * isSpecialValue(12);  // false
 */
export function isSpecialValue(value) {
  return (
    value === SpecialValues.UNKNOWN || value === SpecialValues.NULLIPAROUS
  );
}

/**
 * Validates that a numeric value is non-negative.
 *
 * Used for count fields like numBreastBiopsies and numRelativesWithBrCa.
 * Allows special values (98, 99) to pass validation.
 *
 * @param {number} value - Value to validate
 * @param {string} fieldName - Name of the field being validated
 * @returns {Object} Validation result
 * @returns {boolean} returns.valid - True if value is valid
 * @returns {string[]} returns.errors - Array of error messages
 *
 * @example
 * validateNonNegative(3, 'numBreastBiopsies');
 * // { valid: true, errors: [] }
 *
 * validateNonNegative(-1, 'numBreastBiopsies');
 * // { valid: false, errors: ['numBreastBiopsies cannot be negative'] }
 *
 * validateNonNegative(99, 'numBreastBiopsies');
 * // { valid: true, errors: [] } - special value allowed
 */
export function validateNonNegative(value, fieldName) {
  const errors = [];
  const numValue = Number(value);

  if (isNaN(numValue)) {
    errors.push(`${fieldName} must be a valid number`);
  } else if (numValue < 0 && !isSpecialValue(numValue)) {
    errors.push(`${fieldName} cannot be negative`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
