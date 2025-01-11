// middleware/metricsMiddleware.js
import { calculateMetrics } from "../src/util/metrics.js";
import { generateRecommendations } from "../src/util/recommendations.js";
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';

export const appendGaugeMetrics = async (req, res, next) => {
  try {
    // Dynamically fetch token usage if not provided
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
        tokenUsage = { used: 0, total: 10000 }; // Default values
      } else {
        tokenUsage = { used: data.token_used, total: data.token_total };
      }
    }

    // Default response latency if not provided
    let responseLatency = res.locals.responseLatency || 0.5;

    const context = {
      tokenUsage,
      responseLatency,
      activeSubpersonas: req.activeSubpersonas || [],
    };

    const metrics = calculateMetrics(context);

    // Attach metrics to response object
    res.locals.gaugeMetrics = {
      ...metrics,
      totalSubpersonas: context.activeSubpersonas.length,
      recommendations: generateRecommendations(metrics),
    };

    // Ensure gauge metrics are included in the final response
    const originalSend = res.send;
    res.send = function (body) {
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      body.gaugeMetrics = res.locals.gaugeMetrics;
      originalSend.call(this, JSON.stringify(body));
    };

    next();
  } catch (error) {
    console.error("Error appending gauge metrics:", error);
    res.locals.gaugeMetrics = {}; // Default to empty object on error
    next();
  }
};
