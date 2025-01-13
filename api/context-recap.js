// api/context-recap.js

import supabase, { supabaseRequest } from '../lib/supabaseClient.js';
import { validateUserAndChatroom } from '../middleware/authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';  // Import UUID for consistent ID handling

export default async function handler(req, res) {
  // Ensure the request method is POST
  if (req.method === 'POST') {
    const { history, compressedMemory, additionalNotes, user_id, chatroom_id } = req.body;

    /**
     * **UUID Generation for Missing IDs:**
     * Generate new UUIDs if user_id or chatroom_id are missing.
     */
    const generatedUserId = user_id || uuidv4();
    const generatedChatroomId = chatroom_id || uuidv4();

    /**
     * **Validation of User and Chatroom IDs:**
     * Use middleware to confirm that the provided/generated IDs are valid.
     */
    if (!validateUserAndChatroom(generatedUserId, generatedChatroomId)) {
      return res.status(403).json({ error: "Invalid user_id or chatroom_id." });
    }

    /**
     * **Input Validation:**
     * Ensure that 'history' and 'compressedMemory' are provided.
     */
    if (!compressedMemory || !history) {
      return res.status(400).json({ error: "Both 'history' and 'compressedMemory' are required." });
    }

    // Ensure that 'additionalNotes' is a string if provided
    if (additionalNotes && typeof additionalNotes !== 'string') {
      return res.status(400).json({ error: "'additionalNotes' must be a string if provided." });
    }

    /**
     * **Context Recap Construction:**
     * Build a recap of the current context including memory, history, and any additional notes.
     */
    const recap = `
      === Context Recap ===
      User ID: ${generatedUserId}
      Chatroom ID: ${generatedChatroomId}

      Compressed Memory:
      ${compressedMemory}

      Conversation History:
      ${history}

      ${additionalNotes ? `Additional Notes:\n${additionalNotes}\n` : ''}
    `;

    /**
     * **Gauge Metrics Handling:**
     * Safely retrieve gauge metrics, defaulting to an empty object if missing.
     */
    const gaugeMetrics = res.locals?.gaugeMetrics || {};

    // Log a warning if gauge metrics are missing for debugging
    if (!res.locals?.gaugeMetrics) {
      console.warn("Warning: gaugeMetrics is missing. Using default values.");
    }

    /**
     * **Response Delivery:**
     * Return the generated recap along with gauge metrics.
     */
    res.status(200).json({
      recap: recap.trim(),
      gaugeMetrics,
      user_id: generatedUserId,
      chatroom_id: generatedChatroomId
    });

  } else {
    // Handle unsupported HTTP methods
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
