/**
 * Type definitions for BCRA (Breast Cancer Risk Assessment Tool)
 *
 * This module defines the core data structures used throughout the BCRA library.
 * Type definitions use JSDoc syntax for JavaScript-native type checking and editor support.
 *
 * Field Name Mapping from R Package:
 * - R: ID         → JS: id
 * - R: T1         → JS: initialAge
 * - R: T2         → JS: projectionEndAge
 * - R: N_Biop     → JS: numBreastBiopsies
 * - R: HypPlas    → JS: atypicalHyperplasia
 * - R: AgeMen     → JS: ageAtMenarche
 * - R: Age1st     → JS: ageAtFirstBirth
 * - R: N_Rels     → JS: numRelativesWithBrCa
 * - R: Race       → JS: race
 *
 * @module types
 */

/**
 * Input data structure for breast cancer risk assessment.
 *
 * This type represents the raw or recoded input data required to calculate
 * absolute and relative breast cancer risk using the Gail model (BCRAT).
 *
 * Special Values:
 * - 98 = Nulliparous (no live births) - only for ageAtFirstBirth
 * - 99 = Unknown/Not Applicable - used across multiple fields
 *
 * @typedef {Object} RiskFactorProfile
 * @property {number} id - Individual's unique identifier. Positive integer: 1, 2, 3, ...
 * @property {number} initialAge - Current/initial age at assessment. Real number in [20, 90). Must be less than projectionEndAge.
 * @property {number} projectionEndAge - Future age for risk projection. Real number in (20, 90]. Must be greater than initialAge.
 * @property {number} race - Race/ethnicity code. Integer in [1, 11]. See RaceCode enum and RaceLabels for valid values.
 * @property {number} numBreastBiopsies - Number of previous breast biopsies. Integer: 0, 1, 2, ..., or 99 (unknown).
 * @property {number} ageAtMenarche - Age at first menstrual period. Real number ≤ initialAge, or 99 (unknown).
 * @property {number} ageAtFirstBirth - Age at first live birth. Real number where ageAtMenarche ≤ ageAtFirstBirth ≤ initialAge, 98 (nulliparous/no births), or 99 (unknown).
 * @property {number} numRelativesWithBrCa - Number of first-degree relatives (mother, sisters, daughters) with breast cancer. Integer: 0, 1, 2, ..., or 99 (unknown).
 * @property {number} atypicalHyperplasia - Presence of atypical hyperplasia on any biopsy. 0 (no), 1 (yes), or 99 (unknown/not applicable if no biopsies).
 *
 * @example
 * // Example risk factor data for a 45-year-old woman
 * const data = {
 *   id: 1,
 *   initialAge: 45.2,
 *   projectionEndAge: 55.0,
 *   race: RaceCode.WHITE,
 *   numBreastBiopsies: 1,
 *   ageAtMenarche: 12,
 *   ageAtFirstBirth: 28,
 *   numRelativesWithBrCa: 1,
 *   atypicalHyperplasia: 0
 * };
 *
 * @example
 * // Example risk factor data with unknown values
 * const dataWithUnknowns = {
 *   id: 2,
 *   initialAge: 35,
 *   projectionEndAge: 40,
 *   race: RaceCode.AFRICAN_AMERICAN,
 *   numBreastBiopsies: 99,  // Unknown
 *   ageAtMenarche: 99,       // Unknown
 *   ageAtFirstBirth: 98,     // Nulliparous
 *   numRelativesWithBrCa: 0,
 *   atypicalHyperplasia: 99  // Not applicable (no biopsies)
 * };
 */

/**
 * Recoded covariate values after validation and transformation.
 *
 * The BCRA model uses categorical variables for risk factors. Raw input values
 * are recoded into standardized categories before risk calculation. Different
 * race groups may have different recoding rules.
 *
 * @typedef {Object} RecodedValues
 * @property {number} biopsyCategory - Recoded number of biopsies. 0 (none/unknown), 1 (one biopsy), or 2 (two or more biopsies). Note: Hispanic women pool categories 2 and 1.
 * @property {number} menarcheCategory - Recoded age at menarche. 0 (14+ or unknown), 1 (12-13), or 2 (<12). Note: African-American women pool categories 2 and 1; Hispanic US-born women set to 0.
 * @property {number} firstBirthCategory - Recoded age at first birth. 0 (<20 or unknown), 1 (20-24), 2 (25-29 or nulliparous), or 3 (30+). Note: African-American women set to 0; Hispanic women use different groupings.
 * @property {number} relativesCategory - Recoded number of relatives with breast cancer. 0 (none/unknown), 1 (one relative), or 2 (two or more). Note: Asian and Hispanic women pool categories 2 and 1.
 * @property {number} hyperplasiaMultiplier - Relative risk multiplier for atypical hyperplasia. 0.93 (no hyperplasia), 1.00 (unknown or no biopsies), or 1.82 (hyperplasia present).
 * @property {string} raceLabel - Human-readable race/ethnicity label from RaceLabels.
 *
 * @example
 * // Example recoded values for a white woman
 * const recoded = {
 *   biopsyCategory: 1,
 *   menarcheCategory: 1,
 *   firstBirthCategory: 2,
 *   relativesCategory: 1,
 *   hyperplasiaMultiplier: 0.93,
 *   raceLabel: 'Non-Hispanic White'
 * };
 */

/**
 * Result of input validation and recoding.
 *
 * Contains validation status, error/warning messages, and recoded covariate values.
 * Returned by the recodeAndValidate() function before risk calculation.
 *
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the input data passed all validation checks. If false, risk calculation should not proceed.
 * @property {string[]} errors - Array of error messages describing validation failures. Empty if isValid is true.
 * @property {string[]} warnings - Array of warning messages for potential data issues that don't prevent calculation.
 * @property {RecodedValues} recodedValues - Transformed covariate values ready for risk calculation. Null if validation failed.
 * @property {number} errorIndicator - Binary error flag. 0 = valid, 1 = error present. Matches R package convention.
 *
 * @example
 * // Example validation result - successful
 * const validResult = {
 *   isValid: true,
 *   errors: [],
 *   warnings: [],
 *   recodedValues: {
 *     biopsyCategory: 1,
 *     menarcheCategory: 1,
 *     firstBirthCategory: 2,
 *     relativesCategory: 0,
 *     hyperplasiaMultiplier: 1.00,
 *     raceLabel: 'Non-Hispanic White'
 *   },
 *   errorIndicator: 0
 * };
 *
 * @example
 * // Example validation result - failed
 * const invalidResult = {
 *   isValid: false,
 *   errors: [
 *     'Current age must be between 20 and 89 years',
 *     'Projection age must be greater than current age'
 *   ],
 *   warnings: [],
 *   recodedValues: null,
 *   errorIndicator: 1
 * };
 */

/**
 * Result of breast cancer risk calculation.
 *
 * Contains absolute risk, relative risks, and metadata about the calculation.
 * Returned by the calculateRisk() function.
 *
 * @typedef {Object} RiskResult
 * @property {number|null} absoluteRisk - Absolute risk of developing invasive breast cancer during the projection interval, expressed as a percentage (0-100). Null if calculation failed.
 * @property {number|null} relativeRiskUnder50 - Relative risk multiplier for women under age 50. Calculated from logistic regression model with race-specific coefficients. Null if calculation failed.
 * @property {number|null} relativeRiskAtOrAbove50 - Relative risk multiplier for women age 50 and older. Includes additional age-biopsy interaction term. Null if calculation failed.
 * @property {number|null} averageRisk - Average risk for a woman of the same age and race with "average" risk factors. Only calculated if requested. Null otherwise.
 * @property {string|null} raceEthnicity - Human-readable race/ethnicity label from RaceLabels. Null if calculation failed.
 * @property {Object|null} error - Error object if calculation failed. Contains message and optionally stack trace. Null if successful.
 *
 * @example
 * // Example successful risk calculation result
 * const result = {
 *   absoluteRisk: 2.84,
 *   relativeRiskUnder50: 1.23,
 *   relativeRiskAtOrAbove50: 1.45,
 *   averageRisk: 1.89,
 *   raceEthnicity: 'Non-Hispanic White',
 *   error: null
 * };
 *
 * @example
 * // Example failed risk calculation result
 * const failedResult = {
 *   absoluteRisk: null,
 *   relativeRiskUnder50: null,
 *   relativeRiskAtOrAbove50: null,
 *   averageRisk: null,
 *   raceEthnicity: null,
 *   error: {
 *     message: 'Invalid race code. Must be between 1 and 11',
 *     stack: '...'
 *   }
 * };
 */

/**
 * Race/ethnicity codes for breast cancer risk assessment.
 *
 * Each race group uses population-specific incidence rates, mortality rates,
 * and logistic regression coefficients. Some race groups have specialized
 * recoding rules for risk factors.
 *
 * Data Sources (from R package):
 * - Code 1: SEER White 1983-87 (used in NCI BCRAT)
 * - Code 2: SEER Black 1994-98 (CARE study model)
 * - Codes 3,5: SEER CA Hispanic 1995-2004 (San Francisco Bay Area Breast Cancer Study)
 * - Code 4: Uses White rates (Native American and unknown race)
 * - Codes 6-11: SEER18 1998-2002 (Asian/Pacific Islander subgroups)
 *
 * @enum {number}
 * @readonly
 */
export const RaceCode = {
  /** Non-Hispanic White (SEER 1983-87 rates, NCI BCRAT standard) */
  WHITE: 1,

  /** African-American (SEER Black 1994-98, CARE study model) */
  AFRICAN_AMERICAN: 2,

  /** Hispanic-American, US Born (SEER CA Hispanic 1995-2004) */
  HISPANIC_US_BORN: 3,

  /** Native American and Other/Unknown race (uses White rates) */
  NATIVE_AMERICAN_OTHER: 4,

  /** Hispanic-American, Foreign Born (SEER CA Hispanic 1995-2004) */
  HISPANIC_FOREIGN_BORN: 5,

  /** Chinese-American (SEER18 1998-2002) */
  CHINESE: 6,

  /** Japanese-American (SEER18 1998-2002) */
  JAPANESE: 7,

  /** Filipino-American (SEER18 1998-2002) */
  FILIPINO: 8,

  /** Hawaiian (SEER18 1998-2002) */
  HAWAIIAN: 9,

  /** Other Pacific Islander (SEER18 1998-2002) */
  OTHER_PACIFIC_ISLANDER: 10,

  /** Other Asian (SEER18 1998-2002) */
  OTHER_ASIAN: 11,
};

/**
 * Human-readable labels for race/ethnicity codes.
 *
 * Maps numeric race codes (1-11) to descriptive labels for display purposes.
 * These labels match the R package documentation.
 *
 * Reference Table:
 * | Code | Label                        | R Package Abbr | Data Source          |
 * |------|------------------------------|----------------|----------------------|
 * |  1   | Non-Hispanic White           | Wh             | SEER 1983-87         |
 * |  2   | African-American             | AA             | SEER Black 1994-98   |
 * |  3   | Hispanic (US Born)           | HU             | SEER CA Hisp 1995-04 |
 * |  4   | Native American/Other        | NA             | Uses White rates     |
 * |  5   | Hispanic (Foreign Born)      | HF             | SEER CA Hisp 1995-04 |
 * |  6   | Chinese-American             | Ch             | SEER18 1998-2002     |
 * |  7   | Japanese-American            | Ja             | SEER18 1998-2002     |
 * |  8   | Filipino-American            | Fi             | SEER18 1998-2002     |
 * |  9   | Hawaiian                     | Hw             | SEER18 1998-2002     |
 * | 10   | Other Pacific Islander       | oP             | SEER18 1998-2002     |
 * | 11   | Other Asian                  | oA             | SEER18 1998-2002     |
 *
 * @type {Object.<number, string>}
 * @readonly
 *
 * @example
 * const raceLabel = RaceLabels[3];  // "Hispanic (US Born)"
 */
export const RaceLabels = {
  1: 'Non-Hispanic White',
  2: 'African-American',
  3: 'Hispanic (US Born)',
  4: 'Native American/Other',
  5: 'Hispanic (Foreign Born)',
  6: 'Chinese-American',
  7: 'Japanese-American',
  8: 'Filipino-American',
  9: 'Hawaiian',
  10: 'Other Pacific Islander',
  11: 'Other Asian',
};

/**
 * Special numeric codes for unknown or not applicable values.
 *
 * These codes are used throughout the input data to indicate missing information
 * or special conditions. The recoding logic handles these values appropriately
 * for each field.
 *
 * Usage by Field:
 * - numBreastBiopsies: 99 = unknown → recoded to category 0
 * - ageAtMenarche: 99 = unknown → recoded to category 0
 * - ageAtFirstBirth: 98 = nulliparous (no live births) → recoded based on race
 *                    99 = unknown → recoded to category 0
 * - numRelativesWithBrCa: 99 = unknown → recoded to category 0
 * - atypicalHyperplasia: 99 = not applicable (no biopsies) or unknown
 *
 * @constant
 * @readonly
 */
export const SpecialValues = {
  /** Unknown or missing value - used across multiple fields */
  UNKNOWN: 99,

  /** Nulliparous (no live births) - only used for ageAtFirstBirth */
  NULLIPAROUS: 98,

  /** Not applicable - used for atypicalHyperplasia when no biopsies performed */
  NOT_APPLICABLE: 99,
};
