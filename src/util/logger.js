// util/logger.js
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export function logInfo(message) {
  logger.info({ message });
}

export function logError(message) {
  logger.error({ message });
}

export function logDebug(message) {
  if (process.env.NODE_ENV === "development") {
    logger.debug({ message });
  }
}

export function logDbQuery(queryDetails, results) {
  logger.info({
    message: "Database query executed",
    queryDetails,
    results,
  });
}
