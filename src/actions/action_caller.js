// src/actions/action_caller.js
import axios from 'axios';
import { calculateMetrics } from "../util/metrics.js";
import { generateResponse } from './response_generator_actions.js';

async function callApiWithRetry(endpoint, payload, retries = 3, backoff = 300) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(endpoint, payload);
      return response.data;
    } catch (error) {
      if (attempt < retries && shouldRetry(error)) {
        await new Promise(resolve => setTimeout(resolve, backoff * attempt));
      } else {
        throw error;
      }
    }
  }
}

function shouldRetry(error) {
  return !error.response || (error.response.status >= 500 && error.response.status < 600);
}

export { callApiWithRetry };

async function callAction(action, payload, context) {
  switch (action) {
    case "generate_response":
      return await generateResponse(payload, context);
    case "fetch_gauge_metrics":
      return calculateMetrics(context);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

export { callAction };
