import { describe, it, expect } from 'vitest';
import {
  calculateRisk,
  calculateBatchRisk,
} from '../../src/core/risk-calculator.js';
import { RaceCode } from '../../src/types/index.js';

/**
 * Integration tests for end-to-end breast cancer risk calculation
 *
 * These tests validate the complete workflow through the main API:
 * - calculateRisk() orchestrates: recodeAndValidate → calculateRelativeRisk → calculateAbsoluteRisk
 * - calculateBatchRisk() processes multiple individuals
 */
describe('End-to-end risk calculation', () => {

  describe('Typical individual profiles - White women', () => {
    it('should calculate risk for average 45-year-old White woman (5-year risk)', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
      expect(result.absoluteRisk).toBeLessThan(5);
      // ageAtMenarche=12 maps to category 1 (12-13), so RR > 1.0
      expect(result.relativeRiskUnder50).toBeGreaterThan(1.0);
      expect(result.patternNumber).toBeGreaterThan(0);
    });

    it('should calculate risk for high-risk 45-year-old White woman', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
      // High-risk individual should have significantly elevated risk
      expect(result.relativeRiskUnder50).toBeGreaterThan(5);
    });

    it('should calculate lifetime risk for White woman (age 35 to 90)', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(5); // Lifetime risk should be substantial
      expect(result.absoluteRisk).toBeLessThan(20);
    });

    it('should calculate risk for nulliparous White woman', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.recodedValues.firstBirthCategory).toBe(2);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });
  });

  describe('Typical individual profiles - African-American women', () => {
    it('should calculate risk for average 45-year-old African-American woman', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.recodedValues.firstBirthCategory).toBe(0); // AA model sets to 0
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
      expect(result.absoluteRisk).toBeLessThan(5);
    });

    it('should calculate risk for African-American woman with family history', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.relativeRiskUnder50).toBeGreaterThan(1.5);
    });
  });

  describe('Typical individual profiles - Hispanic women', () => {
    it('should calculate risk for Hispanic US-Born woman', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.recodedValues.menarcheCategory).toBe(0); // HU model sets to 0
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });

    it('should calculate risk for Hispanic Foreign-Born woman', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });
  });

  describe('Typical individual profiles - Asian women', () => {
    it('should calculate risk for Chinese-American woman', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });

    it('should calculate risk for Japanese-American woman', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });

    it('should calculate risk for Filipino-American woman', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });
  });

  describe('Native American/Other', () => {
    it('should calculate risk for Native American woman using White model', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });
  });

  describe('Different age ranges', () => {
    it('should calculate risk for younger woman (age 25 to 30)', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
      expect(result.absoluteRisk).toBeLessThan(1); // Risk should be low for young age
    });

    it('should calculate risk for older woman (age 60 to 70)', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });

    it('should calculate risk for woman near maximum age (age 85 to 90)', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
    });
  });

  describe('Risk comparison - validating relative risk impact', () => {
    it('should show higher risk with increasing family history', () => {
      const baseIndividual = {
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        atypicalHyperplasia: 99,
      };

      const noFamily = calculateRisk({
        ...baseIndividual,
        id: 16,
        numRelativesWithBrCa: 0,
      });

      const oneRelative = calculateRisk({
        ...baseIndividual,
        id: 17,
        numRelativesWithBrCa: 1,
      });

      const twoRelatives = calculateRisk({
        ...baseIndividual,
        id: 18,
        numRelativesWithBrCa: 2,
      });

      expect(oneRelative.absoluteRisk).toBeGreaterThan(noFamily.absoluteRisk);
      expect(twoRelatives.absoluteRisk).toBeGreaterThan(
        oneRelative.absoluteRisk
      );
    });

    it('should show higher risk with biopsies and hyperplasia', () => {
      const baseIndividual = {
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numRelativesWithBrCa: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
      };

      const noBiopsies = calculateRisk({
        ...baseIndividual,
        id: 19,
        numBreastBiopsies: 0,
        atypicalHyperplasia: 99,
      });

      const withBiopsies = calculateRisk({
        ...baseIndividual,
        id: 20,
        numBreastBiopsies: 1,
        atypicalHyperplasia: 0, // No hyperplasia
      });

      const withHyperplasia = calculateRisk({
        ...baseIndividual,
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
      const highRiskIndividual = {
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

      const individualRisk = calculateRisk(highRiskIndividual, {
        calculateAverage: false,
      });
      const averageRisk = calculateRisk(highRiskIndividual, {
        calculateAverage: true,
      });

      expect(individualRisk.success).toBe(true);
      expect(averageRisk.success).toBe(true);
      expect(individualRisk.absoluteRisk).toBeGreaterThan(
        averageRisk.averageRisk
      );
      expect(averageRisk.averageRisk).not.toBeNull();
    });

    it('should calculate average risk higher than individual low-risk', () => {
      const lowRiskIndividual = {
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

      const individualRisk = calculateRisk(lowRiskIndividual, {
        calculateAverage: false,
      });
      const averageRisk = calculateRisk(lowRiskIndividual, {
        calculateAverage: true,
      });

      expect(individualRisk.success).toBe(true);
      expect(averageRisk.success).toBe(true);
      expect(averageRisk.averageRisk).toBeGreaterThan(
        individualRisk.absoluteRisk
      );
      expect(averageRisk.averageRisk).not.toBeNull();
    });

    it('should include both individual and average risk when calculateAverage is true', () => {
      const individual = {
        id: 27,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 0,
      };

      const result = calculateRisk(individual, { calculateAverage: true });

      expect(result.success).toBe(true);
      expect(result.absoluteRisk).not.toBeNull();
      expect(result.averageRisk).not.toBeNull();
      expect(result.absoluteRisk).toBeGreaterThan(0);
      expect(result.averageRisk).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid age range gracefully', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(false);
      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.length).toBeGreaterThan(0);
      expect(result.absoluteRisk).toBeNull();
    });

    it('should handle invalid race code gracefully', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(false);
      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.length).toBeGreaterThan(0);
      expect(result.absoluteRisk).toBeNull();
    });

    it('should handle inconsistent biopsy/hyperplasia data', () => {
      const individual = {
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

      const result = calculateRisk(individual);

      expect(result.success).toBe(false);
      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.length).toBeGreaterThan(0);
      expect(result.absoluteRisk).toBeNull();
    });
  });

  describe('Batch processing', () => {
    it('should process multiple individuals correctly', () => {
      const individuals = [
        {
          id: 28,
          initialAge: 45,
          projectionEndAge: 50,
          race: RaceCode.WHITE,
          numBreastBiopsies: 0,
          ageAtMenarche: 12,
          ageAtFirstBirth: 25,
          numRelativesWithBrCa: 0,
          atypicalHyperplasia: 99,
        },
        {
          id: 29,
          initialAge: 45,
          projectionEndAge: 50,
          race: RaceCode.AFRICAN_AMERICAN,
          numBreastBiopsies: 1,
          ageAtMenarche: 11,
          ageAtFirstBirth: 25,
          numRelativesWithBrCa: 1,
          atypicalHyperplasia: 0,
        },
        {
          id: 30,
          initialAge: 35,
          projectionEndAge: 90,
          race: RaceCode.HISPANIC_US_BORN,
          numBreastBiopsies: 0,
          ageAtMenarche: 12,
          ageAtFirstBirth: 25,
          numRelativesWithBrCa: 0,
          atypicalHyperplasia: 99,
        },
      ];

      const results = calculateBatchRisk(individuals);

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(3);

      // All calculations should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.absoluteRisk).not.toBeNull();
        expect(result.absoluteRisk).toBeGreaterThan(0);
      });

      // Each result should have correct race
      expect(results[0].raceEthnicity).toContain('White');
      expect(results[1].raceEthnicity).toContain('African');
      expect(results[2].raceEthnicity).toContain('Hispanic');
    });

    it('should handle batch with some invalid individuals', () => {
      const individuals = [
        {
          id: 31,
          initialAge: 45,
          projectionEndAge: 50,
          race: RaceCode.WHITE,
          numBreastBiopsies: 0,
          ageAtMenarche: 12,
          ageAtFirstBirth: 25,
          numRelativesWithBrCa: 0,
          atypicalHyperplasia: 99,
        },
        {
          id: 32,
          initialAge: 50,
          projectionEndAge: 45, // Invalid
          race: RaceCode.WHITE,
          numBreastBiopsies: 0,
          ageAtMenarche: 12,
          ageAtFirstBirth: 25,
          numRelativesWithBrCa: 0,
          atypicalHyperplasia: 99,
        },
      ];

      const results = calculateBatchRisk(individuals);

      expect(results.length).toBe(2);
      expect(results[0].success).toBe(true);
      expect(results[0].absoluteRisk).not.toBeNull();
      expect(results[1].success).toBe(false);
      expect(results[1].absoluteRisk).toBeNull();
    });
  });
});
