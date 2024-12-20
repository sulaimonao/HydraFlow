// Updated memory_compressor.js
export function compressMemory(memory) {
  const sentences = memory.split(". ");
  const uniqueSentences = [...new Set(sentences)];
  const summarizedContent = uniqueSentences.slice(0, 3).join(". ") + "...";
  return { compressedMemory: summarizedContent };
}