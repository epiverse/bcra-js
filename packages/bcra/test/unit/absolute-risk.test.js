import { describe, it, expect } from 'vitest';
import {
  expandToSingleYears,
  calculateAbsoluteRisk,
} from '../../src/core/absolute-risk.js';
import { recodeAndValidate } from '../../src/core/recode-check.js';
import { calculateRelativeRisk } from '../../src/core/relative-risk.js';
import { RaceCode } from '../../src/types/index.js';

describe('expandToSingleYears', () => {
  it('should expand 14 age groups into 70 single years', () => {
    const ratesByGroup = [
      0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.007, 0.008, 0.009, 0.01,
      0.011, 0.012, 0.013, 0.014,
    ];

    const singleYearRates = expandToSingleYears(ratesByGroup);

    expect(singleYearRates).toHaveLength(70);
  });

  it('should repeat each group rate 5 times', () => {
    const ratesByGroup = [
      0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.007, 0.008, 0.009, 0.01,
      0.011, 0.012, 0.013, 0.014,
    ];

    const singleYearRates = expandToSingleYears(ratesByGroup);

    // First group (0.001) should appear in years 0-4 (ages 20-24)
    expect(singleYearRates[0]).toBe(0.001);
    expect(singleYearRates[1]).toBe(0.001);
    expect(singleYearRates[2]).toBe(0.001);
    expect(singleYearRates[3]).toBe(0.001);
    expect(singleYearRates[4]).toBe(0.001);

    // Second group (0.002) should appear in years 5-9 (ages 25-29)
    expect(singleYearRates[5]).toBe(0.002);
    expect(singleYearRates[6]).toBe(0.002);
    expect(singleYearRates[7]).toBe(0.002);
    expect(singleYearRates[8]).toBe(0.002);
    expect(singleYearRates[9]).toBe(0.002);

    // Last group (0.014) should appear in years 65-69 (ages 85-89)
    expect(singleYearRates[65]).toBe(0.014);
    expect(singleYearRates[66]).toBe(0.014);
    expect(singleYearRates[67]).toBe(0.014);
    expect(singleYearRates[68]).toBe(0.014);
    expect(singleYearRates[69]).toBe(0.014);
  });

  it('should map age groups correctly', () => {
    const ratesByGroup = [
      0.001, // [20,25) - indices 0-4
      0.002, // [25,30) - indices 5-9
      0.003, // [30,35) - indices 10-14
      0.004, // [35,40) - indices 15-19
      0.005, // [40,45) - indices 20-24
      0.006, // [45,50) - indices 25-29
      0.007, // [50,55) - indices 30-34
      0.008, // [55,60) - indices 35-39
      0.009, // [60,65) - indices 40-44
      0.01, // [65,70) - indices 45-49
      0.011, // [70,75) - indices 50-54
      0.012, // [75,80) - indices 55-59
      0.013, // [80,85) - indices 60-64
      0.014, // [85,90) - indices 65-69
    ];

    const singleYearRates = expandToSingleYears(ratesByGroup);

    // Verify middle of each group
    expect(singleYearRates[2]).toBe(0.001); // Age 22
    expect(singleYearRates[12]).toBe(0.003); // Age 32
    expect(singleYearRates[27]).toBe(0.006); // Age 47
    expect(singleYearRates[42]).toBe(0.009); // Age 62
    expect(singleYearRates[67]).toBe(0.014); // Age 87
  });
});

describe('calculateAbsoluteRisk', () => {
  describe('Input validation', () => {
    it('should return null when validation failed', () => {
      const data = {
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

      const invalidValidation = {
        isValid: false,
        errors: ['Some error'],
        warnings: [],
        recodedValues: {},
        errorIndicator: 1,
      };

      const relativeRisk = {
        relativeRiskUnder50: 1.0,
        relativeRiskAtOrAbove50: 1.0,
        patternNumber: 1,
      };

      const result = calculateAbsoluteRisk(
        data,
        invalidValidation,
        relativeRisk
      );

      expect(result).toBeNull();
    });
  });

  describe('Basic risk calculation', () => {
    it('should calculate absolute risk for a baseline White woman (5-year projection)', () => {
      const data = {
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

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);

      expect(absoluteRisk).not.toBeNull();
      expect(absoluteRisk).toBeGreaterThan(0);
      expect(absoluteRisk).toBeLessThan(100);
    });

    it('should calculate absolute risk for a 10-year projection', () => {
      const data = {
        id: 1,
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);

      expect(absoluteRisk).not.toBeNull();
      expect(absoluteRisk).toBeGreaterThan(0);
      expect(absoluteRisk).toBeLessThan(100);
    });

    it('should calculate absolute risk for a lifetime projection (age 35 to 90)', () => {
      const data = {
        id: 1,
        initialAge: 35,
        projectionEndAge: 90,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);

      expect(absoluteRisk).not.toBeNull();
      expect(absoluteRisk).toBeGreaterThan(0);
      expect(absoluteRisk).toBeLessThan(100);
      // Lifetime risk should be higher than 5-year risk
      expect(absoluteRisk).toBeGreaterThan(5);
    });
  });

  describe('Risk factors impact', () => {
    it('should calculate higher risk for woman with family history', () => {
      const dataNoFamily = {
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

      const dataWithFamily = {
        ...dataNoFamily,
        id: 2,
        numRelativesWithBrCa: 2, // 2 relatives
      };

      const validation1 = recodeAndValidate(dataNoFamily);
      const relativeRisk1 = calculateRelativeRisk(validation1, dataNoFamily.race);
      const absoluteRisk1 = calculateAbsoluteRisk(
        dataNoFamily,
        validation1,
        relativeRisk1
      );

      const validation2 = recodeAndValidate(dataWithFamily);
      const relativeRisk2 = calculateRelativeRisk(validation2, dataWithFamily.race);
      const absoluteRisk2 = calculateAbsoluteRisk(
        dataWithFamily,
        validation2,
        relativeRisk2
      );

      expect(absoluteRisk2).toBeGreaterThan(absoluteRisk1);
    });

    it('should calculate higher risk for woman with biopsies and hyperplasia', () => {
      const dataNoBiopsies = {
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

      const dataWithHyperplasia = {
        ...dataNoBiopsies,
        id: 2,
        numBreastBiopsies: 2,
        atypicalHyperplasia: 1, // Hyperplasia present
      };

      const validation1 = recodeAndValidate(dataNoBiopsies);
      const relativeRisk1 = calculateRelativeRisk(validation1, dataNoBiopsies.race);
      const absoluteRisk1 = calculateAbsoluteRisk(
        dataNoBiopsies,
        validation1,
        relativeRisk1
      );

      const validation2 = recodeAndValidate(dataWithHyperplasia);
      const relativeRisk2 = calculateRelativeRisk(
        validation2,
        dataWithHyperplasia.race
      );
      const absoluteRisk2 = calculateAbsoluteRisk(
        dataWithHyperplasia,
        validation2,
        relativeRisk2
      );

      expect(absoluteRisk2).toBeGreaterThan(absoluteRisk1);
    });
  });

  describe('Fractional ages', () => {
    it('should handle fractional starting age', () => {
      const data = {
        id: 1,
        initialAge: 45.5, // Fractional age
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);

      expect(absoluteRisk).not.toBeNull();
      expect(absoluteRisk).toBeGreaterThan(0);
    });

    it('should handle fractional ending age', () => {
      const data = {
        id: 1,
        initialAge: 45,
        projectionEndAge: 50.7, // Fractional age
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);

      expect(absoluteRisk).not.toBeNull();
      expect(absoluteRisk).toBeGreaterThan(0);
    });

    it('should handle both ages fractional', () => {
      const data = {
        id: 1,
        initialAge: 45.3,
        projectionEndAge: 50.8,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);

      expect(absoluteRisk).not.toBeNull();
      expect(absoluteRisk).toBeGreaterThan(0);
    });
  });

  describe('Different race groups', () => {
    it('should calculate risk for African-American women', () => {
      const data = {
        id: 1,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.AFRICAN_AMERICAN,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);

      expect(absoluteRisk).not.toBeNull();
      expect(absoluteRisk).toBeGreaterThan(0);
      expect(absoluteRisk).toBeLessThan(100);
    });

    it('should calculate risk for Hispanic US-Born women', () => {
      const data = {
        id: 1,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.HISPANIC_US_BORN,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);

      expect(absoluteRisk).not.toBeNull();
      expect(absoluteRisk).toBeGreaterThan(0);
      expect(absoluteRisk).toBeLessThan(100);
    });

    it('should calculate risk for Hispanic Foreign-Born women', () => {
      const data = {
        id: 1,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.HISPANIC_FOREIGN_BORN,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);

      expect(absoluteRisk).not.toBeNull();
      expect(absoluteRisk).toBeGreaterThan(0);
      expect(absoluteRisk).toBeLessThan(100);
    });

    it('should calculate risk for Asian women (Chinese)', () => {
      const data = {
        id: 1,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.CHINESE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);

      expect(absoluteRisk).not.toBeNull();
      expect(absoluteRisk).toBeGreaterThan(0);
      expect(absoluteRisk).toBeLessThan(100);
    });
  });

  describe('Average risk calculation', () => {
    it('should calculate average risk for White women when requested', () => {
      const data = {
        id: 1,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 1,
        ageAtMenarche: 11,
        ageAtFirstBirth: 30,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 0,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const averageRisk = calculateAbsoluteRisk(
        data,
        validation,
        relativeRisk,
        true // Calculate average risk
      );

      expect(averageRisk).not.toBeNull();
      expect(averageRisk).toBeGreaterThan(0);
      expect(averageRisk).toBeLessThan(100);
    });

    it('should use (1-AR)*RR = 1.0 for average risk calculation', () => {
      const data = {
        id: 1,
        initialAge: 45,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 2, // High risk factors
        ageAtMenarche: 10,
        ageAtFirstBirth: 35,
        numRelativesWithBrCa: 2,
        atypicalHyperplasia: 1,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);

      // Individual risk should be higher than average risk for a high-risk individual
      const individualRisk = calculateAbsoluteRisk(
        data,
        validation,
        relativeRisk,
        false
      );
      const averageRisk = calculateAbsoluteRisk(
        data,
        validation,
        relativeRisk,
        true
      );

      expect(individualRisk).toBeGreaterThan(averageRisk);
    });

    it('should use average lambda1/lambda2 for White and Native American races', () => {
      const dataWhite = {
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

      const dataNativeAmerican = {
        ...dataWhite,
        id: 2,
        race: RaceCode.NATIVE_AMERICAN_OTHER,
      };

      const validation1 = recodeAndValidate(dataWhite);
      const relativeRisk1 = calculateRelativeRisk(validation1, dataWhite.race);
      const avgRisk1 = calculateAbsoluteRisk(
        dataWhite,
        validation1,
        relativeRisk1,
        true
      );

      const validation2 = recodeAndValidate(dataNativeAmerican);
      const relativeRisk2 = calculateRelativeRisk(
        validation2,
        dataNativeAmerican.race
      );
      const avgRisk2 = calculateAbsoluteRisk(
        dataNativeAmerican,
        validation2,
        relativeRisk2,
        true
      );

      // Both should use same average rates
      expect(avgRisk1).toBeCloseTo(avgRisk2, 6);
    });
  });

  describe('Edge cases', () => {
    it('should handle single-year projection', () => {
      const data = {
        id: 1,
        initialAge: 45,
        projectionEndAge: 46,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);

      expect(absoluteRisk).not.toBeNull();
      expect(absoluteRisk).toBeGreaterThan(0);
      expect(absoluteRisk).toBeLessThan(1); // Single year should be very small
    });

    it('should handle projection from age 20 to 90', () => {
      const data = {
        id: 1,
        initialAge: 20,
        projectionEndAge: 90,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 98, // Nulliparous (can't be 25 for a 20-year-old)
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const validation = recodeAndValidate(data);
      const relativeRisk = calculateRelativeRisk(validation, data.race);
      const absoluteRisk = calculateAbsoluteRisk(data, validation, relativeRisk);

      expect(absoluteRisk).not.toBeNull();
      expect(absoluteRisk).toBeGreaterThan(0);
      expect(absoluteRisk).toBeLessThan(100);
    });
  });
});
