// src/actions/context_digest.js (Local SQLite Version)
// Removed Supabase and sessionUtils imports
//import { createSession } from '../../lib/supabaseClient.js';
//import { setSessionContext } from '../../lib/sessionUtils.js';

/**
 * Generates a context digest summarizing memory data.
 * @param {Array} memory - The memory data to summarize.
 * @param {object} req - The request object, containing session data.
 * @returns {Object|string} - A digest summary or an error message.
 */
export const generateContextDigest = async (memory, req) => {
  try {
      // ✅ Validate user_id and chatroom_id (Simplified)
      if (!req.session || !req.session.userId || !req.session.chatroomId) {
          throw new Error("❌ Missing user_id or chatroom_id for context digest generation.");
      }

      // ✅ No need to call createSession or setSessionContext - handled by middleware

      // ⚠️ Handle empty memory
      if (!memory || memory.length === 0) {
          console.warn("⚠️ No memory provided for digest.");
          return "No memory available to summarize.";
      }

      // 📝 Generate digest summary
      const digest = {
          user_id: req.session.userId,
          chatroom_id: req.session.chatroomId,
          totalEntries: memory.length,
          highlights: memory.slice(0, 3),  // 📌 First 3 entries as highlights
          generatedAt: new Date().toISOString(),  // ⏰ Timestamp for reference
      };

      console.log(`✅ Context digest generated for user_id: ${req.session.userId}, chatroom_id: ${req.session.chatroomId}`);
      return digest;

  } catch (error) {
      console.error("❌ Error generating context digest:", error);
      return `Failed to generate context digest: ${error.message}`;
  }
};