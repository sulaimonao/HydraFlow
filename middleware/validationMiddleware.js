// middleware/validationMiddleware.js

/**
 * Middleware to validate incoming request bodies against a provided schema.
 * Returns a 400 error if validation fails.
 * @param {Object} schema - The schema to validate the request body against.
 */
export const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);  // Validate request body against schema
  if (error) {
    // If validation fails, send a 400 Bad Request response with the error message
    return res.status(400).json({ error: error.details[0].message });
  }
  next();  // Proceed to the next middleware if validation passes
};

// middleware/metricsMiddleware.js
import { calculateMetrics } from "../src/util/metrics.js";
import { generateRecommendations } from "../src/util/recommendations.js";
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';

/**
* Middleware to append gauge metrics (e.g., token usage, latency) to the response.
* It fetches the latest metrics from the 'gauge_metrics' table if not already provided.
*/
export const appendGaugeMetrics = async (req, res, next) => {
try {
  // Retrieve token usage from previous middleware or fetch from the database if absent
  let tokenUsage = res.locals.tokenUsage;
  if (!tokenUsage) {
    const { data, error } = await supabase
      .from('gauge_metrics')  // Query the 'gauge_metrics' table
      .select('token_used, token_total')  // Select token usage fields
      .order('created_at', { ascending: false })  // Get the latest entry
      .limit(1)
      .single();

    if (error || !data) {
      console.warn("Token usage not found. Using default values.");
      tokenUsage = { used: 0, total: 10000 };  // Default token usage values if fetch fails
    } else {
      tokenUsage = { used: data.token_used, total: data.token_total };  // Use fetched data
    }
  }

  // Set default response latency if not provided by previous middleware
  let responseLatency = res.locals.responseLatency || 0.5;  // Default to 0.5 seconds

  // Context object to calculate metrics
  const context = {
    tokenUsage,
    responseLatency,
    activeSubpersonas: req.activeSubpersonas || [],  // Include active subpersonas for this request
  };

  // Compute metrics based on current request context
  const metrics = calculateMetrics(context);

  // Attach computed metrics and optimization recommendations to the response object
  res.locals.gaugeMetrics = {
    ...metrics,
    totalSubpersonas: context.activeSubpersonas.length,  // Count of active subpersonas
    recommendations: generateRecommendations(metrics),  // Generate performance suggestions
  };

  // Override res.send to include gauge metrics in the outgoing response
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === 'string') {
      body = JSON.parse(body);  // Parse string body to JSON
    }
    body.gaugeMetrics = res.locals.gaugeMetrics;  // Embed gauge metrics in response
    originalSend.call(this, JSON.stringify(body));  // Send modified response
  };

  next();  // Proceed to the next middleware
} catch (error) {
  console.error("Error appending gauge metrics:", error);
  res.locals.gaugeMetrics = {};  // Provide empty metrics object on failure
  next();  // Continue even if metric generation fails
}
};
