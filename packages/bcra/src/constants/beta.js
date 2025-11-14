/**
 * Beta coefficients for logistic regression model (Gail Model)
 *
 * These coefficients are used to calculate relative risk based on risk factor covariates.
 * Each race group has its own set of coefficients based on population-specific studies.
 *
 * Source: BCRA-R/data/BrCa_beta.rda
 *
 * Coefficient Order (6 values per array):
 * [0] N_Biop  - Number of breast biopsies
 * [1] AgeMen  - Age at menarche (first menstrual period)
 * [2] AgeFst  - Age at first live birth
 * [3] N_Rels  - Number of first-degree relatives with breast cancer
 * [4] A50*NB  - Interaction term: Age category (>=50) × Number of biopsies
 * [5] AF*NR   - Interaction term: Age at first birth × Number of relatives
 *
 * @module constants/beta
 */

/**
 * Beta coefficients for Non-Hispanic White women
 * Source: Gail Model (Wh.Gail)
 * Data: Original BCRAT coefficients
 */
export const WHITE_BETA = [
  0.5292641686, // N_Biop
  0.0940103059, // AgeMen
  0.2186262218, // AgeFst
  0.9583027845, // N_Rels
  -0.288042483, // A50*NB
  -0.1908113865, // AF*NR
];

/**
 * Beta coefficients for African-American women
 * Source: CARE Study (AA.CARE)
 * Data: African-American specific model from CARE study
 *
 * Note: AgeFst (index 2) and AF*NR (index 5) are 0 because age at first birth
 * is not included in the African-American relative risk model.
 */
export const BLACK_BETA = [
  0.1822121131, // N_Biop
  0.2672530336, // AgeMen
  0.0, // AgeFst - NOT in AA model
  0.4757242578, // N_Rels
  -0.1119411682, // A50*NB
  0.0, // AF*NR - NOT in AA model
];

/**
 * Beta coefficients for Hispanic-American women (US Born)
 * Source: San Francisco Bay Area Breast Cancer Study (HU.Gail)
 * Data: SEER CA Hispanic 1995-2004, US born population
 *
 * Note: AgeMen (index 1) and AF*NR (index 5) are 0 because age at menarche
 * is not included in the Hispanic US-born model.
 */
export const HISPANIC_US_BETA = [
  0.0970783641, // N_Biop
  0.0, // AgeMen - NOT in HU model
  0.2318368334, // AgeFst
  0.166685441, // N_Rels
  0.0, // A50*NB - NOT in HU model
  0.0, // AF*NR - NOT in HU model
];

/**
 * Beta coefficients for Hispanic-American women (Foreign Born)
 * Source: San Francisco Bay Area Breast Cancer Study (HF.Gail)
 * Data: SEER CA Hispanic 1995-2004, Foreign born population
 *
 * Note: A50*NB (index 4) and AF*NR (index 5) are 0 for this population.
 */
export const HISPANIC_FOREIGN_BETA = [
  0.4798624017, // N_Biop
  0.2593922322, // AgeMen
  0.4669246218, // AgeFst
  0.9076679727, // N_Rels
  0.0, // A50*NB - NOT in HF model
  0.0, // AF*NR - NOT in HF model
];

/**
 * Beta coefficients for Asian-American women (all subgroups)
 * Source: Asian American Breast Cancer Study (Asian.AABCS)
 * Data: Combined model for all Asian/Pacific Islander subgroups
 *
 * This same coefficient array is used for:
 * - Chinese-American (race 6)
 * - Japanese-American (race 7)
 * - Filipino-American (race 8)
 * - Hawaiian (race 9)
 * - Other Pacific Islander (race 10)
 * - Other Asian (race 11)
 *
 * Note: A50*NB (index 4) and AF*NR (index 5) are 0 for this population.
 */
export const ASIAN_BETA = [
  0.55263612260619, // N_Biop
  0.07499257592975, // AgeMen
  0.27638268294593, // AgeFst
  0.79185633720481, // N_Rels
  0.0, // A50*NB - NOT in Asian model
  0.0, // AF*NR - NOT in Asian model
];

/**
 * Beta coefficients for Native American and Other/Unknown race
 * Uses White coefficients (NA.Gail)
 *
 * This is a reference to WHITE_BETA, not a copy.
 */
export const OTHER_BETA = WHITE_BETA;

/**
 * Beta coefficient lookup by race code (1-11)
 *
 * This object maps race codes to their corresponding beta coefficient arrays.
 * Note that multiple race codes may reference the same array:
 * - Race 4 (Native American/Other) uses WHITE_BETA
 * - Races 6-11 (all Asian/Pacific Islander subgroups) use ASIAN_BETA
 *
 * @type {Object.<number, number[]>}
 * @constant
 *
 * @example
 * import { BETA_BY_RACE } from './constants/beta.js';
 * const beta = BETA_BY_RACE[patientData.race];
 */
export const BETA_BY_RACE = {
  1: WHITE_BETA, // Non-Hispanic White
  2: BLACK_BETA, // African-American
  3: HISPANIC_US_BETA, // Hispanic (US Born)
  4: OTHER_BETA, // Native American/Other (uses White)
  5: HISPANIC_FOREIGN_BETA, // Hispanic (Foreign Born)
  6: ASIAN_BETA, // Chinese-American
  7: ASIAN_BETA, // Japanese-American
  8: ASIAN_BETA, // Filipino-American
  9: ASIAN_BETA, // Hawaiian
  10: ASIAN_BETA, // Other Pacific Islander
  11: ASIAN_BETA, // Other Asian
};

/**
 * Coefficient names for documentation and debugging
 * @type {string[]}
 * @constant
 */
export const BETA_COEFFICIENT_NAMES = [
  'N_Biop', // Number of biopsies
  'AgeMen', // Age at menarche
  'AgeFst', // Age at first birth
  'N_Rels', // Number of relatives
  'A50*NB', // Age>=50 × Biopsies interaction
  'AF*NR', // Age first birth × Relatives interaction
];
