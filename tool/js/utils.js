/**
 * Breast Cancer Risk Assessment Tool - Utility Functions
 * Helper functions for formatting, validation, and UI interactions
 */

/**
 * Formats a risk value as a percentage string
 * @param {number} value - Risk value (0-100)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage (e.g., "1.73%")
 */
export function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * Smoothly scrolls to an element
 * @param {string|HTMLElement} target - Element ID or element reference
 * @param {number} offset - Offset from top in pixels (default: 20)
 */
export function smoothScrollTo(target, offset = 20) {
  const element = typeof target === 'string' ? document.getElementById(target) : target;

  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Shows a modal dialog with a message
 * @param {string} title - Modal title
 * @param {string} message - Modal message (can include HTML)
 * @param {Function} onClose - Callback when modal is closed
 */
export function showModal(title, message, onClose = null) {
  const modal = document.getElementById('eligibility-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalOkBtn = document.getElementById('modal-ok-btn');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  modalTitle.textContent = title;
  modalMessage.innerHTML = message;

  // Show modal (Pico CSS uses native dialog element)
  modal.showModal();

  // Close handlers
  const closeHandler = () => {
    modal.close();
    if (onClose) onClose();
  };

  modalOkBtn.onclick = closeHandler;
  modalCloseBtn.onclick = closeHandler;

  // Close on backdrop click
  modal.onclick = (event) => {
    if (event.target === modal) {
      closeHandler();
    }
  };
}

/**
 * Validates age input
 * @param {number} age - Age to validate
 * @returns {Object} Validation result with isValid and message properties
 */
export function validateAge(age) {
  if (!age || isNaN(age)) {
    return { isValid: false, message: 'Please enter a valid age.' };
  }

  const ageNum = parseInt(age, 10);

  if (ageNum < 35 || ageNum > 85) {
    return {
      isValid: false,
      message: 'This tool is designed for women aged 35-85 years.'
    };
  }

  return { isValid: true, message: '' };
}

/**
 * Maps form race/ethnicity values to BCRA RaceCode
 * @param {string} race - Primary race value from form
 * @param {string} subRace - Sub-race value (if applicable)
 * @returns {number} BCRA RaceCode (1-11)
 */
export function mapRaceToRaceCode(race, subRace = '') {
  // Access BCRA RaceCode from global scope (loaded from CDN)
  const RaceCode = window.BCRA?.RaceCode;

  if (!RaceCode) {
    console.error('BCRA library not loaded');
    return 1; // Default to White
  }

  switch (race) {
    case 'white':
      return RaceCode.WHITE; // 1

    case 'african-american':
      return RaceCode.AFRICAN_AMERICAN; // 2

    case 'hispanic':
      if (subRace === 'us-born') {
        return RaceCode.HISPANIC_US_BORN; // 3
      } else if (subRace === 'foreign-born') {
        return RaceCode.HISPANIC_FOREIGN_BORN; // 5
      }
      return RaceCode.HISPANIC_US_BORN; // Default to US born

    case 'asian':
      switch (subRace) {
        case 'chinese':
          return RaceCode.CHINESE; // 6
        case 'japanese':
          return RaceCode.JAPANESE; // 7
        case 'filipino':
          return RaceCode.FILIPINO; // 8
        case 'hawaiian':
          return RaceCode.HAWAIIAN; // 9
        case 'pacific-islander':
          return RaceCode.OTHER_PACIFIC_ISLANDER; // 10
        case 'other-asian':
          return RaceCode.OTHER_ASIAN; // 11
        default:
          return RaceCode.CHINESE; // Default to Chinese
      }

    case 'native-american':
      return RaceCode.NATIVE_AMERICAN; // 4

    case 'unknown':
    default:
      return RaceCode.WHITE; // Default to White
  }
}

/**
 * Maps form biopsy values to BCRA format
 * @param {string} biopsy - Biopsy answer ('yes', 'no', 'unknown')
 * @param {string} numBiopsies - Number of biopsies ('1', '2')
 * @returns {number} Number of biopsies for BCRA (0, 1, 2, or 99)
 */
export function mapBiopsyValue(biopsy, numBiopsies = '') {
  if (biopsy === 'no') {
    return 0;
  } else if (biopsy === 'unknown') {
    return 99;
  } else if (biopsy === 'yes') {
    if (numBiopsies === '1') {
      return 1;
    } else if (numBiopsies === '2') {
      return 2;
    }
    return 1; // Default to 1 if not specified
  }
  return 99; // Unknown
}

/**
 * Maps form menarche values to BCRA format
 * @param {string} menarche - Menarche age range ('7-11', '12-13', '14+')
 * @returns {number} Representative age for BCRA
 */
export function mapMenarcheValue(menarche) {
  switch (menarche) {
    case '7-11':
      return 11; // Use upper bound
    case '12-13':
      return 12; // Use lower bound
    case '14+':
      return 14; // Use lower bound
    default:
      return 99; // Unknown
  }
}

/**
 * Maps form first birth values to BCRA format
 * @param {string} firstBirth - First birth age range
 * @returns {number} Representative age for BCRA (or 98 for nulliparous, 99 for unknown)
 */
export function mapFirstBirthValue(firstBirth) {
  switch (firstBirth) {
    case 'no-births':
      return 98; // Nulliparous
    case '<20':
      return 19;
    case '20-24':
      return 22;
    case '25-29':
      return 27;
    case '30+':
      return 30;
    case 'unknown':
      return 99;
    default:
      return 99;
  }
}

/**
 * Maps form relatives values to BCRA format
 * @param {string} relatives - Number of relatives ('none', 'one', 'more-than-one', 'unknown')
 * @returns {number} Number of relatives for BCRA
 */
export function mapRelativesValue(relatives) {
  switch (relatives) {
    case 'none':
      return 0;
    case 'one':
      return 1;
    case 'more-than-one':
      return 2;
    case 'unknown':
      return 99;
    default:
      return 99;
  }
}

/**
 * Maps form hyperplasia values to BCRA format
 * @param {string} biopsy - Biopsy answer
 * @param {string} hyperplasia - Hyperplasia answer ('yes', 'no', 'unknown')
 * @returns {number} Hyperplasia status for BCRA (0, 1, or 99)
 */
export function mapHyperplasiaValue(biopsy, hyperplasia) {
  // If no biopsy or unknown, hyperplasia must be 99 (not applicable)
  if (biopsy === 'no' || biopsy === 'unknown') {
    return 99;
  }

  // If biopsy was done
  switch (hyperplasia) {
    case 'yes':
      return 1;
    case 'no':
      return 0;
    case 'unknown':
      return 99;
    default:
      return 99;
  }
}

/**
 * Generates a human-readable label for race/ethnicity
 * @param {string} race - Primary race value
 * @param {string} subRace - Sub-race value (if applicable)
 * @returns {string} Human-readable race label
 */
export function getRaceLabel(race, subRace = '') {
  const raceLabels = {
    'white': 'White',
    'african-american': 'African American',
    'hispanic': 'Hispana/Latina',
    'asian': 'Asian American',
    'native-american': 'American Native or Alaskan Native',
    'unknown': 'Unknown'
  };

  const subRaceLabels = {
    'us-born': 'US born',
    'foreign-born': 'Born outside the US',
    'chinese': 'Chinese',
    'japanese': 'Japanese',
    'filipino': 'Filipino',
    'hawaiian': 'Hawaiian',
    'pacific-islander': 'Pacific Islander',
    'other-asian': 'Other Asian'
  };

  let label = raceLabels[race] || race;

  if (subRace && subRaceLabels[subRace]) {
    label += ` (${subRaceLabels[subRace]})`;
  }

  return label;
}

/**
 * Compares patient risk to average risk and returns comparison text
 * @param {number} patientRisk - Patient's risk percentage
 * @param {number} averageRisk - Average risk percentage
 * @returns {Object} Comparison object with isHigher, ratio, and color properties
 */
export function compareRisks(patientRisk, averageRisk) {
  const ratio = averageRisk > 0 ? patientRisk / averageRisk : 0;
  const isHigher = patientRisk > averageRisk;

  return {
    isHigher,
    ratio: ratio.toFixed(2),
    color: isHigher ? 'risk-higher' : 'risk-lower',
    comparison: isHigher ? 'higher than' : 'lower than'
  };
}

/**
 * Selects an appropriate denominator for interpretable risk fractions
 * @param {number} patientRisk - Patient's risk percentage (0-100)
 * @param {number} averageRisk - Average risk percentage (0-100)
 * @returns {Object} Object with denominator, patientNum, and averageNum
 */
export function selectDenominator(patientRisk, averageRisk) {
  const denominators = [100, 200, 500, 1000, 2000, 5000, 10000];

  for (const denom of denominators) {
    const patientNum = Math.round((patientRisk * denom) / 100);
    const averageNum = Math.round((averageRisk * denom) / 100);

    // Both should be >= 1 for interpretability
    if (patientNum >= 1 && averageNum >= 1) {
      return { denominator: denom, patientNum, averageNum };
    }
  }

  // Fallback for very small risks
  return {
    denominator: 10000,
    patientNum: Math.max(1, Math.round((patientRisk * 100))),
    averageNum: Math.max(1, Math.round((averageRisk * 100)))
  };
}

/**
 * Pluralizes a word based on count
 * @param {string} word - Word to pluralize ('woman' or 'develops')
 * @param {number} count - Count to determine singular or plural
 * @returns {string} Pluralized word
 */
export function pluralize(word, count) {
  if (count === 1) {
    return word === 'woman' ? 'woman' : 'develops';
  }
  return word === 'woman' ? 'women' : 'develop';
}

/**
 * Generates risk ratio text based on the ratio value
 * @param {number} ratio - Risk ratio (patient risk / average risk)
 * @returns {string} HTML string describing the risk ratio
 */
export function getRiskRatioText(ratio) {
  if (ratio > 2.0) {
    return `a <strong class="risk-higher">${ratio.toFixed(1)}× elevated risk</strong> compared to the average for women of the same age and race/ethnicity`;
  } else if (ratio > 1.2) {
    return `an <strong class="risk-higher">elevated risk</strong> (${ratio.toFixed(1)}× higher) compared to the average for women of the same age and race/ethnicity`;
  } else if (ratio < 0.8) {
    return `a <strong class="risk-lower">lower risk</strong> (${ratio.toFixed(1)}× the average) compared to the average for women of the same age and race/ethnicity`;
  } else {
    return `a <strong>similar risk</strong> (${ratio.toFixed(1)}× the average) compared to the average for women of the same age and race/ethnicity`;
  }
}

/**
 * Generates risk description text for display with both percentages and interpretable fractions
 * @param {number} patientRisk - Patient's risk percentage
 * @param {number} averageRisk - Average risk percentage
 * @param {string} period - Risk period ('5-year' or 'lifetime')
 * @param {number} age - Patient's age
 * @param {string} raceLabel - Race/ethnicity label
 * @returns {string} HTML string with risk description
 */
export function generateRiskDescription(patientRisk, averageRisk, period = '5-year', age = null, raceLabel = null) {
  const comparison = compareRisks(patientRisk, averageRisk);
  const periodText = period === '5-year' ? 'over the next 5 years' : 'over her lifetime (to age 90)';
  const ratio = averageRisk > 0 ? patientRisk / averageRisk : 1;

  // Percentage-based description (existing)
  let description = `Based on the information provided, the patient's estimated risk for developing invasive
    breast cancer ${periodText} is <strong class="${comparison.color}">${formatPercentage(patientRisk)}</strong>,
    which is <strong>${comparison.comparison}</strong> the average risk of
    <strong>${formatPercentage(averageRisk)}</strong> for women of the same age and race/ethnicity
    in the general U.S. population.`;

  // Add interpretable description if age and race are provided
  if (age !== null && raceLabel !== null) {
    const { denominator, patientNum, averageNum } = selectDenominator(patientRisk, averageRisk);
    const riskRatioText = getRiskRatioText(ratio);

    description += `

    <div class="interpretable-description">
      <h4>What does this mean?</h4>
      <ul>
        <li>Out of ${denominator.toLocaleString()} US women who are ${age} years old and of
            ${raceLabel} race/ethnicity, about ${averageNum} ${pluralize('woman', averageNum)}
            typically ${pluralize('develops', averageNum)} invasive breast cancer ${periodText}.</li>

        <li>For women with similar risk factors as those entered, about ${patientNum}
            out of ${denominator.toLocaleString()} develop invasive breast cancer ${periodText}.</li>

        <li>This indicates ${riskRatioText}.</li>
      </ul>
    </div>`;
  }

  return description;
}
