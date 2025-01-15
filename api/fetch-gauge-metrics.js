// api/fetch-gauge-metrics.js
import { calculateMetrics } from '../src/util/metrics.js';
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

export default async function handler(req, res) {
  try {
    const { query } = req.body;

    // ✅ Validate input
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: "Invalid or missing 'query' parameter." });
    }

    // 🌐 Safely retrieve persistent IDs
    let workflowContext;
    try {
      workflowContext = await orchestrateContextWorkflow({ query, req });
    } catch (workflowError) {
      console.error("❌ Workflow context retrieval failed:", workflowError);
      return res.status(500).json({ error: "Failed to retrieve workflow context." });
    }

    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    if (!persistentUserId || !persistentChatroomId) {
      return res.status(400).json({ error: 'Invalid user_id or chatroom_id.' });
    }

    // 🔒 Set session context
    await setSessionContext(persistentUserId, persistentChatroomId);

    // 🔍 Retrieve metric type
    const metricType = req.query.metricType || 'default';
    console.log(`📊 Fetching gauge metrics for type: ${metricType}`);

    let { tokenUsage, responseLatency, activeSubpersonas } = req.body;

    // 🔄 Retrieve token usage if not provided
    if (!tokenUsage) {
      const { data, error } = await supabaseRequest(
        () => supabase
          .from('gauge_metrics')
          .select('token_used, token_total')
          .eq('user_id', persistentUserId)
          .eq('chatroom_id', persistentChatroomId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      );

      if (error) {
        console.warn("⚠️ Token usage fetch failed. Defaulting values.");
        tokenUsage = { used: 0, total: 10000 };
      } else if (data) {
        tokenUsage = { used: data.token_used, total: data.token_total };
      } else {
        tokenUsage = { used: 0, total: 10000 };
      }
    }

    // ⏳ Set defaults for latency and subpersonas
    responseLatency = typeof responseLatency === 'number' ? responseLatency : 0.5;
    activeSubpersonas = Array.isArray(activeSubpersonas) ? activeSubpersonas : [];

    // 📈 Calculate metrics
    const context = {
      tokenUsage,
      responseLatency,
      activeSubpersonas,
    };

    const metrics = calculateMetrics(context);

    // 📝 Enrich metrics with additional data
    const enrichedMetrics = {
      ...metrics,
      totalSubpersonas: activeSubpersonas.length,
      metricType,
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId
    };

    // ✅ Return metrics
    res.status(200).json(enrichedMetrics);

  } catch (error) {
    console.error("❌ Error fetching gauge metrics:", error);
    res.status(500).json({ error: "Failed to fetch gauge metrics.", details: error.message });
  }
}
