// src/logic/gauge_logic.js (Local SQLite Version)
import os from 'os';
import { performance } from 'perf_hooks';
// Removed Supabase imports
//import { supabase, supabaseRequest } from '../lib/db.js';
import * as db from '../lib/db.js'; // Import SQLite db module
import { logInfo, logError } from '../util/logger.js';

/**
 * 🔍 Collect system metrics: memory, CPU load, and uptime.
 */
export const gatherSystemMetrics = () => {
    const memoryUsage = process.memoryUsage();
    const cpuLoad = os.loadavg();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();

    return {
        memoryUsage: {
            rss: memoryUsage.rss,          // Resident Set Size
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external,
        },
        cpuLoad,
        freeMemory,
        totalMemory,
        uptime: process.uptime(),
    };
};

/**
 * ⏳ Track API response times and associate them with user context.
 * @param {number} start - Start time.
 * @param {number} end - End time.
 * @param {string} userId - User ID for tracking.
 * @param {string} chatroomId - Chatroom ID for context.
 */
export const trackResponseTime = async (start, end, userId, chatroomId) => {
    if (!userId || !chatroomId) {
        logError("❗ Missing user_id or chatroom_id for response time tracking.");
        return;
    }

    const duration = end - start;

    try {
        // Use db.insertApiMetric (You'll need to implement this in lib/db.js)
        await db.insertApiMetric(userId, chatroomId, '/api/gauge', duration);

        logInfo(`📊 Tracked response time: ${duration.toFixed(2)}ms for user: ${userId}, chatroom: ${chatroomId}`);
    } catch (error) {
        logError(`❌ Error tracking response time: ${error.message}`);
    }
};

/**
 * 📈 Collect system and database metrics, track performance, and associate with user context.
 * @param {object} req - Express request object containing user and chatroom IDs.
 */
export const collectGaugeMetrics = async (req) => {
    const { userId, chatroomId } = req.session; // Destructure from req.session
    if (!userId || !chatroomId || !req.session) {
        throw new Error("❗ Missing user_id or chatroom_id for gauge metrics collection.");
    }

    const startTime = performance.now();

    try {
        // 📊 Gather system-level metrics
        const systemMetrics = gatherSystemMetrics();

        // 🗃️  NO Supabase RPC.  Get DB metrics locally if possible.
        //      If you *can't* get DB metrics locally, you might remove this part.
        // const { data: dbMetrics, error: dbError } = await supabaseRequest(
        //   supabase.rpc('get_current_db_metrics')
        // );
        //
        // if (dbError) {
        //   logError(`⚠️ Error fetching DB metrics: ${dbError.message}`);
        // }
        //
        // Replace with a placeholder or local equivalent, or remove entirely
        const dbMetrics = {};  // Placeholder - No local equivalent without significant effort

        const metrics = {
            systemMetrics,
            dbMetrics: dbMetrics, //  Empty object now
            user_id: userId,     // Use userId directly
            chatroom_id: chatroomId, // Use chatroomId directly
            timestamp: new Date().toISOString(),
        };

        const endTime = performance.now();
        await trackResponseTime(startTime, endTime, userId, chatroomId);

        logInfo(`✅ Gauge metrics collected for user: ${userId}, chatroom: ${chatroomId}`);
        return metrics;
    } catch (error) {
        logError(`❌ Error in collectGaugeMetrics: ${error.message}`);
        throw new Error('Failed to collect gauge metrics.');
    }
};

/**
 * 🔄 Alias function to maintain consistent import usage.
 * @param {object} req - Express request object containing user and chatroom IDs.
 */
export const gatherGaugeData = async (req) => {
    return await collectGaugeMetrics(req);
};