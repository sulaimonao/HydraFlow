// src/util/index.js
export * as constants from './constants.js';
export * as helpers from './helpers.js'; // Fix export for helpers
export * as logger from './logger.js';
export * as validation from './validation.js';
export { logError } from './logger.js';

// Export individual db_helpers functions instead of the whole module
export {
  updateSubtasksStatus,
  insertTaskCard,
  addHead as addPrimaryHead, // Aliased to differentiate primary head addition
  createNewHead as addAlternateHead, // Aliased to differentiate alternate head addition
  fetchTaskCardsWithSubtasks,
  upsertFeedbackEntry,
  insertTaskCardWithDependencies,
  fetchTaskCardWithSubtasks,
} from './db_helpers.js';

