// middleware/metricsMiddleware.js

import { calculateMetrics } from "../src/util/metrics.js";
import { generateRecommendations } from "../src/util/recommendations.js";
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';  // Import UUID for consistent ID generation

/**
 * Middleware to append gauge metrics to responses.
 * Calculates and attaches performance metrics, token usage, and recommendations.
 */
export const appendGaugeMetrics = async (req, res, next) => {
  try {
    /**
     * === Token Usage Retrieval ===
     * Dynamically fetch token usage from the latest gauge_metrics record
     * or fallback to default values if not available.
     */
    let tokenUsage = res.locals.tokenUsage;

    if (!tokenUsage) {
      const { data, error } = await supabase
        .from('gauge_metrics')
        .select('token_used, token_total')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.warn("Token usage not found. Using default values.");
        tokenUsage = { used: 0, total: 10000 };  // Fallback to default values
      } else {
        tokenUsage = { used: data.token_used, total: data.token_total };
      }
    }

    /**
     * === Response Latency Handling ===
     * Use the provided response latency or default to 0.5 seconds.
     */
    let responseLatency = res.locals.responseLatency || 0.5;

    /**
     * === Ensure User and Chatroom IDs ===
     * Validate or generate UUIDs for user_id and chatroom_id to ensure proper tracking.
     */
    const user_id = req.body.user_id || uuidv4();
    const chatroom_id = req.body.chatroom_id || uuidv4();

    /**
     * === Metrics Context Construction ===
     * Collect relevant metrics context, including token usage and active subpersonas.
     */
    const context = {
      user_id,
      chatroom_id,
      tokenUsage,
      responseLatency,
      activeSubpersonas: req.activeSubpersonas || [],
    };

    /**
     * === Metrics Calculation ===
     * Compute performance metrics based on the current context.
     */
    const metrics = calculateMetrics(context);

    /**
     * === Attach Metrics to Response ===
     * Embed calculated metrics and recommendations into the response.
     */
    res.locals.gaugeMetrics = {
      ...metrics,
      totalSubpersonas: context.activeSubpersonas.length,
      recommendations: generateRecommendations(metrics),
      user_id: context.user_id,
      chatroom_id: context.chatroom_id,
    };

    /**
     * === Override Response Send ===
     * Ensure gauge metrics are always included in the final response.
     */
    const originalSend = res.send;
    res.send = function (body) {
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      body.gaugeMetrics = res.locals.gaugeMetrics;
      originalSend.call(this, JSON.stringify(body));
    };

    // Proceed to the next middleware or route handler
    next();

  } catch (error) {
    /**
     * === Error Handling ===
     * Log errors and attach an empty gaugeMetrics object to avoid breaking the workflow.
     */
    console.error("Error appending gauge metrics:", error);
    res.locals.gaugeMetrics = {};  // Fallback to empty metrics on failure
    next();
  }
};
