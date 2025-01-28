// src/util/helpers.js

import { validate as validateUUID } from 'uuid';

/**
 * Capitalizes the first letter of a string.
 * @param {string} string - The string to capitalize.
 * @returns {string}
 */
export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Checks if an object is empty.
 * @param {object} obj - The object to check.
 * @returns {boolean}
 */
export function isEmptyObject(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * Pauses execution for a specified number of milliseconds.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validates that both req.session.userId and req.session.chatroomId are provided.
 * @param {object} req - The request object.
 * @returns {boolean}
 */
export function validateUserAndChatroom(req) {
  if (!req.session.userId || !req.session.chatroomId) {
    console.error("⚠️ Missing req.session.userId or req.session.chatroomId.");
    return false;
  }
  return true;
}

/**
 * Merges two objects, giving priority to non-null values in the source.
 * @param {object} target - The target object.
 * @param {object} source - The source object.
 * @returns {object}
 */
export function mergeObjects(target, source) {
  return { ...target, ...Object.fromEntries(Object.entries(source).filter(([_, v]) => v != null)) };
}

/**
 * Validates a UUID.
 * @param {string} uuid - The UUID to validate.
 * @returns {boolean}
 */
export function isValidUUID(uuid) {
  return validateUUID(uuid);
}
