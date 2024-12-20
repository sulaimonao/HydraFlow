// compress-memory.js
function compressMemory(memory) {
  const compressedMemory = new Map();

  memory.forEach((item) => {
    if (!compressedMemory.has(item.key)) {
      compressedMemory.set(item.key, item.value);
    }
  });

  return Array.from(compressedMemory.values());
}

export { compressMemory };