// src/state/memory_state.js

let memory = "";

export function appendMemory(newMemory) {
  memory += ` ${newMemory}`;
  return memory;
}
