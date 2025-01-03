// api/parse-query.js
import { parseQuery } from "../src/actions/query_parser.js";
import { logInfo, logError } from "../src/util/logger.js";

export default async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      logError("Invalid query string received.");
      return res.status(400).json({ error: "A valid query string is required." });
    }

    logInfo(`Parsing query: ${query}`);
    const parsedData = parseQuery(query);

    logInfo("Query parsed successfully.");
    res.status(200).json({ ...parsedData, message: "Query parsed successfully." });
  } catch (error) {
    logError(`Error in parse-query: ${error.message}`);
    res.status(500).json({ error: "Failed to parse query." });
  }
};
