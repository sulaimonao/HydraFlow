// lib/sessionUtils.js
import { supabase, withRetry } from './db.js';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

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
  // Generate unique session details
  const user_id = uuidv4();
  const chatroom_id = uuidv4();
  console.log(`📌 Retrieved session details - user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
  return { user_id, chatroom_id };
};
