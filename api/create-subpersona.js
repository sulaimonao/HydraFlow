import supabase, { supabaseRequest } from '../lib/supabaseClient.js';
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

    // Generate new UUIDs if user_id or chatroom_id are missing
    const generatedUserId = user_id || uuidv4();  
    const generatedChatroomId = chatroom_id || uuidv4();  

    // Insert the new subpersona into the 'heads' table
    const { data, error } = await supabase
      .from('heads')
      .insert([
        {
          name,
          user_id: generatedUserId,      // ✅ Directly referencing user_id
          chatroom_id: generatedChatroomId,  // ✅ Directly referencing chatroom_id
          capabilities,
          preferences,
          status: 'active',
          createdat: new Date().toISOString(),
        }
      ])
      .select(); // Optional: retrieve inserted data

    // Handle any errors returned from the database operation
    if (error) {
      console.error('Database Error:', error);
      throw new Error(`Failed to create subpersona: ${error.message}`);
    }

    // Respond with success if the subpersona was created successfully
    res.status(200).json({ message: 'Subpersona created successfully.', data });
  } catch (error) {
    // Log and return any errors that occur during the process
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: error.message });
  }
};

export default handleCreateSubpersona;
