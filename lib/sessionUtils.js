// lib/sessionUtils.js
import supabase from './supabaseClient.js';
import { withRetry } from './supabaseClient.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export const setSessionContext = async (user_id, chatroom_id) => {
  if (!user_id || !chatroom_id) {
    console.error("❌ Missing user_id or chatroom_id when setting session context");
    throw new Error("❌ user_id and chatroom_id must be provided and cannot be null.");
  }

  console.log(`🔐 Setting session context for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
  
  try {
    await withRetry(() => supabase.rpc('set_rls_context', { user_id, chatroom_id }));
    console.log(`✅ Session context set for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
  } catch (error) {
    logger.error(`❌ Failed to set session context: ${error.message}`);
    throw new Error("Session context setting failed: " + error.message);
  }
};

export const getSessionDetails = async () => {
  // Ensure session details are retrieved before function calls
  const user_id = "mock-user-id-123";  // Replace with actual session retrieval logic
  const chatroom_id = "mock-chatroom-id-456";
  console.log(`📌 Retrieved session details - user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
  return { user_id, chatroom_id };
};

// lib/db.js
import supabase, { supabaseRequest } from './supabaseClient.js';
import { setSessionContext, getSessionDetails } from './sessionUtils.js';

export async function fetchTaskCards(userId, chatroomId) {
  if (!userId || !chatroomId) {
    console.warn("⚠️ userId or chatroomId is missing. Attempting to retrieve session details.");
    const session = await getSessionDetails();
    userId = session.user_id;
    chatroomId = session.chatroom_id;
  }
  console.log(`📌 Debug: fetchTaskCards called with user_id=${userId}, chatroom_id=${chatroomId}`);

  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context confirmed for fetchTaskCards`);
    
    const { data, error } = await supabase.from('task_cards').select('*').eq('user_id', userId).eq('chatroom_id', chatroomId);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error fetching task cards: ", error.message);
    throw new Error("Failed to fetch task cards: " + error.message);
  }
}
