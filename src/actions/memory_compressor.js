// src/actions/memory_compressor.js

// Deduplicates and compresses text-based memory
export function compressTextMemory(memory) {
  const sentences = memory.split(". ").map((sentence) => sentence.trim());
  const uniqueSentences = [...new Set(sentences)];
  const summarizedContent = uniqueSentences.slice(0, 3).join(". ") + "...";
  return { compressedMemory: summarizedContent };
}

// Deduplicates and compresses array-based memory
export function compressArrayMemory(memory) {
  const compressedMemory = new Map();
  memory.forEach((item) => {
    if (item.key && !compressedMemory.has(item.key)) {
      compressedMemory.set(item.key, item.value);
    }
  });
  return Array.from(compressedMemory.values());
}

// Main compressMemory function to handle multiple formats
export function compressMemory(memory) {
  if (typeof memory === "string") {
    return compressTextMemory(memory);
  } else if (Array.isArray(memory)) {
    return { compressedMemory: compressArrayMemory(memory) };
  } else {
    throw new Error("Unsupported memory format. Expected a string or an array.");
  }
}
