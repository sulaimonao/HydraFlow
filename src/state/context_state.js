//src/state/context_state.js

class ContextState {
  constructor() {
    this.tokenUsage = { used: 0, total: 8192 };
    this.responseLatency = 0.8;
  }

  updateTokenUsage(usedTokens) {
    this.tokenUsage.used += usedTokens;
  }

  updateResponseLatency(latency) {
    this.responseLatency = latency;
  }
}

let currentContext = new ContextState();
const contextHistory = [];

export function updateContext(newData) {
  contextHistory.push({ ...currentContext }); // Save a snapshot before updating
  currentContext = { ...currentContext, ...newData };

  return currentContext;
}

export function getContextHistory() {
  return contextHistory;
}

export { currentContext };
module.exports = ContextState;
