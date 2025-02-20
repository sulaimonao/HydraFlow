// api/fetch-gauge-metrics.js (Local SQLite Version - Minimal Changes)
import express from "express";
import { calculateMetrics } from "../src/util/metrics.js";
// Removed supabase imports
//import { supabase, supabaseRequest } from '../lib/db.js';
//Removed setSessionContext import
//import { setSessionContext } from '../lib/sessionUtils.js';
import { sessionContext } from '../middleware/sessionContext.js';

const router = express.Router();

// Added session context middleware
router.post('/', sessionContext, async (req, res) => {
    try {
        const { userId, chatroomId } = req.session;
        // Removed setSessionContext call
        //await setSessionContext(userId, chatroomId);

        const { query, memory, feedback, tokenCount } = req.body;

        // ✅ Validate input
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: "Invalid or missing 'query' parameter." });
        }

        // 🔍 Retrieve metric type
        const metricType = req.query.metricType || 'default';
        console.log(`📊 Fetching gauge metrics for type: ${metricType}`);

        let { tokenUsage, responseLatency, activeSubpersonas } = req.body;

        // 🔄 Retrieve token usage if not provided
        if (!tokenUsage) {
          // Ensure calculateMetrics can be called with these arguments
            tokenUsage = await calculateMetrics(query, memory, feedback, tokenCount);
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
        // Ensure that calculateMetrics is used correctly.
        const metrics = calculateMetrics(context);

        // 📝 Enrich metrics with additional data
        const enrichedMetrics = {
            ...metrics,
            totalSubpersonas: activeSubpersonas.length,
            metricType,
            user_id: userId,
            chatroom_id: chatroomId
        };

        // ✅ Return metrics
        res.status(200).json(enrichedMetrics);

    } catch (error) {
        console.error("❌ Error in fetch-gauge-metrics handler:", error);
        res.status(500).json({ error: "Failed to fetch gauge metrics.", details: error.message });
    }
});

export default router;