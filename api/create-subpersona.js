// api/create-subpersona.js
import { createSubpersona } from '../src/actions/subpersona_creator.js';

const handleCreateSubpersona = async (req, res) => {
  try {
    const { name, capabilities, preferences } = req.body;
    const user_id = req.userId;       // Set by middleware
    const chatroom_id = req.chatroomId; // Set by middleware

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Subpersona name is required.' });
    }

    // Call the subpersona creation logic with authenticated IDs
    const result = await createSubpersona(
      name,
      user_id,
      chatroom_id,
      capabilities,
      preferences
    );

    // Check for errors from the database action
    if (result.error) {
      if (result.error.includes("RLS")) {
        return res.status(403).json({ error: "Access denied due to RLS policy. Check your permissions." });
      }
      throw new Error(result.error);
    }

    // Success response
    res.status(201).json({ message: 'Subpersona created successfully.', data: result });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: error.message });
  }
};

export default handleCreateSubpersona;
