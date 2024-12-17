const COMPRESSION_THRESHOLD = 20; // example threshold
const INITIAL_COMPRESSION_THRESHOLD = 10;

const shouldCreateHead = (actionItems) => {
  return actionItems.includes('create head');
};

const shouldSummarizeLogs = (actionItems) => {
  return actionItems.includes('summarize logs');
};

const shouldCompress = (actionItems, conversationLength) => {
  return actionItems.includes('summarize') && conversationLength > COMPRESSION_THRESHOLD;
};

const needsContextRecap = () => {
  return false; // Implement logic if you need it
};

export { COMPRESSION_THRESHOLD, INITIAL_COMPRESSION_THRESHOLD, shouldCreateHead, shouldSummarizeLogs, shouldCompress, needsContextRecap };
