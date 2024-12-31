// util/logger.js
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // Set log level dynamically
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp
    winston.format.json() // Format logs as JSON
  ),
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === "production"
      ? [new winston.transports.File({ filename: "app.log" })]
      : []), // Add file logging for production
  ],
});

// Log informational messages
export function logInfo(message, meta = {}) {
  logger.info({ message, ...meta });
}

// Log warning messages
export function logWarn(message, meta = {}) {
  logger.warn({ message, ...meta });
}

// Log error messages
export function logError(message, meta = {}) {
  logger.error({ message, ...meta });
}

// Log debug messages
export function logDebug(message, meta = {}) {
  if (process.env.NODE_ENV === "development") {
    logger.debug({ message, ...meta });
  }
}

// Log database queries
export function logDbQuery(queryDetails, results, meta = {}) {
  logger.info({
    message: "Database query executed",
    queryDetails,
    results,
    ...meta,
  });
}

// Log with request context
export function logWithContext(level, message, context = {}) {
  logger.log(level, { message, ...context });
}
