// api/context-recap.js
import supabase, { supabaseRequest } from '../lib/supabaseClient.js';
import { validateUserAndChatroom } from '../middleware/authMiddleware.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { history, compressedMemory, additionalNotes, user_id, chatroom_id } = req.body;

    // Validate user_id and chatroom_id
    if (!validateUserAndChatroom(user_id, chatroom_id)) {
      return res.status(403).json({ error: "Invalid user_id or chatroom_id." });
    }

    // Validate required inputs
    if (!compressedMemory || !history) {
      return res.status(400).json({ error: "Both 'history' and 'compressedMemory' are required." });
    }

    if (additionalNotes && typeof additionalNotes !== 'string') {
      return res.status(400).json({ error: "'additionalNotes' must be a string if provided." });
    }

    const recap = `
      === Context Recap ===
      User ID: ${user_id}
      Chatroom ID: ${chatroom_id}

      Compressed Memory:
      ${compressedMemory}

      Conversation History:
      ${history}

      ${additionalNotes ? `Additional Notes:
      ${additionalNotes}
` : ''}
    `;

    // Fallback for gauge metrics
    const gaugeMetrics = res.locals?.gaugeMetrics || {}; // Default to empty object if undefined

    // Log a warning if gauge metrics are missing
    if (!res.locals?.gaugeMetrics) {
      console.warn("Warning: gaugeMetrics is missing. Using default values.");
    }

    res.status(200).json({
      recap: recap.trim(),
      gaugeMetrics, // Include gauge metrics in the response
    });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
