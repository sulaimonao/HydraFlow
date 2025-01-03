// src/actions/action_caller.js
import axios from "axios";

/**
 * Calls an API endpoint with retries on failure.
 */
export async function callApiWithRetry(endpoint, payload, retries = 3, backoff = 300) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(endpoint, payload);
      return response.data;
    } catch (error) {
      if (attempt < retries && shouldRetry(error)) {
        await new Promise((resolve) => setTimeout(resolve, backoff * attempt));
      } else {
        console.error(`API call failed after ${attempt} attempts: ${error.message}`);
        throw error;
      }
    }
  }
}

/**
 * Determines if a failed API call is retryable.
 */
function shouldRetry(error) {
  return !error.response || (error.response.status >= 500 && error.response.status < 600);
}

export default { callApiWithRetry };
