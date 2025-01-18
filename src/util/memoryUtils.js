//src/util/memoryUtils.js
import { logInfo, logError } from './logger.js';
import zlib from 'zlib';

/**
 * 📦 Compresses memory data using zlib with contextual logging.
 */
export function compressMemory(memory, gaugeMetrics = {}, req) {
  try {
    logInfo(`📦 Compressing memory... Size: ${formatSize(memory)}`, user_id, chatroom_id);
    const compressed = zlib.gzipSync(memory).toString('base64');
    logInfo(`✅ Memory compressed by ${calculateCompressionRate(memory, compressed)}%`, user_id, chatroom_id);
    return compressed;
  } catch (error) {
    logError(`❌ Compression failed: ${error.message}`, user_id, chatroom_id);
    throw new Error('Memory compression failed.');
  }
}

/**
 * 🔍 Calculates token usage in the memory data.
 */
export function calculateTokenUsage(memory, req) {
  try {
    const tokenCount = memory.trim().split(/\s+/).length;
    const estimatedLimit = 8000;
    const usage = {
      used: tokenCount,
      total: estimatedLimit,
      remaining: Math.max(estimatedLimit - tokenCount, 0),
      status: tokenCount > estimatedLimit * 0.8 ? 'high' : 'normal',
    };

    logInfo(`🔎 Token usage: ${tokenCount}/${estimatedLimit}`, user_id, chatroom_id);
    return usage;
  } catch (error) {
    logError(`❌ Token usage calculation failed: ${error.message}`, user_id, chatroom_id);
    throw new Error('Token usage calculation failed.');
  }
}

/**
 * 🔓 Decompresses memory data.
 */
export function decompressMemory(compressedMemory, req) {
  try {
    logInfo('🔓 Decompressing memory...', user_id, chatroom_id);
    const decompressed = zlib.gunzipSync(Buffer.from(compressedMemory, 'base64')).toString();
    logInfo(`✅ Memory decompressed. Size: ${formatSize(decompressed)}`, user_id, chatroom_id);
    return decompressed;
  } catch (error) {
    logError(`❌ Decompression failed: ${error.message}`, user_id, chatroom_id);
    throw new Error('Memory decompression failed.');
  }
}

/**
 * 🔒 Validates memory content integrity.
 */
export function validateMemory(memory, req) {
  const isValid = typeof memory === 'string' && memory.trim().length > 0;
  if (isValid) {
    logInfo('🛡️ Memory validation passed.', user_id, chatroom_id);
  } else {
    logError('❌ Memory validation failed.', user_id, chatroom_id);
  }
  return isValid;
}

/**
 * ⚙️ Optimizes memory by trimming and condensing whitespace.
 */
export function optimizeMemory(memory, req) {
  try {
    logInfo('⚙️ Optimizing memory...', user_id, chatroom_id);
    const optimized = memory.replace(/\s+/g, ' ').trim();
    logInfo(`✅ Memory optimized. New size: ${formatSize(optimized)}`, user_id, chatroom_id);
    return optimized;
  } catch (error) {
    logError(`❌ Memory optimization failed: ${error.message}`, user_id, chatroom_id);
    throw new Error('Memory optimization failed.');
  }
}

/**
 * 🗑️ Clears in-memory data securely.
 */
export function clearMemory(req) {
  try {
    logInfo('🗑️ Clearing memory...', user_id, chatroom_id);
    global.memoryData = "";  // Should be replaced with a better storage solution
    logInfo('✅ Memory cleared.', user_id, chatroom_id);
    return 'Memory cleared successfully.';
  } catch (error) {
    logError(`❌ Memory clearing failed: ${error.message}`, user_id, chatroom_id);
    throw new Error('Memory clearing failed.');
  }
}

/**
 * 📊 Logs the memory size for analysis.
 */
export function logMemoryStats(memory, req) {
  const memorySizeMB = formatSize(memory);
  logInfo(`📊 Memory usage: ${memorySizeMB}`, user_id, chatroom_id);
}

/**
 * 📏 Calculates compression percentage.
 */
function calculateCompressionRate(original, compressed) {
  const originalSize = Buffer.byteLength(original, 'utf-8');
  const compressedSize = Buffer.byteLength(compressed, 'utf-8');
  return (((originalSize - compressedSize) / originalSize) * 100).toFixed(2);
}

/**
 * 📐 Formats byte size into MB for logging.
 */
function formatSize(data) {
  const sizeMB = (Buffer.byteLength(data, 'utf-8') / (1024 * 1024)).toFixed(2);
  return `${sizeMB} MB`;
}

function getUserId(req){
  return req.session.userId;
}
function getChatroomId(req){
  return req.session.chatroomId;
}
