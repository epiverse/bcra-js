import { describe, it, expect } from 'vitest';
import { recodeAndValidate } from '../../src/core/recode-check.js';
import { RaceCode, SpecialValues } from '../../src/types/index.js';

describe('recodeAndValidate', () => {
  describe('Age validation', () => {
    it('should reject initialAge below 20', () => {
      const data = {
        initialAge: 19,
        projectionEndAge: 25,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Initial age must be between 20 and 89 years'
      );
      expect(result.errorIndicator).toBe(1);
    });

    it('should reject initialAge at or above 90', () => {
      const data = {
        initialAge: 90,
        projectionEndAge: 95,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Initial age must be between 20 and 89 years'
      );
    });

    it('should reject projectionEndAge above 90', () => {
      const data = {
        initialAge: 85,
        projectionEndAge: 91,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Projection end age must be 90 years or less'
      );
    });

    it('should reject projectionEndAge <= initialAge', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 40,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Projection end age must be greater than initial age'
      );
    });

    it('should accept valid age range', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(
        result.errors.filter((e) => e.toLowerCase().includes('age'))
      ).toHaveLength(0);
    });

    it('should accept edge case: age 20 to 90', () => {
      const data = {
        initialAge: 20,
        projectionEndAge: 90,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 19, // Must be <= initialAge
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(
        result.errors.filter((e) => e.toLowerCase().includes('age'))
      ).toHaveLength(0);
    });
  });

  describe('Race validation', () => {
    it('should accept all valid race codes 1-11', () => {
      for (let race = 1; race <= 11; race++) {
        const data = {
          initialAge: 40,
          projectionEndAge: 50,
          race,
          numBreastBiopsies: 0,
          ageAtMenarche: 12,
          ageAtFirstBirth: 25,
          numRelativesWithBrCa: 0,
          atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
        };

        const result = recodeAndValidate(data, true);
        expect(
          result.errors.filter((e) => e.toLowerCase().includes('race'))
        ).toHaveLength(0);
      }
    });

    it('should reject race code 0', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: 0,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid race code. Must be between 1 and 11'
      );
    });

    it('should reject race code 12', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: 12,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid race code. Must be between 1 and 11'
      );
    });
  });

  describe('Biopsy recoding', () => {
    it('should recode 0 biopsies to category 0', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.biopsyCategory).toBe(0);
      expect(result.recodedValues.hyperplasiaMultiplier).toBe(1.0);
    });

    it('should recode 1 biopsy to category 1', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 0,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.biopsyCategory).toBe(1);
    });

    it('should recode 2 biopsies to category 2', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 2,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 1,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.biopsyCategory).toBe(2);
    });

    it('should recode 5 biopsies to category 2', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 5,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 0,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.biopsyCategory).toBe(2);
    });

    it('should recode 99 (unknown) biopsies to category 0', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: SpecialValues.UNKNOWN,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.biopsyCategory).toBe(0);
      expect(result.recodedValues.hyperplasiaMultiplier).toBe(1.0);
    });
  });

  describe('Biopsy-Hyperplasia consistency', () => {
    it('should reject 0 biopsies with hyperplasia != 99', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 1,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Consistency error'))).toBe(
        true
      );
    });

    it('should reject 99 biopsies with hyperplasia != 99', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: SpecialValues.UNKNOWN,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 0,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Consistency error'))).toBe(
        true
      );
    });

    it('should reject biopsies > 0 with invalid hyperplasia value', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 5, // Invalid
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Consistency error'))).toBe(
        true
      );
    });

    it('should accept 1 biopsy with hyperplasia = 0', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 0,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.biopsyCategory).toBe(1);
      expect(result.recodedValues.hyperplasiaMultiplier).toBe(0.93);
    });

    it('should accept 1 biopsy with hyperplasia = 1', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 1,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.biopsyCategory).toBe(1);
      expect(result.recodedValues.hyperplasiaMultiplier).toBe(1.82);
    });

    it('should accept 1 biopsy with hyperplasia = 99', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.UNKNOWN,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.biopsyCategory).toBe(1);
      expect(result.recodedValues.hyperplasiaMultiplier).toBe(1.0);
    });
  });

  describe('Age at menarche recoding', () => {
    it('should recode age 14+ to category 0', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 14,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.menarcheCategory).toBe(0);
    });

    it('should recode age 12-13 to category 1', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 13,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.menarcheCategory).toBe(1);
    });

    it('should recode age <12 to category 2', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 11,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.menarcheCategory).toBe(2);
    });

    it('should recode unknown (99) to category 0', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: SpecialValues.UNKNOWN,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.menarcheCategory).toBe(0);
    });

    it('should reject menarche age > initial age', () => {
      const data = {
        initialAge: 25,
        projectionEndAge: 35,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 26,
        ageAtFirstBirth: SpecialValues.NULLIPAROUS,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.includes('Age at menarche cannot be greater than initial age')
        )
      ).toBe(true);
    });

    it('should group African-American category 2 with 1', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.AFRICAN_AMERICAN,
        numBreastBiopsies: 0,
        ageAtMenarche: 11,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.menarcheCategory).toBe(1);
    });

    it('should set Hispanic US Born to category 0', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.HISPANIC_US_BORN,
        numBreastBiopsies: 0,
        ageAtMenarche: 10,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.menarcheCategory).toBe(0);
    });
  });

  describe('Age at first birth recoding', () => {
    it('should recode age <20 to category 0', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 19,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.firstBirthCategory).toBe(0);
    });

    it('should recode age 20-24 to category 1', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 23,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.firstBirthCategory).toBe(1);
    });

    it('should recode age 25-29 to category 2', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 27,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.firstBirthCategory).toBe(2);
    });

    it('should recode age 30+ to category 3', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 32,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.firstBirthCategory).toBe(3);
    });

    it('should recode nulliparous (98) to category 2', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: SpecialValues.NULLIPAROUS,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.firstBirthCategory).toBe(2);
    });

    it('should recode unknown (99) to category 0', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: SpecialValues.UNKNOWN,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.firstBirthCategory).toBe(0);
    });

    it('should reject first birth < menarche', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 13,
        ageAtFirstBirth: 12,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.includes('Age at first birth cannot be less than age at menarche')
        )
      ).toBe(true);
    });

    it('should reject first birth > initial age (unless nulliparous)', () => {
      const data = {
        initialAge: 30,
        projectionEndAge: 40,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 31,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.includes('Age at first birth cannot be greater than initial age')
        )
      ).toBe(true);
    });

    it('should set African-American to category 0 (remove from model)', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.AFRICAN_AMERICAN,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.firstBirthCategory).toBe(0);
    });

    it('should collapse Hispanic categories: 20-29 to 1, 30+ to 2', () => {
      // Test 20-24 → 1
      const data1 = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.HISPANIC_US_BORN,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 22,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };
      const result1 = recodeAndValidate(data1, true);
      expect(result1.recodedValues.firstBirthCategory).toBe(1);

      // Test 25-29 → 1
      const data2 = {
        ...data1,
        ageAtFirstBirth: 27,
      };
      const result2 = recodeAndValidate(data2, true);
      expect(result2.recodedValues.firstBirthCategory).toBe(1);

      // Test 30+ → 2
      const data3 = {
        ...data1,
        ageAtFirstBirth: 32,
      };
      const result3 = recodeAndValidate(data3, true);
      expect(result3.recodedValues.firstBirthCategory).toBe(2);

      // Test nulliparous (98) → 2
      const data4 = {
        ...data1,
        ageAtFirstBirth: SpecialValues.NULLIPAROUS,
      };
      const result4 = recodeAndValidate(data4, true);
      expect(result4.recodedValues.firstBirthCategory).toBe(2);
    });

    it('should collapse Hispanic Foreign Born categories same as US Born', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.HISPANIC_FOREIGN_BORN,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 27,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.firstBirthCategory).toBe(1);
    });
  });

  describe('Number of relatives recoding', () => {
    it('should recode 0 to category 0', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.relativesCategory).toBe(0);
    });

    it('should recode 1 to category 1', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.relativesCategory).toBe(1);
    });

    it('should recode 2+ to category 2', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 3,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.relativesCategory).toBe(2);
    });

    it('should recode unknown (99) to category 0', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: SpecialValues.UNKNOWN,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.relativesCategory).toBe(0);
    });

    it('should collapse Asian category 2 to 1', () => {
      // Test all Asian race codes 6-11
      for (let race = 6; race <= 11; race++) {
        const data = {
          initialAge: 40,
          projectionEndAge: 50,
          race,
          numBreastBiopsies: 0,
          ageAtMenarche: 12,
          ageAtFirstBirth: 25,
          numRelativesWithBrCa: 2,
          atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
        };

        const result = recodeAndValidate(data, true);
        expect(result.recodedValues.relativesCategory).toBe(1);
      }
    });

    it('should collapse Hispanic category 2 to 1', () => {
      const data1 = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.HISPANIC_US_BORN,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 2,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result1 = recodeAndValidate(data1, true);
      expect(result1.recodedValues.relativesCategory).toBe(1);

      const data2 = {
        ...data1,
        race: RaceCode.HISPANIC_FOREIGN_BORN,
      };

      const result2 = recodeAndValidate(data2, true);
      expect(result2.recodedValues.relativesCategory).toBe(1);
    });
  });

  describe('Race-specific biopsy recoding', () => {
    it('should collapse Hispanic biopsy category 2 to 1', () => {
      const data1 = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.HISPANIC_US_BORN,
        numBreastBiopsies: 3,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 1,
      };

      const result1 = recodeAndValidate(data1, true);
      expect(result1.recodedValues.biopsyCategory).toBe(1);

      const data2 = {
        ...data1,
        race: RaceCode.HISPANIC_FOREIGN_BORN,
      };

      const result2 = recodeAndValidate(data2, true);
      expect(result2.recodedValues.biopsyCategory).toBe(1);
    });

    it('should NOT collapse non-Hispanic biopsy category 2', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 3,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 0,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.biopsyCategory).toBe(2);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete valid White individual data', () => {
      const data = {
        initialAge: 45,
        projectionEndAge: 55,
        race: RaceCode.WHITE,
        numBreastBiopsies: 1,
        ageAtMenarche: 12,
        ageAtFirstBirth: 28,
        numRelativesWithBrCa: 1,
        atypicalHyperplasia: 0,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(true);
      expect(result.errorIndicator).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.recodedValues.biopsyCategory).toBe(1);
      expect(result.recodedValues.menarcheCategory).toBe(1);
      expect(result.recodedValues.firstBirthCategory).toBe(2);
      expect(result.recodedValues.relativesCategory).toBe(1);
      expect(result.recodedValues.hyperplasiaMultiplier).toBe(0.93);
    });

    it('should handle complete valid African-American individual data', () => {
      const data = {
        initialAge: 35,
        projectionEndAge: 40,
        race: RaceCode.AFRICAN_AMERICAN,
        numBreastBiopsies: 0,
        ageAtMenarche: 11,
        ageAtFirstBirth: 22,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(true);
      expect(result.recodedValues.menarcheCategory).toBe(1); // Collapsed from 2
      expect(result.recodedValues.firstBirthCategory).toBe(0); // Always 0 for AA
    });

    it('should handle complete valid Hispanic US-Born individual data', () => {
      const data = {
        initialAge: 50,
        projectionEndAge: 60,
        race: RaceCode.HISPANIC_US_BORN,
        numBreastBiopsies: 2,
        ageAtMenarche: 10,
        ageAtFirstBirth: 30,
        numRelativesWithBrCa: 2,
        atypicalHyperplasia: 1,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(true);
      expect(result.recodedValues.biopsyCategory).toBe(1); // Collapsed from 2
      expect(result.recodedValues.menarcheCategory).toBe(0); // Always 0 for HU
      expect(result.recodedValues.firstBirthCategory).toBe(2); // 30+ collapsed
      expect(result.recodedValues.relativesCategory).toBe(1); // Collapsed from 2
    });

    it('should handle complete valid Asian individual data', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.CHINESE,
        numBreastBiopsies: 0,
        ageAtMenarche: 13,
        ageAtFirstBirth: 27,
        numRelativesWithBrCa: 3,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(true);
      expect(result.recodedValues.relativesCategory).toBe(1); // Collapsed from 2
    });

    it('should accumulate multiple errors', () => {
      const data = {
        initialAge: 18, // Invalid
        projectionEndAge: 18, // Invalid
        race: 0, // Invalid
        numBreastBiopsies: 1,
        ageAtMenarche: 25, // Invalid (> initialAge)
        ageAtFirstBirth: 10, // Invalid (< menarche)
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 5, // Invalid
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errorIndicator).toBe(1);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should handle nulliparous individual correctly', () => {
      const data = {
        initialAge: 30,
        projectionEndAge: 35,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 13,
        ageAtFirstBirth: SpecialValues.NULLIPAROUS,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(true);
      expect(result.recodedValues.firstBirthCategory).toBe(2);
    });
  });

  describe('Pre-recoded data (rawInput=false)', () => {
    it('should accept pre-recoded data without modification', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 1, // Already recoded category
        ageAtMenarche: 1, // Already recoded category
        ageAtFirstBirth: 2, // Already recoded category
        numRelativesWithBrCa: 1, // Already recoded category
        atypicalHyperplasia: 0,
      };

      const result = recodeAndValidate(data, false);
      expect(result.recodedValues.biopsyCategory).toBe(1);
      expect(result.recodedValues.menarcheCategory).toBe(1);
      expect(result.recodedValues.firstBirthCategory).toBe(2);
      expect(result.recodedValues.relativesCategory).toBe(1);
      expect(result.recodedValues.hyperplasiaMultiplier).toBe(1.0); // Default
    });
  });

  describe('Race labels', () => {
    it('should provide correct race label for each race code', () => {
      const testCases = [
        { race: RaceCode.WHITE, label: 'Non-Hispanic White' },
        { race: RaceCode.AFRICAN_AMERICAN, label: 'African-American' },
        { race: RaceCode.HISPANIC_US_BORN, label: 'Hispanic (US Born)' },
        { race: RaceCode.NATIVE_AMERICAN_OTHER, label: 'Native American/Other' },
        { race: RaceCode.HISPANIC_FOREIGN_BORN, label: 'Hispanic (Foreign Born)' },
        { race: RaceCode.CHINESE, label: 'Chinese-American' },
        { race: RaceCode.JAPANESE, label: 'Japanese-American' },
        { race: RaceCode.FILIPINO, label: 'Filipino-American' },
        { race: RaceCode.HAWAIIAN, label: 'Hawaiian' },
        { race: RaceCode.OTHER_PACIFIC_ISLANDER, label: 'Other Pacific Islander' },
        { race: RaceCode.OTHER_ASIAN, label: 'Other Asian' },
      ];

      testCases.forEach(({ race, label }) => {
        const data = {
          initialAge: 40,
          projectionEndAge: 50,
          race,
          numBreastBiopsies: 0,
          ageAtMenarche: 12,
          ageAtFirstBirth: 25,
          numRelativesWithBrCa: 0,
          atypicalHyperplasia: SpecialValues.NOT_APPLICABLE,
        };

        const result = recodeAndValidate(data, true);
        expect(result.recodedValues.raceLabel).toBe(label);
      });
    });
  });
});
