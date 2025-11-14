/**
 * Absolute Risk Calculation Module
 *
 * Implements the numerical integration component of the Gail Model (BCRAT) to calculate
 * the absolute risk of developing invasive breast cancer over a specified time period.
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
 * @module core/absolute-risk
 * @license GPL-3.0-or-later
 */

import {
  LAMBDA1_BY_RACE,
  LAMBDA2_BY_RACE,
  WHITE_AVG_LAMBDA1,
  WHITE_AVG_LAMBDA2,
  ATTRIBUTABLE_RISK_BY_RACE,
} from '../constants/index.js';
import { RaceCode } from '../types/index.js';

/**
 * Expands 14 age-group rates into 70 single-year rates
 *
 * The BCRA model uses rates specified for 14 five-year age groups:
 * [20,25), [25,30), [30,35), ..., [85,90)
 *
 * This function expands these to 70 single-year rates by repeating each
 * group rate 5 times, mapping to ages 20-89.
 *
 * @param {number[]} ratesByGroup - Array of 14 rates (one per 5-year age group)
 * @returns {number[]} Array of 70 rates (one per single year, ages 20-89)
 *
 * @example
 * const lambda1 = [0.001, 0.002, ...]; // 14 values
 * const singleYearRates = expandToSingleYears(lambda1);
 * // Returns 70 values: [0.001, 0.001, 0.001, 0.001, 0.001, 0.002, 0.002, ...]
 */
export function expandToSingleYears(ratesByGroup) {
  const singleYearRates = [];

  for (let i = 0; i < ratesByGroup.length; i++) {
    // Repeat each rate 5 times (one for each year in the 5-year group)
    for (let j = 0; j < 5; j++) {
      singleYearRates.push(ratesByGroup[i]);
    }
  }

  return singleYearRates;
}

/**
 * Calculates absolute risk of developing breast cancer using numerical integration
 *
 * Implements the Gail Model formula for absolute risk:
 *
 * AbsoluteRisk = ∫[t1 to t2] [(1-AR)·RR·λ₁(t) / ((1-AR)·RR·λ₁(t) + λ₂(t))] ·
 *                              exp(-∫[t1 to t] ((1-AR)·RR·λ₁(s) + λ₂(s)) ds) dt
 *
 * Where:
 * - t1 = current age (initialAge)
 * - t2 = projection age (projectionEndAge)
 * - λ₁(t) = breast cancer incidence rate at age t (lambda1)
 * - λ₂(t) = competing mortality rate at age t (lambda2)
 * - AR = attributable risk (population attributable risk)
 * - RR = relative risk for the individual
 *
 * The function handles:
 * - Fractional ages (e.g., 45.5 years)
 * - Race-specific incidence and mortality rates
 * - Different RR values for ages < 50 and >= 50
 * - Average risk calculation mode
 *
 * @param {import('../types/index.js').RiskFactorProfile} data - Individual's risk factor data including ages and race
 * @param {import('../types/index.js').ValidationResult} validation - Validated and recoded data
 * @param {{relativeRiskUnder50: number, relativeRiskAtOrAbove50: number, patternNumber: number}} relativeRisk - Relative risk values
 * @param {boolean} [calculateAverage=false] - If true, calculate average risk instead of individual risk
 * @returns {number|null} Absolute risk as percentage (0-100), or null if validation failed
 *
 * @example
 * const data = { initialAge: 45, projectionEndAge: 50, race: RaceCode.WHITE, ... };
 * const validation = recodeAndValidate(data);
 * const relativeRisk = calculateRelativeRisk(validation, data.race);
 * const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);
 * console.log(absoluteRisk); // e.g., 1.84 (1.84% risk over 5 years)
 */
export function calculateAbsoluteRisk(
  data,
  validation,
  relativeRisk,
  calculateAverage = false
) {
  // Check if validation failed
  if (!validation || !validation.isValid) {
    return null;
  }

  const { initialAge, projectionEndAge, race } = data;

  // Get race-specific rates
  const lambda1ByGroup = LAMBDA1_BY_RACE[race];
  const lambda2ByGroup = LAMBDA2_BY_RACE[race];
  const attributableRisk = ATTRIBUTABLE_RISK_BY_RACE[race];

  if (!lambda1ByGroup || !lambda2ByGroup || !attributableRisk) {
    return null;
  }

  // Determine which lambda1 and lambda2 to use
  let lambda1ToUse = lambda1ByGroup;
  let lambda2ToUse = lambda2ByGroup;

  // For average risk calculation, use average rates for White and Native American
  if (
    calculateAverage &&
    (race === RaceCode.WHITE || race === RaceCode.NATIVE_AMERICAN_OTHER)
  ) {
    lambda1ToUse = WHITE_AVG_LAMBDA1;
    lambda2ToUse = WHITE_AVG_LAMBDA2;
  }

  // Expand 14 age groups to 70 single years
  const lambda1 = expandToSingleYears(lambda1ToUse);
  const lambda2 = expandToSingleYears(lambda2ToUse);

  // Build (1-AR)*RR array for all 70 years (ages 20-89)
  const oneMinusARTimesRR = new Array(70);

  if (calculateAverage) {
    // For average risk, use 1.0 for all ages
    oneMinusARTimesRR.fill(1.0);
  } else {
    // Use race-specific attributable risk and individual's relative risk
    const ar1 = attributableRisk[0]; // AR for age < 50
    const ar2 = attributableRisk[1]; // AR for age >= 50
    const rrStar1 = relativeRisk.relativeRiskUnder50;
    const rrStar2 = relativeRisk.relativeRiskAtOrAbove50;

    // Years 0-29 correspond to ages 20-49 (under 50)
    for (let i = 0; i < 30; i++) {
      oneMinusARTimesRR[i] = ar1 * rrStar1;
    }

    // Years 30-69 correspond to ages 50-89 (50 and older)
    for (let i = 30; i < 70; i++) {
      oneMinusARTimesRR[i] = ar2 * rrStar2;
    }
  }

  // Perform numerical integration
  const risk = integrateRisk(
    initialAge,
    projectionEndAge,
    lambda1,
    lambda2,
    oneMinusARTimesRR
  );

  // Convert to percentage
  return risk * 100;
}

/**
 * Performs numerical integration to calculate absolute risk
 *
 * Integrates the Gail Model formula over the age interval [t1, t2] using
 * a discrete approximation with yearly intervals. Handles fractional ages
 * at the boundaries.
 *
 * Algorithm:
 * 1. Convert ages to array indices (age 20 = index 0)
 * 2. Loop through each year interval from t1 to t2
 * 3. For each interval:
 *    - Calculate integration length (handles partial years at boundaries)
 *    - Get rates for that interval: λ₁[j], λ₂[j], (1-AR)·RR[j]
 *    - Calculate combined hazard: λ_combined = (1-AR)·RR·λ₁ + λ₂
 *    - Calculate risk contribution:
 *      Δrisk = [(1-AR)·RR·λ₁ / λ_combined] · exp(-Σλ_combined) · [1 - exp(-λ_combined·Δt)]
 *    - Accumulate risk and update cumulative hazard
 *
 * @param {number} t1 - Initial age (current age)
 * @param {number} t2 - Projection age (future age)
 * @param {number[]} lambda1 - 70-element array of breast cancer incidence rates (ages 20-89)
 * @param {number[]} lambda2 - 70-element array of competing mortality rates (ages 20-89)
 * @param {number[]} oneMinusARTimesRR - 70-element array of (1-AR)×RR values (ages 20-89)
 * @returns {number} Absolute risk on 0-1 scale (multiply by 100 for percentage)
 *
 * @private
 */
function integrateRisk(t1, t2, lambda1, lambda2, oneMinusARTimesRR) {
  // Convert ages to array indices (age 20 = index 0, age 89 = index 69)
  const startInterval = Math.floor(t1) - 20; // Starting year index
  const endInterval = Math.ceil(t2) - 20; // Ending year index
  const numberIntervals = Math.ceil(t2) - Math.floor(t1); // Number of year intervals

  let riskAccumulator = 0.0;
  let cumulativeHazard = 0.0;

  // Integrate over each year interval
  for (let j = 0; j < numberIntervals; j++) {
    const intervalIndex = startInterval + j;

    // Calculate integration length for this interval
    let integrationLength;

    if (numberIntervals > 1 && j > 0 && j < numberIntervals - 1) {
      // Middle intervals: full year
      integrationLength = 1.0;
    } else if (numberIntervals > 1 && j === 0) {
      // First interval: partial year
      integrationLength = 1.0 - (t1 - Math.floor(t1));
    } else if (numberIntervals > 1 && j === numberIntervals - 1) {
      // Last interval: partial year
      const z1 = t2 > Math.floor(t2) ? 1 : 0;
      const z2 = t2 === Math.floor(t2) ? 1 : 0;
      integrationLength = (t2 - Math.floor(t2)) * z1 + z2;
    } else {
      // Single interval: exact length
      integrationLength = t2 - t1;
    }

    // Get rates for this interval
    const oneMinusARRRj = oneMinusARTimesRR[intervalIndex];
    const lambda1j = lambda1[intervalIndex];
    const lambda2j = lambda2[intervalIndex];

    // Calculate combined hazard for this interval
    const combinedHazard = oneMinusARRRj * lambda1j + lambda2j;

    // Calculate risk contribution for this interval
    // PI_j = [(1-AR)·RR·λ₁ / λ_combined] · exp(-Σλ) · [1 - exp(-λ_combined·Δt)]
    const riskContribution =
      (oneMinusARRRj * lambda1j / combinedHazard) *
      Math.exp(-cumulativeHazard) *
      (1 - Math.exp(-combinedHazard * integrationLength));

    // Accumulate risk
    riskAccumulator += riskContribution;

    // Update cumulative hazard
    cumulativeHazard += combinedHazard * integrationLength;
  }

  return riskAccumulator;
}
