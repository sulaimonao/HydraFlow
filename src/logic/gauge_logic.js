// src/logic/gauge_logic.js
import os from 'os';
import { performance } from 'perf_hooks';
import supabase, { supabaseRequest } from '../../lib/supabaseClient.js';
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
 * @param {string} user_id - User ID for tracking.
 * @param {string} chatroom_id - Chatroom ID for context.
 */
export const trackResponseTime = async (start, end, user_id, chatroom_id) => {
    if (!user_id || !chatroom_id) {
        logError("❗ Missing user_id or chatroom_id for response time tracking.");
        return;
    }

    const duration = end - start;

    try {
        await supabaseRequest(
            supabase.from('api_metrics').insert([{
                endpoint: '/api/gauge',
                response_time: duration,
                user_id,
                chatroom_id,
                recorded_at: new Date().toISOString()
            }])
        );

        logInfo(`📊 Tracked response time: ${duration.toFixed(2)}ms for user: ${user_id}, chatroom: ${chatroom_id}`);
    } catch (error) {
        logError(`❌ Error tracking response time: ${error.message}`);
    }
};

/**
 * 📈 Collect system and database metrics, track performance, and associate with user context.
 * @param {object} req - Express request object containing user and chatroom IDs.
 */
export const collectGaugeMetrics = async (req) => {
    const { user_id, chatroom_id } = req.session;
    if (!user_id || !chatroom_id || !req.session) {
        throw new Error("❗ Missing user_id or chatroom_id for gauge metrics collection.");
    }

    const startTime = performance.now();

    try {
        // 📊 Gather system-level metrics
        const systemMetrics = gatherSystemMetrics();

        // 🗃️ Fetch database metrics via RPC
        const { data: dbMetrics, error: dbError } = await supabaseRequest(
            supabase.rpc('get_current_db_metrics')
        );

        if (dbError) {
            logError(`⚠️ Error fetching DB metrics: ${dbError.message}`);
        }

        const metrics = {
            systemMetrics,
            dbMetrics: dbMetrics || {},
            user_id,
            chatroom_id,
            timestamp: new Date().toISOString(),
        };

        const endTime = performance.now();
        await trackResponseTime(startTime, endTime, user_id, chatroom_id);

        logInfo(`✅ Gauge metrics collected for user: ${user_id}, chatroom: ${chatroom_id}`);
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

