// src/util/logger.js (Local SQLite Version - Minor Changes)

import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

export default logger;

/**
 * Generates a timestamp for log entries.
 * @returns {string} - Current ISO timestamp.
 */
function timestamp() {
    return new Date().toISOString();
}

/**
 * Formats context data for logs.  Handles cases where req or req.session is undefined.
 * @param {object} req - The request object.
 * @returns {string} - Formatted context string.
 */
function formatContext(req) {
    if (req && req.session && req.session.userId && req.session.chatroomId) {
        return ` | user_id: ${req.session.userId} | chatroom_id: ${req.session.chatroomId}`;
    }
    return ''; // Return empty string if session data is missing
}

/**
 * Logs informational messages.
 * @param {string} message - The log message.
 * @param {object} [req] - The request object (optional).  Contains session data.
 */
export function logInfo(message, req) {
    console.log(`[INFO] ${timestamp()}: ${message}${formatContext(req)}`);
}

/**
 * Logs error messages.
 * @param {string} message - The error message.
 * @param {object} [req] - The request object (optional). Contains session data.
 */
export function logError(message, req) {
    console.error(`[ERROR] ${timestamp()}: ${message}${formatContext(req)}`);
}

/**
 * Logs debug messages only in development mode.
 * @param {string} message - The debug message.
 * @param {object} [req] - The request object (optional). Contains session data.
 */
export function logDebug(message, req) {
    if (process.env.NODE_ENV === 'development') {
        console.debug(`[DEBUG] ${timestamp()}: ${message}${formatContext(req)}`);
    }
}