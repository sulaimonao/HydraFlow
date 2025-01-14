// src/actions/context_recapper.js

import { callApiWithRetry } from './action_caller.js';
import { setSessionContext } from '../../lib/supabaseClient.js';

export async function contextRecap(history, compressedMemory, user_id, chatroom_id) {
  const endpoint = 'https://hydra-flow.vercel.app/api/context-recap';
  const payload = {
    history: JSON.stringify(history),
    compressedMemory: compressedMemory || ""
  };

  // Set session context for Supabase if used
  await setSessionContext(user_id, chatroom_id);

  // Automated summarization
  const summarizedHistory = summarizeHistory(history);
  payload.history = JSON.stringify(summarizedHistory);

  // Context validation
  const isValid = validateContextRecap(payload);
  if (!isValid) {
    throw new Error("Invalid context recap.");
  }

  return callApiWithRetry(endpoint, payload);
}
