// api/summarize-logs.js
import { summarizeLogs } from "../src/actions/logs_summarizer.js";
import { logInfo, logError } from "../src/util/logger.js";

export default async (req, res) => {
  try {
    const { logs } = req.body;

    if (!logs || typeof logs !== "string") {
      logError("Invalid logs input.");
      return res.status(400).json({ error: "A valid logs string is required." });
    }

    logInfo("Summarizing logs.");
    const summaryReport = await summarizeLogs(logs);

    logInfo("Logs summarized successfully.");
    res.status(200).json({ summaryReport, message: "Logs summarized successfully." });
  } catch (error) {
    logError(`Error in summarize-logs: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};
