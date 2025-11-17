/**
 * Breast Cancer Risk Assessment Tool - Calculator Module
 * Integrates with BCRA library to calculate risk assessments
 */

import {
  mapRaceToRaceCode,
  mapBiopsyValue,
  mapMenarcheValue,
  mapFirstBirthValue,
  mapRelativesValue,
  mapHyperplasiaValue
} from './utils.js';

/**
 * RiskCalculator class for managing risk calculations
 */
export class RiskCalculator {
  constructor() {
    // Check if BCRA library is loaded
    if (!window.BCRA) {
      throw new Error('BCRA library not loaded. Please ensure the library is imported before using the calculator.');
    }

    this.calculateRisk = window.BCRA.calculateRisk;
  }

  /**
   * Converts form data to BCRA-compatible format
   * @param {Object} formData - Form data from FormHandler
   * @returns {Object} BCRA-compatible data object
   */
  convertFormDataToBCRA(formData) {
    const raceCode = mapRaceToRaceCode(formData.race, formData.subRace);
    const numBreastBiopsies = mapBiopsyValue(formData.biopsy, formData.numBiopsies);
    const ageAtMenarche = mapMenarcheValue(formData.menarche);
    const ageAtFirstBirth = mapFirstBirthValue(formData.firstBirth);
    const numRelativesWithBrCa = mapRelativesValue(formData.relatives);
    const atypicalHyperplasia = mapHyperplasiaValue(formData.biopsy, formData.hyperplasia);

    return {
      id: 1,
      initialAge: parseInt(formData.age, 10),
      race: raceCode,
      numBreastBiopsies,
      ageAtMenarche,
      ageAtFirstBirth,
      numRelativesWithBrCa,
      atypicalHyperplasia
    };
  }

  /**
   * Calculates 5-year risk
   * @param {Object} formData - Form data from user input
   * @returns {Object} BCRA calculation result
   */
  calculate5YearRisk(formData) {
    try {
      const bcraData = this.convertFormDataToBCRA(formData);
      const currentAge = bcraData.initialAge;
      const projectionEndAge = Math.min(currentAge + 5, 90);

      const result = this.calculateRisk(
        {
          ...bcraData,
          projectionEndAge
        },
        { calculateAverage: true }
      );

      return {
        success: result.success,
        patientRisk: result.absoluteRisk,
        averageRisk: result.averageRisk,
        relativeRiskUnder50: result.relativeRiskUnder50,
        relativeRiskAtOrAbove50: result.relativeRiskAtOrAbove50,
        validation: result.validation,
        error: result.error,
        projectionInterval: projectionEndAge - currentAge
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          stack: error.stack
        }
      };
    }
  }

  /**
   * Calculates lifetime risk (up to age 90)
   * @param {Object} formData - Form data from user input
   * @returns {Object} BCRA calculation result
   */
  calculateLifetimeRisk(formData) {
    try {
      const bcraData = this.convertFormDataToBCRA(formData);
      const currentAge = bcraData.initialAge;
      const projectionEndAge = 90;

      const result = this.calculateRisk(
        {
          ...bcraData,
          projectionEndAge
        },
        { calculateAverage: true }
      );

      return {
        success: result.success,
        patientRisk: result.absoluteRisk,
        averageRisk: result.averageRisk,
        relativeRiskUnder50: result.relativeRiskUnder50,
        relativeRiskAtOrAbove50: result.relativeRiskAtOrAbove50,
        validation: result.validation,
        error: result.error,
        projectionInterval: projectionEndAge - currentAge
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          stack: error.stack
        }
      };
    }
  }

  /**
   * Calculates both 5-year and lifetime risks
   * @param {Object} formData - Form data from user input
   * @returns {Object} Combined results for both risk periods
   */
  calculateBothRisks(formData) {
    const fiveYearResult = this.calculate5YearRisk(formData);
    const lifetimeResult = this.calculateLifetimeRisk(formData);

    return {
      fiveYear: fiveYearResult,
      lifetime: lifetimeResult,
      success: fiveYearResult.success && lifetimeResult.success
    };
  }

  /**
   * Validates form data before calculation
   * @param {Object} formData - Form data to validate
   * @returns {Object} Validation result with isValid and errors array
   */
  validateFormData(formData) {
    const errors = [];

    // Check required fields
    if (!formData.age) {
      errors.push('Age is required');
    }

    if (!formData.race) {
      errors.push('Race/ethnicity is required');
    }

    // Check sub-race for Hispanic and Asian
    if ((formData.race === 'hispanic' || formData.race === 'asian') && !formData.subRace) {
      errors.push('Sub race/ethnicity is required for the selected race');
    }

    if (!formData.biopsy) {
      errors.push('Biopsy information is required');
    }

    // If biopsy is yes, check for number of biopsies and hyperplasia
    if (formData.biopsy === 'yes') {
      if (!formData.numBiopsies) {
        errors.push('Number of biopsies is required when biopsy history is Yes');
      }
      if (!formData.hyperplasia) {
        errors.push('Atypical hyperplasia information is required when biopsy history is Yes');
      }
    }

    if (!formData.menarche) {
      errors.push('Age at menarche is required');
    }

    if (!formData.firstBirth) {
      errors.push('Age at first birth is required');
    }

    if (!formData.relatives) {
      errors.push('Family history information is required');
    }

    // Age validation
    const age = parseInt(formData.age, 10);
    if (isNaN(age) || age < 35 || age > 85) {
      errors.push('Age must be between 35 and 85 years');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formats calculation results for display
   * @param {Object} results - Raw calculation results
   * @returns {Object} Formatted results ready for UI display
   */
  formatResults(results) {
    if (!results.success) {
      return {
        success: false,
        error: results.error || { message: 'Calculation failed' }
      };
    }

    return {
      success: true,
      fiveYear: {
        patient: results.fiveYear.patientRisk,
        average: results.fiveYear.averageRisk,
        interval: results.fiveYear.projectionInterval
      },
      lifetime: {
        patient: results.lifetime.patientRisk,
        average: results.lifetime.averageRisk,
        interval: results.lifetime.projectionInterval
      },
      relativeRisks: {
        under50: results.fiveYear.relativeRiskUnder50,
        atOrAbove50: results.fiveYear.relativeRiskAtOrAbove50
      }
    };
  }

  /**
   * Handles calculation errors and returns user-friendly messages
   * @param {Object} error - Error object from BCRA or calculation
   * @returns {string} User-friendly error message
   */
  handleError(error) {
    if (!error) {
      return 'An unknown error occurred during calculation.';
    }

    // Check if it's a validation error
    if (error.validation && error.validation.errors) {
      return `Validation errors:\n${error.validation.errors.join('\n')}`;
    }

    // Check for specific error messages
    if (error.message) {
      return error.message;
    }

    return 'An error occurred during risk calculation. Please check your inputs and try again.';
  }
}

/**
 * Creates a new RiskCalculator instance
 * @returns {RiskCalculator} New calculator instance
 */
export function createCalculator() {
  return new RiskCalculator();
}
