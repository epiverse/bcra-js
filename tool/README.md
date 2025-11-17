# Breast Cancer Risk Assessment Tool

A responsive, client-side web application for calculating breast cancer risk using the National Cancer Institute's Breast Cancer Risk Assessment Tool (BCRAT), also known as the Gail Model.

**Live App:** [https://epiverse.github.io/bcra-js/tool/](https://epiverse.github.io/bcra-js/tool/)

## Overview

This web application provides an accessible, privacy-preserving interface for healthcare professionals and individuals to calculate the absolute risk of developing invasive breast cancer over a 5-year period and lifetime (up to age 90).

### Key Features

✅ **Privacy-Preserving**: All calculations run entirely in the browser—no data is sent to servers
✅ **Client-Side Only**: Pure JavaScript application with no backend required
✅ **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
✅ **Interactive Form**: Conditional questions appear based on user responses
✅ **Visual Risk Display**: Population prevalence grids show risk in an intuitive format
✅ **Comprehensive Validation**: Built-in eligibility checks and input validation
✅ **Educational Purpose**: Includes detailed disclaimers and usage guidance

## Technology Stack

- **HTML5**: Semantic markup for accessibility
- **CSS3**: Custom styles built on [Pico.css](https://picocss.com/) minimal framework
- **JavaScript (ES6+)**: Modular, maintainable code using ES modules
- **D3.js v7**: Data-driven visualizations for risk display
- **BCRA Library**: [bcra npm package](https://www.npmjs.com/package/bcra) loaded from jsDelivr CDN

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
apps/bcra-tool/
├── index.html              # Main HTML structure
├── css/
│   └── styles.css          # Custom styles and responsive design
├── js/
│   ├── app.js              # Main application controller
│   ├── form-handler.js     # Form logic and validation
│   ├── calculator.js       # BCRA library integration
│   ├── visualizations.js   # D3.js population grids
│   └── utils.js            # Helper functions
└── README.md               # This file
```

### Module Responsibilities

- **app.js**: Orchestrates the application, coordinates form handling, calculations, and result display
- **form-handler.js**: Manages form state, conditional questions, eligibility checks, and data collection
- **calculator.js**: Integrates with BCRA library, converts form data to BCRA format, performs calculations
- **visualizations.js**: Creates D3.js population prevalence grids for risk visualization
- **utils.js**: Provides utility functions for formatting, validation, and UI helpers

## Local Development

### Prerequisites

- Modern web browser with ES6+ support (Chrome, Firefox, Safari, Edge)
- Local web server (for testing ES modules)

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/epiverse/bcra-js.git
   cd bcra-js/apps/bcra-tool
   ```

2. **Start a local web server**:

   Using Python:
   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   Using Node.js:
   ```bash
   npx http-server -p 8000
   ```

   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**:
   ```
   http://localhost:8000
   ```

### Testing

The application can be tested by:

1. **Eligibility Checks**: Test both eligible and ineligible scenarios
2. **Conditional Questions**: Verify sub-race and biopsy follow-ups appear correctly
3. **Form Validation**: Try submitting incomplete forms
4. **Calculations**: Compare results with known test cases from BCRA library
5. **Responsive Design**: Test on different screen sizes (mobile, tablet, desktop)
6. **Browser Compatibility**: Test on different browsers

### Test Cases

Example test case from BCRA documentation:

**Input:**
- Age: 40
- Race: Non-Hispanic White
- Biopsies: 1
- Age at menarche: 12-13
- Age at first birth: 25-29
- Relatives with breast cancer: 1
- Atypical hyperplasia: No

**Expected Output:**
- 5-year risk: ~1.73%
- Average 5-year risk: ~0.58%

## Deployment

The application is deployed to GitHub Pages automatically via GitHub Actions.

### Deployment Process

1. Changes are pushed to the `main` branch
2. GitHub Actions workflow builds and deploys to `gh-pages` branch
3. App is served from `/tool/` subdirectory

### Manual Deployment

To deploy manually:

```bash
# Ensure you're in the repository root
cd bcra-js

# Create gh-pages branch if it doesn't exist
git checkout -b gh-pages

# Copy app files to /tool/ directory
mkdir -p tool
cp -r apps/bcra-tool/* tool/

# Commit and push
git add tool/
git commit -m "Deploy BCRA tool to GitHub Pages"
git push origin gh-pages
```

## Usage Guidelines

### Who Should Use This Tool

- Healthcare professionals assessing breast cancer risk
- Researchers studying breast cancer epidemiology
- Educators teaching about cancer risk assessment
- Individuals learning about their breast cancer risk (consult with healthcare provider)

### Who Should NOT Use This Tool

This tool cannot accurately calculate risk for women with:
- Medical history of breast cancer, DCIS, or LCIS
- Known BRCA1 or BRCA2 gene mutations
- Other hereditary cancer syndromes
- Age < 35 or > 85 years

For these cases, see [Other Risk Assessment Tools](https://bcrisktool.cancer.gov/about.html#OtherRiskAssessmentTools).

## Privacy & Security

- **No data collection**: All inputs remain in your browser
- **No server communication**: Calculations run entirely client-side
- **No cookies or tracking**: Application does not use cookies or analytics
- **Open source code**: All code is publicly auditable on GitHub

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly across browsers and devices
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use ES6+ modern JavaScript
- Follow existing code organization patterns
- Add JSDoc comments for functions
- Ensure mobile responsiveness
- Test accessibility (keyboard navigation, ARIA labels)

## Disclaimer

⚠️ **IMPORTANT MEDICAL DISCLAIMER**

This tool is provided **for research, educational, and informational purposes only**. It should **NOT** be used as a substitute for professional medical advice, diagnosis, or treatment.

**Key Points:**

1. **Not Medical Advice**: Risk estimates are statistical projections and may not reflect actual individual risk
2. **Consult Healthcare Providers**: Always seek advice from qualified healthcare providers
3. **Individual Variation**: Individual risk varies based on factors not included in this model
4. **No Warranty**: This software is provided "as is" without warranty of any kind
5. **Clinical Validation Required**: Appropriate validation needed before clinical use
6. **Not for Diagnostic Use**: This tool calculates risk estimates only, does not diagnose

**If you have concerns about breast cancer risk, please consult with your healthcare provider.**

## License

This application is part of the bcra-js monorepo and is licensed under the GNU General Public License v3.0 or later (GPL-3.0-or-later). See [LICENSE](../../LICENSE) for details.

## Acknowledgments

- **BCRA Library**: Built on the [bcra npm package](https://www.npmjs.com/package/bcra)
- **Original Model**: Dr. Mitchell H. Gail and colleagues at the National Cancer Institute
- **Visualization Concept**: Adapted from [risk-viz](https://github.com/jeyabbalas/risk-viz) by Jeyabbalas
- **CSS Framework**: [Pico.css](https://picocss.com/) for minimal, elegant styling
- **Visualization Library**: [D3.js](https://d3js.org/) for data-driven visualizations

## Support

- **Documentation**: [BCRA Library Documentation](https://github.com/epiverse/bcra-js/tree/main/packages/bcra)
- **Issues**: [GitHub Issues](https://github.com/epiverse/bcra-js/issues)
- **Discussions**: [GitHub Discussions](https://github.com/epiverse/bcra-js/discussions)

## Version History

- **1.0.0** (2024): Initial release of web application
  - Full BCRAT calculator implementation
  - Responsive design for mobile and desktop
  - D3.js population prevalence visualizations
  - GitHub Pages deployment
