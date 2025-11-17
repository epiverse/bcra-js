/**
 * Breast Cancer Risk Assessment Tool - Form Handler
 * Manages form interactions, conditional questions, and data collection
 */

import { showModal, getRaceLabel } from './utils.js';

/**
 * FormHandler class for managing the assessment form
 */
export class FormHandler {
  constructor() {
    this.form = document.getElementById('bcra-form');
    this.calculateBtn = document.getElementById('calculate-btn');
    this.resetBtn = document.getElementById('reset-btn');

    // Eligibility fields
    this.medicalHistoryField = document.getElementById('q1-medical-history');
    this.geneticMutationField = document.getElementById('q2-genetic-mutation');

    // Demographics fields
    this.ageField = document.getElementById('q3-age');
    this.raceField = document.getElementById('q4-race');
    this.subRaceField = document.getElementById('q4a-subrace');
    this.subRaceGroup = document.getElementById('q4a-subrace-group');

    // History fields
    this.biopsyField = document.getElementById('q5-biopsy');
    this.numBiopsiesField = document.getElementById('q5a-num-biopsies');
    this.numBiopsiesGroup = document.getElementById('q5a-num-biopsies-group');
    this.hyperplasiaField = document.getElementById('q5b-hyperplasia');
    this.hyperplasiaGroup = document.getElementById('q5b-hyperplasia-group');
    this.menarcheField = document.getElementById('q6-menarche');
    this.firstBirthField = document.getElementById('q7-first-birth');
    this.relativesField = document.getElementById('q8-relatives');

    // Form sections
    this.demographicsSection = document.getElementById('demographics-section');
    this.historySection = document.getElementById('history-section');

    // State
    this.isEligible = false;
    this.formData = {};

    this.initialize();
  }

  /**
   * Initializes form event listeners
   */
  initialize() {
    // Eligibility change handlers
    this.medicalHistoryField.addEventListener('change', () => this.handleEligibilityChange());
    this.geneticMutationField.addEventListener('change', () => this.handleEligibilityChange());

    // Race change handler for conditional sub-race
    this.raceField.addEventListener('change', () => this.handleRaceChange());

    // Biopsy change handler for conditional questions
    this.biopsyField.addEventListener('change', () => this.handleBiopsyChange());

    // Reset button handler
    this.resetBtn.addEventListener('click', () => this.resetForm());

    // Enable calculate button when form is complete
    this.form.addEventListener('change', () => this.validateFormCompletion());
  }

  /**
   * Handles eligibility question changes
   */
  handleEligibilityChange() {
    const medicalHistory = this.medicalHistoryField.value;
    const geneticMutation = this.geneticMutationField.value;

    // Check Q1: Medical history
    if (medicalHistory === 'yes') {
      this.showEligibilityModal(
        'Not Eligible for BCRAT',
        `This tool cannot accurately calculate breast cancer risk for women with a medical history
        of any breast cancer or DCIS or LCIS. See
        <a href="https://bcrisktool.cancer.gov/about.html#OtherRiskAssessmentTools" target="_blank" rel="noopener noreferrer">Other Risk Assessment Tools</a>
        for more information.`
      );
      this.disableForm();
      return;
    }

    // Check Q2: Genetic mutation
    if (geneticMutation === 'yes') {
      this.showEligibilityModal(
        'Not Eligible for BCRAT',
        `Other tools may be more appropriate for women with known mutations in either the BRCA1
        or BRCA2 gene, or other hereditary syndromes associated with higher risks of breast cancer. See
        <a href="https://bcrisktool.cancer.gov/about.html#OtherRiskAssessmentTools" target="_blank" rel="noopener noreferrer">Other Risk Assessment Tools</a>
        for more information.`
      );
      this.disableForm();
      return;
    }

    // If both questions are answered appropriately, enable form
    if (medicalHistory === 'no' && (geneticMutation === 'no' || geneticMutation === 'unknown')) {
      this.enableForm();
    }
  }

  /**
   * Shows eligibility modal with message
   * @param {string} title - Modal title
   * @param {string} message - Modal message
   */
  showEligibilityModal(title, message) {
    showModal(title, message, () => {
      // Keep form disabled after modal closes
      this.disableForm();
    });
  }

  /**
   * Enables the rest of the form for eligible patients
   */
  enableForm() {
    this.isEligible = true;
    this.demographicsSection.disabled = false;
    this.historySection.disabled = false;
    this.validateFormCompletion();
  }

  /**
   * Disables the rest of the form for ineligible patients
   */
  disableForm() {
    this.isEligible = false;
    this.demographicsSection.disabled = true;
    this.historySection.disabled = true;
    this.calculateBtn.disabled = true;
  }

  /**
   * Handles race/ethnicity selection change
   * Shows/hides sub-race dropdown based on selection
   */
  handleRaceChange() {
    const race = this.raceField.value;

    // Clear previous sub-race options
    this.subRaceField.innerHTML = '<option value="">-- Select sub race/ethnicity --</option>';

    if (race === 'hispanic') {
      // Show Hispanic sub-options
      this.subRaceField.innerHTML += `
        <option value="us-born">US born</option>
        <option value="foreign-born">Born outside the US</option>
      `;
      this.subRaceGroup.style.display = 'block';
      this.subRaceField.required = true;
    } else if (race === 'asian') {
      // Show Asian sub-options
      this.subRaceField.innerHTML += `
        <option value="chinese">Chinese</option>
        <option value="filipino">Filipino</option>
        <option value="hawaiian">Hawaiian</option>
        <option value="pacific-islander">Pacific Islander</option>
        <option value="japanese">Japanese</option>
        <option value="other-asian">Other Asian</option>
      `;
      this.subRaceGroup.style.display = 'block';
      this.subRaceField.required = true;
    } else {
      // Hide sub-race for other options
      this.subRaceGroup.style.display = 'none';
      this.subRaceField.required = false;
      this.subRaceField.value = '';
    }

    this.validateFormCompletion();
  }

  /**
   * Handles biopsy selection change
   * Shows/hides follow-up questions based on selection
   */
  handleBiopsyChange() {
    const biopsy = this.biopsyField.value;

    if (biopsy === 'yes') {
      // Show follow-up questions
      this.numBiopsiesGroup.style.display = 'block';
      this.hyperplasiaGroup.style.display = 'block';
      this.numBiopsiesField.required = true;
      this.hyperplasiaField.required = true;
    } else {
      // Hide follow-up questions
      this.numBiopsiesGroup.style.display = 'none';
      this.hyperplasiaGroup.style.display = 'none';
      this.numBiopsiesField.required = false;
      this.hyperplasiaField.required = false;
      this.numBiopsiesField.value = '';
      this.hyperplasiaField.value = '';
    }

    this.validateFormCompletion();
  }

  /**
   * Validates if all required fields are completed
   */
  validateFormCompletion() {
    if (!this.isEligible) {
      this.calculateBtn.disabled = true;
      return;
    }

    // Check all required fields
    const requiredFields = [
      this.ageField,
      this.raceField,
      this.biopsyField,
      this.menarcheField,
      this.firstBirthField,
      this.relativesField
    ];

    // Add conditional required fields
    if (this.raceField.value === 'hispanic' || this.raceField.value === 'asian') {
      requiredFields.push(this.subRaceField);
    }

    if (this.biopsyField.value === 'yes') {
      requiredFields.push(this.numBiopsiesField);
      requiredFields.push(this.hyperplasiaField);
    }

    // Check if all required fields have values
    const allFieldsComplete = requiredFields.every(field => field.value !== '');

    this.calculateBtn.disabled = !allFieldsComplete;
  }

  /**
   * Collects all form data
   * @returns {Object} Form data object
   */
  collectFormData() {
    return {
      // Eligibility
      medicalHistory: this.medicalHistoryField.value,
      geneticMutation: this.geneticMutationField.value,

      // Demographics
      age: this.ageField.value,
      race: this.raceField.value,
      subRace: this.subRaceField.value,

      // Patient & Family History
      biopsy: this.biopsyField.value,
      numBiopsies: this.numBiopsiesField.value,
      hyperplasia: this.hyperplasiaField.value,
      menarche: this.menarcheField.value,
      firstBirth: this.firstBirthField.value,
      relatives: this.relativesField.value
    };
  }

  /**
   * Resets the entire form
   */
  resetForm() {
    // Reset form fields
    this.form.reset();

    // Hide conditional questions
    this.subRaceGroup.style.display = 'none';
    this.numBiopsiesGroup.style.display = 'none';
    this.hyperplasiaGroup.style.display = 'none';

    // Disable form sections
    this.disableForm();

    // Hide results section
    document.getElementById('results-section').style.display = 'none';

    // Reset state
    this.isEligible = false;
    this.formData = {};

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Displays the "Your Answers" summary table
   * @param {Object} formData - Form data to display
   */
  displayAnswersSummary(formData) {
    const tableBody = document.getElementById('answers-table-body');
    tableBody.innerHTML = '';

    // Helper function to create table row
    const createRow = (question, answer, isSubQuestion = false) => {
      const row = document.createElement('tr');
      const questionClass = isSubQuestion ? 'answer-subquestion' : '';

      row.innerHTML = `
        <td class="${questionClass}">${question}</td>
        <td>${answer}</td>
      `;

      return row;
    };

    // Add rows for each question
    tableBody.appendChild(
      createRow(
        '1. Does the woman have a medical history of any breast cancer or of DCIS or LCIS?',
        formData.medicalHistory === 'yes' ? 'Yes' : 'No'
      )
    );

    tableBody.appendChild(
      createRow(
        '2. Does the woman have a mutation in either the BRCA1 or BRCA2 gene?',
        formData.geneticMutation === 'yes' ? 'Yes' : formData.geneticMutation === 'no' ? 'No' : 'Unknown'
      )
    );

    tableBody.appendChild(
      createRow('3. What is the patient\'s age?', formData.age)
    );

    const raceLabel = getRaceLabel(formData.race, formData.subRace);
    tableBody.appendChild(
      createRow('4. What is the patient\'s race/ethnicity?', raceLabel)
    );

    if (formData.subRace) {
      tableBody.appendChild(
        createRow(
          '4a. What is the sub race/ethnicity or place of birth?',
          formData.subRace.replace('-', ' '),
          true
        )
      );
    }

    const biopsyAnswer = formData.biopsy === 'yes' ? 'Yes' : formData.biopsy === 'no' ? 'No' : 'Unknown';
    tableBody.appendChild(
      createRow(
        '5. Has the patient ever had a breast biopsy with a benign diagnosis?',
        biopsyAnswer
      )
    );

    if (formData.biopsy === 'yes') {
      const numBiopsiesText = formData.numBiopsies === '1' ? '1' : '2 or more';
      tableBody.appendChild(
        createRow(
          '5a. How many breast biopsies with a benign diagnosis has the patient had?',
          numBiopsiesText,
          true
        )
      );

      const hyperplasiaText = formData.hyperplasia === 'yes' ? 'Yes' : formData.hyperplasia === 'no' ? 'No' : 'Unknown';
      tableBody.appendChild(
        createRow(
          '5b. Has the patient ever had a breast biopsy with atypical hyperplasia?',
          hyperplasiaText,
          true
        )
      );
    }

    tableBody.appendChild(
      createRow(
        '6. What was the woman\'s age at the time of her first menstrual period?',
        formData.menarche
      )
    );

    const firstBirthLabels = {
      'no-births': 'No Births',
      '<20': '< 20',
      '20-24': '20-24',
      '25-29': '25-29',
      '30+': '30 or older',
      'unknown': 'Unknown'
    };
    tableBody.appendChild(
      createRow(
        '7. What was the woman\'s age when she gave birth to her first child?',
        firstBirthLabels[formData.firstBirth] || formData.firstBirth
      )
    );

    const relativesLabels = {
      'none': 'None',
      'one': 'One',
      'more-than-one': 'More than one',
      'unknown': 'Unknown'
    };
    tableBody.appendChild(
      createRow(
        '8. How many of the woman\'s first-degree relatives have had breast cancer?',
        relativesLabels[formData.relatives] || formData.relatives
      )
    );
  }
}

/**
 * Creates a new FormHandler instance
 * @returns {FormHandler} New form handler instance
 */
export function createFormHandler() {
  return new FormHandler();
}
