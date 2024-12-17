let memory = "";

function appendMemory(newMemory) {
  memory += ` ${newMemory}`;
  return memory;
}

module.exports = { appendMemory };
