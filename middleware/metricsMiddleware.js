// middleware/metricsMiddleware.js (Local SQLite Version - Minimal Changes)

import { calculateMetrics } from "../src/util/metrics.js";
import { generateRecommendations } from "../src/util/recommendations.js";
// Removed supabase imports
//import { supabase, supabaseRequest } from '../lib/db.js';
// Removed setSessionContext import
//import { setSessionContext } from '../lib/sessionUtils.js';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';

/**
 * Middleware to append gauge metrics to the response.
 */
export async function appendGaugeMetrics(req, res, next) { // Made async
    console.log('🔍 Checking sessionContext middleware execution...');
    try {
        if (!req.session || !req.session.userId || !req.session.chatroomId) {
            throw new Error("❗ Session context is missing");
        }

        // 🔒 Removed setSessionContext call
        //await setSessionContext(req.session.userId, req.session.chatroomId);

        res.locals.gaugeMetrics = {
            responseTime: 0, // You might want to calculate this dynamically
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // Convert to MB
        };

        console.log(`🔍 req.session content: ${JSON.stringify(req.session)}`);
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