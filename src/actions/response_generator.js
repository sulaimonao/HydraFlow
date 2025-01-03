// src/actions/response_generator.js
import { generateFinalResponse } from "../logic/response_generator.js";

/**
 * Wraps the response generator for enhanced usage.
 */
export async function generateResponse(params) {
  return generateFinalResponse(params);
}
