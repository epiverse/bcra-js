/**
 * TypeScript type definitions for BCRA (Breast Cancer Risk Assessment Tool)
 *
 * This file provides TypeScript type definitions for the BCRA JavaScript library.
 * It mirrors the JSDoc typedefs in src/types/index.js.
 *
 * @packageDocumentation
 */

/**
 * Input data structure for breast cancer risk assessment.
 *
 * This interface represents the raw or recoded input data required to calculate
 * absolute and relative breast cancer risk using the Gail model (BCRAT).
 *
 * Special Values:
 * - 98 = Nulliparous (no live births) - only for ageAtFirstBirth
 * - 99 = Unknown/Not Applicable - used across multiple fields
 */
export interface RiskFactorProfile {
  /** Individual's unique identifier. Positive integer: 1, 2, 3, ... */
  id: number;

  /** Current/initial age at assessment. Real number in [20, 90). Must be less than projectionEndAge. */
  initialAge: number;

  /** Future age for risk projection. Real number in (20, 90]. Must be greater than initialAge. */
  projectionEndAge: number;

  /** Race/ethnicity code. Integer in [1, 11]. See RaceCode enum for valid values. */
  race: number;

  /** Number of previous breast biopsies. Integer: 0, 1, 2, ..., or 99 (unknown). */
  numBreastBiopsies: number;

  /** Age at first menstrual period. Real number ≤ initialAge, or 99 (unknown). */
  ageAtMenarche: number;

  /**
   * Age at first live birth. Real number where ageAtMenarche ≤ ageAtFirstBirth ≤ initialAge,
   * 98 (nulliparous/no births), or 99 (unknown).
   */
  ageAtFirstBirth: number;

  /**
   * Number of first-degree relatives (mother, sisters, daughters) with breast cancer.
   * Integer: 0, 1, 2, ..., or 99 (unknown).
   */
  numRelativesWithBrCa: number;

  /**
   * Presence of atypical hyperplasia on any biopsy.
   * 0 (no), 1 (yes), or 99 (unknown/not applicable if no biopsies).
   */
  atypicalHyperplasia: number;
}

/**
 * Recoded covariate values after validation and transformation.
 *
 * The BCRA model uses categorical variables for risk factors. Raw input values
 * are recoded into standardized categories before risk calculation. Different
 * race groups may have different recoding rules.
 */
export interface RecodedValues {
  /**
   * Recoded number of biopsies.
   * - 0 = none/unknown
   * - 1 = one biopsy
   * - 2 = two or more biopsies
   *
   * Note: Hispanic women pool categories 2 and 1.
   */
  biopsyCategory: number;

  /**
   * Recoded age at menarche.
   * - 0 = 14+ or unknown
   * - 1 = 12-13
   * - 2 = <12
   *
   * Note: African-American women pool categories 2 and 1; Hispanic US-born women set to 0.
   */
  menarcheCategory: number;

  /**
   * Recoded age at first birth.
   * - 0 = <20 or unknown
   * - 1 = 20-24
   * - 2 = 25-29 or nulliparous
   * - 3 = 30+
   *
   * Note: African-American women set to 0; Hispanic women use different groupings.
   */
  firstBirthCategory: number;

  /**
   * Recoded number of relatives with breast cancer.
   * - 0 = none/unknown
   * - 1 = one relative
   * - 2 = two or more
   *
   * Note: Asian and Hispanic women pool categories 2 and 1.
   */
  relativesCategory: number;

  /**
   * Relative risk multiplier for atypical hyperplasia.
   * - 0.93 = no hyperplasia
   * - 1.00 = unknown or no biopsies
   * - 1.82 = hyperplasia present
   */
  hyperplasiaMultiplier: number;

  /** Human-readable race/ethnicity label from RaceLabels. */
  raceLabel: string;
}

/**
 * Result of input validation and recoding.
 *
 * Contains validation status, error/warning messages, and recoded covariate values.
 * Returned by the recodeAndValidate() function before risk calculation.
 */
export interface ValidationResult {
  /**
   * Whether the input data passed all validation checks.
   * If false, risk calculation should not proceed.
   */
  isValid: boolean;

  /**
   * Array of error messages describing validation failures.
   * Empty if isValid is true.
   */
  errors: string[];

  /**
   * Array of warning messages for potential data issues that don't prevent calculation.
   */
  warnings: string[];

  /**
   * Transformed covariate values ready for risk calculation.
   * Null if validation failed.
   */
  recodedValues: RecodedValues | null;

  /**
   * Binary error flag.
   * - 0 = valid
   * - 1 = error present
   *
   * Matches R package convention.
   */
  errorIndicator: number;
}

/**
 * Result of breast cancer risk calculation.
 *
 * Contains absolute risk, relative risks, and metadata about the calculation.
 * Returned by the calculateRisk() function.
 */
export interface RiskResult {
  /**
   * Absolute risk of developing invasive breast cancer during the projection interval,
   * expressed as a percentage (0-100). Null if calculation failed.
   */
  absoluteRisk: number | null;

  /**
   * Relative risk multiplier for women under age 50.
   * Calculated from logistic regression model with race-specific coefficients.
   * Null if calculation failed.
   */
  relativeRiskUnder50: number | null;

  /**
   * Relative risk multiplier for women age 50 and older.
   * Includes additional age-biopsy interaction term.
   * Null if calculation failed.
   */
  relativeRiskAtOrAbove50: number | null;

  /**
   * Average risk for a woman of the same age and race with "average" risk factors.
   * Only calculated if requested. Null otherwise.
   */
  averageRisk: number | null;

  /**
   * Human-readable race/ethnicity label from RaceLabels.
   * Null if calculation failed.
   */
  raceEthnicity: string | null;

  /**
   * Error object if calculation failed.
   * Contains message and optionally stack trace.
   * Null if successful.
   */
  error: {
    message: string;
    stack?: string;
  } | null;
}

/**
 * Race/ethnicity codes for breast cancer risk assessment.
 *
 * Each race group uses population-specific incidence rates, mortality rates,
 * and logistic regression coefficients.
 */
export enum RaceCode {
  /** Non-Hispanic White (SEER 1983-87 rates, NCI BCRAT standard) */
  WHITE = 1,

  /** African-American (SEER Black 1994-98, CARE study model) */
  AFRICAN_AMERICAN = 2,

  /** Hispanic-American, US Born (SEER CA Hispanic 1995-2004) */
  HISPANIC_US_BORN = 3,

  /** Native American and Other/Unknown race (uses White rates) */
  NATIVE_AMERICAN_OTHER = 4,

  /** Hispanic-American, Foreign Born (SEER CA Hispanic 1995-2004) */
  HISPANIC_FOREIGN_BORN = 5,

  /** Chinese-American (SEER18 1998-2002) */
  CHINESE = 6,

  /** Japanese-American (SEER18 1998-2002) */
  JAPANESE = 7,

  /** Filipino-American (SEER18 1998-2002) */
  FILIPINO = 8,

  /** Hawaiian (SEER18 1998-2002) */
  HAWAIIAN = 9,

  /** Other Pacific Islander (SEER18 1998-2002) */
  OTHER_PACIFIC_ISLANDER = 10,

  /** Other Asian (SEER18 1998-2002) */
  OTHER_ASIAN = 11,
}

/**
 * Human-readable labels for race/ethnicity codes.
 *
 * Maps numeric race codes (1-11) to descriptive labels for display purposes.
 */
export const RaceLabels: {
  readonly 1: 'Non-Hispanic White';
  readonly 2: 'African-American';
  readonly 3: 'Hispanic (US Born)';
  readonly 4: 'Native American/Other';
  readonly 5: 'Hispanic (Foreign Born)';
  readonly 6: 'Chinese-American';
  readonly 7: 'Japanese-American';
  readonly 8: 'Filipino-American';
  readonly 9: 'Hawaiian';
  readonly 10: 'Other Pacific Islander';
  readonly 11: 'Other Asian';
};

/**
 * Special numeric codes for unknown or not applicable values.
 *
 * These codes are used throughout the input data to indicate missing information
 * or special conditions.
 */
export const SpecialValues: {
  /** Unknown or missing value - used across multiple fields */
  readonly UNKNOWN: 99;

  /** Nulliparous (no live births) - only used for ageAtFirstBirth */
  readonly NULLIPAROUS: 98;

  /** Not applicable - used for atypicalHyperplasia when no biopsies performed */
  readonly NOT_APPLICABLE: 99;
};
