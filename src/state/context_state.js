//src/state/context_state.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient';

class ContextState {
  constructor() {
    this.tokenUsage = { used: 0, total: 8192 };
    this.responseLatency = 0.8;
  }

  async updateTokenUsage(usedTokens) {
    this.tokenUsage.used += usedTokens;
    await supabaseRequest(
      supabase.from('context_state').update({ tokenUsage: this.tokenUsage }).eq('id', 1)
    );
  }

  async updateResponseLatency(latency) {
    this.responseLatency = latency;
    await supabaseRequest(
      supabase.from('context_state').update({ responseLatency: this.responseLatency }).eq('id', 1)
    );
  }
}

let currentContext = new ContextState();
const contextHistory = [];

export async function updateContext(newData) {
  contextHistory.push({ ...currentContext }); // Save a snapshot before updating
  currentContext = { ...currentContext, ...newData };
  await supabaseRequest(
    supabase.from('context_state').update(currentContext).eq('id', 1)
  );

  return currentContext;
}

export function getContextHistory() {
  return contextHistory;
}

export { currentContext };
