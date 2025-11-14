# BCRA - Breast Cancer Risk Assessment Tool

JavaScript implementation of the National Cancer Institute's Breast Cancer Risk Assessment Tool (BCRAT), also known as the Gail Model.

## Overview

BCRA is a client-side JavaScript library that calculates the absolute risk of invasive breast cancer based on individual risk factors. This implementation maintains full computational fidelity with the original R package while providing a lightweight, privacy-preserving solution that runs entirely in the browser.

## Installation

```bash
npm install bcra
```

Or use via CDN:

```html
<script type="module">
  import { calculateRisk } from 'https://cdn.jsdelivr.net/npm/bcra@latest/dist/bcra.es.js';
</script>
```

## Quick Start

```javascript
import { calculateRisk } from 'bcra';

const data = {
  id: 1,
  initialAge: 40,
  projectionEndAge: 50,
  race: 1, // Non-Hispanic White
  numBreastBiopsies: 1,
  ageAtMenarche: 12,
  ageAtFirstBirth: 25,
  numRelativesWithBrCa: 1,
  atypicalHyperplasia: 0,
};

const result = calculateRisk(data);

console.log(`Absolute Risk: ${result.absoluteRisk.toFixed(2)}%`);
console.log(
  `Relative Risk (age <50): ${result.relativeRiskUnder50.toFixed(2)}`
);
console.log(`Relative Risk (age ≥50): ${result.relativeRiskAtOrAbove50.toFixed(2)}`);
```

## API Documentation

### `calculateRisk(data, options)`

Calculates breast cancer risk for one individual.

**Parameters:**

- `data` (Object): Risk factor profile of an individual
  - `id` (number): Individual's unique ID. Positive integer: 1, 2, 3,... .
  - `initialAge` (number): Initial age. Real number in [20, 90).
  - `projectionEndAge` (number): Risk projection end age, starting at `initialAge`. Real number in (20, 90], such that `initialAge` < `projectionEndAge`.
  - `race` (number): Race. Integer in [1, 11]. See "Race codes" for details.
  - `numBreastBiopsies` (number): Number of breast biopsies. Integer: 0, 1, 2,..., or 99 (unknown).
  - `ageAtMenarche` (number): Age at first menstrual period. Number such that `ageAtMenarche` ≤ `initialAge`, or 99 (unknown)
  - `ageAtFirstBirth` (number): Age at first live birth. Number such that `ageAtMenarche` ≤ `ageAtFirstBirth` ≤ `initialAge`, 98 (nulliparous), or 99 (unknown).
  - `numRelativesWithBrCa` (number): Number of first-degree relatives with breast cancer. Integer: 0, 1, 2,..., or 99 (unknown).
  - `atypicalHyperplasia` (number): Atypical hyperplasia indicator. 0 (no), 1 (yes), or 99 (unknown/not applicable).
- `options` (Object, optional): Calculation options
  - `rawInput` (boolean): Whether input is in raw format (default: true)
  - `calculateAverage` (boolean): Calculate average risk for comparison (default: false)

**Returns:** Object with risk calculations using the Breast Cancer Risk Assessment Tool (BCRAT; Gail model)

### Race Codes

- 1: Non-Hispanic White
- 2: African-American
- 3: Hispanic (US Born)
- 4: Native American/Other
- 5: Hispanic (Foreign Born)
- 6: Chinese-American
- 7: Japanese-American
- 8: Filipino-American
- 9: Hawaiian
- 10: Other Pacific Islander
- 11: Other Asian

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build library
npm run build

# Format code
npm run format
```

## Scientific Background

The Gail Model is a breast cancer risk assessment tool developed by Dr. Mitchell Gail and colleagues at the National Cancer Institute. It estimates a woman's absolute risk of developing invasive breast cancer over a defined age interval.

**Key Publications:**

- [Gail MH, Brinton LA, Byar DP, et al. Projecting individualized probabilities of developing breast cancer for white females who are being examined annually. J Natl Cancer Inst. 1989;81(24):1879-1886.](https://pubmed.ncbi.nlm.nih.gov/2593165/)
- [Costantino JP, Gail MH, Pee D, et al. Validation studies for models projecting the risk of invasive and total breast cancer incidence. J Natl Cancer Inst. 1999;91(18):1541-1548.](https://pubmed.ncbi.nlm.nih.gov/10491430/)

## License

MIT License - see LICENSE file for details

## Disclaimer

This tool is for research and educational purposes. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.

## Status

🚧 **Phase 1 Complete** - Project infrastructure set up
📋 **Phase 2 In Progress** - Implementing data models and constants

See [BCRA-JS-Implementation-Plan.md](../../BCRA-JS-Implementation-Plan.md) for detailed roadmap.
