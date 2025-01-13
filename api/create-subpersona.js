// api/create-subpersona.js

import { createSubpersona } from '../src/actions/subpersona_creator.js';
import { v4 as uuidv4 } from 'uuid';

// Handles the creation of a new subpersona
const handleCreateSubpersona = async (req, res) => {
  try {
    // Extract relevant data from the request body
    const { name, capabilities, preferences, user_id, chatroom_id } = req.body;

    // Validate that the subpersona name is provided
    if (!name) {
      return res.status(400).json({ error: 'Subpersona name is required.' });
    }

    // Ensure user_id and chatroom_id are provided or generate new ones if missing
    const generatedUserId = user_id || uuidv4();  // Generate a new UUID if user_id is missing
    const generatedChatroomId = chatroom_id || uuidv4();  // Generate a new UUID if chatroom_id is missing

    // Validate that both user_id and chatroom_id are present after generation
    if (!generatedUserId || !generatedChatroomId) {
      return res.status(400).json({ error: 'Missing user_id or chatroom_id. These must be provided.' });
    }

    // Use the createSubpersona function to handle database logic for subpersona creation
    const result = await createSubpersona(
      name,
      generatedUserId,
      generatedChatroomId,
      capabilities,
      preferences
    );

    // Handle any errors returned from the database operation
    if (result.error) {
      throw new Error(result.error);
    }

    // Respond with success if the subpersona was created successfully
    res.status(200).json({ message: 'Subpersona created successfully.', data: result });
  } catch (error) {
    // Log and return any errors that occur during the process
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: error.message });
  }
};

export default handleCreateSubpersona;
