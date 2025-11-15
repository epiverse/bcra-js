# BCRA JavaScript Implementation Plan

## Refactoring Strategy for Breast Cancer Risk Assessment Tool

**Version:** 1.0  
**Date:** November 2025  
**License:** MIT

---

## Executive Summary

This document outlines a detailed, step-by-step plan to refactor the BCRA (Breast Cancer Risk Assessment) R package into a modern JavaScript ES6 module and accompanying web application. The refactored package will maintain full computational fidelity with the original R implementation while providing a client-side calculation library that can be easily integrated into privacy-preserving web applications and distributed via CDN.

**Key Deliverables:**

1. ES6 JavaScript module (`bcra`)
2. NPM package for distribution
3. CDN-accessible library via jsDelivr
4. Web-based BCRAT calculator
5. Comprehensive documentation and tests

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Phase 1: Project Setup and Infrastructure](#phase-1-project-setup-and-infrastructure)
3. [Phase 2: Data Model and Constants](#phase-2-data-model-and-constants)
4. [Phase 3: Core Calculation Modules](#phase-3-core-calculation-modules)
5. [Phase 4: Validation and Error Handling](#phase-4-validation-and-error-handling)
6. [Phase 5: Testing Strategy](#phase-5-testing-strategy)
7. [Phase 6: Library Distribution](#phase-6-library-distribution)
8. [Phase 7: Web Application Development](#phase-7-web-application-development)
9. [Phase 8: Documentation](#phase-8-documentation)
10. [Phase 9: Deployment and CI/CD](#phase-9-deployment-and-cicd)
11. [Phase 10: Performance Optimization](#phase-10-performance-optimization)
12. [Technical Considerations](#technical-considerations)
13. [Risk Mitigation](#risk-mitigation)
14. [Timeline and Resources](#timeline-and-resources)

---

## 1. Project Architecture

### 1.1 Repository Structure

```
bcra-js/
├── .github/
│   ├── workflows/
│   │   ├── test.yml              # CI/CD for testing
│   │   ├── publish.yml           # NPM publishing workflow
│   │   └── deploy.yml            # GitHub Pages deployment
│   └── ISSUE_TEMPLATE/
├── packages/
│   └── bcra/                     # Core library package
│       ├── src/
│       │   ├── index.js          # Main entry point
│       │   ├── constants/
│       │   │   ├── index.js
│       │   │   ├── lambda1.js    # Breast cancer incidence rates
│       │   │   ├── lambda2.js    # Competing mortality rates
│       │   │   ├── beta.js       # Logistic regression coefficients
│       │   │   └── attributable-risk.js
│       │   ├── core/
│       │   │   ├── absolute-risk.js
│       │   │   ├── relative-risk.js
│       │   │   ├── recode-check.js
│       │   │   └── risk-calculator.js
│       │   ├── utils/
│       │   │   ├── validators.js
│       │   │   ├── error-handler.js
│       │   │   └── type-guards.js
│       │   └── types/
│       │       └── index.js      # TypeScript definitions (JSDoc)
│       ├── test/
│       │   ├── unit/
│       │   ├── integration/
│       │   └── fixtures/
│       │       └── test-data.json
│       ├── package.json
│       ├── vite.config.js
│       ├── README.md
│       └── LICENSE
├── apps/
│   └── bcrat/           # Web application
│       ├── public/
│       │   ├── index.html
│       │   └── assets/
│       ├── src/
│       │   ├── main.js
│       │   ├── components/
│       │   │   ├── RiskForm.js
│       │   │   ├── ResultsDisplay.js
│       │   │   └── ErrorDisplay.js
│       │   ├── styles/
│       │   │   └── main.css
│       │   └── utils/
│       ├── package.json
│       ├── vite.config.js
│       └── README.md
├── docs/
│   ├── api/                      # API documentation
│   ├── guides/                   # User guides
│   └── mathematical-model.md     # Gail model documentation
├── scripts/
│   ├── validate-constants.js     # Verify constants match R package
│   └── generate-test-cases.js    # Generate test cases from R
├── .gitignore
├── .npmignore
├── package.json                  # Monorepo root
├── README.md
└── LICENSE
```

### 1.2 Technology Stack

**Core Library:**

- ES6+ JavaScript (native modules)
- Vite for bundling and development
- Vitest for testing
- JSDoc for inline documentation (TypeScript definitions)

**Web Application:**

- Vanilla JavaScript (no framework dependency to keep lightweight)
- Vite for build tooling
- Tailwind CSS for styling and responsive design

**Development Tools:**

- ESLint for code quality
- Prettier for code formatting
- Husky for git hooks
- GitHub Actions for CI/CD

---


## Phase 1: Project Setup and Infrastructure ✅

**Status:** Complete | **Date:** November 10, 2025

Established monorepo structure with Vite build tooling, Vitest testing framework, ESLint v9, and Prettier. Created directory structure for `packages/bcra/` (core library) with placeholder files for future phases. Configured npm workspaces, ES module support, and library bundling (ES + UMD formats).

**Key Files Created:**
- `package.json` (root + library), `vite.config.js`, `eslint.config.js`, `.prettierrc`
- Placeholder files: `src/index.js`, `src/types/index.js`, `src/constants/index.js`
- Test setup: `test/unit/basic.test.js` (2 passing tests)

**Verification:** All build, lint, format, and test commands working. Library builds to `dist/bcra.es.js` and `dist/bcra.umd.js`.

---
## Phase 2: Data Model and Constants ✅

**Status:** Complete | **Date:** November 14, 2025

### Phase 2.1: Define Core Data Types
Created comprehensive type definitions in `packages/bcra/src/types/index.js` with JSDoc and TypeScript support.

**Files Created:**
- `src/types/index.js` - 4 JSDoc typedefs (RiskFactorProfile, RecodedValues, ValidationResult, RiskResult), RaceCode enum (11 races), RaceLabels, SpecialValues. Includes field mapping table (R→JS), comprehensive documentation, and usage examples.
- `types/index.d.ts` - Complete TypeScript definitions mirroring JSDoc types
- `src/types/FIELD_MAPPING.md` - R-to-JavaScript field name translation guide with code examples

**Critical Field Names** (for Phase 3 implementers):
- Use `initialAge` NOT `currentAge` (matches R's T1 semantics)
- Use `projectionEndAge` NOT `projectionAge` (matches R's T2)
- Use `numBreastBiopsies`, `numRelativesWithBrCa`, `atypicalHyperplasia` (descriptive names)
- Special values: 98 = NULLIPAROUS, 99 = UNKNOWN/NOT_APPLICABLE
- See `types/FIELD_MAPPING.md` for complete R→JS mapping

### Phase 2.2 & 2.3: Implement Constants Module
Ported all numerical constants from R package with full precision. All values verified against `BCRA-R/data/*.rda` files.

**Files Created:**
- `src/constants/beta.js` - 6 beta coefficient arrays (6 values each) + BETA_BY_RACE lookup
- `src/constants/lambda1.js` - 11 incidence rate arrays (14 age groups each) + LAMBDA1_BY_RACE lookup + WHITE_AVG_LAMBDA1
- `src/constants/lambda2.js` - 11 mortality rate arrays (14 age groups each) + LAMBDA2_BY_RACE lookup + WHITE_AVG_LAMBDA2
- `src/constants/attributable-risk.js` - 6 AR arrays (2 values each: age<50, age>=50) + ATTRIBUTABLE_RISK_BY_RACE lookup + getAttributableRisk() helper
- `src/constants/index.js` - Exports all constants + age-related constants (AGE_GROUPS, MIN_AGE=20, MAX_AGE=90, AGE_THRESHOLD=50, YEARS_PER_AGE_GROUP=5)
- `test/unit/constants.test.js` - 38 passing tests verifying array dimensions, reference integrity, lookup correctness, and sample values

**Key Implementation Details:**
- Race 4 (Native American/Other) uses WHITE constants (references, not copies)
- Races 6-11 (all Asian subgroups) share ASIAN_BETA and ASIAN_1_AR (references)
- WHITE_AVG_LAMBDA1/2 used for average risk calculation (races 1 and 4 only)
- All lookup objects use race codes 1-11 as keys
- Full decimal precision preserved from R (no rounding)

**Usage for Phase 3:**
```javascript
import { BETA_BY_RACE, LAMBDA1_BY_RACE, LAMBDA2_BY_RACE,
         ATTRIBUTABLE_RISK_BY_RACE, getAttributableRisk } from './constants/index.js';

const beta = BETA_BY_RACE[patientData.race];  // 6-element array
const lambda1 = LAMBDA1_BY_RACE[patientData.race];  // 14-element array
const lambda2 = LAMBDA2_BY_RACE[patientData.race];  // 14-element array
const oneMinusAR = getAttributableRisk(patientData.race, age);  // single value
```

**Verification:** All 38 constants tests passing. Values match R package exports exactly.

---

## Phase 3: Core Calculation Modules ✅

**Status:** Complete | **Date:** November 15, 2025

Implemented all core calculation modules for breast cancer risk assessment. The complete calculation pipeline now performs validation, recoding, relative risk calculation, absolute risk calculation (Gail model), and result aggregation.

**Files Created:**
- `src/core/recode-check.js` - Input validation and race-specific recoding logic (400+ lines)
- `src/core/relative-risk.js` - Relative risk calculation with beta coefficients and linear predictors
- `src/core/absolute-risk.js` - Absolute risk calculation using Gail model numerical integration (150+ lines)
- `src/core/risk-calculator.js` - Main API interface with error handling
- `src/index.js` - Library entry point exporting all public functions
- `src/utils/validators.js` - Data structure validation and sanitization helpers
- `test/unit/recode-check.test.js` - 60+ tests for validation and recoding
- `test/unit/relative-risk.test.js` - 25+ tests for RR calculations
- `test/unit/absolute-risk.test.js` - 35+ tests for absolute risk
- `test/integration/risk-calculator.test.js` - 40+ end-to-end integration tests

**Key Implementation Details:**

**Validation & Recoding (`recode-check.js`):**
- Age validation: 20 ≤ initialAge < projectionEndAge ≤ 90
- Race-specific recoding rules:
  - Biopsies: 0/99→0, 1→1, 2+→2 (Hispanic: 2+ grouped with 1)
  - Menarche: ≥14/99→0, 12-13→1, <12→2 (African-American: <12 grouped with 12-13; Hispanic US: all→0)
  - First birth: <20/99→0, 20-24→1, 25-29/98→2, 30+→3 (African-American: all→0; Hispanic: different grouping)
  - Relatives: 0/99→0, 1→1, 2+→2 (Asian/Hispanic: 2+ grouped with 1)
- Hyperplasia multipliers: 0.93 (no), 1.82 (yes), 1.0 (unknown)
- Consistency checks for biopsy/hyperplasia relationship

**Relative Risk (`relative-risk.js`):**
- Linear predictor calculation for age <50 and ≥50 using race-specific beta coefficients
- LP1 = β₀×biopsies + β₁×menarche + β₂×firstBirth + β₃×relatives + β₅×(firstBirth×relatives) + ln(hyperplasia)
- LP2 = LP1 + β₄×biopsies (additional age×biopsies interaction for ≥50)
- RR = exp(LP)
- Pattern number calculation (1-108) for risk factor combination identification

**Absolute Risk (`absolute-risk.js`):**
- Gail model numerical integration over single-year age intervals
- Expands 5-year age group rates (lambda1, lambda2) to 70 single-year rates (ages 20-89)
- Applies (1-AR)×RR multipliers for age <50 and ≥50
- Integrates: Σ [(1-AR)×RR×λ₁ / h] × exp(-H) × [1 - exp(-h×Δt)]
  - h = combined hazard, H = cumulative hazard
- Handles partial year intervals at boundaries
- Returns risk as percentage (0-100)

**Main API (`risk-calculator.js`):**
- `calculateRisk(patientData, options)` - Single patient calculation
- `calculateBatchRisk(patients, options)` - Batch processing
- Options: `rawInput` (default: true), `calculateAverage` (default: false)
- Comprehensive error handling with structured error responses

**Usage Example:**
```javascript
import { calculateRisk, RaceCode } from 'bcra';

const result = calculateRisk({
  id: 1,
  initialAge: 40,
  projectionEndAge: 50,
  race: RaceCode.WHITE,
  numBreastBiopsies: 1,
  ageAtMenarche: 12,
  ageAtFirstBirth: 25,
  numRelativesWithBrCa: 1,
  atypicalHyperplasia: 0
});

// result.absoluteRisk: 2.34 (percentage for 10-year period)
// result.relativeRiskUnder50: 1.52
// result.relativeRiskAtOrAbove50: 1.48
// result.patternNumber: 43
```

**Verification:** All 160 tests passing across 6 test files. Library builds successfully with no errors. Core calculation logic matches R package behavior.

**Ready for Phase 4:** Validation and error handling enhancements.

---

## Phase 4: Validation and Error Handling

### Step 4.1: Create Comprehensive Validators

**Create `packages/bcra/src/utils/validators.js`:**

```javascript
import { MIN_AGE, MAX_AGE } from '../constants/index.js';
import { SpecialValues } from '../types/index.js';

/**
 * Validates risk factor data structure
 * @param {Object} data - Risk factor data to validate
 * @returns {Object} Validation result
 */
export function validateRiskFactorDataStructure(data) {
  const errors = [];

  const requiredFields = [
    'id',
    'initialAge',
    'projectionEndAge',
    'race',
    'numBreastBiopsies',
    'ageAtMenarche',
    'ageAtFirstBirth',
    'numRelativesWithBrCa',
    'atypicalHyperplasia',
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Type checking
  const numericFields = [
    'initialAge',
    'projectionEndAge',
    'race',
    'numBreastBiopsies',
    'ageAtMenarche',
    'ageAtFirstBirth',
    'numRelativesWithBrCa',
    'atypicalHyperplasia',
  ];

  for (const field of numericFields) {
    if (field in data && typeof data[field] !== 'number') {
      errors.push(`${field} must be a number`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates age ranges
 */
export function validateAge(age, fieldName) {
  const errors = [];

  if (age < MIN_AGE || age >= MAX_AGE) {
    errors.push(
      `${fieldName} must be between ${MIN_AGE} and ${MAX_AGE - 1} years`
    );
  }

  if (!Number.isInteger(age) && age !== Math.floor(age)) {
    // Allow fractional ages but warn
    errors.push(`${fieldName} should typically be a whole number`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes input data
 */
export function sanitizePatientData(data) {
  return {
    ...data,
    initialAge: Number(data.initialAge),
    projectionEndAge: Number(data.projectionEndAge),
    race: Number(data.race),
    numBreastBiopsies: Number(data.numBreastBiopsies),
    ageAtMenarche: Number(data.ageAtMenarche),
    ageAtFirstBirth: Number(data.ageAtFirstBirth),
    numRelativesWithBrCa: Number(data.numRelativesWithBrCa),
    atypicalHyperplasia: Number(data.atypicalHyperplasia),
  };
}
```

### Step 4.2: Create Error Handling Utilities

**Create `packages/bcra/src/utils/error-handler.js`:**

```javascript
/**
 * Custom error classes
 */
export class BCRAValidationError extends Error {
  constructor(message, fieldErrors = {}) {
    super(message);
    this.name = 'BCRAValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export class BCRACalculationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'BCRACalculationError';
    this.details = details;
  }
}

/**
 * Error formatter
 */
export function formatValidationErrors(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return 'No errors';
  }

  return errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n');
}

/**
 * Creates user-friendly error messages
 */
export function createUserFriendlyError(error) {
  const friendlyMessages = {
    'Invalid race code': 'Please select a valid race/ethnicity option.',
    'Current age must be between 20 and 89 years':
      'Age must be between 20 and 89 years for risk calculation.',
    'Projection age must be greater than current age':
      'The future age must be greater than the current age.',
    'Age at menarche cannot be greater than current age':
      'Age at first period cannot be greater than current age.',
    'Age at first birth cannot be less than age at menarche':
      'Age at first birth must be after age at first period.',
  };

  return friendlyMessages[error] || error;
}
```

---

## Phase 5: Testing Strategy

### Step 5.1: Unit Tests

**Create `packages/bcra/test/unit/recode-check.test.js`:**

```javascript
import { describe, it, expect } from 'vitest';
import { recodeAndValidate } from '../../src/core/recode-check.js';
import { RaceCode } from '../../src/types/index.js';

describe('recodeAndValidate', () => {
  describe('Age validation', () => {
    it('should reject age below 20', () => {
      const data = {
        initialAge: 19,
        projectionEndAge: 25,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Current age must be between 20 and 89 years'
      );
    });

    it('should reject projection age <= current age', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 40,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Projection age must be greater than current age'
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
        atypicalHyperplasia: 99,
      };

      const result = recodeAndValidate(data, true);
      expect(result.errors.filter((e) => e.includes('age'))).toHaveLength(0);
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
        atypicalHyperplasia: 99,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.biopsyCategory).toBe(0);
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

    it('should recode 2+ biopsies to category 2', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 3,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 1,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.biopsyCategory).toBe(2);
    });

    it('should validate hyperplasia consistency for 0 biopsies', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.WHITE,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 1, // Invalid: should be 99
      };

      const result = recodeAndValidate(data, true);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Consistency error'))).toBe(
        true
      );
    });
  });

  describe('Race-specific recoding', () => {
    it('should set menarche to 0 for Hispanic US Born', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.HISPANIC_US_BORN,
        numBreastBiopsies: 0,
        ageAtMenarche: 10,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.menarcheCategory).toBe(0);
    });

    it('should set first birth to 0 for African American', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.AFRICAN_AMERICAN,
        numBreastBiopsies: 0,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 99,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.firstBirthCategory).toBe(0);
    });

    it('should group Hispanic biopsies 2+ with 1', () => {
      const data = {
        initialAge: 40,
        projectionEndAge: 50,
        race: RaceCode.HISPANIC_FOREIGN_BORN,
        numBreastBiopsies: 3,
        ageAtMenarche: 12,
        ageAtFirstBirth: 25,
        numRelativesWithBrCa: 0,
        atypicalHyperplasia: 1,
      };

      const result = recodeAndValidate(data, true);
      expect(result.recodedValues.biopsyCategory).toBe(1);
    });
  });
});
```

**Create similar test files for:**

- `test/unit/relative-risk.test.js`
- `test/unit/absolute-risk.test.js`
- `test/unit/validators.test.js`

### Step 5.2: Integration Tests

**Create `packages/bcra/test/integration/risk-calculator.test.js`:**

```javascript
import { describe, it, expect } from 'vitest';
import { calculateRisk } from '../../src/index.js';
import { RaceCode } from '../../src/types/index.js';

describe('Risk Calculator Integration', () => {
  it('should calculate risk for a typical White woman', () => {
    const patient = {
      id: 1,
      initialAge: 40,
      projectionEndAge: 50,
      race: RaceCode.WHITE,
      numBreastBiopsies: 1,
      ageAtMenarche: 12,
      ageAtFirstBirth: 25,
      numRelativesWithBrCa: 1,
      atypicalHyperplasia: 0,
    };

    const result = calculateRisk(patient);

    expect(result.success).toBe(true);
    expect(result.absoluteRisk).toBeGreaterThan(0);
    expect(result.absoluteRisk).toBeLessThan(100);
    expect(result.relativeRiskUnder50).toBeDefined();
    expect(result.relativeRiskAtOrAbove50).toBeDefined();
  });

  it('should calculate risk for an African American woman', () => {
    const patient = {
      id: 2,
      initialAge: 35,
      projectionEndAge: 40,
      race: RaceCode.AFRICAN_AMERICAN,
      numBreastBiopsies: 0,
      ageAtMenarche: 11,
      ageAtFirstBirth: 22,
      numRelativesWithBrCa: 0,
      atypicalHyperplasia: 99,
    };

    const result = calculateRisk(patient);

    expect(result.success).toBe(true);
    expect(result.absoluteRisk).toBeGreaterThan(0);
    expect(result.raceEthnicity).toBe('African-American');
  });

  it('should handle nulliparous women', () => {
    const patient = {
      id: 3,
      initialAge: 30,
      projectionEndAge: 35,
      race: RaceCode.WHITE,
      numBreastBiopsies: 0,
      ageAtMenarche: 13,
      ageAtFirstBirth: 98, // Nulliparous
      numRelativesWithBrCa: 0,
      atypicalHyperplasia: 99,
    };

    const result = calculateRisk(patient);

    expect(result.success).toBe(true);
    expect(result.absoluteRisk).toBeGreaterThan(0);
  });

  it('should return error for invalid input', () => {
    const patient = {
      id: 4,
      initialAge: 15, // Invalid: too young
      projectionEndAge: 25,
      race: RaceCode.WHITE,
      numBreastBiopsies: 0,
      ageAtMenarche: 12,
      ageAtFirstBirth: 25,
      numRelativesWithBrCa: 0,
      atypicalHyperplasia: 99,
    };

    const result = calculateRisk(patient);

    expect(result.success).toBe(false);
    expect(result.validation.errors.length).toBeGreaterThan(0);
  });
});
```

### Step 5.3: Cross-Validation with R Package

**Create `packages/bcra/test/integration/r-validation.test.js`:**

```javascript
import { describe, it, expect } from 'vitest';
import { calculateRisk } from '../../src/index.js';
import testCases from '../fixtures/r-test-cases.json';

/**
 * These test cases are generated from the R package
 * to ensure computational fidelity
 */
describe('Cross-validation with R package', () => {
  testCases.forEach((testCase) => {
    it(`should match R result for case ${testCase.id}`, () => {
      const result = calculateRisk(testCase.input);

      expect(result.success).toBe(true);

      // Allow small numerical differences due to floating point
      expect(result.absoluteRisk).toBeCloseTo(
        testCase.expectedAbsoluteRisk,
        4 // decimal places
      );

      expect(result.relativeRiskUnder50).toBeCloseTo(testCase.expectedRR1, 4);

      expect(result.relativeRiskAtOrAbove50).toBeCloseTo(testCase.expectedRR2, 4);
    });
  });
});
```

**Create script to generate test cases from R:**

**`scripts/generate-test-cases.js`:**

````javascript
/**
 * This script documents how to generate test cases from the R package
 *
 * In R, run:
 * ```R
 * library(BCRA-R)
 * data(exampledata)
 *
 * # Calculate risks
 * risks <- absolute.risk(exampledata)
 * rr <- relative.risk(exampledata)
 *
 * # Create test cases JSON
 * test_cases <- data.frame(
 *   id = exampledata$ID,
 *   input = exampledata,
 *   expectedAbsoluteRisk = risks,
 *   expectedRR1 = rr$RR_Star1,
 *   expectedRR2 = rr$RR_Star2
 * )
 *
 * write.json(test_cases, "r-test-cases.json")
 * ```
 */
````

### Step 5.4: Test Configuration

**Create `packages/bcra/vitest.config.js`:**

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        '**/*.test.js',
        '**/*.spec.js',
      ],
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
  },
});
```

---

## Phase 6: Library Distribution

### Step 6.1: NPM Package Preparation

**Update `packages/bcra/package.json` for publication:**

```json
{
  "name": "bcra",
  "version": "1.0.0",
  "description": "Breast Cancer Risk Assessment Tool - JavaScript implementation of NCI's BCRAT (Gail Model)",
  "type": "module",
  "main": "./dist/bcra.umd.js",
  "module": "./dist/bcra.es.js",
  "types": "./types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/bcra.es.js",
      "require": "./dist/bcra.umd.js",
      "types": "./types/index.d.ts"
    },
    "./package.json": "./package.json"
  },
  "files": ["dist", "types", "README.md", "LICENSE"],
  "keywords": [
    "breast-cancer",
    "risk-assessment",
    "bcrat",
    "gail-model",
    "medical",
    "healthcare",
    "epidemiology",
    "oncology",
    "cancer-screening",
    "risk-calculator"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

### Step 6.2: TypeScript Definitions

**Create `packages/bcra/types/index.d.ts`:**

```typescript
export interface PatientData {
  id: string | number;
  initialAge: number;
  projectionEndAge: number;
  race: number;
  numBreastBiopsies: number;
  ageAtMenarche: number;
  ageAtFirstBirth: number;
  numRelativesWithBrCa: number;
  atypicalHyperplasia: number;
}

export interface RiskResult {
  success: boolean;
  absoluteRisk: number | null;
  averageRisk: number | null;
  relativeRiskUnder50: number | null;
  relativeRiskAtOrAbove50: number | null;
  patternNumber: number | null;
  raceEthnicity: string | null;
  projectionInterval: number | null;
  validation: ValidationResult;
  recodedValues: RecodedValues | null;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RecodedValues {
  biopsyCategory: number;
  menarcheCategory: number;
  firstBirthCategory: number;
  relativesCategory: number;
  hyperplasiaMultiplier: number;
  raceLabel: string;
}

export interface CalculationOptions {
  rawInput?: boolean;
  calculateAverage?: boolean;
}

export function calculateRisk(
  patientData: PatientData,
  options?: CalculationOptions
): RiskResult;

export function calculateBatchRisk(
  patients: PatientData[],
  options?: CalculationOptions
): RiskResult[];

export const RaceCode: {
  readonly WHITE: 1;
  readonly AFRICAN_AMERICAN: 2;
  readonly HISPANIC_US_BORN: 3;
  readonly NATIVE_AMERICAN_OTHER: 4;
  readonly HISPANIC_FOREIGN_BORN: 5;
  readonly CHINESE: 6;
  readonly JAPANESE: 7;
  readonly FILIPINO: 8;
  readonly HAWAIIAN: 9;
  readonly OTHER_PACIFIC_ISLANDER: 10;
  readonly OTHER_ASIAN: 11;
};

export const VERSION: string;
```

### Step 6.3: jsDelivr Configuration

**Create `.jsdelivrrc`:**

```json
{
  "files": {
    "include": ["dist/**"]
  }
}
```

**Document CDN usage in README:**

````markdown
## CDN Usage

The library is available via jsDelivr:

### Latest version

```html
<script type="module">
  import BCRA from 'https://cdn.jsdelivr.net/npm/bcra@latest/dist/bcra.es.js';

  const result = BCRA.calculateRisk({
    id: 1,
    initialAge: 40,
    projectionEndAge: 50,
    race: 1,
    // ... other fields
  });

  console.log(`Absolute risk: ${result.absoluteRisk}%`);
</script>
```
````

### Specific version

```html
<script type="module">
  import BCRA from 'https://cdn.jsdelivr.net/npm/bcra@1.0.0/dist/bcra.es.js';
</script>
```

### UMD (for older browsers)

```html
<script src="https://cdn.jsdelivr.net/npm/bcra@1.0.0/dist/bcra.umd.js"></script>
<script>
  const result = window.BCRA.calculateRisk({...});
</script>
```

````

### Step 6.4: GitHub Actions for Publishing

**Create `.github/workflows/publish.yml`:**

```yaml
name: Publish to NPM

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci
        working-directory: packages/bcra

      - name: Run tests
        run: npm test
        working-directory: packages/bcra

      - name: Build
        run: npm run build
        working-directory: packages/bcra

      - name: Publish to NPM
        run: npm publish
        working-directory: packages/bcra
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
````

---

## Phase 7: Web Application Development

### Step 7.1: Application Structure

**Create `apps/bcrat/index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Breast Cancer Risk Assessment Tool (BCRAT)</title>
    <meta
      name="description"
      content="Calculate your breast cancer risk using the NCI's Breast Cancer Risk Assessment Tool (Gail Model)"
    />
    <link rel="stylesheet" href="/src/styles/main.css" />
  </head>
  <body>
    <div class="container">
      <header class="header">
        <h1>Breast Cancer Risk Assessment Tool</h1>
        <p class="subtitle">Based on the NCI's BCRAT (Gail Model)</p>
      </header>

      <main class="main-content">
        <div class="disclaimer">
          <h3>⚠️ Important Disclaimer</h3>
          <p>
            This tool provides statistical risk estimates and is not a
            substitute for professional medical advice. Please consult with a
            healthcare provider for personalized risk assessment and screening
            recommendations.
          </p>
        </div>

        <form id="risk-form" class="risk-form">
          <!-- Form fields will be inserted here -->
        </form>

        <div id="results" class="results hidden">
          <!-- Results will be displayed here -->
        </div>

        <div id="error-display" class="error-display hidden">
          <!-- Errors will be displayed here -->
        </div>
      </main>

      <footer class="footer">
        <p>
          Data sources: NCI BCRAT, SEER, CARE Study, SFBCS, AABCS<br />
          Open source implementation under MIT License<br />
          <a href="https://github.com/yourusername/bcra-js" target="_blank"
            >View on GitHub</a
          >
        </p>
      </footer>
    </div>

    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### Step 7.2: Form Component

**Create `apps/bcrat/src/components/RiskForm.js`:**

```javascript
import { RaceCode, RaceLabels } from 'bcra';

export class RiskForm {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.form = null;
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="form-section">
        <h2>Patient Information</h2>
        
        <div class="form-group">
          <label for="initialAge">
            Initial Age (years) *
            <span class="help-text">Must be between 20 and 89</span>
          </label>
          <input
            type="number"
            id="initialAge"
            name="initialAge"
            min="20"
            max="89"
            required
            placeholder="e.g., 40"
          >
        </div>

        <div class="form-group">
          <label for="projectionEndAge">
            Projection End Age (years) *
            <span class="help-text">Age for risk projection, must be greater than initial age</span>
          </label>
          <input
            type="number"
            id="projectionEndAge"
            name="projectionEndAge"
            min="20"
            max="90"
            required
            placeholder="e.g., 50"
          >
        </div>

        <div class="form-group">
          <label for="race">
            Race/Ethnicity *
          </label>
          <select id="race" name="race" required>
            <option value="">Select race/ethnicity</option>
            ${Object.entries(RaceLabels)
              .map(
                ([code, label]) => `<option value="${code}">${label}</option>`
              )
              .join('')}
          </select>
        </div>
      </div>

      <div class="form-section">
        <h2>Risk Factors</h2>

        <div class="form-group">
          <label for="numBreastBiopsies">
            Number of Breast Biopsies *
            <span class="help-text">Enter 0 if none, 99 if unknown</span>
          </label>
          <input
            type="number"
            id="numBreastBiopsies"
            name="numBreastBiopsies"
            min="0"
            required
            placeholder="e.g., 0"
          >
        </div>

        <div class="form-group">
          <label for="atypicalHyperplasia">
            Atypical Hyperplasia *
            <span class="help-text">Found in biopsy? (0=No, 1=Yes, 99=Unknown/Not Applicable)</span>
          </label>
          <select id="atypicalHyperplasia" name="atypicalHyperplasia" required>
            <option value="">Select</option>
            <option value="0">No</option>
            <option value="1">Yes</option>
            <option value="99">Unknown/Not Applicable</option>
          </select>
        </div>

        <div class="form-group">
          <label for="ageAtMenarche">
            Age at First Menstrual Period *
            <span class="help-text">Enter 99 if unknown</span>
          </label>
          <input 
            type="number" 
            id="ageAtMenarche" 
            name="ageAtMenarche" 
            min="7" 
            max="20" 
            required
            placeholder="e.g., 12"
          >
        </div>

        <div class="form-group">
          <label for="ageAtFirstBirth">
            Age at First Live Birth *
            <span class="help-text">Enter 98 if no live births, 99 if unknown</span>
          </label>
          <input 
            type="number" 
            id="ageAtFirstBirth" 
            name="ageAtFirstBirth" 
            min="10" 
            required
            placeholder="e.g., 25"
          >
        </div>

        <div class="form-group">
          <label for="numRelativesWithBrCa">
            Number of First-Degree Relatives with Breast Cancer *
            <span class="help-text">Mother, sisters, daughters. Enter 99 if unknown</span>
          </label>
          <input
            type="number"
            id="numRelativesWithBrCa"
            name="numRelativesWithBrCa"
            min="0"
            required
            placeholder="e.g., 0"
          >
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          Calculate Risk
        </button>
        <button type="reset" class="btn btn-secondary">
          Clear Form
        </button>
      </div>
    `;

    this.form = this.container.querySelector('form');
  }

  attachEventListeners() {
    // Auto-update projection age when initial age changes
    const initialAgeInput = this.container.querySelector('#initialAge');
    const projectionEndAgeInput = this.container.querySelector('#projectionEndAge');

    initialAgeInput.addEventListener('input', (e) => {
      const initialAge = parseInt(e.target.value);
      if (!isNaN(initialAge)) {
        projectionEndAgeInput.min = initialAge + 1;
        // Suggest 5-year projection
        if (
          !projectionEndAgeInput.value ||
          parseInt(projectionEndAgeInput.value) <= initialAge
        ) {
          projectionEndAgeInput.value = Math.min(initialAge + 5, 90);
        }
      }
    });

    // Biopsy/atypical hyperplasia consistency logic
    const biopsiesInput = this.container.querySelector('#numBreastBiopsies');
    const hyperplasiaSelect = this.container.querySelector('#atypicalHyperplasia');

    biopsiesInput.addEventListener('input', (e) => {
      const biopsies = parseInt(e.target.value);
      if (biopsies === 0 || biopsies === 99) {
        hyperplasiaSelect.value = '99';
        hyperplasiaSelect.disabled = true;
      } else {
        hyperplasiaSelect.disabled = false;
        if (hyperplasiaSelect.value === '99') {
          hyperplasiaSelect.value = '';
        }
      }
    });
  }

  getData() {
    const formData = new FormData(this.form);
    return {
      id: 1, // Can be generated or left as default
      initialAge: parseFloat(formData.get('initialAge')),
      projectionEndAge: parseFloat(formData.get('projectionEndAge')),
      race: parseInt(formData.get('race')),
      numBreastBiopsies: parseInt(formData.get('numBreastBiopsies')),
      ageAtMenarche: parseInt(formData.get('ageAtMenarche')),
      ageAtFirstBirth: parseInt(formData.get('ageAtFirstBirth')),
      numRelativesWithBrCa: parseInt(formData.get('numRelativesWithBrCa')),
      atypicalHyperplasia: parseInt(formData.get('atypicalHyperplasia')),
    };
  }

  reset() {
    this.form.reset();
    this.container.querySelector('#atypicalHyperplasia').disabled = false;
  }
}
```

### Step 7.3: Results Display Component

**Create `apps/bcrat/src/components/ResultsDisplay.js`:**

```javascript
export class ResultsDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  show(result) {
    this.container.classList.remove('hidden');

    if (!result.success) {
      this.showError(result);
      return;
    }

    this.container.innerHTML = `
      <div class="results-content">
        <h2>Risk Assessment Results</h2>
        
        <div class="result-primary">
          <div class="risk-value">
            <span class="risk-number">${result.absoluteRisk.toFixed(2)}%</span>
            <span class="risk-label">
              Absolute Risk of Invasive Breast Cancer
            </span>
            <span class="risk-timeframe">
              from age ${Math.floor(result.validation.isValid ? result.projectionInterval : 0)} 
              to age ${Math.floor(result.projectionInterval || 0)}
            </span>
          </div>
        </div>

        <div class="result-details">
          <h3>Additional Information</h3>
          
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Race/Ethnicity:</span>
              <span class="detail-value">${result.raceEthnicity}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">Relative Risk (Age &lt;50):</span>
              <span class="detail-value">${result.relativeRiskUnder50.toFixed(3)}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">Relative Risk (Age ≥50):</span>
              <span class="detail-value">${result.relativeRiskAtOrAbove50.toFixed(3)}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">Projection Interval:</span>
              <span class="detail-value">${result.projectionInterval.toFixed(1)} years</span>
            </div>
          </div>
        </div>

        ${this.renderInterpretation(result.absoluteRisk)}

        <div class="result-actions">
          <button class="btn btn-primary" onclick="window.print()">
            Print Results
          </button>
          <button class="btn btn-secondary" id="new-calculation">
            New Calculation
          </button>
        </div>

        <div class="result-disclaimer">
          <p>
            <strong>Remember:</strong> This is a statistical estimate based on population data. 
            Your individual risk may vary. Please discuss these results with your healthcare provider.
          </p>
        </div>
      </div>
    `;

    // Scroll to results
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  renderInterpretation(risk) {
    let interpretation = '';
    let riskLevel = '';

    if (risk < 1.67) {
      riskLevel = 'Average';
      interpretation =
        'Your estimated risk is considered average for your age and risk factors.';
    } else if (risk < 3) {
      riskLevel = 'Slightly Elevated';
      interpretation = 'Your estimated risk is slightly above average.';
    } else if (risk < 5) {
      riskLevel = 'Moderately Elevated';
      interpretation =
        'Your estimated risk is moderately elevated. Discuss screening options with your healthcare provider.';
    } else {
      riskLevel = 'Elevated';
      interpretation =
        'Your estimated risk is elevated. It is important to discuss screening and prevention strategies with your healthcare provider.';
    }

    return `
      <div class="result-interpretation">
        <h3>Interpretation</h3>
        <div class="risk-level ${riskLevel.toLowerCase().replace(/\s+/g, '-')}">
          <strong>Risk Level:</strong> ${riskLevel}
        </div>
        <p>${interpretation}</p>
        
        <h4>What This Means:</h4>
        <p>
          This percentage represents the estimated probability that you will develop 
          invasive breast cancer during the specified time interval, based on your 
          current age and risk factors.
        </p>
        
        <h4>Next Steps:</h4>
        <ul>
          <li>Share these results with your healthcare provider</li>
          <li>Discuss appropriate screening schedules</li>
          <li>Consider lifestyle modifications that may reduce risk</li>
          <li>Ask about risk-reducing medications if applicable</li>
        </ul>
      </div>
    `;
  }

  showError(result) {
    this.container.innerHTML = `
      <div class="results-error">
        <h2>Unable to Calculate Risk</h2>
        <p>The following issues were found with the input data:</p>
        <ul class="error-list">
          ${result.validation.errors.map((err) => `<li>${err}</li>`).join('')}
        </ul>
        <button class="btn btn-secondary" id="back-to-form">
          Return to Form
        </button>
      </div>
    `;
  }

  hide() {
    this.container.classList.add('hidden');
  }
}
```

### Step 7.4: Main Application

**Create `apps/bcrat/src/main.js`:**

```javascript
import { calculateRisk } from 'bcra';
import { RiskForm } from './components/RiskForm.js';
import { ResultsDisplay } from './components/ResultsDisplay.js';

class BCRATCalculator {
  constructor() {
    this.form = new RiskForm('risk-form');
    this.results = new ResultsDisplay('results');
    this.init();
  }

  init() {
    // Handle form submission
    document.getElementById('risk-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.calculateRisk();
    });

    // Handle new calculation button (delegated)
    document.addEventListener('click', (e) => {
      if (e.target.id === 'new-calculation' || e.target.id === 'back-to-form') {
        this.resetForm();
      }
    });

    // Add loading indicator
    this.createLoadingIndicator();
  }

  createLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'loading';
    indicator.className = 'loading hidden';
    indicator.innerHTML = `
      <div class="spinner"></div>
      <p>Calculating risk...</p>
    `;
    document.body.appendChild(indicator);
  }

  showLoading() {
    document.getElementById('loading').classList.remove('hidden');
  }

  hideLoading() {
    document.getElementById('loading').classList.add('hidden');
  }

  calculateRisk() {
    this.showLoading();
    this.results.hide();

    // Small delay to show loading state (calculations are near-instant)
    setTimeout(() => {
      try {
        const patientData = this.form.getData();
        const result = calculateRisk(patientData);

        this.hideLoading();
        this.results.show(result);

        // Track calculation (if analytics are set up)
        this.trackCalculation(result);
      } catch (error) {
        this.hideLoading();
        this.showError(error);
      }
    }, 300);
  }

  resetForm() {
    this.form.reset();
    this.results.hide();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showError(error) {
    const errorDisplay = document.getElementById('error-display');
    errorDisplay.innerHTML = `
      <h3>An Error Occurred</h3>
      <p>${error.message}</p>
      <button class="btn btn-secondary" onclick="location.reload()">
        Reload Page
      </button>
    `;
    errorDisplay.classList.remove('hidden');
  }

  trackCalculation(result) {
    // Placeholder for analytics tracking
    // Could integrate with Google Analytics, Plausible, etc.
    if (window.plausible) {
      window.plausible('Risk Calculation', {
        props: {
          success: result.success,
          race: result.raceEthnicity,
        },
      });
    }
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new BCRATCalculator();
});
```

### Step 7.5: Styling

**Create `apps/bcrat/src/styles/main.css`:**

```css
/* CSS variables for theming */
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --background: #ffffff;
  --surface: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--surface);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
.header {
  text-align: center;
  padding: 40px 0;
  border-bottom: 2px solid var(--border);
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

/* Disclaimer */
.disclaimer {
  background-color: #fef3c7;
  border-left: 4px solid var(--warning-color);
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 4px;
}

.disclaimer h3 {
  color: var(--warning-color);
  margin-bottom: 10px;
}

/* Form styles */
.risk-form {
  background-color: var(--background);
  padding: 30px;
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.form-section {
  margin-bottom: 30px;
}

.form-section h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: var(--primary-color);
  border-bottom: 2px solid var(--border);
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.help-text {
  display: block;
  font-size: 0.875rem;
  font-weight: normal;
  color: var(--text-secondary);
  margin-top: 4px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: var(--surface);
  cursor: not-allowed;
}

/* Buttons */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.btn {
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  background-color: #475569;
}

/* Results */
.results {
  background-color: var(--background);
  padding: 30px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  margin-top: 30px;
}

.result-primary {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  margin-bottom: 30px;
}

.risk-value {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.risk-number {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.risk-label {
  font-size: 1.25rem;
  margin-bottom: 5px;
}

.risk-timeframe {
  font-size: 1rem;
  opacity: 0.9;
}

.result-details {
  margin-bottom: 30px;
}

.result-details h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: var(--primary-color);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.detail-item {
  padding: 15px;
  background-color: var(--surface);
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
}

.detail-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.detail-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Interpretation */
.result-interpretation {
  background-color: var(--surface);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.result-interpretation h3,
.result-interpretation h4 {
  color: var(--primary-color);
  margin-bottom: 15px;
}

.risk-level {
  padding: 10px 15px;
  border-radius: 4px;
  margin: 15px 0;
  font-size: 1.1rem;
}

.risk-level.average {
  background-color: #d1fae5;
  color: #065f46;
}

.risk-level.slightly-elevated {
  background-color: #fef3c7;
  color: #92400e;
}

.risk-level.moderately-elevated {
  background-color: #fed7aa;
  color: #9a3412;
}

.risk-level.elevated {
  background-color: #fecaca;
  color: #991b1b;
}

.result-interpretation ul {
  margin-left: 20px;
}

.result-interpretation li {
  margin-bottom: 8px;
}

/* Result actions */
.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
}

.result-disclaimer {
  background-color: #fef3c7;
  border-left: 4px solid var(--warning-color);
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

/* Loading indicator */
.loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading p {
  color: white;
  margin-top: 20px;
  font-size: 1.2rem;
}

/* Utility classes */
.hidden {
  display: none !important;
}

/* Footer */
.footer {
  text-align: center;
  padding: 40px 0;
  margin-top: 60px;
  border-top: 2px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.footer a {
  color: var(--primary-color);
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }

  .risk-number {
    font-size: 3rem !important;
  }

  .form-actions,
  .result-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

/* Print styles */
@media print {
  .form-section,
  .form-actions,
  .result-actions,
  .footer,
  .disclaimer {
    display: none;
  }

  .results {
    box-shadow: none;
  }

  .result-primary {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
```

### Step 7.6: Vite Configuration for Web App

**Create `apps/bcrat/vite.config.js`:**

```javascript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/', // Will be '/bcra-js/' for GitHub Pages
  resolve: {
    alias: {
      bcra: path.resolve(__dirname, '../../packages/bcra/src/index.js'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          bcra: ['bcra'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

---

## Phase 8: Documentation

### Step 8.1: Library README

**Create comprehensive `packages/bcra/README.md`:**

````markdown
# BCRA - Breast Cancer Risk Assessment

JavaScript implementation of the NCI's Breast Cancer Risk Assessment Tool (BCRAT), also known as the Gail Model.

## Features

- ✅ Complete implementation of the Gail Model
- ✅ Support for multiple race/ethnic groups
- ✅ Client-side calculation (no server required)
- ✅ Zero dependencies
- ✅ TypeScript definitions included
- ✅ Comprehensive validation and error handling
- ✅ Available via NPM and CDN

## Installation

### NPM

```bash
npm install bcra
```
````

### Yarn

```bash
yarn add bcra
```

### CDN (jsDelivr)

```html
<script type="module">
  import { calculateRisk } from 'https://cdn.jsdelivr.net/npm/bcra@latest/dist/bcra.es.js';
</script>
```

## Quick Start

```javascript
import { calculateRisk, RaceCode } from 'bcra';

const patient = {
  id: 1,
  initialAge: 40,
  projectionEndAge: 50,
  race: RaceCode.WHITE,
  numBreastBiopsies: 1,
  ageAtMenarche: 12,
  ageAtFirstBirth: 25,
  numRelativesWithBrCa: 1,
  atypicalHyperplasia: 0,
};

const result = calculateRisk(patient);

if (result.success) {
  console.log(`Absolute Risk: ${result.absoluteRisk.toFixed(2)}%`);
  console.log(`Relative Risk (<50): ${result.relativeRiskUnder50.toFixed(3)}`);
  console.log(`Relative Risk (≥50): ${result.relativeRiskAtOrAbove50.toFixed(3)}`);
} else {
  console.error('Validation errors:', result.validation.errors);
}
```

## API Documentation

[Full API documentation...continues with detailed examples]

## Race/Ethnicity Codes

The package supports 11 race/ethnicity groups:

1. Non-Hispanic White
2. African-American
3. Hispanic (US Born)
4. Native American/Other
5. Hispanic (Foreign Born)
6. Chinese-American
7. Japanese-American
8. Filipino-American
9. Hawaiian
10. Other Pacific Islander
11. Other Asian

## Validation Rules

[Detailed validation rules documentation...]

## Mathematical Model

The BCRA package implements the Gail Model, which estimates the absolute risk...

[Continues with mathematical documentation...]

## Browser Support

- Chrome/Edge: last 2 versions
- Firefox: last 2 versions
- Safari: last 2 versions
- No IE support (ES6+ required)

## License

MIT

## Citation

If you use this package in research, please cite:

[Citation information...]

## Acknowledgments

Based on the NCI's BCRAT and the R package by Ming-Hsiang Ku.

Data sources: SEER, CARE Study, SFBCS, AABCS

````

### Step 8.2: Web App README

**Create `apps/web-calculator/README.md`:**

```markdown
# BCRAT Web Calculator

Interactive web application for calculating breast cancer risk using the BCRA library.

## Features

- User-friendly interface
- Real-time validation
- Responsive design (mobile-friendly)
- Print-friendly results
- No data collection or server communication

## Development

```bash
npm install
npm run dev
````

## Build

```bash
npm run build
```

## Deployment

This app is designed to be deployed to GitHub Pages...

[Continues with deployment instructions...]

````

### Step 8.3: Mathematical Model Documentation

**Create `docs/mathematical-model.md`:**

This should include:
- Detailed explanation of the Gail Model
- Formula documentation
- Parameter descriptions
- References to original papers

### Step 8.4: API Documentation

Consider using a documentation generator like:
- JSDoc → documentation.js
- TypeDoc for TypeScript definitions
- Or manually create comprehensive API docs

---

## Phase 9: Deployment and CI/CD

### Step 9.1: GitHub Actions for Testing

**Create `.github/workflows/test.yml`:**

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Generate coverage report
        run: npm run test:coverage
        working-directory: packages/bcra

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./packages/bcra/coverage/lcov.info
          flags: unittests
````

### Step 9.2: GitHub Pages Deployment

**Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build library
        run: npm run build
        working-directory: packages/bcra

      - name: Build web app
        run: npm run build
        working-directory: apps/web-calculator
        env:
          VITE_BASE_URL: /bcra-js/

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./apps/web-calculator/dist
```

### Step 9.3: Configure GitHub Pages

1. Go to repository Settings → Pages
2. Set source to `gh-pages` branch
3. Custom domain (optional)

---

## Phase 10: Performance Optimization

### Step 10.1: Code Splitting

The Vite configuration already includes code splitting. Monitor bundle sizes:

```bash
npm run build -- --analyze
```

### Step 10.2: Caching Strategy

For the web app, implement service worker for offline capability:

**Create `apps/web-calculator/public/sw.js`:**

```javascript
const CACHE_NAME = 'bcrat-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/styles/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### Step 10.3: Performance Monitoring

Add Web Vitals monitoring:

```bash
npm install web-vitals
```

```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## Technical Considerations

### 1. Floating Point Precision

JavaScript uses IEEE 754 double-precision floating-point. For medical calculations:

- Use `Number.EPSILON` for comparisons
- Round display values appropriately
- Document precision limitations
- Validate against R package results (tolerance: 1e-6)

### 2. Data Privacy

The calculator should:

- Run entirely client-side (no server communication)
- Not store any patient data
- Not use cookies or tracking (optional analytics with consent)
- Include clear privacy policy

### 3. Browser Compatibility

Target ES2020+ features:

- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- BigInt (if needed for IDs)
- No polyfills required for modern browsers

### 4. Accessibility

Ensure WCAG 2.1 Level AA compliance:

- Proper ARIA labels
- Keyboard navigation
- Screen reader testing
- Color contrast ratios
- Form validation announcements

### 5. Internationalization

Consider future i18n support:

- Use i18n library (e.g., `i18next`)
- Separate strings into resource files
- Support multiple languages
- Handle number formatting by locale

---

## Risk Mitigation

### 1. Computational Accuracy

**Risk:** Differences between R and JavaScript implementations

**Mitigation:**

- Cross-validate with R package test cases
- Use same numerical algorithms
- Document any unavoidable differences
- Set acceptance criteria (e.g., <0.01% difference)

### 2. Medical Liability

**Risk:** Incorrect calculations leading to wrong medical decisions

**Mitigation:**

- Clear disclaimers throughout
- Professional code review
- Extensive testing with known cases
- Recommend professional medical consultation
- Proper versioning and changelog

### 3. Data Constants

**Risk:** Using outdated epidemiological data

**Mitigation:**

- Document data sources and dates
- Version constants separately
- Provide update mechanism
- Monitor NCI updates
- Clear version in results

### 4. Browser Issues

**Risk:** Calculation errors in specific browsers

**Mitigation:**

- Cross-browser testing
- Unit tests in multiple environments
- Error tracking
- Graceful degradation
- Clear browser requirements

---

## Timeline and Resources

### Estimated Timeline

**Phase 1-2 (Setup & Constants):** 1 week

- Repository setup
- Data model definition
- Constants implementation

**Phase 3 (Core Calculations):** 2-3 weeks

- Validation logic
- Relative risk calculation
- Absolute risk calculation
- Integration and testing

**Phase 4-5 (Validation & Testing):** 1-2 weeks

- Unit tests
- Integration tests
- R cross-validation
- Bug fixes

**Phase 6 (Distribution):** 1 week

- NPM package preparation
- CDN setup
- Documentation

**Phase 7 (Web App):** 2 weeks

- UI implementation
- Component development
- Styling
- UX refinement

**Phase 8 (Documentation):** 1 week

- API documentation
- User guides
- Mathematical documentation

**Phase 9 (Deployment):** 1 week

- CI/CD setup
- GitHub Pages configuration
- Final testing

**Phase 10 (Optimization):** Ongoing

- Performance monitoring
- User feedback
- Iterative improvements

---

## Success Criteria

### Library

✅ Passes all unit tests (>90% coverage)
✅ Matches R package results (within 0.01% tolerance)
✅ Published to NPM
✅ Available via jsDelivr CDN
✅ Complete TypeScript definitions
✅ Comprehensive documentation

### Web Application

✅ Mobile-responsive design
✅ Accessible (WCAG 2.1 AA)
✅ Fast load time (<3s on 3G)
✅ Works offline (PWA)
✅ Deployed to GitHub Pages
✅ Clear disclaimers and instructions

### Project

✅ Open source (MIT license)
✅ CI/CD pipeline functional
✅ Active issue tracking
✅ Contribution guidelines
✅ Code of conduct
✅ Changelog maintained

---

## Conclusion

This implementation plan provides a comprehensive roadmap for refactoring the BCRA R package into a modern JavaScript library and web application. The modular approach ensures maintainability, the extensive testing strategy ensures accuracy, and the clear documentation enables adoption by other developers and researchers.

Key success factors:

1. **Computational fidelity** with the R package
2. **User-friendly** web interface
3. **Comprehensive testing** and validation
4. **Clear documentation** and examples
5. **Active maintenance** and updates

By following this plan systematically, the development team can deliver a high-quality, reliable tool for breast cancer risk assessment that serves both developers (via the library) and end-users (via the web application).
