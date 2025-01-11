// api/create-subpersona.js
import { createSubpersona } from '../actions/subpersona_creator.js';
import { v4 as uuidv4 } from 'uuid';

const handleCreateSubpersona = async (req, res) => {
  try {
    const { name, capabilities, preferences, user_id, chatroom_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Subpersona name is required.' });
    }

    const generatedUserId = user_id || uuidv4();
    const generatedChatroomId = chatroom_id || uuidv4();

    // Use the imported createSubpersona for database logic
    const result = await createSubpersona(
      name,
      generatedUserId,
      generatedChatroomId,
      capabilities,
      preferences
    );

    if (result.error) {
      throw new Error(result.error);
    }

    res.status(200).json({ message: 'Subpersona created successfully.', data: result });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: error.message });
  }
};

export default handleCreateSubpersona;
