//src/util/memoryUtils.js
import { logInfo, logError } from './logger.js';
import zlib from 'zlib';

/**
 * Compresses memory data with contextual logging.
 * @param {string} memory - Raw memory data.
 * @param {object} gaugeMetrics - System metrics for optimization.
 * @param {string} user_id - User identifier.
 * @param {string} chatroom_id - Chatroom identifier.
 * @returns {string} - Compressed memory string.
 */
export function compressMemory(memory, gaugeMetrics = {}, user_id = null, chatroom_id = null) {
  try {
    logInfo('Compressing memory...', user_id, chatroom_id);
    const compressed = zlib.gzipSync(memory).toString('base64');
    logInfo(`Memory compressed. Size reduced by ${calculateCompressionRate(memory, compressed)}%`, user_id, chatroom_id);
    return compressed;
  } catch (error) {
    logError(`Memory compression failed: ${error.message}`, user_id, chatroom_id);
    throw new Error('Failed to compress memory.');
  }
}

/**
 * Calculates token usage of memory data.
 * @param {string} memory - Memory data to analyze.
 * @param {string} user_id - User identifier.
 * @param {string} chatroom_id - Chatroom identifier.
 * @returns {object} - Token usage statistics.
 */
export function calculateTokenUsage(memory, user_id = null, chatroom_id = null) {
  try {
    logInfo('Calculating token usage...', user_id, chatroom_id);

    const tokenCount = memory.split(/\s+/).length;
    const estimatedTokenLimit = 8000;
    const remainingTokens = estimatedTokenLimit - tokenCount;

    const usageStats = {
      used: tokenCount,
      total: estimatedTokenLimit,
      remaining: Math.max(remainingTokens, 0),
      status: tokenCount > estimatedTokenLimit * 0.8 ? 'high' : 'normal'
    };

    logInfo(`Token usage: ${tokenCount}/${estimatedTokenLimit}`, user_id, chatroom_id);
    return usageStats;
  } catch (error) {
    logError(`Token usage calculation failed: ${error.message}`, user_id, chatroom_id);
    throw new Error('Failed to calculate token usage.');
  }
}

/**
 * Decompresses memory data.
 * @param {string} compressedMemory - Compressed memory string.
 * @param {string} user_id - User identifier.
 * @param {string} chatroom_id - Chatroom identifier.
 * @returns {string} - Decompressed memory.
 */
export function decompressMemory(compressedMemory, user_id = null, chatroom_id = null) {
  try {
    logInfo('Decompressing memory...', user_id, chatroom_id);
    const decompressed = zlib.gunzipSync(Buffer.from(compressedMemory, 'base64')).toString();
    logInfo('Memory decompressed successfully.', user_id, chatroom_id);
    return decompressed;
  } catch (error) {
    logError(`Memory decompression failed: ${error.message}`, user_id, chatroom_id);
    throw new Error('Failed to decompress memory.');
  }
}

/**
 * Validates memory data integrity.
 * @param {string} memory - Memory data to validate.
 * @param {string} user_id - User identifier.
 * @param {string} chatroom_id - Chatroom identifier.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateMemory(memory, user_id = null, chatroom_id = null) {
  try {
    logInfo('Validating memory...', user_id, chatroom_id);
    const isValid = typeof memory === 'string' && memory.trim().length > 0;
    if (!isValid) logError('Memory validation failed: Invalid format or empty content.', user_id, chatroom_id);
    return isValid;
  } catch (error) {
    logError(`Memory validation error: ${error.message}`, user_id, chatroom_id);
    return false;
  }
}

/**
 * Optimizes memory by cleaning up data.
 * @param {string} memory - Memory to optimize.
 * @param {string} user_id - User identifier.
 * @param {string} chatroom_id - Chatroom identifier.
 * @returns {string} - Optimized memory.
 */
export function optimizeMemory(memory, user_id = null, chatroom_id = null) {
  try {
    logInfo('Optimizing memory...', user_id, chatroom_id);
    const optimized = memory.replace(/\s+/g, ' ').trim();
    logInfo('Memory optimized successfully.', user_id, chatroom_id);
    return optimized;
  } catch (error) {
    logError(`Memory optimization failed: ${error.message}`, user_id, chatroom_id);
    throw new Error('Failed to optimize memory.');
  }
}

/**
 * Calculates compression percentage.
 * @param {string} original - Original memory data.
 * @param {string} compressed - Compressed memory data.
 * @returns {number} - Compression rate.
 */
function calculateCompressionRate(original, compressed) {
  const originalSize = Buffer.byteLength(original, 'utf-8');
  const compressedSize = Buffer.byteLength(compressed, 'utf-8');
  return (((originalSize - compressedSize) / originalSize) * 100).toFixed(2);
}

/**
 * Clears memory data securely.
 * @param {string} user_id - User identifier.
 * @param {string} chatroom_id - Chatroom identifier.
 * @returns {string} - Confirmation message.
 */
export function clearMemory(user_id = null, chatroom_id = null) {
  try {
    logInfo('Clearing memory...', user_id, chatroom_id);
    global.memoryData = "";  // Simulate clearing in-memory data
    logInfo('Memory cleared.', user_id, chatroom_id);
    return 'Memory cleared successfully.';
  } catch (error) {
    logError(`Memory clearing failed: ${error.message}`, user_id, chatroom_id);
    throw new Error('Failed to clear memory.');
  }
}

/**
 * Logs memory size statistics.
 * @param {string} memory - Memory data.
 * @param {string} user_id - User identifier.
 * @param {string} chatroom_id - Chatroom identifier.
 */
export function logMemoryStats(memory, user_id = null, chatroom_id = null) {
  const memorySizeMB = (Buffer.byteLength(memory, 'utf-8') / (1024 * 1024)).toFixed(2);
  logInfo(`Memory usage: ${memorySizeMB} MB`, user_id, chatroom_id);
}
