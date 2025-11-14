/**
 * Main Risk Calculator Module
 *
 * Orchestrates the complete breast cancer risk calculation workflow by coordinating:
 * 1. Input validation and recoding (recodeAndValidate)
 * 2. Relative risk calculation (calculateRelativeRisk)
 * 3. Absolute risk calculation (calculateAbsoluteRisk)
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
 * @module core/risk-calculator
 * @license GPL-3.0-or-later
 */

import { recodeAndValidate } from './recode-check.js';
import { calculateRelativeRisk } from './relative-risk.js';
import { calculateAbsoluteRisk } from './absolute-risk.js';
import { RaceLabels } from '../types/index.js';

/**
 * Calculates breast cancer risk for an individual using the BCRAT (Gail Model)
 *
 * This is the main entry point for breast cancer risk calculation. It orchestrates
 * the complete workflow:
 * 1. Validates and recodes input data
 * 2. Calculates relative risk using logistic regression
 * 3. Calculates absolute risk using numerical integration
 * 4. Optionally calculates average risk for comparison
 *
 * The function never throws exceptions. All errors are caught and returned in a
 * structured error result object.
 *
 * @param {import('../types/index.js').RiskFactorProfile} data - An individual's risk factor data
 * @param {Object} [options] - Calculation options
 * @param {boolean} [options.rawInput=true] - Whether input is in raw format (true) or already recoded (false)
 * @param {boolean} [options.calculateAverage=false] - Whether to also calculate average risk for comparison
 * @returns {import('../types/index.js').RiskResult} Comprehensive risk calculation result
 *
 * @example
 * // Calculate individualized risk for a 45-year-old White woman
 * const profile = {
 *   id: 1,
 *   initialAge: 45,
 *   projectionEndAge: 50,
 *   race: 1,
 *   numBreastBiopsies: 0,
 *   ageAtMenarche: 12,
 *   ageAtFirstBirth: 25,
 *   numRelativesWithBrCa: 0,
 *   atypicalHyperplasia: 99
 * };
 *
 * const result = calculateRisk(profile);
 * console.log(`5-year breast cancer risk: ${result.absoluteRisk.toFixed(2)}%`);
 * // Output: 5-year breast cancer risk: 1.23%
 *
 * @example
 * // Calculate with average risk comparison
 * const result = calculateRisk(profile, { calculateAverage: true });
 * console.log(`Individualized risk: ${result.absoluteRisk.toFixed(2)}%`);
 * console.log(`Average risk: ${result.averageRisk.toFixed(2)}%`);
 * // Output: Individual's risk: 1.23%
 * //         Average risk: 1.15%
 */
export function calculateRisk(data, options = {}) {
  // Default options
  const { rawInput = true, calculateAverage = false } = options;

  // Initialize result with null values
  const result = {
    success: false,
    absoluteRisk: null,
    averageRisk: null,
    relativeRiskUnder50: null,
    relativeRiskAtOrAbove50: null,
    patternNumber: null,
    raceEthnicity: null,
    projectionInterval: null,
    validation: {
      isValid: false,
      errors: [],
      warnings: [],
    },
    recodedValues: null,
    error: null,
  };

  try {
    // Step 1: Validate and recode input data
    const validation = recodeAndValidate(data, rawInput);

    // Store validation result
    result.validation = validation;

    // If validation failed, return early with error result
    if (!validation || !validation.isValid) {
      return result;
    }

    // Store recoded values
    result.recodedValues = validation.recodedValues;

    // Extract race and ages for metadata
    const { race, initialAge, projectionEndAge } = data;
    result.raceEthnicity = RaceLabels[race] || null;
    result.projectionInterval = projectionEndAge - initialAge;

    // Step 2: Calculate relative risk using logistic regression
    const relativeRisk = calculateRelativeRisk(validation, race);

    // If relative risk calculation failed, return early
    if (
      !relativeRisk ||
      relativeRisk.relativeRiskUnder50 === null ||
      relativeRisk.relativeRiskAtOrAbove50 === null
    ) {
      result.validation.errors.push(
        'Relative risk calculation failed for this race/ethnicity'
      );
      return result;
    }

    // Store relative risk values
    result.relativeRiskUnder50 = relativeRisk.relativeRiskUnder50;
    result.relativeRiskAtOrAbove50 = relativeRisk.relativeRiskAtOrAbove50;
    result.patternNumber = relativeRisk.patternNumber;

    // Step 3: Calculate individualized absolute risk using numerical integration
    const individualizedAbsoluteRisk = calculateAbsoluteRisk(
      data,
      validation,
      relativeRisk,
      false // Individual risk, not average
    );

    // If absolute risk calculation failed, return early
    if (individualizedAbsoluteRisk === null) {
      result.validation.errors.push(
        'Absolute risk calculation failed - missing race-specific rates'
      );
      return result;
    }

    // Store individualized absolute risk
    result.absoluteRisk = individualizedAbsoluteRisk;

    // Step 4: Optionally calculate average risk for comparison
    if (calculateAverage) {
      // Store average risk (can be null if not supported for this race)
      result.averageRisk = calculateAbsoluteRisk(
        data,
        validation,
        relativeRisk,
        true // Average risk
      );
    }

    // Mark calculation as successful
    result.success = true;

    return result;
  } catch (error) {
    // Catch any unexpected errors and return structured error result
    result.error = {
      message: error.message || 'Unknown error during risk calculation',
      stack: error.stack || '',
    };
    result.validation.errors.push(
      `Unexpected error: ${error.message || 'Unknown error'}`
    );
    return result;
  }
}

/**
 * Calculates breast cancer risk for multiple individuals (batch processing)
 *
 * Processes an array of individual data objects independently. Each calculation
 * is isolated - no state is shared between individuals.
 *
 * @param {import('../types/index.js').RiskFactorProfile[]} individuals - Array of individual risk factor data
 * @param {Object} [options] - Calculation options (applied to all individuals)
 * @param {boolean} [options.rawInput=true] - Whether input is in raw format
 * @param {boolean} [options.calculateAverage=false] - Whether to calculate average risk
 * @returns {import('../types/index.js').RiskResult[]} Array of risk calculation results
 *
 * @example
 * // Calculate risk for multiple individuals
 * const individuals = [
 *   { id: 1, initialAge: 45, projectionEndAge: 50, race: 1, ... },
 *   { id: 2, initialAge: 50, projectionEndAge: 60, race: 2, ... },
 *   { id: 3, initialAge: 35, projectionEndAge: 90, race: 3, ... }
 * ];
 *
 * const results = calculateBatchRisk(individuals);
 * results.forEach((result, i) => {
 *   if (result.success) {
 *     console.log(`Individual ${i+1}: ${result.absoluteRisk.toFixed(2)}% risk`);
 *   } else {
 *     console.log(`Individual ${i+1}: Calculation failed`);
 *   }
 * });
 */
export function calculateBatchRisk(individuals, options = {}) {
  return individuals.map((individual) => calculateRisk(individual, options));
}
