// middleware/metricsMiddleware.js

import { calculateMetrics } from "../src/util/metrics.js";
import { generateRecommendations } from "../src/util/recommendations.js";
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';

/**
 * Middleware to append gauge metrics to responses.
 * Calculates token usage, performance metrics, and provides recommendations.
 */
export const appendGaugeMetrics = async (req, res, next) => {
  try {
    // === 🔒 Validate or Generate User and Chatroom IDs ===
    let user_id = req.body.user_id || req.headers['x-user-id'] || uuidv4();
    let chatroom_id = req.body.chatroom_id || req.headers['x-chatroom-id'] || uuidv4();

    // Validate UUIDs
    if (!validateUUID(user_id)) {
      console.warn("⚠️ Invalid user_id detected. Generating a new one.");
      user_id = uuidv4();
    }
    if (!validateUUID(chatroom_id)) {
      console.warn("⚠️ Invalid chatroom_id detected. Generating a new one.");
      chatroom_id = uuidv4();
    }

    // 🔐 Set Supabase session context for RLS policies
    await setSessionContext(user_id, chatroom_id);

    // === 📊 Retrieve Token Usage ===
    let tokenUsage = res.locals.tokenUsage;

    if (!tokenUsage) {
      const { data, error } = await supabase
        .from('gauge_metrics')
        .select('token_used, token_total')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.warn("⚠️ Token usage not found. Using default values.");
        tokenUsage = { used: 0, total: 10000 };
      } else {
        tokenUsage = { used: data.token_used, total: data.token_total };
      }
    }

    // === ⏱️ Retrieve Response Latency ===
    const responseLatency = res.locals.responseLatency || 0.5;

    // === 📦 Construct Metrics Context ===
    const context = {
      user_id,
      chatroom_id,
      tokenUsage,
      responseLatency,
      activeSubpersonas: req.activeSubpersonas || [],
    };

    // === 📈 Calculate Metrics ===
    const metrics = calculateMetrics(context);

    // === 📝 Attach Metrics and Recommendations ===
    res.locals.gaugeMetrics = {
      ...metrics,
      totalSubpersonas: context.activeSubpersonas.length,
      recommendations: generateRecommendations(metrics),
      user_id: context.user_id,
      chatroom_id: context.chatroom_id,
    };

    // === 🛠️ Non-intrusive Response Augmentation ===
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (typeof body === 'object') {
        body.gaugeMetrics = res.locals.gaugeMetrics;
      }
      originalJson(body);
    };

    next();

  } catch (error) {
    // === 🚨 Error Handling ===
    console.error("❌ Error appending gauge metrics:", error);

    // Optional: Log error to Supabase for tracking
    await supabaseRequest(() =>
      supabase.from('debug_logs').insert([
        {
          user_id: req.userId || "system",
          context_id: "metricsMiddleware",
          issue: "Gauge Metrics Error",
          resolution: error.message,
          timestamp: new Date().toISOString(),
        }
      ])
    );

    res.locals.gaugeMetrics = {};
    next();
  }
};
