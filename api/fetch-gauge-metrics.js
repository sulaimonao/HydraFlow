// api/fetch-gauge-metrics.js
import { calculateMetrics } from '../src/util/metrics.js';
import supabase, { supabaseRequest, setSessionContext } from '../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

export default async function handler(req, res) {
  try {
    const { query } = req.body;
    const workflowContext = await orchestrateContextWorkflow({ query, req });
    const persistentUserId = workflowContext.generatedIdentifiers.user_id;
    const persistentChatroomId = workflowContext.generatedIdentifiers.chatroom_id;

    await setSessionContext(persistentUserId, persistentChatroomId);

    const metricType = req.query.metricType || 'default';
    let { tokenUsage, responseLatency, activeSubpersonas } = req.body;

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

      if (error || !data) {
        console.warn("Token usage not found. Using default values.");
        tokenUsage = { used: 0, total: 10000 };
      } else {
        tokenUsage = { used: data.token_used, total: data.token_total };
      }
    }

    responseLatency = responseLatency || 0.5;
    activeSubpersonas = activeSubpersonas || [];

    const context = {
      tokenUsage,
      responseLatency,
      activeSubpersonas,
    };

    const metrics = calculateMetrics(context);

    const enrichedMetrics = {
      ...metrics,
      totalSubpersonas: activeSubpersonas.length,
      metricType,
      user_id: persistentUserId,
      chatroom_id: persistentChatroomId
    };

    res.status(200).json(enrichedMetrics);
  } catch (error) {
    console.error("Error fetching gauge metrics:", error);
    res.status(500).json({ error: error.message });
  }
}
