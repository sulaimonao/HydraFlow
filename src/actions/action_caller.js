// src/actions/action_caller.js
import axios from 'axios';
import { calculateMetrics } from "../util/metrics.js";
import { generateResponse } from './response_generator_actions.js';
import { setSessionContext, createSession } from '../../lib/supabaseClient.js';  // ✅ Added createSession for session checks
import { setSessionContext } from '../../lib/sessionUtils.js';

// 🔄 Retry logic for API calls with session context
async function callApiWithRetry(endpoint, payload, req, retries = 3, backoff = 300) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // ✅ Ensure the session exists before making the API call
      await createSession(req.session.userId, req.session.chatroomId);
      await setSessionContext(req.session.userId, req.session.chatroomId);

      const response = await axios.post(endpoint, {
        ...payload,
        userId: req.session.userId,
        chatroomId: req.session.chatroomId,  // 🔒 Attach user and chatroom IDs from session
      });

      return response.data;
    } catch (error) {
      if (attempt < retries && shouldRetry(error)) {
        console.warn(`⚠️ API call failed (Attempt ${attempt}). Retrying in ${backoff * attempt}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff * attempt));
      } else {
        console.error(`❌ API call failed after ${attempt} attempts:`, error.message);
        throw error;
      }
    }
  }
}

// 🔍 Detect if the error is recoverable
function shouldRetry(error) {
  return !error.response || (error.response.status >= 500 && error.response.status < 600);
}

export { callApiWithRetry };

// 🎯 Centralized action dispatcher with persistent session context
async function callAction(action, payload, req) {

  // Validate session
  if (!req.session.userId || !req.session.chatroomId) {
    throw new Error("Missing userId or chatroomId in session.");
  }  

  switch (action) {
    case 'generate_response':
      return await generateResponse(payload, context);

    case "fetch_gauge_metrics":
      return calculateMetrics(context);

    case "compress_memory":
      // ✅ Memory compression with context enforcement
      return await callApiWithRetry('/api/compress-memory', payload, req);

    case "create_subpersona":
      // ✅ Persona creation with context enforcement
      return await callApiWithRetry('/api/create-subpersona', payload, req);

    default:
      throw new Error(`❌ Unknown action: ${action}`);
  }
}

export { callAction };
