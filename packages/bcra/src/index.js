/**
 * BCRAT - Breast Cancer Risk Assessment Tool
 * JavaScript implementation of NCI's BCRAT (Gail Model)
 *
 * This is a derivative work based on the BCRA R package
 * originally developed by Fanni Zhang and licensed under GPL-2 or later.
 *
 * Copyright (C) 2020 Fanni Zhang (Original BCRA R Package)
 * Copyright (C) 2025 epiVerse (JavaScript Implementation)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * @module bcra
 * @version 1.0.0
 * @license GPL-3.0-or-later
 */

// Core calculation functions (Phase 3.1 - Complete)
export { recodeAndValidate } from './core/recode-check.js';

// Core calculation functions (Phase 3.2 - Complete)
export { calculateRelativeRisk } from './core/relative-risk.js';

// Core calculation functions (Phase 3.3 - Complete)
export { calculateAbsoluteRisk, expandToSingleYears } from './core/absolute-risk.js';

// Core calculation functions (Phase 3.4-3.5 - Complete)
export { calculateRisk, calculateBatchRisk } from './core/risk-calculator.js';

// Export types and constants for advanced users (Phase 2 - Complete)
export * from './types/index.js';
export * as constants from './constants/index.js';

// Export version
export const VERSION = '1.0.0';

// Import main functions for default export
import { calculateRisk, calculateBatchRisk } from './core/risk-calculator.js';

// Default export with main API
export default {
  calculateRisk,
  calculateBatchRisk,
  VERSION,
};
