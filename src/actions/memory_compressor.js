// src/actions/memory_compressor.js
/**
 * Compresses memory based on its type.
 */
export function compressMemory(memory) {
  if (typeof memory === "string") {
    const sentences = memory.split(/\.\s+/).map((s) => s.trim());
    const uniqueSentences = [...new Set(sentences)];
    return { compressedMemory: uniqueSentences.slice(0, 5).join(". ") + "..." };
  } else if (Array.isArray(memory)) {
    const uniqueEntries = [...new Map(memory.map((item) => [item.key, item.value])).values()];
    return { compressedMemory: uniqueEntries };
  } else {
    throw new Error("Unsupported memory format.");
  }
}
