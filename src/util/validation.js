// src/util/validation.js
/**
 * Validates the required input parameters.
 * @param {Object} params - The parameters to validate.
 * @throws {Error} - If any required parameter is missing or invalid.
 */
export function validateInputs(params) {
  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      throw new Error(`Missing required parameter: ${key}`);
    }
  }
}
