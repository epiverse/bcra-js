/**
 * Type definitions using JSDoc - Implemented in Phase 2
 */

/**
 * @typedef {Object} RiskFactorProfile
 * @property {number} id - Individual's unique ID. Positive integer: 1, 2, 3,... .
 * @property {number} initialAge - Initial age. Real number in [20, 90).
 * @property {number} projectionEndAge - Risk projection end age, starting at `initialAge`. Real number in (20, 90], such that `initialAge` < `projectionEndAge`.
 * @property {number} race - Race. Integer in [1, 11]. See "Race codes" for details.
 * @property {number} numBreastBiopsies - Number of breast biopsies. Integer: 0, 1, 2,..., or 99 (unknown).
 * @property {number} ageAtMenarche - Age at first menstrual period. Number such that `ageAtMenarche` ≤ `initialAge`, or 99 (unknown)
 * @property {number} ageAtFirstBirth - Age at first live birth. Number such that `ageAtMenarche` ≤ `ageAtFirstBirth` ≤ `initialAge`, 98 (nulliparous), or 99 (unknown).
 * @property {number} numRelativesWithBrCa - Number of first-degree relatives with breast cancer. Integer: 0, 1, 2,..., or 99 (unknown).
 * @property {number} atypicalHyperplasia - Atypical hyperplasia indicator. 0 (no), 1 (yes), or 99 (unknown/not applicable).
 */

/**
 * @typedef {Object} RiskResult
 * @property {number} absoluteRisk - Absolute risk percentage
 * @property {number} relativeRiskUnder50 - Relative risk for age < 50
 * @property {number} relativeRiskAtOrAbove50 - Relative risk for age ≥ 50
 * @property {number|null} averageRisk - Average risk (if calculated)
 * @property {string} raceEthnicity - Race/ethnicity label
 * @property {Object|null} error - Error object if calculation failed
 */

/**
 * Race codes
 * @enum {number}
 */
export const RaceCode = {
  WHITE: 1,
  AFRICAN_AMERICAN: 2,
  HISPANIC_US_BORN: 3,
  NATIVE_AMERICAN_OTHER: 4,
  HISPANIC_FOREIGN_BORN: 5,
  CHINESE: 6,
  JAPANESE: 7,
  FILIPINO: 8,
  HAWAIIAN: 9,
  OTHER_PACIFIC_ISLANDER: 10,
  OTHER_ASIAN: 11,
};

/**
 * Race/ethnicity labels
 * @type {Object.<number, string>}
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
 * Special values for unknown/not applicable
 */
export const SpecialValues = {
  UNKNOWN: 99,
  NULLIPAROUS: 98,
  NOT_APPLICABLE: 99,
};
