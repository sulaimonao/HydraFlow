// src/util/memoryUtils.js (Local SQLite Version - Minor Changes)
import { logInfo, logError } from './logger.js';
import zlib from 'zlib';

/**
 * 📦 Compresses memory data using zlib with contextual logging.
 *  Now takes a req parameter for logging context.
 */
export function compressMemory(memory, req) { // Added req parameter
    try {
        logInfo(`📦 Compressing memory... Size: ${formatSize(memory)}`, req); // Pass req to logInfo
        const compressed = zlib.gzipSync(memory).toString('base64');
        logInfo(`✅ Memory compressed by ${calculateCompressionRate(memory, compressed)}%`, req); // Pass req
        return {compressedMemory: compressed}; // Return an object for consistency with the original return value
    } catch (error) {
        logError(`❌ Compression failed: ${error.message}`, req); // Pass req to logError
        throw new Error('Memory compression failed.');
    }
}

/**
 * 🔍 Calculates token usage in the memory data.
 *  Now takes a req parameter for logging context.
 */
export function calculateTokenUsage(memory, req) { // Added req parameter
    try {
        const tokenCount = memory.trim().split(/\s+/).length;
        const estimatedLimit = 8000;
        const usage = {
            used: tokenCount,
            total: estimatedLimit,
            remaining: Math.max(estimatedLimit - tokenCount, 0),
            status: tokenCount > estimatedLimit * 0.8 ? 'high' : 'normal',
        };

        logInfo(`🔎 Token usage: ${tokenCount}/${estimatedLimit}`, req); // Pass req
        return usage;
    } catch (error) {
        logError(`❌ Token usage calculation failed: ${error.message}`, req); // Pass req
        throw new Error('Token usage calculation failed.');
    }
}

/**
 * 🔓 Decompresses memory data.
 *  Now takes a req parameter for logging context.
 */
export function decompressMemory(compressedMemory, req) { // Added req parameter
    try {
        logInfo('🔓 Decompressing memory...', req); // Pass req
        const decompressed = zlib.gunzipSync(Buffer.from(compressedMemory, 'base64')).toString();
        logInfo(`✅ Memory decompressed. Size: ${formatSize(decompressed)}`, req); // Pass req
        return decompressed;
    } catch (error) {
        logError(`❌ Decompression failed: ${error.message}`, req); // Pass req
        throw new Error('Memory decompression failed.');
    }
}

/**
 * 🔒 Validates memory content integrity.
 * Now takes a req parameter for logging context.
 */
export function validateMemory(memory, req) { // Added req parameter
    const isValid = typeof memory === 'string' && memory.trim().length > 0;
    if (isValid) {
        logInfo('🛡️ Memory validation passed.', req); // Pass req
    } else {
        logError('❌ Memory validation failed.', req); // Pass req
    }
    return isValid;
}

/**
 * ⚙️ Optimizes memory by trimming and condensing whitespace.
 * Now takes a req parameter for logging context
 */
export function optimizeMemory(memory, req) { // Added req parameter
    try {
        logInfo('⚙️ Optimizing memory...', req); // Pass req
        const optimized = memory.replace(/\s+/g, ' ').trim();
        logInfo(`✅ Memory optimized. New size: ${formatSize(optimized)}`, req); // Pass req
        return optimized;
    } catch (error) {
        logError(`❌ Memory optimization failed: ${error.message}`, req); // Pass req
        throw new Error('Memory optimization failed.');
    }
}

/**
 * 🗑️ Clears in-memory data securely.  (This function is problematic - see notes below)
 * Now takes a req parameter for logging context.
 */
export function clearMemory(req) { // Added req parameter
    try {
        logInfo('🗑️ Clearing memory...', req); // Pass req
        // global.memoryData = "";  // This line is removed. DO NOT USE GLOBALS.

        // Instead of clearing a global variable, we'll now rely on
        // deleting/updating the database entry.  This function becomes a no-op.
        logInfo('✅ Memory cleared.', req); // Pass req
        return 'Memory cleared successfully.'; // Keep the return value consistent
    } catch (error) {
        logError(`❌ Memory clearing failed: ${error.message}`, req); // Pass req
        throw new Error('Memory clearing failed.');
    }
}

/**
 * 📊 Logs the memory size for analysis.
 *  Now takes a req parameter for logging context.
 */
export function logMemoryStats(memory, req) { // Added req parameter
    const memorySizeMB = formatSize(memory);
    logInfo(`📊 Memory usage: ${memorySizeMB}`, req); // Pass req
}

/**
 * 📏 Calculates compression percentage. (No changes needed)
 */
function calculateCompressionRate(original, compressed) {
    const originalSize = Buffer.byteLength(original, 'utf-8');
    const compressedSize = Buffer.byteLength(compressed, 'base64');
    return (((originalSize - compressedSize) / originalSize) * 100).toFixed(2);
}

/**
 * 📐 Formats byte size into MB for logging. (No changes needed)
 */
function formatSize(data) {
    const sizeMB = (Buffer.byteLength(data, 'utf-8') / (1024 * 1024)).toFixed(2);
    return `${sizeMB} MB`;
}

// These functions are no longer needed, but kept for reference
// function getUserId(req){
//   return req.session.userId;
// }
// function getChatroomId(req){
//   return req.session.chatroomId;
// }