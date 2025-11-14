/**
 * Constants module for BCRA (Breast Cancer Risk Assessment Tool)
 *
 * This module exports all numerical constants required for breast cancer risk calculation
 * using the Gail model. Constants are ported from the R package BCRA-R and maintain
 * full numerical fidelity with the original implementation.
 *
 * Exports:
 * - Beta coefficients (logistic regression model)
 * - Lambda1 (breast cancer incidence rates by age and race)
 * - Lambda2 (competing mortality rates by age and race)
 * - 1-AR (attributable risk values by race and age threshold)
 * - Age-related constants (groups, thresholds, ranges)
 *
 * @module constants
 */

// Export all beta coefficients and lookup
export * from './beta.js';

// Export all lambda1 (breast cancer incidence) rates and lookup
export * from './lambda1.js';

// Export all lambda2 (competing mortality) rates and lookup
export * from './lambda2.js';

// Export all 1-AR (attributable risk) values and helper function
export * from './attributable-risk.js';

/**
 * Age group boundaries (in years)
 * 14 groups: [20,25), [25,30), [30,35), ..., [85,90)
 *
 * These boundaries define the 5-year age intervals used for
 * incidence and mortality rate lookups.
 *
 * @type {number[]}
 * @constant
 */
export const AGE_GROUPS = [
  20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85,
];

/**
 * Number of single years in each 5-year age group
 * @constant
 */
export const YEARS_PER_AGE_GROUP = 5;

/**
 * Minimum age for risk calculation (years)
 * @constant
 */
export const MIN_AGE = 20;

/**
 * Maximum age for risk calculation (years)
 * @constant
 */
export const MAX_AGE = 90;

/**
 * Age threshold for relative risk calculation
 * Used to select between RR_Star1 (<50) and RR_Star2 (>=50)
 * Also used for attributable risk value selection
 *
 * @constant
 */
export const AGE_THRESHOLD = 50;
