const { parseQuery } = require('../src/actions/query_parser');

module.exports = async (req, res) => {
  try {
    const { query } = req.body;
    const result = parseQuery(query);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in parse-query:", error);
    res.status(500).json({ error: "Failed to parse query." });
  }
};
