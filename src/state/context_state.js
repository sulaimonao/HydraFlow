//context_state.js

let currentContext = {};
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
