/**
 * Competing mortality rates (lambda2)
 *
 * These rates represent the age-specific mortality from causes OTHER than breast cancer.
 * They are used to account for competing risks when calculating absolute breast cancer risk.
 * Rates are expressed as probability per person-year.
 *
 * Source: BCRA-R/data/BrCa_lambda2.rda
 *
 * Structure:
 * - 14 age groups: [20,25), [25,30), [30,35), ..., [85,90)
 * - Each value represents the mortality rate for that 5-year age group
 * - Rates are from NCHS (National Center for Health Statistics) databases
 *
 * @module constants/lambda2
 */

/**
 * Competing mortality rates for Non-Hispanic White women
 * Source: NCHS White 1985-87
 * Dataset: Wh.1983_87
 */
export const WHITE_LAMBDA2 = [
  0.000493, // [20,25)
  0.000531, // [25,30)
  0.000625, // [30,35)
  0.000825, // [35,40)
  0.001307, // [40,45)
  0.002181, // [45,50)
  0.003655, // [50,55)
  0.005852, // [55,60)
  0.009439, // [60,65)
  0.015028, // [65,70)
  0.023839, // [70,75)
  0.038832, // [75,80)
  0.066828, // [80,85)
  0.144908, // [85,90)
];

/**
 * Competing mortality rates for "average" Non-Hispanic White women
 * Source: NCHS White 1992-96
 * Dataset: Wh_Avg.1992_96
 *
 * These rates are used when calculating average risk (options.calculateAverage = true)
 * for White women and Native American/Other women.
 */
export const WHITE_AVG_LAMBDA2 = [
  0.0004412, // [20,25)
  0.0005254, // [25,30)
  0.0006746, // [30,35)
  0.0009092, // [35,40)
  0.0012534, // [40,45)
  0.001957, // [45,50)
  0.0032984, // [50,55)
  0.0054622, // [55,60)
  0.0091035, // [60,65)
  0.0141854, // [65,70)
  0.0225935, // [70,75)
  0.0361146, // [75,80)
  0.0613626, // [80,85)
  0.1420663, // [85,90)
];

/**
 * Competing mortality rates for African-American women
 * Source: NCHS Black 1996-2000
 * Dataset: AA.1994_98
 */
export const BLACK_LAMBDA2 = [
  0.00074354, // [20,25)
  0.00101698, // [25,30)
  0.00145937, // [30,35)
  0.00215933, // [35,40)
  0.00315077, // [40,45)
  0.00448779, // [45,50)
  0.00632281, // [50,55)
  0.00963037, // [55,60)
  0.01471818, // [60,65)
  0.02116304, // [65,70)
  0.03266035, // [70,75)
  0.04564087, // [75,80)
  0.06835185, // [80,85)
  0.13271262, // [85,90)
];

/**
 * Competing mortality rates for Hispanic-American women (US Born)
 * Source: SEER CA Hispanic 1995-2004
 * Dataset: HU.1995_04
 */
export const HISPANIC_US_LAMBDA2 = [
  0.0003561, // [20,25)
  0.0004038, // [25,30)
  0.0005281, // [30,35)
  0.0008875, // [35,40)
  0.0013987, // [40,45)
  0.0020769, // [45,50)
  0.0030912, // [50,55)
  0.004696, // [55,60)
  0.007605, // [60,65)
  0.0120555, // [65,70)
  0.0193805, // [70,75)
  0.0288386, // [75,80)
  0.0429634, // [80,85)
  0.0740349, // [85,90)
];

/**
 * Competing mortality rates for Native American and Other/Unknown race
 * Uses White 1985-87 rates (NA.1983_87)
 *
 * This is a reference to WHITE_LAMBDA2, not a copy.
 */
export const OTHER_LAMBDA2 = WHITE_LAMBDA2;

/**
 * Competing mortality rates for Hispanic-American women (Foreign Born)
 * Source: SEER CA Hispanic 1995-2004
 * Dataset: HF.1995_04
 */
export const HISPANIC_FOREIGN_LAMBDA2 = [
  0.0003129, // [20,25)
  0.0002908, // [25,30)
  0.0003515, // [30,35)
  0.0004943, // [35,40)
  0.0007807, // [40,45)
  0.001284, // [45,50)
  0.0020325, // [50,55)
  0.0034533, // [55,60)
  0.0058674, // [60,65)
  0.0096888, // [65,70)
  0.0154429, // [70,75)
  0.0254675, // [75,80)
  0.0448037, // [80,85)
  0.1125678, // [85,90)
];

/**
 * Competing mortality rates for Chinese-American women
 * Source: NCHS mortality data 1998-2002
 * Dataset: Ch.1998_02
 */
export const CHINESE_LAMBDA2 = [
  0.000210649076, // [20,25)
  0.000192644865, // [25,30)
  0.000244435215, // [30,35)
  0.000317895949, // [35,40)
  0.000473261994, // [40,45)
  0.00080027138, // [45,50)
  0.001217480226, // [50,55)
  0.002099836508, // [55,60)
  0.003436889186, // [60,65)
  0.006097405623, // [65,70)
  0.010664526765, // [70,75)
  0.020148678452, // [75,80)
  0.03799079659, // [80,85)
  0.098333900733, // [85,90)
];

/**
 * Competing mortality rates for Japanese-American women
 * Source: NCHS mortality data 1998-2002
 * Dataset: Ja.1998_02
 */
export const JAPANESE_LAMBDA2 = [
  0.000173593803, // [20,25)
  0.000295805882, // [25,30)
  0.000228322534, // [30,35)
  0.000363242389, // [35,40)
  0.000590633044, // [40,45)
  0.001086079485, // [45,50)
  0.001859999966, // [50,55)
  0.003216600974, // [55,60)
  0.004719402141, // [60,65)
  0.008535331402, // [65,70)
  0.012433511681, // [70,75)
  0.020230197885, // [75,80)
  0.037725498348, // [80,85)
  0.106149118663, // [85,90)
];

/**
 * Competing mortality rates for Filipino-American women
 * Source: NCHS mortality data 1998-2002
 * Dataset: Fi.1998_02
 */
export const FILIPINO_LAMBDA2 = [
  0.000229120979, // [20,25)
  0.000262988494, // [25,30)
  0.00031484409, // [30,35)
  0.000394471908, // [35,40)
  0.00064762261, // [40,45)
  0.001170202327, // [45,50)
  0.001809380379, // [50,55)
  0.002614170568, // [55,60)
  0.004483330681, // [60,65)
  0.007393665092, // [65,70)
  0.012233059675, // [70,75)
  0.021127058106, // [75,80)
  0.037936954809, // [80,85)
  0.085138518334, // [85,90)
];

/**
 * Competing mortality rates for Hawaiian women
 * Source: NCHS mortality data 1998-2002
 * Dataset: Hw.1998_02
 */
export const HAWAIIAN_LAMBDA2 = [
  0.000563507269, // [20,25)
  0.000369640217, // [25,30)
  0.001019912579, // [30,35)
  0.001234013911, // [35,40)
  0.002098344078, // [40,45)
  0.002982934175, // [45,50)
  0.005402445702, // [50,55)
  0.009591474245, // [55,60)
  0.016315472607, // [60,65)
  0.020152229069, // [65,70)
  0.02735483871, // [70,75)
  0.050446998723, // [75,80)
  0.072262026612, // [80,85)
  0.145844504021, // [85,90)
];

/**
 * Competing mortality rates for Other Pacific Islander women
 * Source: NCHS mortality data 1998-2002
 * Dataset: oP.1998_02
 */
export const OTHER_PACIFIC_ISLANDER_LAMBDA2 = [
  0.000465500812, // [20,25)
  0.00060046692, // [25,30)
  0.000851057138, // [30,35)
  0.001478265376, // [35,40)
  0.001931486788, // [40,45)
  0.003866623959, // [45,50)
  0.004924932309, // [50,55)
  0.008177071806, // [55,60)
  0.00863820289, // [60,65)
  0.018974658371, // [65,70)
  0.029257567105, // [70,75)
  0.038408980974, // [75,80)
  0.052869579345, // [80,85)
  0.074745721133, // [85,90)
];

/**
 * Competing mortality rates for Other Asian women
 * Source: NCHS mortality data 1998-2002
 * Dataset: oA.1998_02
 */
export const OTHER_ASIAN_LAMBDA2 = [
  0.000212632332, // [20,25)
  0.000242170741, // [25,30)
  0.000301552711, // [30,35)
  0.000369053354, // [35,40)
  0.000543002943, // [40,45)
  0.000893862331, // [45,50)
  0.001515172239, // [50,55)
  0.002574669551, // [55,60)
  0.004324370426, // [60,65)
  0.007419621918, // [65,70)
  0.01325176513, // [70,75)
  0.02229142749, // [75,80)
  0.041746550635, // [80,85)
  0.087485802065, // [85,90)
];

/**
 * Lambda2 lookup by race code (1-11)
 *
 * Maps race codes to their corresponding competing mortality rate arrays.
 * Note that race 4 (Native American/Other) references WHITE_LAMBDA2.
 *
 * @type {Object.<number, number[]>}
 * @constant
 *
 * @example
 * import { LAMBDA2_BY_RACE } from './constants/lambda2.js';
 * const lambda2 = LAMBDA2_BY_RACE[patientData.race];
 */
export const LAMBDA2_BY_RACE = {
  1: WHITE_LAMBDA2, // Non-Hispanic White
  2: BLACK_LAMBDA2, // African-American
  3: HISPANIC_US_LAMBDA2, // Hispanic (US Born)
  4: OTHER_LAMBDA2, // Native American/Other (uses White)
  5: HISPANIC_FOREIGN_LAMBDA2, // Hispanic (Foreign Born)
  6: CHINESE_LAMBDA2, // Chinese-American
  7: JAPANESE_LAMBDA2, // Japanese-American
  8: FILIPINO_LAMBDA2, // Filipino-American
  9: HAWAIIAN_LAMBDA2, // Hawaiian
  10: OTHER_PACIFIC_ISLANDER_LAMBDA2, // Other Pacific Islander
  11: OTHER_ASIAN_LAMBDA2, // Other Asian
};

/**
 * Average lambda2 for calculating average risk
 * Used when options.calculateAverage is true for White and Native American/Other women
 *
 * @type {number[]}
 * @constant
 */
export const AVG_LAMBDA2 = WHITE_AVG_LAMBDA2;
