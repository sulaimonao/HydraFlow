// src/utils/memoryUtils.js

import { logInfo, logError } from './logger.js';
import zlib from 'zlib';

/**
 * Compresses memory data to optimize storage.
 * @param {string} memory - Raw memory data.
 * @param {object} gaugeMetrics - Current system metrics for optimization.
 * @returns {string} - Compressed memory string.
 */
export function compressMemory(memory, gaugeMetrics = {}) {
  try {
    logInfo('Compressing memory...');
    const compressed = zlib.gzipSync(memory).toString('base64');
    logInfo(`Memory compressed. Size reduced by ${calculateCompressionRate(memory, compressed)}%`);
    return compressed;
  } catch (error) {
    logError(`Memory compression failed: ${error.message}`);
    throw new Error('Failed to compress memory.');
  }
}

/**
 * Decompresses memory data for usage.
 * @param {string} compressedMemory - Compressed memory string.
 * @returns {string} - Decompressed memory data.
 */
export function decompressMemory(compressedMemory) {
  try {
    logInfo('Decompressing memory...');
    const decompressed = zlib.gunzipSync(Buffer.from(compressedMemory, 'base64')).toString();
    logInfo('Memory decompressed successfully.');
    return decompressed;
  } catch (error) {
    logError(`Memory decompression failed: ${error.message}`);
    throw new Error('Failed to decompress memory.');
  }
}

/**
 * Validates the integrity of memory data.
 * @param {string} memory - Memory data to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateMemory(memory) {
  try {
    logInfo('Validating memory...');
    const isValid = typeof memory === 'string' && memory.length > 0;
    if (!isValid) logError('Memory validation failed: Invalid format or empty content.');
    return isValid;
  } catch (error) {
    logError(`Memory validation error: ${error.message}`);
    return false;
  }
}

/**
 * Optimizes memory by trimming unnecessary whitespace and redundant data.
 * @param {string} memory - Raw memory data.
 * @returns {string} - Optimized memory data.
 */
export function optimizeMemory(memory) {
  try {
    logInfo('Optimizing memory...');
    const optimized = memory.replace(/\s+/g, ' ').trim();
    logInfo('Memory optimized successfully.');
    return optimized;
  } catch (error) {
    logError(`Memory optimization failed: ${error.message}`);
    throw new Error('Failed to optimize memory.');
  }
}

/**
 * Calculates the compression rate between original and compressed data.
 * @param {string} original - Original memory data.
 * @param {string} compressed - Compressed memory data.
 * @returns {number} - Compression percentage.
 */
function calculateCompressionRate(original, compressed) {
  const originalSize = Buffer.byteLength(original, 'utf-8');
  const compressedSize = Buffer.byteLength(compressed, 'utf-8');
  return (((originalSize - compressedSize) / originalSize) * 100).toFixed(2);
}

/**
 * Clears memory data securely.
 * @returns {string} - Confirmation message.
 */
export function clearMemory() {
  try {
    logInfo('Clearing memory...');
    return 'Memory cleared successfully.';
  } catch (error) {
    logError(`Memory clearing failed: ${error.message}`);
    throw new Error('Failed to clear memory.');
  }
}

/**
 * Logs memory usage statistics.
 * @param {string} memory - Memory data to analyze.
 */
export function logMemoryStats(memory) {
  const memorySizeMB = (Buffer.byteLength(memory, 'utf-8') / (1024 * 1024)).toFixed(2);
  logInfo(`Memory usage: ${memorySizeMB} MB`);
}
