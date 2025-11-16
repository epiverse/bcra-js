/**
 * Test utilities for cross-validation between R and JavaScript implementations
 * Provides helpers for comparing results with appropriate tolerances
 */

/**
 * Tolerance levels for numerical comparisons
 * Based on moderate tolerance settings: ±0.01% absolute risk, ±0.001 RR
 */
export const TOLERANCE = {
  ABSOLUTE_RISK: 0.01,     // ±0.01% for absolute risk percentages
  RELATIVE_RISK: 0.001,    // ±0.001 for RR multipliers
  PATTERN_NUMBER: 0,       // Exact match required for pattern numbers (integer)
  RECODED_VALUES: 0,       // Exact match for categorical recoded values
};

/**
 * Convert R test case to JavaScript input format
 * Maps R column names to JS field names
 */
export function rToJsInput(rCase) {
  return {
    id: rCase.ID,
    initialAge: rCase.T1,
    projectionEndAge: rCase.T2,
    numBreastBiopsies: rCase.N_Biop,
    atypicalHyperplasia: rCase.HypPlas,
    ageAtMenarche: rCase.AgeMen,
    ageAtFirstBirth: rCase.Age1st,
    numRelativesWithBrCa: rCase.N_Rels,
    race: rCase.Race,
  };
}

/**
 * Compare JavaScript result with R reference result
 * Returns comparison object with pass/fail and details
 */
export function compareResults(jsResult, rReference, options = {}) {
  const {
    checkAbsoluteRisk = true,
    checkRelativeRisk = true,
    checkPatternNumber = true,
    checkRecodedValues = true,
    checkValidation = true,
  } = options;

  const comparison = {
    pass: true,
    differences: [],
    details: {},
  };

  // Check if both are valid or both are errors
  if (checkValidation) {
    const jsIsValid = jsResult.success && jsResult.validation.isValid;
    const rIsValid = rReference.Error_Ind === 0;

    if (jsIsValid !== rIsValid) {
      comparison.pass = false;
      comparison.differences.push({
        field: 'validation',
        expected: rIsValid ? 'valid' : 'error',
        actual: jsIsValid ? 'valid' : 'error',
        message: `Validation mismatch: R says ${rIsValid ? 'valid' : 'error'}, JS says ${jsIsValid ? 'valid' : 'error'}`,
      });
    }

    comparison.details.validation = {
      jsValid: jsIsValid,
      rValid: rIsValid,
      match: jsIsValid === rIsValid,
    };
  }

  // Only compare values if both are valid
  const bothValid = jsResult.success && rReference.Error_Ind === 0;

  if (bothValid) {
    // Compare absolute risk
    if (checkAbsoluteRisk && jsResult.absoluteRisk !== null && !isNaN(rReference.AbsRisk)) {
      const diff = Math.abs(jsResult.absoluteRisk - rReference.AbsRisk);
      const withinTolerance = diff <= TOLERANCE.ABSOLUTE_RISK;

      if (!withinTolerance) {
        comparison.pass = false;
        comparison.differences.push({
          field: 'absoluteRisk',
          expected: rReference.AbsRisk,
          actual: jsResult.absoluteRisk,
          diff,
          tolerance: TOLERANCE.ABSOLUTE_RISK,
          message: `Absolute risk differs by ${diff.toFixed(4)}% (tolerance: ±${TOLERANCE.ABSOLUTE_RISK}%)`,
        });
      }

      comparison.details.absoluteRisk = {
        js: jsResult.absoluteRisk,
        r: rReference.AbsRisk,
        diff,
        withinTolerance,
      };
    }

    // Compare relative risk (age < 50)
    if (checkRelativeRisk && jsResult.relativeRiskUnder50 !== null && !isNaN(rReference.RR_Star1)) {
      const diff = Math.abs(jsResult.relativeRiskUnder50 - rReference.RR_Star1);
      const withinTolerance = diff <= TOLERANCE.RELATIVE_RISK;

      if (!withinTolerance) {
        comparison.pass = false;
        comparison.differences.push({
          field: 'relativeRiskUnder50',
          expected: rReference.RR_Star1,
          actual: jsResult.relativeRiskUnder50,
          diff,
          tolerance: TOLERANCE.RELATIVE_RISK,
          message: `RR (age <50) differs by ${diff.toFixed(6)} (tolerance: ±${TOLERANCE.RELATIVE_RISK})`,
        });
      }

      comparison.details.relativeRiskUnder50 = {
        js: jsResult.relativeRiskUnder50,
        r: rReference.RR_Star1,
        diff,
        withinTolerance,
      };
    }

    // Compare relative risk (age >= 50)
    if (checkRelativeRisk && jsResult.relativeRiskAtOrAbove50 !== null && !isNaN(rReference.RR_Star2)) {
      const diff = Math.abs(jsResult.relativeRiskAtOrAbove50 - rReference.RR_Star2);
      const withinTolerance = diff <= TOLERANCE.RELATIVE_RISK;

      if (!withinTolerance) {
        comparison.pass = false;
        comparison.differences.push({
          field: 'relativeRiskAtOrAbove50',
          expected: rReference.RR_Star2,
          actual: jsResult.relativeRiskAtOrAbove50,
          diff,
          tolerance: TOLERANCE.RELATIVE_RISK,
          message: `RR (age ≥50) differs by ${diff.toFixed(6)} (tolerance: ±${TOLERANCE.RELATIVE_RISK})`,
        });
      }

      comparison.details.relativeRiskAtOrAbove50 = {
        js: jsResult.relativeRiskAtOrAbove50,
        r: rReference.RR_Star2,
        diff,
        withinTolerance,
      };
    }

    // Compare pattern number (exact match)
    if (checkPatternNumber && jsResult.patternNumber !== null && !isNaN(rReference.PatternNumber)) {
      const match = jsResult.patternNumber === rReference.PatternNumber;

      if (!match) {
        comparison.pass = false;
        comparison.differences.push({
          field: 'patternNumber',
          expected: rReference.PatternNumber,
          actual: jsResult.patternNumber,
          diff: Math.abs(jsResult.patternNumber - rReference.PatternNumber),
          tolerance: TOLERANCE.PATTERN_NUMBER,
          message: `Pattern number mismatch: expected ${rReference.PatternNumber}, got ${jsResult.patternNumber}`,
        });
      }

      comparison.details.patternNumber = {
        js: jsResult.patternNumber,
        r: rReference.PatternNumber,
        match,
      };
    }

    // Compare recoded values
    if (checkRecodedValues && jsResult.recodedValues !== null) {
      const recodedComparison = {
        biopsyCategory: compareRecodedValue(
          jsResult.recodedValues.biopsyCategory,
          parseRecodedValue(rReference.NB_Cat),
          'biopsyCategory'
        ),
        menarcheCategory: compareRecodedValue(
          jsResult.recodedValues.menarcheCategory,
          parseRecodedValue(rReference.AM_Cat),
          'menarcheCategory'
        ),
        firstBirthCategory: compareRecodedValue(
          jsResult.recodedValues.firstBirthCategory,
          parseRecodedValue(rReference.AF_Cat),
          'firstBirthCategory'
        ),
        relativesCategory: compareRecodedValue(
          jsResult.recodedValues.relativesCategory,
          parseRecodedValue(rReference.NR_Cat),
          'relativesCategory'
        ),
        hyperplasiaMultiplier: compareHyperplasiaMultiplier(
          jsResult.recodedValues.hyperplasiaMultiplier,
          rReference.R_Hyp
        ),
      };

      comparison.details.recodedValues = recodedComparison;

      // Check for any recoded value mismatches
      Object.entries(recodedComparison).forEach(([field, result]) => {
        if (!result.match) {
          comparison.pass = false;
          comparison.differences.push({
            field: `recodedValues.${field}`,
            expected: result.r,
            actual: result.js,
            message: `Recoded value mismatch for ${field}: expected ${result.r}, got ${result.js}`,
          });
        }
      });
    }
  }

  return comparison;
}

/**
 * Parse R recoded value (may be numeric or string like "A", "B")
 */
function parseRecodedValue(rValue) {
  if (rValue === null || rValue === undefined || rValue === '' || rValue === 'NA') {
    return null;
  }
  if (rValue === 'A' || rValue === 'B') {
    return rValue; // Error indicators
  }
  const parsed = Number(rValue);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Compare recoded categorical values (allowing for null/NA)
 */
function compareRecodedValue(jsValue, rValue, fieldName) {
  // Handle error cases (R returns "A" or "B" for errors)
  if (rValue === 'A' || rValue === 'B') {
    return {
      js: jsValue,
      r: rValue,
      match: true, // Don't fail on error cases
      note: 'R error indicator',
    };
  }

  // Both null/undefined is a match
  if ((jsValue === null || jsValue === undefined) && (rValue === null || rValue === undefined)) {
    return { js: jsValue, r: rValue, match: true };
  }

  // One null, one not null is a mismatch
  if ((jsValue === null || jsValue === undefined) !== (rValue === null || rValue === undefined)) {
    return { js: jsValue, r: rValue, match: false };
  }

  // Compare numerical values
  const match = Number(jsValue) === Number(rValue);
  return { js: jsValue, r: rValue, match };
}

/**
 * Compare hyperplasia multiplier with tolerance for floating point
 */
function compareHyperplasiaMultiplier(jsValue, rValue) {
  if (typeof rValue === 'string' && (rValue === 'A' || rValue === 'B')) {
    return {
      js: jsValue,
      r: rValue,
      match: true, // Don't fail on error cases
      note: 'R error indicator',
    };
  }

  const rNum = Number(rValue);
  if (isNaN(rNum) || jsValue === null || jsValue === undefined) {
    return { js: jsValue, r: rValue, match: false };
  }

  const diff = Math.abs(jsValue - rNum);
  const match = diff < 0.001; // Small tolerance for floating point

  return { js: jsValue, r: rNum, diff, match };
}

/**
 * Format comparison report for display
 */
export function formatComparisonReport(comparison) {
  if (comparison.pass) {
    return '✓ All values match within tolerance';
  }

  let report = '✗ Comparison failed:\n';
  comparison.differences.forEach((diff, index) => {
    report += `  ${index + 1}. ${diff.message}\n`;
    report += `     Expected: ${diff.expected}\n`;
    report += `     Actual:   ${diff.actual}\n`;
    if (diff.diff !== undefined) {
      report += `     Diff:     ${diff.diff}\n`;
    }
  });

  return report;
}

/**
 * Batch compare multiple test cases
 */
export function batchCompare(jsResults, rReferences, options = {}) {
  const results = [];

  for (let i = 0; i < jsResults.length; i++) {
    const jsResult = jsResults[i];
    const rReference = rReferences[i];

    const comparison = compareResults(jsResult, rReference, options);

    results.push({
      index: i,
      id: rReference.ID,
      description: rReference.Description,
      comparison,
      jsResult,
      rReference,
    });
  }

  const summary = {
    total: results.length,
    passed: results.filter((r) => r.comparison.pass).length,
    failed: results.filter((r) => r.comparison.pass === false).length,
    passRate: 0,
  };

  summary.passRate = (summary.passed / summary.total) * 100;

  return {
    results,
    summary,
  };
}

/**
 * Get failures from batch comparison results
 */
export function getFailures(batchResults) {
  return batchResults.results.filter((r) => !r.comparison.pass);
}

/**
 * Format batch comparison summary
 */
export function formatBatchSummary(batchResults) {
  const { summary } = batchResults;

  let report = `\nCross-Validation Summary:\n`;
  report += `  Total: ${summary.total}\n`;
  report += `  Passed: ${summary.passed} (${summary.passRate.toFixed(1)}%)\n`;
  report += `  Failed: ${summary.failed}\n`;

  if (summary.failed > 0) {
    report += `\nFailures:\n`;
    const failures = getFailures(batchResults);
    failures.forEach((failure, index) => {
      report += `  ${index + 1}. ID ${failure.id}: ${failure.description}\n`;
      failure.comparison.differences.forEach((diff) => {
        report += `     - ${diff.message}\n`;
      });
    });
  }

  return report;
}

/**
 * Validate recoding logic matches between R and JS
 */
export function validateRecoding(jsRecoded, rRecoded) {
  if (!jsRecoded || !rRecoded) {
    return { valid: false, message: 'Missing recoded values' };
  }

  const checks = {
    biopsyCategory: jsRecoded.biopsyCategory === parseRecodedValue(rRecoded.NB_Cat),
    menarcheCategory: jsRecoded.menarcheCategory === parseRecodedValue(rRecoded.AM_Cat),
    firstBirthCategory: jsRecoded.firstBirthCategory === parseRecodedValue(rRecoded.AF_Cat),
    relativesCategory: jsRecoded.relativesCategory === parseRecodedValue(rRecoded.NR_Cat),
  };

  const allValid = Object.values(checks).every((v) => v);

  return {
    valid: allValid,
    checks,
    message: allValid ? 'All recoded values match' : 'Some recoded values differ',
  };
}

/**
 * Helper to create descriptive test name
 */
export function makeTestName(rCase) {
  const desc = rCase.Description || '';
  const details = `ID ${rCase.ID}: ${desc} (Race ${rCase.Race}, Age ${rCase.T1}→${rCase.T2})`;
  return details;
}

/**
 * Check if result should be compared (both valid or check error cases too)
 */
export function shouldCompare(jsResult, rReference, compareErrors = false) {
  const jsValid = jsResult.success && jsResult.validation.isValid;
  const rValid = rReference.Error_Ind === 0;

  if (compareErrors) {
    return true; // Compare all cases including errors
  }

  return jsValid && rValid; // Only compare valid cases
}

/**
 * Filter test cases by validation status
 */
export function filterByValidation(testCases, validOnly = true) {
  if (validOnly) {
    return testCases.filter((tc) => tc.Error_Ind === 0);
  }
  return testCases.filter((tc) => tc.Error_Ind === 1);
}

/**
 * Group test cases by a field (e.g., race, pattern number)
 */
export function groupBy(testCases, field) {
  const groups = {};
  testCases.forEach((tc) => {
    const key = tc[field];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(tc);
  });
  return groups;
}
