// src/state/heads_state.js
const heads = [];

function addHead(name, status) {
  heads.push({ name, status, createdAt: Date.now() });
}

function getHeads() {
  return heads;
}

export { addHead, getHeads };
