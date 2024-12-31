// src/actions/memory_compressor.js

/**
 * Deduplicates and compresses text-based memory.
 *
 * @param {string} memory - The raw text-based memory to compress.
 * @returns {Object} - The compressed memory in text format.
 */
export function compressTextMemory(memory) {
  const sentences = memory.split(/\.\s+/).map((sentence) => sentence.trim());
  const uniqueSentences = [...new Set(sentences)];
  const summarizedContent =
    uniqueSentences.slice(0, 5).join(". ") + (uniqueSentences.length > 5 ? "..." : "");
  return { compressedMemory: summarizedContent };
}

/**
 * Deduplicates and compresses array-based memory.
 *
 * @param {Array} memory - The array-based memory to compress.
 * @returns {Array} - The compressed memory as an array.
 */
export function compressArrayMemory(memory) {
  const compressedMemory = new Map();
  memory.forEach((item) => {
    if (item.key && !compressedMemory.has(item.key)) {
      compressedMemory.set(item.key, item.value);
    }
  });
  return Array.from(compressedMemory.values());
}

/**
 * Main memory compression function to handle multiple formats.
 *
 * @param {string|Array} memory - The memory to compress, either as a string or an array.
 * @returns {Object} - The compressed memory and its format.
 * @throws {Error} - If the memory format is unsupported.
 */
export function compressMemory(memory) {
  if (typeof memory === "string") {
    return compressTextMemory(memory);
  } else if (Array.isArray(memory)) {
    return { compressedMemory: compressArrayMemory(memory) };
  } else {
    throw new Error("Unsupported memory format. Expected a string or an array.");
  }
}
