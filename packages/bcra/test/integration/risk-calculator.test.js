import { describe, it, expect } from 'vitest';
import { recodeAndValidate } from '../../src/core/recode-check.js';
import { calculateRelativeRisk } from '../../src/core/relative-risk.js';
import { calculateAbsoluteRisk } from '../../src/core/absolute-risk.js';
import { RaceCode } from '../../src/types/index.js';

/**
 * Integration tests for end-to-end breast cancer risk calculation
 *
 * These tests validate the complete workflow:
 * 1. recodeAndValidate - Input validation and recoding
 * 2. calculateRelativeRisk - Logistic regression
 * 3. calculateAbsoluteRisk - Numerical integration
 */
describe('End-to-end risk calculation', () => {
  /**
   * Helper function to calculate absolute risk for a patient
   * @param {Object} patientData - Patient data
   * @param {boolean} calculateAverage - Whether to calculate average risk
   * @returns {{absoluteRisk: number, relativeRisk: Object, validation: Object}}
   */
  function calculateRisk(patientData, calculateAverage = false) {
    const validation = recodeAndValidate(patientData);
    const relativeRisk = calculateRelativeRisk(validation, patientData.race);
    const absoluteRisk = calculateAbsoluteRisk(
      patientData,
      validation,
      relativeRisk,
      calculateAverage
    );

    return {
      absoluteRisk,
      relativeRisk,
      validation,
    };
  }

  describe('Typical patient profiles - White women', () => {
    it('should calculate risk for average 45-year-old White woman (5-year risk)', () => {
      const patient = {
        id: 1,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
      expect(result.absoluteRisk).toBeLessThan(5);
      // ageAtMenarche=12 maps to category 1 (12-13), so RR > 1.0
      expect(result.relativeRisk.relativeRiskUnder50).toBeGreaterThan(1.0);
      expect(result.relativeRisk.patternNumber).toBeGreaterThan(0);
    });

    it('should calculate risk for high-risk 45-year-old White woman', () => {
      const patient = {
        id: 2,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 2,
        ageAtMenarche: 11,
        ageAtFirstBirth: 35,
        numRelativesWithBrCa: 2,
        atypicalHyperplasia: 1, // Hyperplasia present
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
      // High-risk patient should have significantly elevated risk
      expect(result.relativeRisk.relativeRiskUnder50).toBeGreaterThan(5);
    });

    it('should calculate lifetime risk for White woman (age 35 to 90)', () => {
      const patient = {
        id: 3,
        initialAge: 35,
        projectionEndAge: 90,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(5); // Lifetime risk should be substantial
      expect(result.absoluteRisk).toBeLessThan(20);
    });

    it('should calculate risk for nulliparous White woman', () => {
      const patient = {
        id: 4,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 98, // Nulliparous
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.validation.recodedValues.firstBirthCategory).toBe(2);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });
  });

  describe('Typical patient profiles - African-American women', () => {
    it('should calculate risk for average 45-year-old African-American woman', () => {
      const patient = {
        id: 5,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.AFRICAN_AMERICAN,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25, // Not used in AA model but still required
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.validation.recodedValues.firstBirthCategory).toBe(0); // AA model sets to 0
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
      expect(result.absoluteRisk).toBeLessThan(5);
    });

    it('should calculate risk for African-American woman with family history', () => {
      const patient = {
        id: 6,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.AFRICAN_AMERICAN,
        numBreastBiopsies: 1,
        ageAtMenarche: 11,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 0,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.relativeRisk.relativeRiskUnder50).toBeGreaterThan(1.5);
    });
  });

  describe('Typical patient profiles - Hispanic women', () => {
    it('should calculate risk for Hispanic US-Born woman', () => {
      const patient = {
        id: 7,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.HISPANIC_US_BORN,
        numBreastBiopsies: 0,
        ageAtMenarche: 12, // Not used in HU model
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.validation.recodedValues.menarcheCategory).toBe(0); // HU model sets to 0
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });

    it('should calculate risk for Hispanic Foreign-Born woman', () => {
      const patient = {
        id: 8,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.HISPANIC_FOREIGN_BORN,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });
  });

  describe('Typical patient profiles - Asian women', () => {
    it('should calculate risk for Chinese-American woman', () => {
      const patient = {
        id: 9,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.CHINESE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });

    it('should calculate risk for Japanese-American woman', () => {
      const patient = {
        id: 10,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.JAPANESE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });

    it('should calculate risk for Filipino-American woman', () => {
      const patient = {
        id: 11,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.FILIPINO,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });
  });

  describe('Native American/Other', () => {
    it('should calculate risk for Native American woman using White model', () => {
      const patient = {
        id: 12,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.NATIVE_AMERICAN_OTHER,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });
  });

  describe('Different age ranges', () => {
    it('should calculate risk for younger woman (age 25 to 30)', () => {
      const patient = {
        id: 13,
        initialAge: 25,
        projectionEndAge: 30,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 99, // Unknown
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
      expect(result.absoluteRisk).toBeLessThan(1); // Risk should be low for young age
    });

    it('should calculate risk for older woman (age 60 to 70)', () => {
      const patient = {
        id: 14,
        initialAge: 60,
        projectionEndAge: 70,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });

    it('should calculate risk for woman near maximum age (age 85 to 90)', () => {
      const patient = {
        id: 15,
        initialAge: 85,
        projectionEndAge: 90,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });
  });

  describe('Risk comparison - validating relative risk impact', () => {
    it('should show higher risk with increasing family history', () => {
      const basePatient = {
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        atypicalHyperplasia: 99,
      };

      const noFamily = calculateRisk({
        ...basePatient,
        id: 16,
        numRelativesWithBrCa: 0,
      });

      const oneRelative = calculateRisk({
        ...basePatient,
        id: 17,
        numRelativesWithBrCa: 1,
      });

      const twoRelatives = calculateRisk({
        ...basePatient,
        id: 18,
        numRelativesWithBrCa: 2,
      });

      expect(oneRelative.absoluteRisk).toBeGreaterThan(noFamily.absoluteRisk);
      expect(twoRelatives.absoluteRisk).toBeGreaterThan(
        oneRelative.absoluteRisk
      );
    });

    it('should show higher risk with biopsies and hyperplasia', () => {
      const basePatient = {
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numRelativesWithBrCa: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
      };

      const noBiopsies = calculateRisk({
        ...basePatient,
        id: 19,
        numBreastBiopsies: 0,
        atypicalHyperplasia: 99,
      });

      const withBiopsies = calculateRisk({
        ...basePatient,
        id: 20,
        numBreastBiopsies: 1,
        atypicalHyperplasia: 0, // No hyperplasia
      });

      const withHyperplasia = calculateRisk({
        ...basePatient,
        id: 21,
        numBreastBiopsies: 1,
        atypicalHyperplasia: 1, // Hyperplasia present
      });

      expect(withBiopsies.absoluteRisk).toBeGreaterThan(noBiopsies.absoluteRisk);
      expect(withHyperplasia.absoluteRisk).toBeGreaterThan(
        withBiopsies.absoluteRisk
      );
    });
  });

  describe('Average risk calculation', () => {
    it('should calculate average risk lower than individual high-risk', () => {
      const highRiskPatient = {
        id: 22,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 2,
        ageAtMenarche: 11,
        ageAtFirstBirth: 35,
        numRelativesWithBrCa: 2,
        atypicalHyperplasia: 1,
      };

      const individualRisk = calculateRisk(highRiskPatient, false);
      const averageRisk = calculateRisk(highRiskPatient, true);

      expect(individualRisk.absoluteRisk).toBeGreaterThan(
        averageRisk.absoluteRisk
      );
    });

    it('should calculate average risk higher than individual low-risk', () => {
      const lowRiskPatient = {
        id: 23,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 14,
        ageAtFirstBirth: 19,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const individualRisk = calculateRisk(lowRiskPatient, false);
      const averageRisk = calculateRisk(lowRiskPatient, true);

      expect(averageRisk.absoluteRisk).toBeGreaterThan(
        individualRisk.absoluteRisk
      );
    });
  });

  describe('Error handling', () => {
    it('should handle invalid age range gracefully', () => {
      const patient = {
        id: 24,
        initialAge: 50,
        projectionEndAge: 45, // Invalid: end < start
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(false);
      expect(result.absoluteRisk).toBeNull();
    });

    it('should handle invalid race code gracefully', () => {
      const patient = {
        id: 25,
        initialAge: 45,
        projectionEndAge: 50,
        race: 99, // Invalid race
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(false);
      expect(result.absoluteRisk).toBeNull();
    });

    it('should handle inconsistent biopsy/hyperplasia data', () => {
      const patient = {
        id: 26,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0, // No biopsies
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 1, // But hyperplasia present - inconsistent!
      };

      const result = calculateRisk(patient);

      expect(result.validation.isValid).toBe(false);
      expect(result.absoluteRisk).toBeNull();
    });
  });
});
