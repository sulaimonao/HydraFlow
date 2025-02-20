// src/actions/action_caller.js (Local SQLite Version)
import axios from 'axios';
import { calculateMetrics } from "../util/metrics.js";
import { generateResponse } from './response_generator_actions.js';
// Removed setSessionContext import
//import { setSessionContext } from '../../lib/sessionUtils.js';

// 🔄 Retry logic for API calls (Simplified - No setSessionContext)
async function callApiWithRetry(endpoint, payload, req, retries = 3, backoff = 300) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // ✅ No need to call setSessionContext - handled by middleware

            // Use a relative path for local API calls
            const fullEndpoint = `http://localhost:${process.env.PORT || 3000}${endpoint}`;

            const response = await axios.post(fullEndpoint, { // Use the full URL
                ...payload,
                // No need to pass these. req.session is available in the route handlers.
                // userId: req.session.userId,
                // chatroomId: req.session.chatroomId,
            }, {
                headers: {
                    'x-hydra-session-id': req.headers['x-hydra-session-id'] // Pass session ID
                }
            });

            return response.data;
        } catch (error) {
            if (attempt < retries && shouldRetry(error)) {
                console.warn(`⚠️ API call failed (Attempt ${attempt}). Retrying in ${backoff * attempt}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff * attempt));
            } else {
                console.error(`❌ API call failed after ${attempt} attempts:`, error);
                throw error; // Re-throw the error to be caught by the caller
            }
        }
    }
}

// 🔍 Detect if the error is recoverable
function shouldRetry(error) {
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
}


// 🎯 Centralized action dispatcher
async function callAction(action, payload, req) {

    // Validate session (still needed, but simplified)
    if (!req.session || !req.session.userId || !req.session.chatroomId) {
        throw new Error("Missing userId or chatroomId in session.");
    }

    switch (action) {
        case 'generate_response':
            // Assuming generateResponse can now access req.session directly if needed
            return await generateResponse(payload, req); // Pass req

        case "fetch_gauge_metrics":
              // Assuming calculateMetrics does NOT need database access, or it uses ../util/metrics.js
            return calculateMetrics(payload); // What is context? Assuming it is payload

        case "compress_memory":
            return await callApiWithRetry('/api/compress-memory', payload, req);

        case "create_subpersona":
            return await callApiWithRetry('/api/create-subpersona', payload, req);

        default:
            throw new Error(`❌ Unknown action: ${action}`);
    }
}

export { callAction, callApiWithRetry };