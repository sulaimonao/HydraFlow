// api/summarize-logs.js
import winston from "winston";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { logs } = req.body;

      if (!logs) {
        return res.status(400).json({ error: "Logs are required." });
      }

      // Set up the logger
      const logger = winston.createLogger({
        level: "info",
        format: winston.format.json(),
        transports: [new winston.transports.Console()],
      });

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

      // Log the analysis
      logger.info("Logs analyzed", summaryReport);

      // Fallback for gauge metrics
      const gaugeMetrics = res.locals.gaugeMetrics || {};

      res.status(200).json({
        summaryReport,
        gaugeMetrics, // Include gauge metrics in the response
        message: "Logs summarized successfully.",
      });
    } catch (error) {
      console.error("Error in summarize-logs:", error);
      res.status(500).json({ error: "Failed to summarize logs." });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
