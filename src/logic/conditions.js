export const COMPRESSION_THRESHOLD = 20; // example threshold
export const INITIAL_COMPRESSION_THRESHOLD = 10;

export function shouldCreateHead(actionItems) {
  return actionItems.includes('create head');
}

export function shouldSummarizeLogs(actionItems) {
  return actionItems.includes('summarize logs');
}

export function shouldCompress(actionItems, conversationLength) {
  return actionItems.includes('summarize') && conversationLength > COMPRESSION_THRESHOLD;
}

export function needsContextRecap() {
  return false; // Implement logic if you need it
}
