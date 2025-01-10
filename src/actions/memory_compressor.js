// src/actions/memory_compressor.js

// Enhanced deduplication and segmentation
export function compressMemory(memory) {
  if (typeof memory === "string") {
    return compressTextMemory(memory);
  } else if (Array.isArray(memory)) {
    return { compressedMemory: compressArrayMemory(memory) };
  } else {
    throw new Error("Unsupported memory format. Expected a string or an array.");
  }
}

function compressTextMemory(memory) {
  const sentences = memory.split(". ").map((sentence) => sentence.trim());
  const uniqueSentences = [...new Set(sentences)];
  const summarizedContent = uniqueSentences.slice(0, 3).join(". ") + "...";
  return { compressedMemory: summarizedContent };
}

function compressArrayMemory(memory) {
  const compressedMemory = new Map();
  memory.forEach((item) => {
    if (item.key && !compressedMemory.has(item.key)) {
      compressedMemory.set(item.key, item.value);
    }
  });
  return Array.from(compressedMemory.values());
}

// Periodic cleanup
export function periodicCleanup(memory) {
  const currentTime = Date.now();
  return memory.filter(entry => currentTime - entry.timestamp < 30 * 24 * 60 * 60 * 1000); // Keep entries from the last 30 days
}
