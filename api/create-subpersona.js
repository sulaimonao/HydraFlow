const { createHead } = require('../src/actions/subpersona_creator');

module.exports = async (req, res) => {
  try {
    const { task, description } = req.body;
    const result = createHead(task, description);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    res.status(500).json({ error: "Failed to create sub-persona." });
  }
};
