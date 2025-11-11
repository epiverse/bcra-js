# BCRA - Breast Cancer Risk Assessment Tool

JavaScript implementation of the National Cancer Institute's Breast Cancer Risk Assessment Tool (BCRAT), also known as the Gail Model.

## Overview

BCRA is a client-side JavaScript library that calculates the absolute risk of invasive breast cancer based on individual risk factors. This implementation maintains full computational fidelity with the original R package while providing a lightweight, privacy-preserving solution that runs entirely in the browser.

## Features

- 🔒 **Privacy-First**: All calculations performed client-side - no data leaves the browser
- 🎯 **Accurate**: Maintains computational fidelity with NCI's original R implementation
- 🚀 **Modern**: ES6+ JavaScript with full TypeScript definitions
- 📦 **Lightweight**: Zero dependencies, small bundle size
- 🌐 **Universal**: Works in browsers and Node.js
- 🧪 **Tested**: Comprehensive test suite with cross-validation against R package

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

const patientData = {
  id: 1,
  currentAge: 40,
  projectionAge: 50,
  race: 1, // Non-Hispanic White
  numberOfBiopsies: 1,
  ageAtMenarche: 12,
  ageAtFirstBirth: 25,
  firstDegreeRelatives: 1,
  hyperplasia: 0,
};

const result = calculateRisk(patientData);

console.log(`Absolute Risk: ${result.absoluteRisk.toFixed(2)}%`);
console.log(
  `Relative Risk (age <50): ${result.relativeRiskUnder50.toFixed(2)}`
);
console.log(`Relative Risk (age ≥50): ${result.relativeRiskOver50.toFixed(2)}`);
```

## API Documentation

### `calculateRisk(patientData, options)`

Calculates breast cancer risk for a single patient.

**Parameters:**

- `patientData` (Object): Patient risk factor data
  - `currentAge` (number): Current age (20-89)
  - `projectionAge` (number): Future age for risk projection (currentAge to 90)
  - `race` (number): Race/ethnicity code (1-11)
  - `numberOfBiopsies` (number): Number of breast biopsies (0, 1, 2+, or 99 for unknown)
  - `ageAtMenarche` (number): Age at first menstrual period (7-17, or 99 for unknown)
  - `ageAtFirstBirth` (number): Age at first live birth (10-60, 98 for nulliparous, 99 for unknown)
  - `firstDegreeRelatives` (number): Number of first-degree relatives with breast cancer (0-10, or 99 for unknown)
  - `hyperplasia` (number): Atypical hyperplasia (0=no, 1=yes, 99=unknown/not applicable)
- `options` (Object, optional): Calculation options
  - `rawInput` (boolean): Whether input is in raw format (default: true)
  - `calculateAverage` (boolean): Calculate average risk for comparison (default: false)

**Returns:** Object with risk calculations

### Race/Ethnicity Codes

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

- Gail MH, Brinton LA, Byar DP, et al. Projecting individualized probabilities of developing breast cancer for white females who are being examined annually. J Natl Cancer Inst. 1989;81(24):1879-1886.
- Costantino JP, Gail MH, Pee D, et al. Validation studies for models projecting the risk of invasive and total breast cancer incidence. J Natl Cancer Inst. 1999;91(18):1541-1548.

## License

MIT License - see LICENSE file for details

## Citation

If you use this library in research, please cite:

```
BCRA JavaScript Library (2025)
JavaScript implementation of NCI's Breast Cancer Risk Assessment Tool
https://github.com/epiverse/bcra-js
```

## Disclaimer

This tool is for research and educational purposes. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.

## Contributing

Contributions welcome! Please see CONTRIBUTING.md for guidelines.

## Status

🚧 **Phase 1 Complete** - Project infrastructure set up
📋 **Phase 2 In Progress** - Implementing data models and constants

See [BCRA-JS-Implementation-Plan.md](../../BCRA-JS-Implementation-Plan.md) for detailed roadmap.
