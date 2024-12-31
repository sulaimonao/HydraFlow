// summarize-logs.js
import { logInfo, logError } from "../src/util/logger.js";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { logs } = req.body;

      // Validate input
      if (!logs || typeof logs !== "string") {
        return res.status(400).json({ error: "A valid logs string is required." });
      }

      // Analyze logs
      const errorPattern = /error|fail|exception/i;
      const errorCount = (logs.match(errorPattern) || []).length;

      // Summarize logs
      const totalEntries = logs.split("\n").length;
      const firstFiveLines = logs.split("\n").slice(0, 5).join("\n");

      const summaryReport = {
        totalEntries,
        errorCount,
        firstFiveLines: `${firstFiveLines}...`,
      };

      // Log the analysis summary
      logInfo("Logs analyzed successfully.", summaryReport);

      // Respond with the summary
      res.status(200).json({
        summaryReport,
        message: "Logs summarized successfully.",
      });
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logError(`Error in summarize-logs: ${error.message}`);
    res.status(500).json({ error: "Internal server error. Failed to summarize logs." });
  }
}
