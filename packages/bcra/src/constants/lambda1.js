/**
 * Breast cancer composite incidence rates (lambda1)
 *
 * These rates represent the age-specific incidence of invasive breast cancer
 * for different race/ethnicity groups. Rates are expressed as probability per person-year.
 *
 * Source: BCRA-R/data/BrCa_lambda1.rda
 *
 * Structure:
 * - 14 age groups: [20,25), [25,30), [30,35), ..., [85,90)
 * - Each value represents the incidence rate for that 5-year age group
 * - Rates are from various SEER (Surveillance, Epidemiology, and End Results) databases
 *
 * @module constants/lambda1
 */

/**
 * Breast cancer incidence rates for Non-Hispanic White women
 * Source: SEER White 1983-87 (used in NCI BCRAT)
 * Dataset: Wh.1983_87
 */
export const WHITE_LAMBDA1 = [
  0.00001, // [20,25)
  0.000076, // [25,30)
  0.000266, // [30,35)
  0.000661, // [35,40)
  0.001265, // [40,45)
  0.001866, // [45,50)
  0.002211, // [50,55)
  0.002721, // [55,60)
  0.003348, // [60,65)
  0.003923, // [65,70)
  0.004178, // [70,75)
  0.004439, // [75,80)
  0.004421, // [80,85)
  0.004109, // [85,90)
];

/**
 * Breast cancer incidence rates for "average" Non-Hispanic White women
 * Source: SEER White 1992-96
 * Dataset: Wh_Avg.1992_96
 *
 * These rates are used when calculating average risk (options.calculateAverage = true)
 * for White women and Native American/Other women.
 */
export const WHITE_AVG_LAMBDA1 = [
  0.0000122, // [20,25)
  0.0000741, // [25,30)
  0.0002297, // [30,35)
  0.0005649, // [35,40)
  0.0011645, // [40,45)
  0.0019525, // [45,50)
  0.0026154, // [50,55)
  0.0030279, // [55,60)
  0.0036757, // [60,65)
  0.0042029, // [65,70)
  0.0047308, // [70,75)
  0.0049425, // [75,80)
  0.0047976, // [80,85)
  0.0040106, // [85,90)
];

/**
 * Breast cancer incidence rates for African-American women
 * Source: SEER Black 1994-98
 * Dataset: AA.1994_98
 */
export const BLACK_LAMBDA1 = [
  0.00002696, // [20,25)
  0.00011295, // [25,30)
  0.00031094, // [30,35)
  0.00067639, // [35,40)
  0.00119444, // [40,45)
  0.00187394, // [45,50)
  0.00241504, // [50,55)
  0.00291112, // [55,60)
  0.00310127, // [60,65)
  0.0036656, // [65,70)
  0.00393132, // [70,75)
  0.00408951, // [75,80)
  0.00396793, // [80,85)
  0.00363712, // [85,90)
];

/**
 * Breast cancer incidence rates for Hispanic-American women (US Born)
 * Source: SEER CA Hispanic 1995-2004
 * Dataset: HU.1995_04
 */
export const HISPANIC_US_LAMBDA1 = [
  0.0000166, // [20,25)
  0.0000741, // [25,30)
  0.000274, // [30,35)
  0.0006099, // [35,40)
  0.0012225, // [40,45)
  0.0019027, // [45,50)
  0.0023142, // [50,55)
  0.0028357, // [55,60)
  0.0031144, // [60,65)
  0.0030794, // [65,70)
  0.0033344, // [70,75)
  0.0035082, // [75,80)
  0.0025308, // [80,85)
  0.0020414, // [85,90)
];

/**
 * Breast cancer incidence rates for Native American and Other/Unknown race
 * Uses White 1983-87 rates (NA.1983_87)
 *
 * This is a reference to WHITE_LAMBDA1, not a copy.
 */
export const OTHER_LAMBDA1 = WHITE_LAMBDA1;

/**
 * Breast cancer incidence rates for Hispanic-American women (Foreign Born)
 * Source: SEER CA Hispanic 1995-2004
 * Dataset: HF.1995_04
 */
export const HISPANIC_FOREIGN_LAMBDA1 = [
  0.0000102, // [20,25)
  0.0000531, // [25,30)
  0.0001578, // [30,35)
  0.0003602, // [35,40)
  0.0007617, // [40,45)
  0.0011599, // [45,50)
  0.0014111, // [50,55)
  0.0017245, // [55,60)
  0.0020619, // [60,65)
  0.0023603, // [65,70)
  0.0025575, // [70,75)
  0.0028227, // [75,80)
  0.0028295, // [80,85)
  0.0025868, // [85,90)
];

/**
 * Breast cancer incidence rates for Chinese-American women
 * Source: SEER18 1998-2002
 * Dataset: Ch.1998_02
 */
export const CHINESE_LAMBDA1 = [
  0.000004059636, // [20,25)
  0.000045944465, // [25,30)
  0.000188279352, // [30,35)
  0.000492930493, // [35,40)
  0.000913603501, // [40,45)
  0.001471537353, // [45,50)
  0.001421275482, // [50,55)
  0.001970946494, // [55,60)
  0.001674745804, // [60,65)
  0.001821581075, // [65,70)
  0.001834477198, // [70,75)
  0.001919911972, // [75,80)
  0.002233371071, // [80,85)
  0.002247315779, // [85,90)
];

/**
 * Breast cancer incidence rates for Japanese-American women
 * Source: SEER18 1998-2002
 * Dataset: Ja.1998_02
 */
export const JAPANESE_LAMBDA1 = [
  0.000000000001, // [20,25) - extremely low, near-zero rate
  0.000099483924, // [25,30)
  0.000287041681, // [30,35)
  0.000545285759, // [35,40)
  0.001152211095, // [40,45)
  0.001859245108, // [45,50)
  0.002606291272, // [50,55)
  0.003221751682, // [55,60)
  0.004006961859, // [60,65)
  0.003521715275, // [65,70)
  0.003593038294, // [70,75)
  0.003589303081, // [75,80)
  0.003538507159, // [80,85)
  0.002051572909, // [85,90)
];

/**
 * Breast cancer incidence rates for Filipino-American women
 * Source: SEER18 1998-2002
 * Dataset: Fi.1998_02
 */
export const FILIPINO_LAMBDA1 = [
  0.000007500161, // [20,25)
  0.000081073945, // [25,30)
  0.000227492565, // [30,35)
  0.000549786433, // [35,40)
  0.001129400541, // [40,45)
  0.001813873795, // [45,50)
  0.002223665639, // [50,55)
  0.002680309266, // [55,60)
  0.00289121923, // [60,65)
  0.002534421279, // [65,70)
  0.002457159409, // [70,75)
  0.00228661692, // [75,80)
  0.001814802825, // [80,85)
  0.00175087913, // [85,90)
];

/**
 * Breast cancer incidence rates for Hawaiian women
 * Source: SEER18 1998-2002
 * Dataset: Hw.1998_02
 */
export const HAWAIIAN_LAMBDA1 = [
  0.000045080582, // [20,25)
  0.000098570724, // [25,30)
  0.00033997086, // [30,35)
  0.000852591429, // [35,40)
  0.001668562761, // [40,45)
  0.002552703284, // [45,50)
  0.003321774046, // [50,55)
  0.005373001776, // [55,60)
  0.005237808549, // [60,65)
  0.005581732512, // [65,70)
  0.005677419355, // [70,75)
  0.006513409962, // [75,80)
  0.003889457523, // [80,85)
  0.002949061662, // [85,90)
];

/**
 * Breast cancer incidence rates for Other Pacific Islander women
 * Source: SEER18 1998-2002
 * Dataset: oP.1998_02
 */
export const OTHER_PACIFIC_ISLANDER_LAMBDA1 = [
  0.000000000001, // [20,25) - extremely low, near-zero rate
  0.000071525212, // [25,30)
  0.000288799028, // [30,35)
  0.000602250698, // [35,40)
  0.000755579402, // [40,45)
  0.000766406354, // [45,50)
  0.001893124938, // [50,55)
  0.002365580107, // [55,60)
  0.00284393307, // [60,65)
  0.002920921732, // [65,70)
  0.002330395655, // [70,75)
  0.002036291235, // [75,80)
  0.001482683983, // [80,85)
  0.001012248203, // [85,90)
];

/**
 * Breast cancer incidence rates for Other Asian women
 * Source: SEER18 1998-2002
 * Dataset: oA.1998_02
 */
export const OTHER_ASIAN_LAMBDA1 = [
  0.000012355409, // [20,25)
  0.000059526456, // [25,30)
  0.000184320831, // [30,35)
  0.000454677273, // [35,40)
  0.000791265338, // [40,45)
  0.001048462801, // [45,50)
  0.001372467817, // [50,55)
  0.001495473711, // [55,60)
  0.001646746198, // [60,65)
  0.001478363563, // [65,70)
  0.001216010125, // [70,75)
  0.0010676637, // [75,80)
  0.001376104012, // [80,85)
  0.000661576644, // [85,90)
];

/**
 * Lambda1 lookup by race code (1-11)
 *
 * Maps race codes to their corresponding breast cancer incidence rate arrays.
 * Note that race 4 (Native American/Other) references WHITE_LAMBDA1.
 *
 * @type {Object.<number, number[]>}
 * @constant
 *
 * @example
 * import { LAMBDA1_BY_RACE } from './constants/lambda1.js';
 * const lambda1 = LAMBDA1_BY_RACE[data.race];
 */
export const LAMBDA1_BY_RACE = {
  1: WHITE_LAMBDA1, // Non-Hispanic White
  2: BLACK_LAMBDA1, // African-American
  3: HISPANIC_US_LAMBDA1, // Hispanic (US Born)
  4: OTHER_LAMBDA1, // Native American/Other (uses White)
  5: HISPANIC_FOREIGN_LAMBDA1, // Hispanic (Foreign Born)
  6: CHINESE_LAMBDA1, // Chinese-American
  7: JAPANESE_LAMBDA1, // Japanese-American
  8: FILIPINO_LAMBDA1, // Filipino-American
  9: HAWAIIAN_LAMBDA1, // Hawaiian
  10: OTHER_PACIFIC_ISLANDER_LAMBDA1, // Other Pacific Islander
  11: OTHER_ASIAN_LAMBDA1, // Other Asian
};

/**
 * Average lambda1 for calculating average risk
 * Used when options.calculateAverage is true for White and Native American/Other women
 *
 * @type {number[]}
 * @constant
 */
export const AVG_LAMBDA1 = WHITE_AVG_LAMBDA1;
