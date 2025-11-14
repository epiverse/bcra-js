import { describe, it, expect } from 'vitest';
import { calculateRelativeRisk } from '../../src/core/relative-risk.js';
import { RaceCode } from '../../src/types/index.js';

describe('calculateRelativeRisk', () => {
  describe('Input validation', () => {
    it('should return null values when validation failed', () => {
      const invalidValidation = {
        isValid: false,
        errors: ['Age validation failed'],
        warnings: [],
        recodedValues: {},
        errorIndicator: 1,
      };

      const result = calculateRelativeRisk(invalidValidation, RaceCode.WHITE);

      expect(result).toEqual({
        relativeRiskUnder50: null,
        relativeRiskAtOrAbove50: null,
        patternNumber: null,
      });
    });

    it('should handle missing recodedValues gracefully', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {}, // Missing required fields
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.WHITE);

      expect(result.relativeRiskUnder50).toBeNull();
      expect(result.relativeRiskAtOrAbove50).toBeNull();
      expect(result.patternNumber).toBeNull();
    });
  });

  describe('Pattern number calculation', () => {
    it('should calculate pattern number correctly for base case (all zeros)', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 0,
          menarcheCategory: 0,
          firstBirthCategory: 0,
          relativesCategory: 0,
          hyperplasiaMultiplier: 1.0,
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.WHITE);

      // Pattern = 0*36 + 0*12 + 0*3 + 0*1 + 1 = 1
      expect(result.patternNumber).toBe(1);
    });

    it('should calculate pattern number correctly for maximum values', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 2,
          menarcheCategory: 2,
          firstBirthCategory: 3,
          relativesCategory: 2,
          hyperplasiaMultiplier: 1.0,
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.WHITE);

      // Pattern = 2*36 + 2*12 + 3*3 + 2*1 + 1 = 72 + 24 + 9 + 2 + 1 = 108
      expect(result.patternNumber).toBe(108);
    });

    it('should calculate pattern number correctly for middle values', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 1,
          menarcheCategory: 1,
          firstBirthCategory: 2,
          relativesCategory: 1,
          hyperplasiaMultiplier: 1.0,
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.WHITE);

      // Pattern = 1*36 + 1*12 + 2*3 + 1*1 + 1 = 36 + 12 + 6 + 1 + 1 = 56
      expect(result.patternNumber).toBe(56);
    });
  });

  describe('Relative risk calculation for White women', () => {
    it('should calculate RR correctly for baseline (all zeros, no hyperplasia)', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 0,
          menarcheCategory: 0,
          firstBirthCategory: 0,
          relativesCategory: 0,
          hyperplasiaMultiplier: 1.0,
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.WHITE);

      // LP1 = 0 + 0 + 0 + 0 + 0 + log(1.0) = 0
      // LP2 = 0 + 0 = 0
      // RR_Star1 = exp(0) = 1.0
      // RR_Star2 = exp(0) = 1.0
      expect(result.relativeRiskUnder50).toBeCloseTo(1.0, 10);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(1.0, 10);
    });

    it('should calculate RR correctly with one biopsy, no hyperplasia', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 1,
          menarcheCategory: 0,
          firstBirthCategory: 0,
          relativesCategory: 0,
          hyperplasiaMultiplier: 0.93, // No hyperplasia
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.WHITE);

      // White_Beta[0] = 0.5292641686, White_Beta[4] = -0.2880424830
      // LP1 = 1*0.5292641686 + 0 + 0 + 0 + 0 + log(0.93)
      //     = 0.5292641686 + (-0.072570608)
      //     = 0.4566935606
      // LP2 = LP1 + 1*(-0.2880424830)
      //     = 0.4566935606 - 0.2880424830
      //     = 0.1686510776
      // RR_Star1 = exp(0.4566935606) ≈ 1.5788
      // RR_Star2 = exp(0.1686510776) ≈ 1.1837
      expect(result.relativeRiskUnder50).toBeCloseTo(1.5788, 4);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(1.1837, 4);
    });

    it('should calculate RR correctly with hyperplasia present', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 1,
          menarcheCategory: 0,
          firstBirthCategory: 0,
          relativesCategory: 0,
          hyperplasiaMultiplier: 1.82, // Hyperplasia present
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.WHITE);

      // LP1 = 1*0.5292641686 + 0 + 0 + 0 + 0 + log(1.82)
      //     = 0.5292641686 + 0.5988443
      //     = 1.1281084686
      // LP2 = 1.1281084686 + 1*(-0.2880424830)
      //     = 0.8400659856
      // RR_Star1 = exp(1.1281084686) ≈ 3.0898
      // RR_Star2 = exp(0.8400659856) ≈ 2.3166
      expect(result.relativeRiskUnder50).toBeCloseTo(3.0898, 3);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(2.3166, 3);
    });

    it('should include AF*NR interaction term correctly', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 0,
          menarcheCategory: 0,
          firstBirthCategory: 2,
          relativesCategory: 1,
          hyperplasiaMultiplier: 1.0,
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.WHITE);

      // White_Beta[2] = 0.2186262218, White_Beta[3] = 0.9583027845, White_Beta[5] = -0.1908113865
      // LP1 = 0 + 0 + 2*0.2186262218 + 1*0.9583027845 + 2*1*(-0.1908113865) + log(1.0)
      //     = 0.4372524436 + 0.9583027845 - 0.381622773
      //     = 1.0139324551
      // LP2 = LP1 + 0
      //     = 1.0139324551
      // RR_Star1 = exp(1.0139324551) ≈ 2.7564
      // RR_Star2 = exp(1.0139324551) ≈ 2.7564
      expect(result.relativeRiskUnder50).toBeCloseTo(2.7564, 4);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(2.7564, 4);
    });

    it('should calculate RR for complex case with all factors', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 2,
          menarcheCategory: 2,
          firstBirthCategory: 3,
          relativesCategory: 2,
          hyperplasiaMultiplier: 1.82,
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.WHITE);

      // White_Beta = [0.5292641686, 0.0940103059, 0.2186262218, 0.9583027845, -0.2880424830, -0.1908113865]
      // LP1 = 2*0.5292641686 + 2*0.0940103059 + 3*0.2186262218 + 2*0.9583027845 + 3*2*(-0.1908113865) + log(1.82)
      //     = 1.0585283372 + 0.1880206118 + 0.6558786654 + 1.916605569 - 1.1448683190 + 0.5988443
      //     = 3.2731091644
      // LP2 = 3.2731091644 + 2*(-0.2880424830)
      //     = 3.2731091644 - 0.576084966
      //     = 2.6970241984
      // RR_Star1 = exp(3.2731091644) ≈ 26.390
      // RR_Star2 = exp(2.6970241984) ≈ 14.837
      expect(result.relativeRiskUnder50).toBeCloseTo(26.390, 2);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(14.837, 2);
    });
  });

  describe('Relative risk calculation for African-American women', () => {
    it('should calculate RR correctly for African-American baseline', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 0,
          menarcheCategory: 0,
          firstBirthCategory: 0, // Not used in AA model
          relativesCategory: 0,
          hyperplasiaMultiplier: 1.0,
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.AFRICAN_AMERICAN);

      // LP1 = 0, LP2 = 0, RR = 1.0
      expect(result.relativeRiskUnder50).toBeCloseTo(1.0, 10);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(1.0, 10);
    });

    it('should ignore firstBirthCategory for African-American (beta[2]=0)', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 1,
          menarcheCategory: 1,
          firstBirthCategory: 3, // Should be ignored (beta = 0)
          relativesCategory: 1,
          hyperplasiaMultiplier: 1.0,
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.AFRICAN_AMERICAN);

      // Black_Beta = [0.1822121131, 0.2672530336, 0.0, 0.4757242578, -0.1119411682, 0.0]
      // LP1 = 1*0.1822121131 + 1*0.2672530336 + 3*0.0 + 1*0.4757242578 + 3*1*0.0 + log(1.0)
      //     = 0.1822121131 + 0.2672530336 + 0 + 0.4757242578 + 0 + 0
      //     = 0.9251894045
      // LP2 = 0.9251894045 + 1*(-0.1119411682)
      //     = 0.8132482363
      // RR_Star1 = exp(0.9251894045) ≈ 2.5223
      // RR_Star2 = exp(0.8132482363) ≈ 2.2556
      expect(result.relativeRiskUnder50).toBeCloseTo(2.5223, 3);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(2.2556, 3);
    });
  });

  describe('Relative risk calculation for Hispanic women (US Born)', () => {
    it('should calculate RR correctly for Hispanic US baseline', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 0,
          menarcheCategory: 0, // Not used in HU model
          firstBirthCategory: 0,
          relativesCategory: 0,
          hyperplasiaMultiplier: 1.0,
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.HISPANIC_US_BORN);

      expect(result.relativeRiskUnder50).toBeCloseTo(1.0, 10);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(1.0, 10);
    });

    it('should ignore menarcheCategory for Hispanic US (beta[1]=0)', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 1,
          menarcheCategory: 2, // Should be ignored (beta = 0)
          firstBirthCategory: 2,
          relativesCategory: 1,
          hyperplasiaMultiplier: 0.93,
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.HISPANIC_US_BORN);

      // Hispanic_US_Beta = [0.0970783641, 0.0, 0.2318368334, 0.166685441, 0.0, 0.0]
      // LP1 = 1*0.0970783641 + 2*0.0 + 2*0.2318368334 + 1*0.166685441 + 2*1*0.0 + log(0.93)
      //     = 0.0970783641 + 0 + 0.4636736668 + 0.166685441 + 0 - 0.072570608
      //     = 0.6548668739
      // LP2 = LP1 + 1*0.0 = 0.6548668739
      // RR_Star1 = exp(0.6548668739) ≈ 1.9249
      // RR_Star2 = exp(0.6548668739) ≈ 1.9249
      expect(result.relativeRiskUnder50).toBeCloseTo(1.9249, 4);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(1.9249, 4);
    });
  });

  describe('Relative risk calculation for Hispanic women (Foreign Born)', () => {
    it('should calculate RR correctly for Hispanic Foreign Born', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 1,
          menarcheCategory: 1,
          firstBirthCategory: 1,
          relativesCategory: 1,
          hyperplasiaMultiplier: 1.0,
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.HISPANIC_FOREIGN_BORN);

      // Hispanic_Foreign_Beta = [0.4798624017, 0.2593922322, 0.4669246218, 0.9076679727, 0.0, 0.0]
      // LP1 = 1*0.4798624017 + 1*0.2593922322 + 1*0.4669246218 + 1*0.9076679727 + 1*1*0.0 + log(1.0)
      //     = 0.4798624017 + 0.2593922322 + 0.4669246218 + 0.9076679727
      //     = 2.1138472284
      // LP2 = LP1 + 1*0.0 = 2.1138472284
      // RR_Star1 = exp(2.1138472284) ≈ 8.280
      // RR_Star2 = exp(2.1138472284) ≈ 8.280
      expect(result.relativeRiskUnder50).toBeCloseTo(8.280, 3);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(8.280, 3);
    });
  });

  describe('Relative risk calculation for Asian women', () => {
    it('should calculate RR correctly for Chinese-American women', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 1,
          menarcheCategory: 1,
          firstBirthCategory: 2,
          relativesCategory: 1,
          hyperplasiaMultiplier: 1.0,
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.CHINESE);

      // Asian_Beta = [0.55263612260619, 0.07499257592975, 0.27638268294593, 0.79185633720481, 0.0, 0.0]
      // LP1 = 1*0.55263612260619 + 1*0.07499257592975 + 2*0.27638268294593 + 1*0.79185633720481 + 2*1*0.0 + log(1.0)
      //     = 0.55263612260619 + 0.07499257592975 + 0.55276536589186 + 0.79185633720481 + 0
      //     = 1.97225040163261
      // LP2 = LP1 + 1*0.0 = 1.97225040163261
      // RR_Star1 = exp(1.97225040163261) ≈ 7.187
      // RR_Star2 = exp(1.97225040163261) ≈ 7.187
      expect(result.relativeRiskUnder50).toBeCloseTo(7.187, 3);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(7.187, 3);
    });

    it('should use same coefficients for all Asian subgroups', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 1,
          menarcheCategory: 1,
          firstBirthCategory: 1,
          relativesCategory: 1,
          hyperplasiaMultiplier: 1.0,
        },
        errorIndicator: 0,
      };

      const chineseResult = calculateRelativeRisk(validation, RaceCode.CHINESE);
      const japaneseResult = calculateRelativeRisk(validation, RaceCode.JAPANESE);
      const filipinoResult = calculateRelativeRisk(validation, RaceCode.FILIPINO);
      const hawaiianResult = calculateRelativeRisk(validation, RaceCode.HAWAIIAN);
      const otherPIResult = calculateRelativeRisk(validation, RaceCode.OTHER_PACIFIC_ISLANDER);
      const otherAsianResult = calculateRelativeRisk(validation, RaceCode.OTHER_ASIAN);

      // All should have identical results
      expect(japaneseResult.relativeRiskUnder50).toBe(chineseResult.relativeRiskUnder50);
      expect(filipinoResult.relativeRiskUnder50).toBe(chineseResult.relativeRiskUnder50);
      expect(hawaiianResult.relativeRiskUnder50).toBe(chineseResult.relativeRiskUnder50);
      expect(otherPIResult.relativeRiskUnder50).toBe(chineseResult.relativeRiskUnder50);
      expect(otherAsianResult.relativeRiskUnder50).toBe(chineseResult.relativeRiskUnder50);

      expect(japaneseResult.relativeRiskAtOrAbove50).toBe(chineseResult.relativeRiskAtOrAbove50);
      expect(filipinoResult.relativeRiskAtOrAbove50).toBe(chineseResult.relativeRiskAtOrAbove50);
      expect(hawaiianResult.relativeRiskAtOrAbove50).toBe(chineseResult.relativeRiskAtOrAbove50);
      expect(otherPIResult.relativeRiskAtOrAbove50).toBe(chineseResult.relativeRiskAtOrAbove50);
      expect(otherAsianResult.relativeRiskAtOrAbove50).toBe(chineseResult.relativeRiskAtOrAbove50);
    });
  });

  describe('Relative risk calculation for Native American/Other', () => {
    it('should use White coefficients for race code 4', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 1,
          menarcheCategory: 1,
          firstBirthCategory: 2,
          relativesCategory: 1,
          hyperplasiaMultiplier: 1.0,
        },
        errorIndicator: 0,
      };

      const whiteResult = calculateRelativeRisk(validation, RaceCode.WHITE);
      const otherResult = calculateRelativeRisk(validation, RaceCode.NATIVE_AMERICAN_OTHER);

      // Should have identical results
      expect(otherResult.relativeRiskUnder50).toBe(whiteResult.relativeRiskUnder50);
      expect(otherResult.relativeRiskAtOrAbove50).toBe(whiteResult.relativeRiskAtOrAbove50);
      expect(otherResult.patternNumber).toBe(whiteResult.patternNumber);
    });
  });

  describe('Edge cases', () => {
    it('should handle very small hyperplasia multiplier', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 0,
          menarcheCategory: 0,
          firstBirthCategory: 0,
          relativesCategory: 0,
          hyperplasiaMultiplier: 0.001, // Very small
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.WHITE);

      // log(0.001) = -6.907755
      // LP1 = -6.907755, RR_Star1 = exp(-6.907755) ≈ 0.001
      expect(result.relativeRiskUnder50).toBeCloseTo(0.001, 6);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(0.001, 6);
    });

    it('should handle very large hyperplasia multiplier', () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        recodedValues: {
          biopsyCategory: 0,
          menarcheCategory: 0,
          firstBirthCategory: 0,
          relativesCategory: 0,
          hyperplasiaMultiplier: 100.0, // Very large
        },
        errorIndicator: 0,
      };

      const result = calculateRelativeRisk(validation, RaceCode.WHITE);

      // log(100) = 4.60517
      // LP1 = 4.60517, RR_Star1 = exp(4.60517) ≈ 100
      expect(result.relativeRiskUnder50).toBeCloseTo(100.0, 1);
      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(100.0, 1);
    });
  });
});
