import { describe, it, expect } from 'vitest';
import {
  // Beta coefficients
  WHITE_BETA,
  BLACK_BETA,
  HISPANIC_US_BETA,
  HISPANIC_FOREIGN_BETA,
  ASIAN_BETA,
  OTHER_BETA,
  BETA_BY_RACE,
  // Lambda1 (incidence rates)
  WHITE_LAMBDA1,
  BLACK_LAMBDA1,
  HISPANIC_US_LAMBDA1,
  HISPANIC_FOREIGN_LAMBDA1,
  OTHER_LAMBDA1,
  CHINESE_LAMBDA1,
  JAPANESE_LAMBDA1,
  FILIPINO_LAMBDA1,
  HAWAIIAN_LAMBDA1,
  OTHER_PACIFIC_ISLANDER_LAMBDA1,
  OTHER_ASIAN_LAMBDA1,
  WHITE_AVG_LAMBDA1,
  LAMBDA1_BY_RACE,
  AVG_LAMBDA1,
  // Lambda2 (mortality rates)
  WHITE_LAMBDA2,
  BLACK_LAMBDA2,
  HISPANIC_US_LAMBDA2,
  HISPANIC_FOREIGN_LAMBDA2,
  OTHER_LAMBDA2,
  CHINESE_LAMBDA2,
  JAPANESE_LAMBDA2,
  FILIPINO_LAMBDA2,
  HAWAIIAN_LAMBDA2,
  OTHER_PACIFIC_ISLANDER_LAMBDA2,
  OTHER_ASIAN_LAMBDA2,
  WHITE_AVG_LAMBDA2,
  LAMBDA2_BY_RACE,
  AVG_LAMBDA2,
  // Attributable risk
  WHITE_1_AR,
  BLACK_1_AR,
  HISPANIC_US_1_AR,
  HISPANIC_FOREIGN_1_AR,
  ASIAN_1_AR,
  OTHER_1_AR,
  ATTRIBUTABLE_RISK_BY_RACE,
  getAttributableRisk,
  // Age constants
  AGE_GROUPS,
  YEARS_PER_AGE_GROUP,
  MIN_AGE,
  MAX_AGE,
  AGE_THRESHOLD,
} from '../../src/constants/index.js';

describe('Constants Module', () => {
  describe('Beta Coefficients', () => {
    it('should have 6 coefficients per array', () => {
      expect(WHITE_BETA).toHaveLength(6);
      expect(BLACK_BETA).toHaveLength(6);
      expect(HISPANIC_US_BETA).toHaveLength(6);
      expect(HISPANIC_FOREIGN_BETA).toHaveLength(6);
      expect(ASIAN_BETA).toHaveLength(6);
    });

    it('should have OTHER_BETA reference WHITE_BETA', () => {
      expect(OTHER_BETA).toBe(WHITE_BETA);
    });

    it('should have correct values for WHITE_BETA', () => {
      expect(WHITE_BETA[0]).toBeCloseTo(0.5292641686, 10); // N_Biop
      expect(WHITE_BETA[3]).toBeCloseTo(0.9583027845, 10); // N_Rels
      expect(WHITE_BETA[5]).toBeCloseTo(-0.1908113865, 10); // AF*NR
    });

    it('should have BETA_BY_RACE lookup with all 11 races', () => {
      expect(Object.keys(BETA_BY_RACE)).toHaveLength(11);
      for (let race = 1; race <= 11; race++) {
        expect(BETA_BY_RACE[race]).toBeDefined();
        expect(BETA_BY_RACE[race]).toHaveLength(6);
      }
    });

    it('should have race 4 use WHITE_BETA', () => {
      expect(BETA_BY_RACE[4]).toBe(WHITE_BETA);
    });

    it('should have races 6-11 use ASIAN_BETA', () => {
      for (let race = 6; race <= 11; race++) {
        expect(BETA_BY_RACE[race]).toBe(ASIAN_BETA);
      }
    });
  });

  describe('Lambda1 (Breast Cancer Incidence)', () => {
    it('should have 14 age groups per array', () => {
      expect(WHITE_LAMBDA1).toHaveLength(14);
      expect(BLACK_LAMBDA1).toHaveLength(14);
      expect(CHINESE_LAMBDA1).toHaveLength(14);
      expect(WHITE_AVG_LAMBDA1).toHaveLength(14);
    });

    it('should have OTHER_LAMBDA1 reference WHITE_LAMBDA1', () => {
      expect(OTHER_LAMBDA1).toBe(WHITE_LAMBDA1);
    });

    it('should have AVG_LAMBDA1 reference WHITE_AVG_LAMBDA1', () => {
      expect(AVG_LAMBDA1).toBe(WHITE_AVG_LAMBDA1);
    });

    it('should have correct values for WHITE_LAMBDA1', () => {
      expect(WHITE_LAMBDA1[0]).toBe(0.00001); // [20,25)
      expect(WHITE_LAMBDA1[4]).toBe(0.001265); // [40,45)
      expect(WHITE_LAMBDA1[13]).toBe(0.004109); // [85,90)
    });

    it('should have correct values for BLACK_LAMBDA1', () => {
      expect(BLACK_LAMBDA1[0]).toBe(0.00002696); // [20,25)
      expect(BLACK_LAMBDA1[5]).toBe(0.00187394); // [45,50)
    });

    it('should have LAMBDA1_BY_RACE lookup with all 11 races', () => {
      expect(Object.keys(LAMBDA1_BY_RACE)).toHaveLength(11);
      for (let race = 1; race <= 11; race++) {
        expect(LAMBDA1_BY_RACE[race]).toBeDefined();
        expect(LAMBDA1_BY_RACE[race]).toHaveLength(14);
      }
    });

    it('should have race 4 use WHITE_LAMBDA1', () => {
      expect(LAMBDA1_BY_RACE[4]).toBe(WHITE_LAMBDA1);
    });
  });

  describe('Lambda2 (Competing Mortality)', () => {
    it('should have 14 age groups per array', () => {
      expect(WHITE_LAMBDA2).toHaveLength(14);
      expect(BLACK_LAMBDA2).toHaveLength(14);
      expect(CHINESE_LAMBDA2).toHaveLength(14);
      expect(WHITE_AVG_LAMBDA2).toHaveLength(14);
    });

    it('should have OTHER_LAMBDA2 reference WHITE_LAMBDA2', () => {
      expect(OTHER_LAMBDA2).toBe(WHITE_LAMBDA2);
    });

    it('should have AVG_LAMBDA2 reference WHITE_AVG_LAMBDA2', () => {
      expect(AVG_LAMBDA2).toBe(WHITE_AVG_LAMBDA2);
    });

    it('should have correct values for WHITE_LAMBDA2', () => {
      expect(WHITE_LAMBDA2[0]).toBe(0.000493); // [20,25)
      expect(WHITE_LAMBDA2[6]).toBe(0.003655); // [50,55)
      expect(WHITE_LAMBDA2[13]).toBe(0.144908); // [85,90)
    });

    it('should have correct values for BLACK_LAMBDA2', () => {
      expect(BLACK_LAMBDA2[0]).toBe(0.00074354); // [20,25)
      expect(BLACK_LAMBDA2[5]).toBe(0.00448779); // [45,50)
    });

    it('should have LAMBDA2_BY_RACE lookup with all 11 races', () => {
      expect(Object.keys(LAMBDA2_BY_RACE)).toHaveLength(11);
      for (let race = 1; race <= 11; race++) {
        expect(LAMBDA2_BY_RACE[race]).toBeDefined();
        expect(LAMBDA2_BY_RACE[race]).toHaveLength(14);
      }
    });

    it('should have race 4 use WHITE_LAMBDA2', () => {
      expect(LAMBDA2_BY_RACE[4]).toBe(WHITE_LAMBDA2);
    });
  });

  describe('Attributable Risk (1-AR)', () => {
    it('should have 2 values per array (age<50, age>=50)', () => {
      expect(WHITE_1_AR).toHaveLength(2);
      expect(BLACK_1_AR).toHaveLength(2);
      expect(HISPANIC_US_1_AR).toHaveLength(2);
      expect(HISPANIC_FOREIGN_1_AR).toHaveLength(2);
      expect(ASIAN_1_AR).toHaveLength(2);
    });

    it('should have OTHER_1_AR reference WHITE_1_AR', () => {
      expect(OTHER_1_AR).toBe(WHITE_1_AR);
    });

    it('should have correct values for WHITE_1_AR', () => {
      expect(WHITE_1_AR[0]).toBe(0.5788413); // Age < 50
      expect(WHITE_1_AR[1]).toBe(0.5788413); // Age >= 50
    });

    it('should have correct values for BLACK_1_AR', () => {
      expect(BLACK_1_AR[0]).toBe(0.7294988); // Age < 50
      expect(BLACK_1_AR[1]).toBe(0.74397137); // Age >= 50
    });

    it('should have ATTRIBUTABLE_RISK_BY_RACE lookup with all 11 races', () => {
      expect(Object.keys(ATTRIBUTABLE_RISK_BY_RACE)).toHaveLength(11);
      for (let race = 1; race <= 11; race++) {
        expect(ATTRIBUTABLE_RISK_BY_RACE[race]).toBeDefined();
        expect(ATTRIBUTABLE_RISK_BY_RACE[race]).toHaveLength(2);
      }
    });

    it('should have race 4 use WHITE_1_AR', () => {
      expect(ATTRIBUTABLE_RISK_BY_RACE[4]).toBe(WHITE_1_AR);
    });

    it('should have races 6-11 use ASIAN_1_AR', () => {
      for (let race = 6; race <= 11; race++) {
        expect(ATTRIBUTABLE_RISK_BY_RACE[race]).toBe(ASIAN_1_AR);
      }
    });

    describe('getAttributableRisk helper function', () => {
      it('should return correct value for age < 50', () => {
        expect(getAttributableRisk(1, 45)).toBe(WHITE_1_AR[0]);
        expect(getAttributableRisk(2, 30)).toBe(BLACK_1_AR[0]);
      });

      it('should return correct value for age >= 50', () => {
        expect(getAttributableRisk(1, 55)).toBe(WHITE_1_AR[1]);
        expect(getAttributableRisk(2, 70)).toBe(BLACK_1_AR[1]);
      });

      it('should throw error for invalid race code', () => {
        expect(() => getAttributableRisk(0, 50)).toThrow();
        expect(() => getAttributableRisk(12, 50)).toThrow();
      });
    });
  });

  describe('Age Constants', () => {
    it('should have 14 age group boundaries', () => {
      expect(AGE_GROUPS).toHaveLength(14);
    });

    it('should have age groups starting at 20 and incrementing by 5', () => {
      expect(AGE_GROUPS[0]).toBe(20);
      expect(AGE_GROUPS[1]).toBe(25);
      expect(AGE_GROUPS[13]).toBe(85);
    });

    it('should have correct age range constants', () => {
      expect(MIN_AGE).toBe(20);
      expect(MAX_AGE).toBe(90);
      expect(AGE_THRESHOLD).toBe(50);
      expect(YEARS_PER_AGE_GROUP).toBe(5);
    });
  });

  describe('Data Integrity', () => {
    it('should have non-negative incidence rates', () => {
      const allLambda1Arrays = Object.values(LAMBDA1_BY_RACE);
      allLambda1Arrays.forEach((array) => {
        array.forEach((rate) => {
          expect(rate).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('should have non-negative mortality rates', () => {
      const allLambda2Arrays = Object.values(LAMBDA2_BY_RACE);
      allLambda2Arrays.forEach((array) => {
        array.forEach((rate) => {
          expect(rate).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('should have attributable risk values between 0 and 1', () => {
      const allARArrays = Object.values(ATTRIBUTABLE_RISK_BY_RACE);
      allARArrays.forEach((array) => {
        array.forEach((value) => {
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThan(1);
        });
      });
    });

    it('should have incidence rates generally increasing with age (most groups)', () => {
      // Check that rates generally increase for first 10 age groups
      [WHITE_LAMBDA1, BLACK_LAMBDA1, HISPANIC_US_LAMBDA1].forEach((array) => {
        const firstHalf = array.slice(0, 10);
        const increasing = firstHalf.every(
          (rate, idx, arr) => idx === 0 || rate >= arr[idx - 1] * 0.5
        ); // Allow some variation
        expect(increasing).toBe(true);
      });
    });

    it('should have mortality rates increasing with age', () => {
      [WHITE_LAMBDA2, BLACK_LAMBDA2, HISPANIC_US_LAMBDA2].forEach((array) => {
        for (let i = 1; i < array.length; i++) {
          expect(array[i]).toBeGreaterThan(array[i - 1]);
        }
      });
    });
  });
});
