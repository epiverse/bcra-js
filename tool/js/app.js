/**
 * Breast Cancer Risk Assessment Tool - Main Application
 * Orchestrates form handling, calculations, and visualizations
 */

import { createFormHandler } from './form-handler.js';
import { createCalculator } from './calculator.js';
import { renderRiskComparison, clearVisualizations } from './visualizations.js';
import { smoothScrollTo, generateRiskDescription, getRaceLabel } from './utils.js';

/**
 * Main application class
 */
class BCRAApp {
  constructor() {
    this.formHandler = null;
    this.calculator = null;
    this.resultsSection = document.getElementById('results-section');

    this.initialize();
  }

  /**
   * Initializes the application
   */
  initialize() {
    // Wait for DOM and BCRA library to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Sets up the application components
   */
  setup() {
    try {
      // Initialize form handler
      this.formHandler = createFormHandler();

      // Wait a bit for BCRA library to load from CDN
      setTimeout(() => {
        this.initializeCalculator();
      }, 500);

      // Set up event listeners
      this.setupEventListeners();

      // Reset form on page load to clear any cached values
      this.formHandler.resetForm();

      console.log('BCRA App initialized successfully');
    } catch (error) {
      console.error('Error initializing BCRA App:', error);
      this.showError('Failed to initialize the application. Please refresh the page.');
    }
  }

  /**
   * Initializes the calculator once BCRA library is loaded
   */
  initializeCalculator() {
    try {
      if (!window.BCRA) {
        console.warn('BCRA library not yet loaded, retrying...');
        setTimeout(() => this.initializeCalculator(), 500);
        return;
      }

      this.calculator = createCalculator();
      console.log('Calculator initialized with BCRA library');
    } catch (error) {
      console.error('Error initializing calculator:', error);
      this.showError('Failed to load the BCRA calculation library. Please refresh the page.');
    }
  }

  /**
   * Sets up event listeners for the application
   */
  setupEventListeners() {
    // Calculate button
    const form = document.getElementById('bcra-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCalculate();
    });

    // New calculation button
    const newCalcBtn = document.getElementById('new-calculation-btn');
    newCalcBtn.addEventListener('click', () => {
      this.formHandler.resetForm();
      clearVisualizations();
    });

    // Download results button
    const downloadBtn = document.getElementById('download-results-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        this.downloadResults();
      });
    }

    // Handle window resize for responsive visualizations
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (this.resultsSection.style.display !== 'none') {
          this.updateVisualizations();
        }
      }, 250);
    });
  }

  /**
   * Handles the calculate risk button click
   */
  async handleCalculate() {
    try {
      // Check if calculator is ready
      if (!this.calculator) {
        this.showError('Calculator is still loading. Please wait a moment and try again.');
        return;
      }

      // Show loading state
      this.showLoading(true);

      // Collect form data
      const formData = this.formHandler.collectFormData();

      // Validate form data
      const validation = this.calculator.validateFormData(formData);
      if (!validation.isValid) {
        this.showValidationErrors(validation.errors);
        this.showLoading(false);
        return;
      }

      // Calculate risks
      const results = this.calculator.calculateBothRisks(formData);

      // Check if calculation was successful
      if (!results.success) {
        const errorMessage = this.calculator.handleError(
          results.fiveYear.error || results.lifetime.error
        );
        this.showError(errorMessage);
        this.showLoading(false);
        return;
      }

      // Store form data for display
      this.currentFormData = formData;
      this.currentResults = results;

      // Display results
      this.displayResults(formData, results);

      // Hide loading state
      this.showLoading(false);

      // Scroll to results
      setTimeout(() => {
        smoothScrollTo('results-section', 80);
      }, 100);

    } catch (error) {
      console.error('Error during calculation:', error);
      this.showError('An unexpected error occurred during calculation. Please try again.');
      this.showLoading(false);
    }
  }

  /**
   * Displays the calculation results
   * @param {Object} formData - Form data
   * @param {Object} results - Calculation results
   */
  displayResults(formData, results) {
    // Show results section
    this.resultsSection.style.display = 'block';

    // Render 5-year risk visualizations
    renderRiskComparison(
      'viz-5year-patient',
      'viz-5year-average',
      results.fiveYear.patientRisk,
      results.fiveYear.averageRisk,
      '5-year'
    );

    // Render lifetime risk visualizations
    renderRiskComparison(
      'viz-lifetime-patient',
      'viz-lifetime-average',
      results.lifetime.patientRisk,
      results.lifetime.averageRisk,
      'lifetime'
    );

    // Update risk descriptions
    this.updateRiskDescriptions(results, formData);

    // Display answers summary
    this.formHandler.displayAnswersSummary(formData);
  }

  /**
   * Updates risk description text
   * @param {Object} results - Calculation results
   * @param {Object} formData - Form data with age and race information
   */
  updateRiskDescriptions(results, formData) {
    const age = parseInt(formData.age, 10);
    const raceLabel = getRaceLabel(formData.race, formData.subRace);

    // 5-year risk description
    const fiveYearDesc = document.getElementById('risk-5year-description');
    fiveYearDesc.innerHTML = generateRiskDescription(
      results.fiveYear.patientRisk,
      results.fiveYear.averageRisk,
      '5-year',
      age,
      raceLabel
    );

    // Lifetime risk description
    const lifetimeDesc = document.getElementById('risk-lifetime-description');
    lifetimeDesc.innerHTML = generateRiskDescription(
      results.lifetime.patientRisk,
      results.lifetime.averageRisk,
      'lifetime',
      age,
      raceLabel
    );
  }

  /**
   * Updates visualizations (e.g., after window resize)
   */
  updateVisualizations() {
    if (this.currentResults) {
      // Re-render 5-year risk visualizations
      renderRiskComparison(
        'viz-5year-patient',
        'viz-5year-average',
        this.currentResults.fiveYear.patientRisk,
        this.currentResults.fiveYear.averageRisk,
        '5-year'
      );

      // Re-render lifetime risk visualizations
      renderRiskComparison(
        'viz-lifetime-patient',
        'viz-lifetime-average',
        this.currentResults.lifetime.patientRisk,
        this.currentResults.lifetime.averageRisk,
        'lifetime'
      );
    }
  }

  /**
   * Shows loading state
   * @param {boolean} isLoading - Whether to show loading state
   */
  showLoading(isLoading) {
    const calculateBtn = document.getElementById('calculate-btn');
    const form = document.getElementById('bcra-form');

    if (isLoading) {
      calculateBtn.disabled = true;
      calculateBtn.textContent = 'Calculating...';
      calculateBtn.setAttribute('aria-busy', 'true');
      form.classList.add('loading');
    } else {
      calculateBtn.disabled = false;
      calculateBtn.textContent = 'Calculate Risk';
      calculateBtn.removeAttribute('aria-busy');
      form.classList.remove('loading');

      // Re-validate form to restore proper button state
      this.formHandler.validateFormCompletion();
    }
  }

  /**
   * Shows validation errors
   * @param {Array<string>} errors - Array of error messages
   */
  showValidationErrors(errors) {
    const errorMessage = `Please correct the following errors:\n\n${errors.join('\n')}`;
    alert(errorMessage);
  }

  /**
   * Shows an error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    alert(`Error: ${message}`);
  }

  /**
   * Downloads risk assessment results as a JSON file
   */
  downloadResults() {
    if (!this.currentResults || !this.currentFormData) {
      alert('No results available to download. Please calculate risk first.');
      return;
    }

    try {
      const age = parseInt(this.currentFormData.age, 10);
      const raceLabel = getRaceLabel(this.currentFormData.race, this.currentFormData.subRace);

      // Prepare results object
      const resultsData = {
        metadata: {
          timestamp: new Date().toISOString(),
          toolVersion: '1.0.0',
          calculationDate: new Date().toLocaleDateString('en-US')
        },
        patientInfo: {
          age: age,
          race: raceLabel
        },
        riskFactors: {
          medicalHistory: this.currentFormData.medicalHistory,
          geneticMutation: this.currentFormData.geneticMutation,
          biopsyHistory: this.currentFormData.biopsy,
          numberOfBiopsies: this.currentFormData.numBiopsies || 'N/A',
          atypicalHyperplasia: this.currentFormData.hyperplasia || 'N/A',
          ageAtMenarche: this.currentFormData.menarche,
          ageAtFirstBirth: this.currentFormData.firstBirth,
          firstDegreeRelativesWithBreastCancer: this.currentFormData.relatives
        },
        results: {
          fiveYearRisk: {
            absoluteRisk: this.currentResults.fiveYear.patientRisk,
            averageRisk: this.currentResults.fiveYear.averageRisk,
            projectionInterval: this.currentResults.fiveYear.projectionInterval,
            unit: 'percentage'
          },
          lifetimeRisk: {
            absoluteRisk: this.currentResults.lifetime.patientRisk,
            averageRisk: this.currentResults.lifetime.averageRisk,
            projectionInterval: this.currentResults.lifetime.projectionInterval,
            unit: 'percentage'
          }
        }
      };

      // Add relative risks if available
      if (this.currentResults.fiveYear.relativeRiskUnder50 !== undefined) {
        resultsData.results.relativeRisks = {
          under50: this.currentResults.fiveYear.relativeRiskUnder50,
          atOrAbove50: this.currentResults.fiveYear.relativeRiskAtOrAbove50
        };
      }

      // Create pretty JSON
      const jsonString = JSON.stringify(resultsData, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with current date
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `bcra-results-${dateStr}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Results downloaded successfully');
    } catch (error) {
      console.error('Error downloading results:', error);
      this.showError('Failed to download results. Please try again.');
    }
  }
}

// Initialize the application when the script loads
const app = new BCRAApp();

// Export for debugging purposes
window.BCRAApp = app;
