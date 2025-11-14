# Field Name Mapping: R Package → JavaScript Library

This document provides a comprehensive mapping between the R package field names and the JavaScript library field names for the BCRA (Breast Cancer Risk Assessment Tool).

## Purpose

When porting R code to JavaScript or comparing calculations between the two implementations, use this guide to translate field names correctly. The JavaScript library uses more descriptive, semantically clear field names while maintaining full compatibility with the R package logic.

## Primary Data Fields

| R Package Field | JavaScript Field | Type | Description | Valid Values |
|----------------|------------------|------|-------------|--------------|
| `ID` | `id` | number | Individual's unique identifier | Positive integers: 1, 2, 3, ... |
| `T1` | `initialAge` | number | Current/initial age at assessment | Real number in [20, 90) |
| `T2` | `projectionEndAge` | number | Future age for risk projection | Real number in (20, 90], T2 > T1 |
| `Race` | `race` | number | Race/ethnicity code | Integer in [1, 11] |
| `N_Biop` | `numBreastBiopsies` | number | Number of breast biopsies | 0, 1, 2, ..., or 99 (unknown) |
| `HypPlas` | `atypicalHyperplasia` | number | Atypical hyperplasia indicator | 0 (no), 1 (yes), 99 (unknown/N/A) |
| `AgeMen` | `ageAtMenarche` | number | Age at first menstrual period | Number ≤ T1, or 99 (unknown) |
| `Age1st` | `ageAtFirstBirth` | number | Age at first live birth | Number where AgeMen ≤ Age1st ≤ T1, 98 (nulliparous), or 99 (unknown) |
| `N_Rels` | `numRelativesWithBrCa` | number | Number of first-degree relatives with breast cancer | 0, 1, 2, ..., or 99 (unknown) |

## Recoded/Categorical Fields

After validation, raw values are transformed into categorical variables. The R package uses these abbreviations in `recode.check.R`:

| R Package Variable | JavaScript Field | Type | Description | Valid Values |
|-------------------|------------------|------|-------------|--------------|
| `NB_Cat` | `biopsyCategory` | number | Recoded biopsy count | 0, 1, or 2 |
| `AM_Cat` | `menarcheCategory` | number | Recoded age at menarche | 0, 1, or 2 |
| `AF_Cat` | `firstBirthCategory` | number | Recoded age at first birth | 0, 1, 2, or 3 |
| `NR_Cat` | `relativesCategory` | number | Recoded relative count | 0, 1, or 2 |
| `R_Hyp` | `hyperplasiaMultiplier` | number | Hyperplasia risk multiplier | 0.93, 1.00, or 1.82 |
| `CharRace` | `raceLabel` | string | Race/ethnicity label | See RaceLabels mapping |

## Race Code Mapping

| R Code | R Abbr | JavaScript Constant | JavaScript Label |
|--------|--------|---------------------|------------------|
| 1 | `Wh` | `RaceCode.WHITE` | `'Non-Hispanic White'` |
| 2 | `AA` | `RaceCode.AFRICAN_AMERICAN` | `'African-American'` |
| 3 | `HU` | `RaceCode.HISPANIC_US_BORN` | `'Hispanic (US Born)'` |
| 4 | `NA` | `RaceCode.NATIVE_AMERICAN_OTHER` | `'Native American/Other'` |
| 5 | `HF` | `RaceCode.HISPANIC_FOREIGN_BORN` | `'Hispanic (Foreign Born)'` |
| 6 | `Ch` | `RaceCode.CHINESE` | `'Chinese-American'` |
| 7 | `Ja` | `RaceCode.JAPANESE` | `'Japanese-American'` |
| 8 | `Fi` | `RaceCode.FILIPINO` | `'Filipino-American'` |
| 9 | `Hw` | `RaceCode.HAWAIIAN` | `'Hawaiian'` |
| 10 | `oP` | `RaceCode.OTHER_PACIFIC_ISLANDER` | `'Other Pacific Islander'` |
| 11 | `oA` | `RaceCode.OTHER_ASIAN` | `'Other Asian'` |

## Special Values

| R Package | JavaScript Constant | Numeric Value | Meaning |
|-----------|---------------------|---------------|---------|
| 98 (Age1st only) | `SpecialValues.NULLIPAROUS` | 98 | No live births |
| 99 | `SpecialValues.UNKNOWN` | 99 | Unknown/missing value |
| 99 (HypPlas) | `SpecialValues.NOT_APPLICABLE` | 99 | Not applicable (no biopsies) |

## Function Parameter Mapping

### R: `absolute.risk(data, Raw_Ind=1, Avg_White=0)`
**JavaScript:** `calculateRisk(data, options = {})`

| R Parameter | JavaScript Parameter       | Default | Description |
|-------------|----------------------------|---------|-------------|
| `data` | `data`                     | Required | Input data object/data frame |
| `Raw_Ind` | `options.rawInput`         | `true` | Whether input is in raw format (1=true, 0=false) |
| `Avg_White` | `options.calculateAverage` | `false` | Calculate average risk (1=true, 0=false) |

### R: `recode.check(data, Raw_Ind=1)`
**JavaScript:** `recodeAndValidate(data, rawInput = true)`

| R Parameter | JavaScript Parameter | Default | Description |
|-------------|---------------------|---------|-------------|
| `data` | `data` | Required | Input data object |
| `Raw_Ind` | `rawInput` | `true` | Whether to perform recoding (1=true, 0=false) |

## Code Translation Examples

### Example 1: Accessing Data Fields

**R Code:**
```r
age_start <- data$T1
age_end <- data$T2
num_biopsies <- data$N_Biop
```

**JavaScript Code:**
```javascript
const ageStart = data.initialAge;
const ageEnd = data.projectionEndAge;
const numBiopsies = data.numBreastBiopsies;
```

### Example 2: Age Validation

**R Code:**
```r
set_T1_missing[which((data$T1 < 20 | data$T1 >= 90) | data$T1 >= data$T2)] <- NA
```

**JavaScript Code:**
```javascript
if (data.initialAge < 20 || data.initialAge >= 90 || data.initialAge >= data.projectionEndAge) {
  errors.push('Invalid age range');
}
```

### Example 3: Race-Specific Logic

**R Code:**
```r
# For African-Americans, set Age1st to 0
AF_Cat[which(data$Race == 2)] <- 0
```

**JavaScript Code:**
```javascript
// For African-Americans, set firstBirthCategory to 0
if (data.race === RaceCode.AFRICAN_AMERICAN) {
  firstBirthCategory = 0;
}
```

### Example 4: Special Value Handling

**R Code:**
```r
# Nulliparous or unknown
if (data$Age1st == 98 | data$Age1st == 99) {
  # Handle special case
}
```

**JavaScript Code:**
```javascript
// Nulliparous or unknown
if (data.ageAtFirstBirth === SpecialValues.NULLIPAROUS ||
    data.ageAtFirstBirth === SpecialValues.UNKNOWN) {
  // Handle special case
}
```

## Important Differences

### 1. Naming Convention
- **R:** Uses abbreviated names (T1, N_Biop, HypPlas)
- **JavaScript:** Uses descriptive camelCase names (initialAge, numBreastBiopsies, atypicalHyperplasia)

### 2. Data Structure Access
- **R:** Uses `$` operator: `data$T1`
- **JavaScript:** Uses dot notation: `data.initialAge`

### 3. Boolean Parameters
- **R:** Uses numeric (0/1) for boolean flags
- **JavaScript:** Uses true JavaScript booleans (true/false)

### 4. Array Indexing
- **R:** 1-based indexing
- **JavaScript:** 0-based indexing

### 5. Missing Values
- **R:** Uses `NA` for missing/invalid
- **JavaScript:** Uses `null` for missing, numeric codes (98, 99) per R package convention

## Validation Rules

Both implementations enforce the same validation rules:

1. **Age constraints:**
   - `20 ≤ initialAge < 90`
   - `20 < projectionEndAge ≤ 90`
   - `initialAge < projectionEndAge`

2. **Race constraints:**
   - `1 ≤ race ≤ 11`

3. **Consistency requirements:**
   - If `numBreastBiopsies = 0` or `99`, then `atypicalHyperplasia = 99`
   - If `numBreastBiopsies > 0` and `< 99`, then `atypicalHyperplasia ∈ {0, 1, 99}`
   - `ageAtMenarche ≤ initialAge`
   - `ageAtMenarche ≤ ageAtFirstBirth ≤ initialAge` (when both are known)

## Quick Reference Guide

When porting R code to JavaScript:

1. ✅ Replace `data$FieldName` with `data.fieldName`
2. ✅ Use the mapping table above for all field names
3. ✅ Convert numeric booleans (0/1) to true booleans (true/false)
4. ✅ Use `RaceCode` constants instead of numeric literals
5. ✅ Use `SpecialValues` constants for 98 and 99
6. ✅ Remember: JavaScript uses 0-based array indexing
7. ✅ Use `null` for missing recoded values instead of R's `NA`

## Testing Equivalence

To verify JavaScript implementation matches R calculations:

```javascript
// Load same test data in both environments
// Compare results field by field:
// - Absolute risk should match to 4+ decimal places
// - Relative risks should match to 4+ decimal places
// - Recoded categories should be identical
```

## References

- R Package: `BCRA-R/R/recode.check.R` - Primary validation and recoding logic
- R Package: `BCRA-R/R/absolute.risk.R` - Risk calculation
- R Package: `BCRA-R/R/relative.risk.R` - Relative risk calculation
- R Documentation: `BCRA-R/man/exampledata.Rd` - Field descriptions

---

**Last Updated:** November 2025
**Version:** 1.0 (Phase 2.1)
