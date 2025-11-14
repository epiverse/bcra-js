/**
 * Relative Risk Calculation Module
 *
 * Implements the logistic regression component of the Gail Model (BCRAT) to calculate
 * relative risk multipliers for two age groups (< 50 and >= 50).
 *
 * This is a derivative work based on the BCRA R package
 * originally developed by Fanni Zhang and licensed under GPL-2 or later.
 *
 * Copyright (C) 2020 Fanni Zhang (Original BCRA R Package)
 * Copyright (C) 2025 epiVerse (JavaScript Implementation)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * @module core/relative-risk
 * @license GPL-3.0-or-later
 */

import { BETA_BY_RACE } from '../constants/index.js';

/**
 * Calculates relative risk for women under age 50 and age 50+
 *
 * Uses race-specific beta coefficients from logistic regression models to compute
 * relative risk multipliers. The model uses categorical covariates produced by
 * the recodeAndValidate function.
 *
 * Formula:
 * - LP1 = β₀·NB + β₁·AM + β₂·AF + β₃·NR + β₅·(AF×NR) + ln(R_Hyp)
 * - LP2 = LP1 + β₄·NB
 * - RR_Star1 = exp(LP1) for ages < 50
 * - RR_Star2 = exp(LP2) for ages >= 50
 *
 * Where:
 * - NB = biopsyCategory (0, 1, or 2)
 * - AM = menarcheCategory (0, 1, or 2)
 * - AF = firstBirthCategory (0, 1, 2, or 3)
 * - NR = relativesCategory (0, 1, or 2)
 * - R_Hyp = hyperplasiaMultiplier (0.93, 1.00, or 1.82)
 * - β = race-specific beta coefficients
 *
 * Pattern Number:
 * Identifies one of 108 unique risk factor combinations:
 * PatternNumber = NB×36 + AM×12 + AF×3 + NR×1 + 1
 * Range: 1-108 (3×3×4×3 = 108 patterns)
 *
 * @param {import('../types/index.js').ValidationResult} validation - Validated and recoded data from recodeAndValidate()
 * @param {number} race - Race code (1-11) from RaceCode enum
 * @returns {{relativeRiskUnder50: number|null, relativeRiskAtOrAbove50: number|null, patternNumber: number|null}}
 *
 * @example
 * // Calculate relative risk for validated risk factor data
 * const validation = recodeAndValidate(data);
 * const relativeRisk = calculateRelativeRisk(validation, RaceCode.WHITE);
 * console.log(relativeRisk.relativeRiskUnder50); // e.g., 2.45
 * console.log(relativeRisk.relativeRiskAtOrAbove50); // e.g., 1.87
 * console.log(relativeRisk.patternNumber); // e.g., 56 (one of 108 patterns)
 */
export function calculateRelativeRisk(validation, race) {
  // Initialize result with null values
  const result = {
    relativeRiskUnder50: null,
    relativeRiskAtOrAbove50: null,
    patternNumber: null,
  };

  // Check if validation failed
  if (!validation || !validation.isValid) {
    return result;
  }

  // Extract recoded values
  const {
    biopsyCategory,
    menarcheCategory,
    firstBirthCategory,
    relativesCategory,
    hyperplasiaMultiplier,
  } = validation.recodedValues;

  // Validate that all required fields are present
  if (
    biopsyCategory === undefined ||
    menarcheCategory === undefined ||
    firstBirthCategory === undefined ||
    relativesCategory === undefined ||
    hyperplasiaMultiplier === undefined
  ) {
    return result;
  }

  // Get beta coefficients for this race
  const beta = BETA_BY_RACE[race];
  if (!beta) {
    return result;
  }

  // Calculate pattern number (1-108)
  // Pattern = NB*36 + AM*12 + AF*3 + NR*1 + 1
  // This uniquely identifies the risk factor combination
  const patternNumber =
    biopsyCategory * 36 +
    menarcheCategory * 12 +
    firstBirthCategory * 3 +
    relativesCategory * 1 +
    1;

  // Calculate Linear Predictor 1 (LP1) for women under age 50
  // LP1 = β[0]·NB + β[1]·AM + β[2]·AF + β[3]·NR + β[5]·(AF×NR) + ln(R_Hyp)
  const LP1 =
    biopsyCategory * beta[0] + // N_Biop
    menarcheCategory * beta[1] + // AgeMen
    firstBirthCategory * beta[2] + // AgeFst
    relativesCategory * beta[3] + // N_Rels
    firstBirthCategory * relativesCategory * beta[5] + // AF*NR interaction
    Math.log(hyperplasiaMultiplier); // log(R_Hyp)

  // Calculate Linear Predictor 2 (LP2) for women age 50 and older
  // LP2 = LP1 + β[4]·NB (adds age>=50 × biopsies interaction)
  const LP2 = LP1 + biopsyCategory * beta[4]; // A50*NB interaction

  // Calculate relative risks using exponential function
  const relativeRiskUnder50 = Math.exp(LP1);
  const relativeRiskAtOrAbove50 = Math.exp(LP2);

  return {
    relativeRiskUnder50,
    relativeRiskAtOrAbove50,
    patternNumber,
  };
}
