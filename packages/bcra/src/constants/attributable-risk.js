/**
 * 1 - Attributable Risk values (1-AR)
 *
 * The attributable risk represents the proportion of breast cancer cases in a population
 * that can be attributed to the risk factors included in the model. The value (1-AR) is
 * used in the absolute risk calculation as a scaling factor for relative risk.
 *
 * Source: BCRA-R/data/BrCa_1_AR.rda
 *
 * Structure:
 * - Each race group has 2 values: one for age <50, one for age >=50
 * - Values differ by age because risk factor patterns vary with age
 * - Based on different epidemiological studies by race/ethnicity
 *
 * @module constants/attributable-risk
 */

/**
 * 1-Attributable Risk for Non-Hispanic White women
 * Source: Gail Model (Wh.Gail)
 * Data: Original NCI BCRAT model
 *
 * Note: Same value for both age groups (0.5788413)
 */
export const WHITE_1_AR = [
  0.5788413, // Age < 50
  0.5788413, // Age >= 50
];

/**
 * 1-Attributable Risk for African-American women
 * Source: CARE Study (AA.CARE)
 * Data: Contraceptive and Reproductive Experiences Study
 */
export const BLACK_1_AR = [
  0.7294988, // Age < 50
  0.74397137, // Age >= 50
];

/**
 * 1-Attributable Risk for Hispanic-American women (US Born)
 * Source: San Francisco Bay Area Breast Cancer Study (HU.Gail)
 * Data: SEER CA Hispanic 1995-2004, US born population
 */
export const HISPANIC_US_1_AR = [
  0.749294788397, // Age < 50
  0.778215491668, // Age >= 50
];

/**
 * 1-Attributable Risk for Native American and Other/Unknown race
 * Uses White values (NA.Gail)
 *
 * This is a reference to WHITE_1_AR, not a copy.
 */
export const OTHER_1_AR = WHITE_1_AR;

/**
 * 1-Attributable Risk for Hispanic-American women (Foreign Born)
 * Source: San Francisco Bay Area Breast Cancer Study (HF.Gail)
 * Data: SEER CA Hispanic 1995-2004, Foreign born population
 */
export const HISPANIC_FOREIGN_1_AR = [
  0.428864989813, // Age < 50
  0.450352338746, // Age >= 50
];

/**
 * 1-Attributable Risk for Asian-American women (all subgroups)
 * Source: Asian American Breast Cancer Study (Asian.AABCS)
 * Data: Combined model for all Asian/Pacific Islander subgroups
 *
 * This same value array is used for:
 * - Chinese-American (race 6)
 * - Japanese-American (race 7)
 * - Filipino-American (race 8)
 * - Hawaiian (race 9)
 * - Other Pacific Islander (race 10)
 * - Other Asian (race 11)
 */
export const ASIAN_1_AR = [
  0.47519806426735, // Age < 50
  0.50316401683903, // Age >= 50
];

/**
 * 1-Attributable Risk lookup by race code (1-11)
 *
 * Maps race codes to their corresponding 1-AR value arrays [age<50, age>=50].
 * Note that:
 * - Race 4 (Native American/Other) references WHITE_1_AR
 * - Races 6-11 (all Asian/Pacific Islander subgroups) reference ASIAN_1_AR
 *
 * @type {Object.<number, number[]>}
 * @constant
 *
 * @example
 * import { ATTRIBUTABLE_RISK_BY_RACE } from './constants/attributable-risk.js';
 * const ar = ATTRIBUTABLE_RISK_BY_RACE[patientData.race];
 * const oneMinusAR = patientData.initialAge < 50 ? ar[0] : ar[1];
 */
export const ATTRIBUTABLE_RISK_BY_RACE = {
  1: WHITE_1_AR, // Non-Hispanic White
  2: BLACK_1_AR, // African-American
  3: HISPANIC_US_1_AR, // Hispanic (US Born)
  4: OTHER_1_AR, // Native American/Other (uses White)
  5: HISPANIC_FOREIGN_1_AR, // Hispanic (Foreign Born)
  6: ASIAN_1_AR, // Chinese-American
  7: ASIAN_1_AR, // Japanese-American
  8: ASIAN_1_AR, // Filipino-American
  9: ASIAN_1_AR, // Hawaiian
  10: ASIAN_1_AR, // Other Pacific Islander
  11: ASIAN_1_AR, // Other Asian
};

/**
 * Age threshold for selecting attributable risk value
 * @constant
 */
export const AGE_THRESHOLD = 50;

/**
 * Helper function to get the appropriate 1-AR value for a given race and age
 *
 * @param {number} race - Race code (1-11)
 * @param {number} age - Age in years
 * @returns {number} The 1-AR value for the specified race and age group
 *
 * @example
 * import { getAttributableRisk } from './constants/attributable-risk.js';
 * const oneMinusAR = getAttributableRisk(1, 45); // Returns 0.5788413 (White, age <50)
 * const oneMinusAR2 = getAttributableRisk(2, 55); // Returns 0.74397137 (Black, age >=50)
 */
export function getAttributableRisk(race, age) {
  const arArray = ATTRIBUTABLE_RISK_BY_RACE[race];
  if (!arArray) {
    throw new Error(`Invalid race code: ${race}. Must be between 1 and 11.`);
  }
  return age < AGE_THRESHOLD ? arArray[0] : arArray[1];
}
