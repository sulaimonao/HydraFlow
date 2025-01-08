// api/create-subpersona.js

export default async (req, res) => {
  try {
    const { task, description, triggerCondition, capabilities, preferences, user_id, chatroom_id } = req.body;

    // Input validation
    if (!task || !description) {
      return res.status(400).json({ error: "Task and description are required." });
    }

    // Generate unique sub-persona name
    const timestamp = Date.now();
    const subPersonaName = `${task.replace(/ /g, "").toLowerCase()}_${timestamp}`;

    // Construct sub-persona data
    const subPersonaData = {
      name: subPersonaName,
      status: "active",
      createdat: new Date(timestamp).toISOString(),
      capabilities: capabilities || {}, // Default to empty object
      preferences: preferences || {}, // Default to empty object
      user_id: user_id || null,
      chatroom_id: chatroom_id || null,
    };

    // Database insertion query
    const query = `
      INSERT INTO heads (name, status, createdat, capabilities, preferences, user_id, chatroom_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      subPersonaData.name,
      subPersonaData.status,
      subPersonaData.createdat,
      JSON.stringify(subPersonaData.capabilities),
      JSON.stringify(subPersonaData.preferences),
      subPersonaData.user_id,
      subPersonaData.chatroom_id,
    ];

    // Execute query (assuming `db` is your database client)
    const result = await db.query(query, values);

    // Return success response with created sub-persona
    return res.status(200).json({
      message: "Sub-persona created successfully.",
      subPersona: result.rows[0],
    });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    return res.status(500).json({ error: "Failed to create sub-persona. Please try again." });
  }
};
