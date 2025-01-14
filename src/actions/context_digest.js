// src/actions/context_digest.js
import { setSessionContext } from '../../lib/supabaseClient.js';  // ✅ Import for session context

/**
 * Generates a context digest summarizing memory data.
 * @param {Array} memory - The memory data to summarize.
 * @param {string} user_id - The user ID for session context.
 * @param {string} chatroom_id - The chatroom ID for session context.
 * @returns {Object|string} - A digest summary or an error message.
 */
export const generateContextDigest = async (memory, user_id, chatroom_id) => {
  try {
    // ✅ Validate user_id and chatroom_id
    if (!user_id || !chatroom_id) {
      throw new Error("Missing user_id or chatroom_id for context digest generation.");
    }

    // 🔒 Set session context for RLS compliance
    await setSessionContext(user_id, chatroom_id);

    // ⚠️ Handle empty memory
    if (!memory || memory.length === 0) {
      return "No memory available to summarize.";
    }

    // 📝 Generate digest summary
    const digest = {
      user_id,         // ✅ Include user ID for tracking
      chatroom_id,     // ✅ Include chatroom ID for tracking
      totalEntries: memory.length,
      highlights: memory.slice(0, 3),  // 📌 First 3 entries as highlights
      generatedAt: new Date().toISOString(),  // ⏰ Timestamp for reference
    };

    return digest;
  } catch (error) {
    console.error("Error generating context digest:", error);
    return `Failed to generate context digest: ${error.message}`;
  }
};
