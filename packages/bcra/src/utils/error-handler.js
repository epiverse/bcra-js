/**
 * Error handling utilities for BCRA
 *
 * This module provides custom error classes and error formatting utilities
 * for validation and calculation errors. These utilities help distinguish
 * between different types of errors and provide user-friendly error messages.
 *
 * @module utils/error-handler
 */

/**
 * Custom error class for validation failures.
 *
 * Thrown when risk factor data fails validation checks. Includes
 * field-level error details for programmatic error handling and
 * form field highlighting.
 *
 * @extends Error
 *
 * @example
 * throw new BCRAValidationError('Invalid input data', {
 *   initialAge: 'Age must be between 20 and 89',
 *   race: 'Race code must be between 1 and 11'
 * });
 */
export class BCRAValidationError extends Error {
  /**
   * Creates a new BCRAValidationError instance.
   *
   * @param {string} message - Error message
   * @param {Object.<string, string|string[]>} [fieldErrors={}] - Map of field names to error messages
   */
  constructor(message, fieldErrors = {}) {
    super(message);
    this.name = 'BCRAValidationError';
    this.fieldErrors = fieldErrors;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BCRAValidationError);
    }
  }

  /**
   * Returns a JSON representation of the error.
   *
   * @returns {Object} Error details
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      fieldErrors: this.fieldErrors,
      stack: this.stack,
    };
  }
}

/**
 * Custom error class for calculation failures.
 *
 * Thrown when risk calculation fails due to computational issues,
 * unexpected values, or internal errors. Includes additional details
 * about the failure context.
 *
 * @extends Error
 *
 * @example
 * throw new BCRACalculationError('Division by zero in risk calculation', {
 *   function: 'calculateAbsoluteRisk',
 *   age: 45,
 *   hazard: 0
 * });
 */
export class BCRACalculationError extends Error {
  /**
   * Creates a new BCRACalculationError instance.
   *
   * @param {string} message - Error message
   * @param {Object} [details={}] - Additional error context
   */
  constructor(message, details = {}) {
    super(message);
    this.name = 'BCRACalculationError';
    this.details = details;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BCRACalculationError);
    }
  }

  /**
   * Returns a JSON representation of the error.
   *
   * @returns {Object} Error details
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * Formats an array of validation errors into a human-readable string.
 *
 * Converts an array of error messages into a numbered list that can
 * be displayed to users or logged for debugging.
 *
 * @param {string[]} errors - Array of error messages
 * @returns {string} Formatted error message
 *
 * @example
 * const errors = [
 *   'Missing required field: initialAge',
 *   'Race code must be between 1 and 11'
 * ];
 * console.log(formatValidationErrors(errors));
 * // Output:
 * // 1. Missing required field: initialAge
 * // 2. Race code must be between 1 and 11
 */
export function formatValidationErrors(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return 'No errors';
  }

  return errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n');
}

/**
 * Mapping of technical error messages to user-friendly alternatives.
 *
 * Used by createUserFriendlyError() to convert internal error messages
 * into messages suitable for end users.
 *
 * @constant
 * @private
 */
const USER_FRIENDLY_MESSAGES = {
  // Age validation errors
  'Current age must be between 20 and 89 years':
    'Age must be between 20 and 89 years for risk calculation.',
  'initialAge must be between 20 and 89 years':
    'Age must be between 20 and 89 years for risk calculation.',
  'Projection age must be greater than current age':
    'The future age must be greater than the current age.',
  'projectionEndAge must be greater than initialAge':
    'The future age must be greater than the current age.',

  // Race validation errors
  'Invalid race code': 'Please select a valid race/ethnicity option.',
  'Invalid race code. Must be between 1 and 11':
    'Please select a valid race/ethnicity option.',
  'Race code must be between 1 and 11':
    'Please select a valid race/ethnicity option.',

  // Temporal relationship errors
  'Age at menarche cannot be greater than current age':
    'Age at first menstrual period cannot be greater than current age.',
  'Age at menarche cannot be greater than initial age':
    'Age at first menstrual period cannot be greater than current age.',
  'Age at first birth cannot be less than age at menarche':
    'Age at first birth must be after age at first menstrual period.',
  'ageAtFirstBirth must be >= ageAtMenarche (unless nulliparous or unknown)':
    'Age at first birth must be after age at first menstrual period.',

  // Biopsy/hyperplasia consistency errors
  'Consistency error: If no biopsies (0 or 99), atypical hyperplasia must be not applicable (99)':
    'If you have not had breast biopsies, please select "Unknown/Not Applicable" for atypical hyperplasia.',
  'Consistency error: If biopsies performed, atypical hyperplasia must be 0 (no), 1 (yes), or 99':
    'Please indicate whether atypical hyperplasia was found in your biopsy.',

  // Missing field errors
  'Missing required field': 'Please fill in all required fields.',

  // Type errors
  'must be a number': 'Please enter a valid number.',
  'must be a finite number': 'Please enter a valid number.',
  'cannot be null or undefined': 'This field is required.',

  // Range errors
  'cannot be negative': 'Value cannot be negative.',
};

/**
 * Creates a user-friendly error message from a technical error message.
 *
 * Attempts to map technical error messages to user-friendly alternatives.
 * Falls back to the original message if no mapping is found.
 *
 * @param {string} error - Technical error message
 * @returns {string} User-friendly error message
 *
 * @example
 * const technical = 'Invalid race code. Must be between 1 and 11';
 * const friendly = createUserFriendlyError(technical);
 * console.log(friendly);
 * // "Please select a valid race/ethnicity option."
 *
 * @example
 * const unknown = 'Some unexpected error';
 * const friendly = createUserFriendlyError(unknown);
 * console.log(friendly);
 * // "Some unexpected error" (falls back to original)
 */
export function createUserFriendlyError(error) {
  // Direct match
  if (error in USER_FRIENDLY_MESSAGES) {
    return USER_FRIENDLY_MESSAGES[error];
  }

  // Partial match - check if any key is a substring of the error
  for (const [technicalMsg, friendlyMsg] of Object.entries(
    USER_FRIENDLY_MESSAGES
  )) {
    if (error.includes(technicalMsg)) {
      return friendlyMsg;
    }
  }

  // No mapping found - return original error
  return error;
}

/**
 * Converts an array of technical error messages to user-friendly messages.
 *
 * Maps each error in the array through createUserFriendlyError().
 *
 * @param {string[]} errors - Array of technical error messages
 * @returns {string[]} Array of user-friendly error messages
 *
 * @example
 * const technical = [
 *   'Invalid race code. Must be between 1 and 11',
 *   'Current age must be between 20 and 89 years'
 * ];
 * const friendly = createUserFriendlyErrors(technical);
 * console.log(friendly);
 * // [
 * //   'Please select a valid race/ethnicity option.',
 * //   'Age must be between 20 and 89 years for risk calculation.'
 * // ]
 */
export function createUserFriendlyErrors(errors) {
  if (!Array.isArray(errors)) {
    return [];
  }

  return errors.map((error) => createUserFriendlyError(error));
}

/**
 * Creates a validation error result object.
 *
 * Helper function to create a standardized validation result structure
 * with error messages and metadata.
 *
 * @param {string[]} errors - Array of error messages
 * @param {string[]} [warnings=[]] - Array of warning messages
 * @param {Object} [metadata={}] - Additional metadata
 * @returns {Object} Validation result object
 *
 * @example
 * const result = createValidationResult(
 *   ['Age must be between 20 and 89'],
 *   ['Age should typically be a whole number'],
 *   { field: 'initialAge' }
 * );
 * // {
 * //   isValid: false,
 * //   errors: ['Age must be between 20 and 89'],
 * //   warnings: ['Age should typically be a whole number'],
 * //   metadata: { field: 'initialAge' }
 * // }
 */
export function createValidationResult(errors, warnings = [], metadata = {}) {
  const errorArray = errors || [];
  const warningArray = warnings || [];

  return {
    isValid: errorArray.length === 0,
    errors: errorArray,
    warnings: warningArray,
    ...metadata,
  };
}
