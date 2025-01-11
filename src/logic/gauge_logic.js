// src/logic/gauge_logic.js
import os from 'os';
import { performance } from 'perf_hooks';
import supabase, { supabaseRequest } from '../../lib/supabaseClient.js';

// Collect system metrics
export const gatherSystemMetrics = () => {
    const memoryUsage = process.memoryUsage();
    const cpuLoad = os.loadavg();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();

    return {
        memoryUsage: {
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external,
        },
        cpuLoad,
        freeMemory,
        totalMemory,
    };
};

// Track response time for API calls
export const trackResponseTime = async (start, end) => {
    const duration = end - start;

    try {
        await supabaseRequest(supabase
            .from('api_metrics')
            .insert([{ endpoint: '/api/gauge', response_time: duration }])
        );

        console.log(`Tracked response time: ${duration}ms`);
    } catch (error) {
        console.error('Error tracking response time:', error);
    }
};

// Gather metrics and track performance
export const collectGaugeMetrics = async () => {
    const startTime = performance.now();

    const systemMetrics = gatherSystemMetrics();

    const dbMetrics = await supabaseRequest(
        supabase.rpc('get_current_db_metrics')
    );

    const metrics = {
        systemMetrics,
        dbMetrics,
        timestamp: new Date().toISOString(),
    };

    const endTime = performance.now();
    await trackResponseTime(startTime, endTime);

    return metrics;
};

// Alias function to fix import issues
export const gatherGaugeData = async () => {
    return await collectGaugeMetrics();
};
