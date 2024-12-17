let conversationHistory = [];
let compressedMemory = "";

export function addUserMessage(message) {
  conversationHistory.push({ role: 'user', content: message });
}

export function addAssistantMessage(message) {
  conversationHistory.push({ role: 'assistant', content: message });
}

export function getConversationLength() {
  return conversationHistory.length;
}

export function getFullHistory() {
  return conversationHistory;
}

export function getCompressedMemory() {
  return compressedMemory;
}

export function setCompressedMemory(value) {
  compressedMemory = value;
}
