//src/state/context_state.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';

class ContextState {
  constructor(user_id, chatroom_id) {
    this.user_id = user_id;
    this.chatroom_id = chatroom_id;
    this.tokenUsage = { used: 0, total: 8192 };
    this.responseLatency = 0.8;
  }

  async updateTokenUsage(usedTokens) {
    this.tokenUsage.used += usedTokens;
    try {
      await supabaseRequest(() =>
        supabase
          .from('context_state')
          .update({ tokenUsage: this.tokenUsage })
          .eq('user_id', this.user_id)
          .eq('chatroom_id', this.chatroom_id)
      );
    } catch (error) {
      console.error('Error updating token usage:', error);
    }
  }

  async updateResponseLatency(latency) {
    this.responseLatency = latency;
    try {
      await supabaseRequest(() =>
        supabase
          .from('context_state')
          .update({ responseLatency: this.responseLatency })
          .eq('user_id', this.user_id)
          .eq('chatroom_id', this.chatroom_id)
      );
    } catch (error) {
      console.error('Error updating response latency:', error);
    }
  }
}

let currentContext;
const contextHistory = [];

// Log context updates for debugging
export function logContextUpdate(newData) {
  console.log('Context Updated:', newData);
  contextHistory.push({ ...currentContext });
}

// Enhanced context update with persistent IDs
export async function updateContext(newData) {
  const { generatedIdentifiers } = await orchestrateContextWorkflow({ query: 'update context' });
  const { user_id, chatroom_id } = generatedIdentifiers;

  if (!currentContext || currentContext.user_id !== user_id || currentContext.chatroom_id !== chatroom_id) {
    currentContext = new ContextState(user_id, chatroom_id);
  }

  logContextUpdate(newData);
  Object.assign(currentContext, newData);

  try {
    await supabaseRequest(() =>
      supabase
        .from('context_state')
        .update(currentContext)
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );
  } catch (error) {
    console.error('Error updating context:', error);
  }

  return currentContext;
}

export function getContextHistory() {
  return contextHistory;
}

export { currentContext };
