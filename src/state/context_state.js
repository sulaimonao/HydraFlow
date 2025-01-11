//src/state/context_state.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient.js';

class ContextState {
  constructor() {
    this.tokenUsage = { used: 0, total: 8192 };
    this.responseLatency = 0.8;
  }

  async updateTokenUsage(usedTokens) {
    this.tokenUsage.used += usedTokens;
    try {
      await supabaseRequest(() => supabase.from('context_state').update({ tokenUsage: this.tokenUsage }).eq('id', 1));
    } catch (error) {
      console.error('Error updating token usage:', error);
    }
  }

  async updateResponseLatency(latency) {
    this.responseLatency = latency;
    try {
      await supabaseRequest(() => supabase.from('context_state').update({ responseLatency: this.responseLatency }).eq('id', 1));
    } catch (error) {
      console.error('Error updating response latency:', error);
    }
  }
}

let currentContext = new ContextState();
const contextHistory = [];

// Log context updates for debugging
export function logContextUpdate(newData) {
  console.log("Context Updated:", newData);
  contextHistory.push({ ...currentContext });
}

// Enhanced context update
export async function updateContext(newData) {
  logContextUpdate(newData);
  currentContext = { ...currentContext, ...newData };

  try {
    await supabaseRequest(() => supabase.from('context_state').update(currentContext).eq('id', 1));
  } catch (error) {
    console.error('Error updating context:', error);
  }

  return currentContext;
}

export function getContextHistory() {
  return contextHistory;
}

export { currentContext };
