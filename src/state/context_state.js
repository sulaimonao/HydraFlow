//src/state/context_state.js
import supabase, { supabaseRequest} from '../../lib/supabaseClient.js';
import { setSessionContext } from '../../lib/sessionUtils.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';

class ContextState {
  constructor(user_id, chatroom_id) {
    this.user_id = user_id;
    this.chatroom_id = chatroom_id;
    this.tokenUsage = { used: 0, total: 8192 };
    this.responseLatency = 0.8;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * ✅ Updates token usage for the current session.
   */
  async updateTokenUsage(usedTokens) {
    this.tokenUsage.used += usedTokens;
    this.updatedAt = new Date().toISOString();

    try {
      await setSessionContext(this.user_id, this.chatroom_id);
      await supabaseRequest(() =>
        supabase
          .from('context_state')
          .update({ tokenUsage: this.tokenUsage, updatedAt: this.updatedAt })
          .eq('user_id', this.user_id)
          .eq('chatroom_id', this.chatroom_id)
      );
      console.log(`📝 Token usage updated: ${this.tokenUsage.used}/${this.tokenUsage.total}`);
    } catch (error) {
      console.error('❌ Error updating token usage:', error.message);
    }
  }

  /**
   * ✅ Updates response latency for the current session.
   */
  async updateResponseLatency(latency) {
    this.responseLatency = latency;
    this.updatedAt = new Date().toISOString();

    try {
      await setSessionContext(this.user_id, this.chatroom_id);
      await supabaseRequest(() =>
        supabase
          .from('context_state')
          .update({ responseLatency: this.responseLatency, updatedAt: this.updatedAt })
          .eq('user_id', this.user_id)
          .eq('chatroom_id', this.chatroom_id)
      );
      console.log(`⏱️ Response latency updated: ${this.responseLatency}s`);
    } catch (error) {
      console.error('❌ Error updating response latency:', error.message);
    }
  }
}

let currentContext;
const contextHistory = [];

/**
 * ✅ Logs context updates for traceability.
 */
export function logContextUpdate(newData) {
  console.log('📝 Context Updated:', newData);
  contextHistory.push({ ...currentContext, updatedAt: new Date().toISOString() });
}

/**
 * ✅ Updates the global context state and stores it in the database.
 * @param {Object} newData - New context data to merge.
 * @param {Object} req - Request object for workflow context.
 */
export async function updateContext(newData, req) {
  try {
    const { user_id, chatroom_id } = req.session;

    if (!currentContext || currentContext.user_id !== user_id || currentContext.chatroom_id !== chatroom_id) {
      currentContext = new ContextState(user_id, chatroom_id);
    }    

    logContextUpdate(newData);
    Object.assign(currentContext, newData);

    await setSessionContext(user_id, chatroom_id);

    await supabaseRequest(() =>
      supabase
        .from('context_state')
        .update(currentContext)
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    console.log('✅ Context updated successfully.');
    return currentContext;

  } catch (error) {
    console.error('❌ Error updating context:', error.message);
    throw new Error("Failed to update context.");
  }
}

/**
 * ✅ Retrieves the context update history for debugging.
 */
export function getContextHistory() {
  return contextHistory;
}

export { currentContext };
