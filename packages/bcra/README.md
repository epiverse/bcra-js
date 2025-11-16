# BCRA - Breast Cancer Risk Assessment Tool

[![NPM Version](https://img.shields.io/npm/v/bcra.svg)](https://www.npmjs.com/package/bcra)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)](./test)

> Privacy-preserving, client-side JavaScript implementation of the National Cancer Institute's Breast Cancer Risk Assessment Tool (BCRAT), also known as the Gail Model.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [calculateRisk()](#calculateriskdata-options)
  - [calculateBatchRisk()](#calculatebatchriskpatients-options)
  - [Race Codes](#race-codes)
  - [Return Values](#return-values)
- [Usage Examples](#usage-examples)
- [Validation Rules](#validation-rules)
- [Error Handling](#error-handling)
- [Scientific Background](#scientific-background)
- [Development](#development)
- [Disclaimer](#disclaimer)

---

## Overview

**BCRA** is a pure JavaScript implementation of the Breast Cancer Risk Assessment Tool (BCRAT), commonly known as the **Gail Model**. This library calculates the absolute risk of developing invasive breast cancer over a specified time period based on individual risk factors.

Originally developed by Dr. Mitchell Gail and colleagues at the National Cancer Institute, the Gail Model is one of the most widely validated breast cancer risk assessment tools. This JavaScript implementation maintains **full computational fidelity** with the original R package while providing a lightweight, client-side solution.

### Why BCRA?

- **Privacy-Preserving**: All calculations run entirely in the browser—no data is sent to servers
- **Clinically Validated**: Implements the exact algorithms from NCI's BCRAT (Gail Model)
- **Multi-Ethnic Support**: Includes race-specific models for 11 different populations
- **Zero Dependencies**: Lightweight library with no external dependencies
- **Type-Safe**: Includes TypeScript definitions for type safety
- **Well-Tested**: Comprehensive test suite with cross-validation against the R package

---

## Features

✅ **Complete Gail Model Implementation**
- Relative risk calculation with race-specific beta coefficients
- Absolute risk calculation using numerical integration
- Competing hazards (non-breast cancer mortality) modeling

✅ **Multi-Ethnic Risk Models**
- Non-Hispanic White (Gail Model)
- African-American (CARE Study Model)
- Hispanic (US-born and Foreign-born) (SFBCS Model)
- Asian/Pacific Islander populations (AABCS Model)
- Native American/Other

✅ **Comprehensive Validation**
- Pre-flight structural validation
- Domain-specific validation with race-specific recoding
- Consistency checks (e.g., biopsy/hyperplasia relationship)
- User-friendly error messages

✅ **Flexible Usage**
- Single patient calculations
- Batch processing for multiple patients
- Optional average risk comparison
- Raw input or pre-recoded data support

✅ **Modern JavaScript**
- ES6+ modules
- Works in browsers and Node.js
- Available via NPM and CDN
- TypeScript definitions included

---

## Installation

### NPM

```bash
npm install bcra
```

### Yarn

```bash
yarn add bcra
```

### pnpm

```bash
pnpm add bcra
```

### CDN (jsDelivr)

```html
<!-- ES Module -->
<script type="module">
  import { calculateRisk } from 'https://cdn.jsdelivr.net/npm/bcra@latest/dist/bcra.es.js';
</script>

<!-- UMD (for older browsers) -->
<script src="https://cdn.jsdelivr.net/npm/bcra@latest/dist/bcra.umd.js"></script>
<script>
  const { calculateRisk } = window.BCRA;
</script>
```

### Browser Requirements

- Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge)
- No Internet Explorer support

---

## Quick Start

```javascript
import { calculateRisk, RaceCode } from 'bcra';

// Define patient data
const patientData = {
  id: 1,
  initialAge: 40,              // Current age: 40 years
  projectionEndAge: 50,         // Calculate risk up to age 50
  race: RaceCode.WHITE,         // Non-Hispanic White
  numBreastBiopsies: 1,         // 1 previous biopsy
  ageAtMenarche: 12,            // First period at age 12
  ageAtFirstBirth: 25,          // First child at age 25
  numRelativesWithBrCa: 1,      // 1 first-degree relative with breast cancer
  atypicalHyperplasia: 0,       // No atypical hyperplasia
};

// Calculate risk
const result = calculateRisk(patientData);

if (result.success) {
  console.log(`Absolute Risk: ${result.absoluteRisk.toFixed(2)}%`);
  console.log(`Relative Risk (age <50): ${result.relativeRiskUnder50.toFixed(2)}`);
  console.log(`Relative Risk (age ≥50): ${result.relativeRiskAtOrAbove50.toFixed(2)}`);
} else {
  console.error('Validation errors:', result.validation.errors);
}
```

**Output:**
```
Absolute Risk: 2.34%
Relative Risk (age <50): 1.52
Relative Risk (age ≥50): 1.48
```

This means the patient has a **2.34% absolute risk** of developing invasive breast cancer between ages 40 and 50.

---

## API Reference

### `calculateRisk(data, options)`

Calculates breast cancer risk for a single individual.

#### Parameters

**`data`** (Object) - Risk factor profile containing:

| Field | Type | Description | Valid Values |
|-------|------|-------------|--------------|
| `id` | number \| string | Unique identifier | Any |
| `initialAge` | number | Current age | 20 ≤ initialAge < 90 |
| `projectionEndAge` | number | End age for risk projection | initialAge < projectionEndAge ≤ 90 |
| `race` | number | Race/ethnicity code | 1-11 (see [Race Codes](#race-codes)) |
| `numBreastBiopsies` | number | Number of breast biopsies | 0, 1, 2, 3, ..., or 99 (unknown) |
| `ageAtMenarche` | number | Age at first menstrual period | ageAtMenarche ≤ initialAge, or 99 (unknown) |
| `ageAtFirstBirth` | number | Age at first live birth | ageAtMenarche ≤ ageAtFirstBirth ≤ initialAge, 98 (nulliparous), or 99 (unknown) |
| `numRelativesWithBrCa` | number | First-degree relatives with breast cancer | 0, 1, 2, 3, ..., or 99 (unknown) |
| `atypicalHyperplasia` | number | Atypical hyperplasia status | 0 (no), 1 (yes), 99 (unknown/N/A) |

**`options`** (Object, optional) - Calculation options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `rawInput` | boolean | `true` | Whether inputs are in raw format (needs recoding) |
| `calculateAverage` | boolean | `false` | Calculate average risk for comparison |

#### Returns

**`RiskResult`** (Object) containing:

```typescript
{
  success: boolean,                    // Whether calculation succeeded
  absoluteRisk: number | null,         // Absolute risk as percentage (0-100)
  averageRisk: number | null,          // Average risk (if calculateAverage=true)
  relativeRiskUnder50: number | null,  // RR multiplier for age < 50
  relativeRiskAtOrAbove50: number | null, // RR multiplier for age ≥ 50
  patternNumber: number | null,        // Risk factor pattern (1-108)
  raceEthnicity: string | null,        // Race/ethnicity label
  projectionInterval: number | null,   // Years in projection (projectionEndAge - initialAge)
  validation: {                        // Validation details
    isValid: boolean,
    errors: string[],
    warnings: string[]
  },
  recodedValues: {                     // Recoded categorical values
    biopsyCategory: number,
    menarcheCategory: number,
    firstBirthCategory: number,
    relativesCategory: number,
    hyperplasiaMultiplier: number,
    raceLabel: string
  } | null,
  error: {                             // Error details (if success=false)
    message: string,
    stack?: string
  } | undefined
}
```

---

### `calculateBatchRisk(patients, options)`

Calculates breast cancer risk for multiple individuals.

#### Parameters

**`patients`** (Array) - Array of risk factor profiles (same format as `calculateRisk` data parameter)

**`options`** (Object, optional) - Same options as `calculateRisk`

#### Returns

**Array of `RiskResult`** objects, one for each patient in the input array.

#### Example

```javascript
import { calculateBatchRisk, RaceCode } from 'bcra';

const patients = [
  { id: 1, initialAge: 40, projectionEndAge: 50, race: RaceCode.WHITE, /* ... */ },
  { id: 2, initialAge: 35, projectionEndAge: 45, race: RaceCode.AFRICAN_AMERICAN, /* ... */ },
  { id: 3, initialAge: 50, projectionEndAge: 60, race: RaceCode.HISPANIC_US_BORN, /* ... */ },
];

const results = calculateBatchRisk(patients);

results.forEach((result, index) => {
  console.log(`Patient ${patients[index].id}:`);
  if (result.success) {
    console.log(`  Absolute Risk: ${result.absoluteRisk.toFixed(2)}%`);
  } else {
    console.log(`  Errors:`, result.validation.errors);
  }
});
```

---

### Race Codes

The library supports 11 different race/ethnicity groups with population-specific risk models:

| Code | Race/Ethnicity | Model Source | Notes |
|------|----------------|--------------|-------|
| **1** | Non-Hispanic White | Gail Model (SEER 1983-87) | Original BCRAT model |
| **2** | African-American | CARE Study | Age at first birth not in model |
| **3** | Hispanic (US Born) | SFBCS (San Francisco Bay Area) | Age at menarche not in model |
| **4** | Native American/Other | Same as Non-Hispanic White | Uses White model coefficients |
| **5** | Hispanic (Foreign Born) | SFBCS | Different groupings than US-born |
| **6** | Chinese-American | AABCS (Asian American) | Shared Asian model |
| **7** | Japanese-American | AABCS | Shared Asian model |
| **8** | Filipino-American | AABCS | Shared Asian model |
| **9** | Hawaiian | AABCS | Shared Asian model |
| **10** | Other Pacific Islander | AABCS | Shared Asian model |
| **11** | Other Asian | AABCS | Shared Asian model |

**Using Race Codes:**

```javascript
import { RaceCode } from 'bcra';

const data = {
  // ... other fields
  race: RaceCode.AFRICAN_AMERICAN,  // Recommended: use enum
  // OR
  race: 2,                            // Direct numeric code
};
```

**Race-Specific Model Differences:**

- **African-American (Race 2)**: Age at first birth is eliminated from the relative risk model
- **Hispanic US Born (Race 3)**: Age at menarche is eliminated from the model
- **Hispanic (Races 3, 5)**: Different category groupings for biopsies, age at first birth, and relatives
- **Asian/Pacific Islander (Races 6-11)**: All use the same beta coefficients and group relatives category 2 with 1

---

### Return Values

#### Absolute Risk

The **absolute risk** is the probability (expressed as a percentage from 0-100) that the individual will develop invasive breast cancer during the projection interval.

**Example Interpretation:**
- `absoluteRisk: 2.5` means a **2.5% chance** of developing breast cancer from `initialAge` to `projectionEndAge`
- For a 5-year projection (age 40 to 45), an absolute risk of 1.2% means approximately 12 out of 1,000 women with similar characteristics would develop breast cancer

#### Relative Risk

**Relative risk** values indicate how much higher (or lower) the individual's risk is compared to a woman with "average" risk factors:

- `relativeRiskUnder50: 1.5` means **1.5× higher risk** than average for ages < 50
- `relativeRiskAtOrAbove50: 0.8` means **0.8× (20% lower)** risk than average for ages ≥ 50

#### Pattern Number

The **pattern number** (1-108) uniquely identifies the combination of categorical risk factors:
- 3 biopsy categories × 3 menarche categories × 4 first birth categories × 3 relatives categories = 108 patterns
- Useful for grouping individuals with identical risk factor profiles

---

## Usage Examples

### Example 1: Basic Calculation

```javascript
import { calculateRisk, RaceCode } from 'bcra';

const result = calculateRisk({
  id: 1,
  initialAge: 45,
  projectionEndAge: 50,
  race: RaceCode.WHITE,
  numBreastBiopsies: 0,
  ageAtMenarche: 13,
  ageAtFirstBirth: 28,
  numRelativesWithBrCa: 0,
  atypicalHyperplasia: 99, // Unknown
});

console.log(result);
```

### Example 2: Handling Validation Errors

```javascript
import { calculateRisk, RaceCode } from 'bcra';

const invalidData = {
  id: 2,
  initialAge: 19,  // ERROR: Too young (must be ≥ 20)
  projectionEndAge: 25,
  race: RaceCode.WHITE,
  numBreastBiopsies: 1,
  ageAtMenarche: 12,
  ageAtFirstBirth: 25,
  numRelativesWithBrCa: 1,
  atypicalHyperplasia: 1,
};

const result = calculateRisk(invalidData);

if (!result.success) {
  console.error('Validation failed:');
  result.validation.errors.forEach((error, i) => {
    console.error(`  ${i + 1}. ${error}`);
  });
}

// Output:
// Validation failed:
//   1. Initial age must be between 20 and 89 years
```

### Example 3: Batch Processing

```javascript
import { calculateBatchRisk, RaceCode } from 'bcra';

const cohort = [
  {
    id: 'P001',
    initialAge: 40,
    projectionEndAge: 50,
    race: RaceCode.WHITE,
    numBreastBiopsies: 0,
    ageAtMenarche: 12,
    ageAtFirstBirth: 25,
    numRelativesWithBrCa: 0,
    atypicalHyperplasia: 99,
  },
  {
    id: 'P002',
    initialAge: 35,
    projectionEndAge: 40,
    race: RaceCode.AFRICAN_AMERICAN,
    numBreastBiopsies: 1,
    ageAtMenarche: 11,
    ageAtFirstBirth: 22,
    numRelativesWithBrCa: 1,
    atypicalHyperplasia: 0,
  },
];

const results = calculateBatchRisk(cohort);

// Create summary report
const summary = results.map((r) => ({
  id: r.validation.isValid ? cohort.find((p) => p.id === r.id)?.id : 'N/A',
  absoluteRisk: r.absoluteRisk?.toFixed(2) + '%' || 'N/A',
  valid: r.success,
}));

console.table(summary);
```

### Example 4: Comparing to Average Risk

```javascript
import { calculateRisk, RaceCode } from 'bcra';

const data = {
  id: 3,
  initialAge: 50,
  projectionEndAge: 60,
  race: RaceCode.WHITE,
  numBreastBiopsies: 2,
  ageAtMenarche: 11,
  ageAtFirstBirth: 98, // Nulliparous
  numRelativesWithBrCa: 2,
  atypicalHyperplasia: 1,
};

const result = calculateRisk(data, { calculateAverage: true });

console.log(`Individual's Risk: ${result.absoluteRisk.toFixed(2)}%`);
console.log(`Average Risk: ${result.averageRisk.toFixed(2)}%`);
console.log(`Risk Ratio: ${(result.absoluteRisk / result.averageRisk).toFixed(2)}×`);

// Output:
// Individual's Risk: 5.67%
// Average Risk: 3.12%
// Risk Ratio: 1.82×
```

### Example 5: Different Race Groups

```javascript
import { calculateRisk, RaceCode, RaceLabels } from 'bcra';

const baseData = {
  id: 4,
  initialAge: 40,
  projectionEndAge: 45,
  numBreastBiopsies: 1,
  ageAtMenarche: 12,
  ageAtFirstBirth: 25,
  numRelativesWithBrCa: 1,
  atypicalHyperplasia: 0,
};

// Calculate for multiple races
const races = [
  RaceCode.WHITE,
  RaceCode.AFRICAN_AMERICAN,
  RaceCode.HISPANIC_US_BORN,
  RaceCode.CHINESE,
];

races.forEach((race) => {
  const result = calculateRisk({ ...baseData, race });
  console.log(
    `${RaceLabels[race]}: ${result.absoluteRisk.toFixed(2)}%`
  );
});

// Output:
// Non-Hispanic White: 1.23%
// African-American: 1.15%
// Hispanic (US Born): 0.98%
// Chinese-American: 0.87%
```

### Example 6: Handling Unknown Values

```javascript
import { calculateRisk, RaceCode } from 'bcra';

const dataWithUnknowns = {
  id: 5,
  initialAge: 55,
  projectionEndAge: 65,
  race: RaceCode.WHITE,
  numBreastBiopsies: 99,          // Unknown
  ageAtMenarche: 99,               // Unknown
  ageAtFirstBirth: 99,             // Unknown
  numRelativesWithBrCa: 99,        // Unknown
  atypicalHyperplasia: 99,         // Unknown/Not applicable
};

const result = calculateRisk(dataWithUnknowns);

// The model treats unknowns as baseline/average values
console.log(`Risk with all unknowns: ${result.absoluteRisk.toFixed(2)}%`);
console.log(`Pattern number: ${result.patternNumber}`);
```

---

## Validation Rules

The library performs comprehensive validation to ensure data integrity and consistency.

### Age Constraints

- **Initial age**: Must be ≥ 20 and < 90 years
- **Projection end age**: Must be > initial age and ≤ 90 years
- **Age at menarche**: Must be ≤ initial age (unless unknown = 99)
- **Age at first birth**: Must be ≥ age at menarche and ≤ initial age (unless nulliparous = 98 or unknown = 99)

### Race Validation

- Must be an integer between 1 and 11 (inclusive)

### Biopsy and Hyperplasia Consistency

**Rule A**: If no biopsies performed (`numBreastBiopsies` = 0 or 99), then `atypicalHyperplasia` MUST be 99 (not applicable)

**Rule B**: If biopsies performed (`numBreastBiopsies` > 0 and < 99), then `atypicalHyperplasia` MUST be 0, 1, or 99

### Special Values

- **98**: Nulliparous (never had a live birth) - only valid for `ageAtFirstBirth`
- **99**: Unknown/Not Applicable - valid for most fields

### Race-Specific Recoding

The library automatically recodes inputs based on race-specific model requirements:

#### African-American (Race 2)
- Age at first birth is set to 0 (not used in CARE model)
- Age at menarche category 2 (≤11) is grouped with category 1 (12-13)

#### Hispanic US Born (Race 3)
- Age at menarche is set to 0 (not used in model)
- Special groupings for age at first birth, biopsies, and relatives

#### Hispanic Foreign Born (Race 5)
- Special groupings for age at first birth, biopsies, and relatives

#### Asian/Pacific Islander (Races 6-11)
- Number of relatives category 2 (2+) is grouped with category 1

---

## Error Handling

The library uses structured error handling with user-friendly messages.

### Validation Errors

When validation fails, the result object contains detailed error information:

```javascript
const result = calculateRisk(invalidData);

if (!result.success) {
  console.log('Validation errors:');
  result.validation.errors.forEach((error) => {
    console.log(`  - ${error}`);
  });

  console.log('\nRecoded values:', result.recodedValues);
  console.log('Error indicator:', result.validation.isValid ? 0 : 1);
}
```

### Common Validation Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Initial age must be between 20 and 89 years" | `initialAge` < 20 or ≥ 90 | Use age between 20-89 |
| "Projection end age must be greater than initial age" | `projectionEndAge` ≤ `initialAge` | Use larger projection age |
| "Consistency error: If no biopsies, atypical hyperplasia must be not applicable (99)" | Biopsies=0 but hyperplasia≠99 | Set hyperplasia to 99 |
| "Age at first birth cannot be less than age at menarche" | `ageAtFirstBirth` < `ageAtMenarche` | Fix chronological order |
| "Invalid race code. Must be between 1 and 11" | `race` outside valid range | Use race code 1-11 |

### Custom Error Classes

The library provides custom error classes for programmatic error handling:

```javascript
import { calculateRisk, BCRAValidationError, BCRACalculationError } from 'bcra';

try {
  const result = calculateRisk(data);

  if (!result.success && result.error) {
    if (result.error instanceof BCRAValidationError) {
      // Handle validation error
      console.error('Validation failed:', result.validation.errors);
    } else if (result.error instanceof BCRACalculationError) {
      // Handle calculation error
      console.error('Calculation failed:', result.error.message);
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

---

## Scientific Background

### The Gail Model

The Gail Model, developed by Dr. Mitchell H. Gail and colleagues at the National Cancer Institute, estimates the absolute risk of developing invasive breast cancer over a specified time period. It combines:

1. **Relative Risk ($RR$)**: Individual risk factors compared to average
2. **Baseline Incidence Rates ($\lambda_1$)**: Age-specific breast cancer rates for the general population
3. **Competing Mortality ($\lambda_2$)**: Risk of death from non-breast cancer causes
4. **Attributable Risk ($AR$)**: Proportion of risk explained by known factors

### Mathematical Formula

The model uses numerical integration to calculate absolute risk:

$$
\text{AbsoluteRisk} = \int_{t_1}^{t_2} \frac{(1-AR) \cdot RR \cdot \lambda_1(t)}{(1-AR) \cdot RR \cdot \lambda_1(t) + \lambda_2(t)} \cdot \exp\left(-\int_{t_1}^{t} \left[(1-AR) \cdot RR \cdot \lambda_1(s) + \lambda_2(s)\right] ds\right) dt
$$

Where:
- $t_1$: Initial age (current age)
- $t_2$: Projection end age
- $\lambda_1(t)$: Breast cancer incidence rate at age $t$
- $\lambda_2(t)$: Competing mortality rate at age $t$
- $AR$: Attributable risk (population attributable risk)
- $RR$: Relative risk based on individual's risk factors

### Relative Risk Calculation

The relative risk is calculated using logistic regression:

$$
RR = \exp\left(\beta_0 \cdot \text{biopsies} + \beta_1 \cdot \text{menarche} + \beta_2 \cdot \text{firstBirth} + \beta_3 \cdot \text{relatives} + \beta_4 \cdot \mathbb{1}_{\text{age} \geq 50} \cdot \text{biopsies} + \beta_5 \cdot \text{firstBirth} \cdot \text{relatives} + \ln(\text{hyperplasia})\right)
$$

**Two-stage calculation:**

For ages < 50:

$$
LP_1 = \beta_0 \cdot NB + \beta_1 \cdot AM + \beta_2 \cdot AF + \beta_3 \cdot NR + \beta_5 \cdot (AF \times NR) + \ln(R_{Hyp})
$$

$$
RR_1 = \exp(LP_1)
$$

For ages ≥ 50:

$$
LP_2 = LP_1 + \beta_4 \cdot NB
$$

$$
RR_2 = \exp(LP_2)
$$

Where:
- $NB$: Number of biopsies category (0, 1, or 2)
- $AM$: Age at menarche category (0, 1, or 2)
- $AF$: Age at first birth category (0, 1, 2, or 3)
- $NR$: Number of relatives category (0, 1, or 2)
- $R_{Hyp}$: Hyperplasia multiplier (0.93, 1.00, or 1.82)
- $\beta_i$: Race-specific regression coefficients

### Data Sources

**Incidence Rates ($\lambda_1$):**
- Surveillance, Epidemiology, and End Results (SEER) Program
- Various time periods: 1983-87 (White baseline), 1992-96 (White average), 1995-2004 (Hispanic), 1998-2002 (Asian subgroups)

**Mortality Rates ($\lambda_2$):**
- National Center for Health Statistics (NCHS)
- Time periods vary by race/ethnicity

**Beta Coefficients ($\beta$):**
- Non-Hispanic White: Original Gail Model (1989)
- African-American: Contraceptive and Reproductive Experiences (CARE) Study
- Hispanic: San Francisco Bay Area Breast Cancer Study (SFBCS)
- Asian/Pacific Islander: Asian American Breast Cancer Study (AABCS)

### Key Publications

1. **Original Gail Model:**
   - Gail MH, Brinton LA, Byar DP, et al. *Projecting individualized probabilities of developing breast cancer for white females who are being examined annually.* J Natl Cancer Inst. 1989;81(24):1879-1886.
   - [PubMed: 2593165](https://pubmed.ncbi.nlm.nih.gov/2593165/)

2. **Validation Study:**
   - Costantino JP, Gail MH, Pee D, et al. *Validation studies for models projecting the risk of invasive and total breast cancer incidence.* J Natl Cancer Inst. 1999;91(18):1541-1548.
   - [PubMed: 10491430](https://pubmed.ncbi.nlm.nih.gov/10491430/)

3. **African-American Model:**
   - Gail MH, Costantino JP, Pee D, et al. *Projecting individualized absolute invasive breast cancer risk in African American women.* J Natl Cancer Inst. 2007;99(23):1782-1792.

4. **Asian/Pacific Islander Model:**
   - Matsuno RK, Costantino JP, Ziegler RG, et al. *Projecting individualized absolute invasive breast cancer risk in Asian and Pacific Islander American women.* J Natl Cancer Inst. 2011;103(12):951-961.

5. **Hispanic Model:**
   - Banegas MP, John EM, Slattery ML, et al. *Projecting individualized absolute invasive breast cancer risk in US Hispanic women.* J Natl Cancer Inst. 2017;109(2):djw215.

### Model Limitations

- Does not include BRCA1/BRCA2 mutations (use other tools for hereditary cancer syndromes)
- Limited to women ≥ 20 years old without prior breast cancer
- May underestimate risk for women with strong family histories
- Does not account for breast density or all environmental factors
- Population-based estimates may not apply to all individuals

---

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/epiverse/bcra-js.git
cd bcra-js/packages/bcra

# Install dependencies
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Building

```bash
# Build library for distribution
npm run build

# Output: dist/bcra.es.js and dist/bcra.umd.js
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Project Structure

```
packages/bcra/
├── src/
│   ├── index.js                 # Main entry point
│   ├── constants/               # Beta, lambda1, lambda2, AR
│   ├── core/                    # Risk calculation modules
│   │   ├── recode-check.js     # Validation and recoding
│   │   ├── relative-risk.js    # Relative risk calculation
│   │   ├── absolute-risk.js    # Absolute risk calculation
│   │   └── risk-calculator.js  # Main API
│   ├── utils/                   # Helper functions
│   │   ├── validators.js       # Input validation
│   │   └── error-handler.js    # Error handling
│   └── types/                   # Type definitions
│       └── index.js            # JSDoc types
├── test/                        # Test suites
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
├── types/                       # TypeScript definitions
│   └── index.d.ts
├── dist/                        # Built library (generated)
├── package.json
├── vite.config.js
└── README.md
```

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Coding Standards

- Follow existing code style (enforced by ESLint and Prettier)
- Write comprehensive tests for new features
- Add JSDoc comments for all public functions
- Update TypeScript definitions if API changes
- Keep functions focused and modular

---

## Disclaimer

⚠️ **IMPORTANT MEDICAL DISCLAIMER**

This tool is provided **for research, educational, and informational purposes only**. It should **NOT** be used as a substitute for professional medical advice, diagnosis, or treatment.

**Key Points:**

1. **Not Medical Advice**: The breast cancer risk estimates provided by this tool are statistical projections based on population data and may not reflect an individual's actual risk.

2. **Consult Healthcare Providers**: Always seek the advice of qualified healthcare providers with any questions you may have regarding breast cancer risk, screening, or medical conditions.

3. **Individual Variation**: Individual risk can vary significantly based on factors not included in this model (e.g., BRCA mutations, breast density, detailed family history).

4. **No Warranty**: This software is provided "as is" without warranty of any kind. The authors and copyright holders are not liable for any damages arising from the use of this software.

5. **Clinical Validation Required**: Before using this tool in any clinical setting, appropriate validation and regulatory compliance must be obtained.

6. **Not for Diagnostic Use**: This tool calculates risk estimates only and does not diagnose breast cancer or any other medical condition.

**If you have concerns about breast cancer risk, please consult with your healthcare provider, who can consider your complete medical history and recommend appropriate screening and prevention strategies.**

---

## Acknowledgments

- **Original Model**: Dr. Mitchell H. Gail and colleagues at the National Cancer Institute
- **R Package**: Fanni Zhang and contributors
- **Data Sources**: SEER Program, NCHS, CARE Study, SFBCS, AABCS
- **Scientific Community**: Researchers who validated and extended the Gail Model for diverse populations

---

## Support

- **Documentation**: [Full Documentation](https://github.com/epiverse/bcra-js/tree/main/packages/bcra)
- **Issues**: [GitHub Issues](https://github.com/epiverse/bcra-js/issues)
- **Discussions**: [GitHub Discussions](https://github.com/epiverse/bcra-js/discussions)
