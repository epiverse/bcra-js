import { SpecialValues, RaceCode, RaceLabels } from '../types/index.js';

/**
 * Validates and recodes input data for breast cancer risk assessment
 * @param {import('../types/index.js').RiskFactorProfile} data - Raw risk factor data
 * @param {boolean} rawInput - Whether inputs are in raw format (default: true)
 * @returns {import('../types/index.js').ValidationResult}
 */
export function recodeAndValidate(data, rawInput = true) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    recodedValues: {},
    errorIndicator: 0,
  };

  // Step 1: Validate age constraints
  const ageValidation = validateAges(data.initialAge, data.projectionEndAge);
  if (!ageValidation.valid) {
    result.errors.push(...ageValidation.errors);
    result.isValid = false;
    result.errorIndicator = 1;
  }

  // Step 2: Validate race
  const raceValidation = validateRace(data.race);
  if (!raceValidation.valid) {
    result.errors.push(raceValidation.error);
    result.isValid = false;
    result.errorIndicator = 1;
  }
  result.recodedValues.raceLabel = raceValidation.label;

  if (rawInput) {
    // Step 3: Recode number of biopsies
    const biopsyRecode = recodeNumberOfBiopsies(
      data.numBreastBiopsies,
      data.atypicalHyperplasia,
      data.race
    );
    if (!biopsyRecode.valid) {
      result.errors.push(biopsyRecode.error);
      result.isValid = false;
      result.errorIndicator = 1;
    }
    result.recodedValues.biopsyCategory = biopsyRecode.category;
    result.recodedValues.hyperplasiaMultiplier = biopsyRecode.multiplier;

    // Step 4: Recode age at menarche
    const menarcheRecode = recodeAgeAtMenarche(
      data.ageAtMenarche,
      data.initialAge,
      data.race
    );
    if (!menarcheRecode.valid) {
      result.errors.push(menarcheRecode.error);
      result.isValid = false;
      result.errorIndicator = 1;
    }
    result.recodedValues.menarcheCategory = menarcheRecode.category;

    // Step 5: Recode age at first birth
    const firstBirthRecode = recodeAgeAtFirstBirth(
      data.ageAtFirstBirth,
      data.ageAtMenarche,
      data.initialAge,
      data.race
    );
    if (!firstBirthRecode.valid) {
      result.errors.push(firstBirthRecode.error);
      result.isValid = false;
      result.errorIndicator = 1;
    }
    result.recodedValues.firstBirthCategory = firstBirthRecode.category;

    // Step 6: Recode number of relatives
    const relativesRecode = recodeNumberOfRelatives(
      data.numRelativesWithBrCa,
      data.race
    );
    if (!relativesRecode.valid) {
      result.errors.push(relativesRecode.error);
      result.isValid = false;
      result.errorIndicator = 1;
    }
    result.recodedValues.relativesCategory = relativesRecode.category;
  } else {
    // Data already recoded, use as-is with minimal validation
    result.recodedValues.biopsyCategory = data.numBreastBiopsies;
    result.recodedValues.menarcheCategory = data.ageAtMenarche;
    result.recodedValues.firstBirthCategory = data.ageAtFirstBirth;
    result.recodedValues.relativesCategory = data.numRelativesWithBrCa;
    result.recodedValues.hyperplasiaMultiplier = 1.0; // Default
  }

  return result;
}

/**
 * Validates age constraints: 20 <= initialAge < projectionEndAge <= 90
 * @param {number} initialAge - Current age
 * @param {number} projectionEndAge - Future age for risk projection
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateAges(initialAge, projectionEndAge) {
  const errors = [];
  let valid = true;

  if (initialAge < 20 || initialAge >= 90) {
    errors.push('Initial age must be between 20 and 89 years');
    valid = false;
  }

  if (projectionEndAge > 90) {
    errors.push('Projection end age must be 90 years or less');
    valid = false;
  }

  if (initialAge >= projectionEndAge) {
    errors.push('Projection end age must be greater than initial age');
    valid = false;
  }

  return { valid, errors };
}

/**
 * Validates race code
 * @param {number} race - Race code (1-11)
 * @returns {{valid: boolean, error: string, label: string}}
 */
function validateRace(race) {
  if (race < 1 || race > 11) {
    return {
      valid: false,
      error: 'Invalid race code. Must be between 1 and 11',
      label: 'Unknown',
    };
  }
  return {
    valid: true,
    error: null,
    label: RaceLabels[race],
  };
}

/**
 * Recodes number of biopsies and validates against atypical hyperplasia
 *
 * Recoding rules:
 * - 0 or 99 (unknown) → Category 0
 * - 1 → Category 1
 * - 2+ → Category 2
 *
 * Consistency requirements:
 * (A) If biopsies = 0 or 99, atypical hyperplasia MUST be 99 (not applicable)
 * (B) If biopsies > 0 and < 99, atypical hyperplasia = 0, 1, or 99
 *
 * Race-specific:
 * - Hispanic (US/Foreign): Category 2 grouped with 1
 *
 * @param {number} numBreastBiopsies - Number of breast biopsies
 * @param {number} atypicalHyperplasia - Atypical hyperplasia status (0=no, 1=yes, 99=unknown/NA)
 * @param {number} race - Race code
 * @returns {{valid: boolean, error: string|null, category: number|null, multiplier: number|null}}
 */
function recodeNumberOfBiopsies(numBreastBiopsies, atypicalHyperplasia, race) {
  let category;
  let multiplier = 1.0;

  // Check consistency requirement (A): If no biopsies, hyperplasia must be not applicable
  if (
    (numBreastBiopsies === 0 || numBreastBiopsies === SpecialValues.UNKNOWN) &&
    atypicalHyperplasia !== SpecialValues.NOT_APPLICABLE
  ) {
    return {
      valid: false,
      error:
        'Consistency error: If no biopsies, atypical hyperplasia must be not applicable (99)',
      category: null,
      multiplier: null,
    };
  }

  // Check consistency requirement (B): If biopsies performed, hyperplasia must be 0, 1, or 99
  if (
    numBreastBiopsies > 0 &&
    numBreastBiopsies < SpecialValues.UNKNOWN &&
    atypicalHyperplasia !== 0 &&
    atypicalHyperplasia !== 1 &&
    atypicalHyperplasia !== SpecialValues.UNKNOWN
  ) {
    return {
      valid: false,
      error:
        'Consistency error: If biopsies performed, atypical hyperplasia must be 0, 1, or 99',
      category: null,
      multiplier: null,
    };
  }

  // Recode biopsies to categories
  if (numBreastBiopsies === 0 || numBreastBiopsies === SpecialValues.UNKNOWN) {
    category = 0;
    multiplier = 1.0;
  } else if (numBreastBiopsies === 1) {
    category = 1;
  } else if (
    numBreastBiopsies >= 2 &&
    numBreastBiopsies < SpecialValues.UNKNOWN
  ) {
    category = 2;
  } else {
    return {
      valid: false,
      error: 'Invalid number of biopsies',
      category: null,
      multiplier: null,
    };
  }

  // Set atypical hyperplasia multiplier (only if biopsies > 0)
  if (category > 0) {
    if (atypicalHyperplasia === 0) {
      multiplier = 0.93;
    } else if (atypicalHyperplasia === 1) {
      multiplier = 1.82;
    } else if (atypicalHyperplasia === SpecialValues.UNKNOWN) {
      multiplier = 1.0;
    }
  }

  // Race-specific recoding for Hispanic women
  if (
    race === RaceCode.HISPANIC_US_BORN ||
    race === RaceCode.HISPANIC_FOREIGN_BORN
  ) {
    if (numBreastBiopsies === 0 || numBreastBiopsies === SpecialValues.UNKNOWN) {
      category = 0;
    } else if (category === 2) {
      category = 1; // Group 2+ with 1
    }
  }

  return { valid: true, error: null, category, multiplier };
}

/**
 * Recodes age at menarche
 *
 * Recoding rules:
 * - 14+ or 99 (unknown) → Category 0
 * - 12-13 → Category 1
 * - <12 → Category 2
 *
 * Race-specific rules:
 * - African-American: Category 2 (≤11) grouped with Category 1 (12-13)
 * - Hispanic US Born: Not in RR model, all set to 0
 *
 * @param {number} ageAtMenarche - Age at first menstrual period
 * @param {number} initialAge - Current age
 * @param {number} race - Race code
 * @returns {{valid: boolean, error: string|null, category: number|null}}
 */
function recodeAgeAtMenarche(ageAtMenarche, initialAge, race) {
  let category;

  // Validation: menarche cannot be after current age (unless unknown)
  if (ageAtMenarche > initialAge && ageAtMenarche !== SpecialValues.UNKNOWN) {
    return {
      valid: false,
      error: 'Age at menarche cannot be greater than initial age',
      category: null,
    };
  }

  // Recode to categories
  if (ageAtMenarche >= 14 || ageAtMenarche === SpecialValues.UNKNOWN) {
    category = 0;
  } else if (ageAtMenarche >= 12 && ageAtMenarche < 14) {
    category = 1;
  } else if (ageAtMenarche > 0 && ageAtMenarche < 12) {
    category = 2;
  } else {
    return {
      valid: false,
      error: 'Invalid age at menarche',
      category: null,
    };
  }

  // Race-specific adjustments
  // African-American: group category 2 with 1
  if (race === RaceCode.AFRICAN_AMERICAN && category === 2) {
    category = 1;
  }

  // Hispanic US Born: not in model, set to 0
  if (race === RaceCode.HISPANIC_US_BORN) {
    category = 0;
  }

  return { valid: true, error: null, category };
}

/**
 * Recodes age at first birth
 *
 * Recoding rules (standard):
 * - <20 or 99 (unknown) → Category 0
 * - 20-24 → Category 1
 * - 25-29 or 98 (nulliparous) → Category 2
 * - 30+ → Category 3
 *
 * Race-specific rules:
 * - African-American: Not in RR model, all set to 0
 * - Hispanic (US/Foreign): Different grouping
 *   - <20 or 99 → 0
 *   - 20-29 → 1
 *   - 30+ or 98 → 2
 *
 * @param {number} ageAtFirstBirth - Age at first live birth (98=nulliparous, 99=unknown)
 * @param {number} ageAtMenarche - Age at first menstrual period
 * @param {number} initialAge - Current age
 * @param {number} race - Race code
 * @returns {{valid: boolean, error: string|null, category: number|null}}
 */
function recodeAgeAtFirstBirth(
  ageAtFirstBirth,
  ageAtMenarche,
  initialAge,
  race
) {
  let category;

  // Validation: first birth cannot be before menarche
  if (
    ageAtFirstBirth < ageAtMenarche &&
    ageAtMenarche !== SpecialValues.UNKNOWN &&
    ageAtFirstBirth !== SpecialValues.UNKNOWN &&
    ageAtFirstBirth !== SpecialValues.NULLIPAROUS
  ) {
    return {
      valid: false,
      error: 'Age at first birth cannot be less than age at menarche',
      category: null,
    };
  }

  // Validation: first birth cannot exceed current age (except nulliparous)
  if (
    ageAtFirstBirth > initialAge &&
    ageAtFirstBirth < SpecialValues.NULLIPAROUS
  ) {
    return {
      valid: false,
      error: 'Age at first birth cannot be greater than initial age',
      category: null,
    };
  }

  // African-American: not in model
  if (race === RaceCode.AFRICAN_AMERICAN) {
    return { valid: true, error: null, category: 0 };
  }

  // Hispanic recoding (both US-born and Foreign-born)
  if (
    race === RaceCode.HISPANIC_US_BORN ||
    race === RaceCode.HISPANIC_FOREIGN_BORN
  ) {
    if (ageAtFirstBirth < 20 || ageAtFirstBirth === SpecialValues.UNKNOWN) {
      category = 0;
    } else if (ageAtFirstBirth >= 20 && ageAtFirstBirth < 30) {
      category = 1;
    } else if (
      ageAtFirstBirth >= 30 ||
      ageAtFirstBirth === SpecialValues.NULLIPAROUS
    ) {
      category = 2;
    } else {
      return {
        valid: false,
        error: 'Invalid age at first birth',
        category: null,
      };
    }
    return { valid: true, error: null, category };
  }

  // Standard recoding for other races
  if (ageAtFirstBirth < 20 || ageAtFirstBirth === SpecialValues.UNKNOWN) {
    category = 0;
  } else if (ageAtFirstBirth >= 20 && ageAtFirstBirth < 25) {
    category = 1;
  } else if (
    (ageAtFirstBirth >= 25 && ageAtFirstBirth < 30) ||
    ageAtFirstBirth === SpecialValues.NULLIPAROUS
  ) {
    category = 2;
  } else if (
    ageAtFirstBirth >= 30 &&
    ageAtFirstBirth < SpecialValues.NULLIPAROUS
  ) {
    category = 3;
  } else {
    return {
      valid: false,
      error: 'Invalid age at first birth',
      category: null,
    };
  }

  return { valid: true, error: null, category };
}

/**
 * Recodes number of first-degree relatives with breast cancer
 *
 * Recoding rules:
 * - 0 or 99 (unknown) → Category 0
 * - 1 → Category 1
 * - 2+ → Category 2
 *
 * Race-specific rules:
 * - Asian-American (races 6-11): Category 2 grouped with 1
 * - Hispanic (US/Foreign): Category 2 grouped with 1
 *
 * @param {number} numRelativesWithBrCa - Number of first-degree relatives with breast cancer
 * @param {number} race - Race code
 * @returns {{valid: boolean, error: string|null, category: number|null}}
 */
function recodeNumberOfRelatives(numRelativesWithBrCa, race) {
  let category;

  // Recode to categories
  if (
    numRelativesWithBrCa === 0 ||
    numRelativesWithBrCa === SpecialValues.UNKNOWN
  ) {
    category = 0;
  } else if (numRelativesWithBrCa === 1) {
    category = 1;
  } else if (
    numRelativesWithBrCa >= 2 &&
    numRelativesWithBrCa < SpecialValues.UNKNOWN
  ) {
    category = 2;
  } else {
    return {
      valid: false,
      error: 'Invalid number of relatives',
      category: null,
    };
  }

  // Race-specific adjustments
  // Asian-American and Hispanic: group category 2 with 1
  if (
    (race >= RaceCode.CHINESE && race <= RaceCode.OTHER_ASIAN) ||
    race === RaceCode.HISPANIC_US_BORN ||
    race === RaceCode.HISPANIC_FOREIGN_BORN
  ) {
    if (category === 2) {
      category = 1;
    }
  }

  return { valid: true, error: null, category };
}
