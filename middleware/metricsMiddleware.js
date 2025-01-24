// middleware/metricsMiddleware.js

import { calculateMetrics } from "../src/util/metrics.js";
import { generateRecommendations } from "../src/util/recommendations.js";
import supabase, { supabaseRequest} from '../lib/supabaseClient.js';
import { setSessionContext } from '../lib/sessionUtils.js';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';

/**
 * Middleware to append gauge metrics to the response.
 */
export function appendGaugeMetrics(req, res, next) {
  console.log('🔍 Checking sessionContext middleware execution...');
  try {
    if (!req.session || !req.session.userId || !req.session.chatroomId) {
      throw new Error("❗ Session context is missing");
    }

    // 🔒 Set session context for RLS enforcement using session data
    await setSessionContext(req.session.userId, req.session.chatroomId);

    res.locals.gaugeMetrics = {
      responseTime: 0,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // Convert to MB
    };

    console.log(`🔍 req.locals content: ${JSON.stringify(req.locals)}`);
    next();
  } catch (error) {
    console.error("❌ Error in appendGaugeMetrics middleware:", error.message);
    res.status(500).json({
      error: 'Failed to append gauge metrics.',
      details: error.message,
      code: 'GAUGE_METRICS_ERROR',
    });
  }
}
