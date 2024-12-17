function compressMemory(memory) {
  const compressed = memory.split(". ").slice(0, 3).join(". ") + "...";
  return { compressedMemory: compressed };
}

module.exports = { compressMemory };
