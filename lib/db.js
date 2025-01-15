//lib/db.js
import supabase, { supabaseRequest, setSessionContext } from './supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

/* -----------------------------------------------------------------------------
 *   Task Cards & Subtasks
 * --------------------------------------------------------------------------- */

// Insert a new task card
export async function insertTaskCard({ query, goal, priority = 'High' }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase.from('task_cards').insert([{ goal, priority, user_id, chatroom_id }])
    );

    if (error) throw new Error(`Error inserting task card: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in insertTaskCard:', error);
    throw error;
  }
}

// Insert subtasks for a specific task card
export async function insertSubtasks({ query, taskCardId, subtasks }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const formattedSubtasks = subtasks.map((subtask) => ({
      task_card_id: taskCardId,
      description: subtask.description,
      status: subtask.status || 'pending',
      user_id,
      chatroom_id
    }));

    const { data, error } = await supabaseRequest(
      supabase.from('subtasks').insert(formattedSubtasks)
    );

    if (error) throw new Error(`Error inserting subtasks: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in insertSubtasks:', error);
    throw error;
  }
}

// Fetch all task cards (with subtasks and dependencies)
export async function fetchTaskCards({ query }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase
        .from('task_cards')
        .select(
          `
            *,
            subtasks:subtasks!subtasks_task_card_id_fkey (
              *,
              child_dependencies:task_dependencies!fk_child (parent_subtask_id),
              parent_dependencies:task_dependencies!fk_parent (child_subtask_id)
            )
          `
        )
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    if (error) throw new Error(`Error fetching task cards: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in fetchTaskCards:', error);
    throw error;
  }
}

// Update the status of a subtask
export async function updateSubtaskStatus({ query, subtaskId, status }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase
        .from('subtasks')
        .update({ status })
        .eq('id', subtaskId)
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    if (error) {
      throw new Error(`Error updating subtask status: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in updateSubtaskStatus:', error);
    throw error;
  }
}

// Fetch subtask details by task card ID
export async function fetchSubtasksByTaskCard({ query, taskCardId }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase
        .from('subtasks')
        .select('*')
        .eq('task_card_id', taskCardId)
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    if (error) throw new Error(`Error fetching subtasks: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in fetchSubtasksByTaskCard:', error);
    throw error;
  }
}

// Insert a new task dependency
export async function insertTaskDependency({ query, subtaskId, dependsOn }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase
        .from('task_dependencies')
        .insert([
          {
            child_subtask_id: subtaskId,
            parent_subtask_id: dependsOn,
            user_id,
            chatroom_id
          }
        ])
    );

    if (error) throw new Error(`Error inserting task dependency: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in insertTaskDependency:', error);
    throw error;
  }
}

/* -----------------------------------------------------------------------------
 *   Feedback, Debug Logs, Templates
 * --------------------------------------------------------------------------- */

// Submit feedback
export async function submitFeedback({ query, responseId, userFeedback, rating }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase.from('feedback_entries').insert([
        {
          response_id: responseId,
          user_feedback: userFeedback,
          rating,
          user_id,
          chatroom_id
        }
      ])
    );

    if (error) throw new Error(`Error submitting feedback: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    throw error;
  }
}

// Fetch feedback entries
export async function fetchFeedback({ query }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase
        .from('feedback_entries')
        .select('*')
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    if (error) throw new Error(`Error fetching feedback: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in fetchFeedback:', error);
    throw error;
  }
}

// Log an issue to debug_logs
export async function logIssue({ query, issue, resolution }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase.from('debug_logs').insert([
        {
          user_id,
          context_id: chatroom_id,
          issue,
          resolution,
          created_at: new Date().toISOString()
        }
      ])
    );

    if (error) throw new Error(`Error logging issue: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in logIssue:', error);
    throw error;
  }
}

// Fetch debug logs
export async function fetchDebugLogs({ query }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase
        .from('debug_logs')
        .select('*')
        .eq('context_id', chatroom_id)
        .eq('user_id', user_id)
    );

    if (error) {
      throw new Error(`Error fetching debug logs: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in fetchDebugLogs:', error);
    throw error;
  }
}

// Fetch templates
export async function fetchTemplates({ query }) {
  try {
    // No user_id/chatroom_id filter used here, unless you prefer to scope them.
    // For now, it simply fetches all templates from the 'templates' table.
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    // Not strictly needed to set session if you want globally accessible templates,
    // but let's maintain consistency:
    const { user_id, chatroom_id } = generatedIdentifiers;
    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase.from('templates').select('*')
    );

    if (error) throw new Error(`Error fetching templates: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in fetchTemplates:', error);
    throw error;
  }
}

/* -----------------------------------------------------------------------------
 *   Task Card Deletion
 * --------------------------------------------------------------------------- */

// Delete a task card (cascades to subtasks and dependencies)
export async function deleteTaskCard({ query, taskCardId }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase.from('task_cards').delete().eq('id', taskCardId).eq('user_id', user_id).eq('chatroom_id', chatroom_id)
    );

    if (error) throw new Error(`Error deleting task card: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in deleteTaskCard:', error);
    throw error;
  }
}

/* -----------------------------------------------------------------------------
 *   Heads
 * --------------------------------------------------------------------------- */

// Insert a new head
export async function insertHead({ query, name, capabilities, preferences }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase
        .from('heads')
        .insert([
          {
            name,
            capabilities,
            preferences,
            user_id,
            chatroom_id,
            status: 'active',
            createdat: new Date().toISOString()
          }
        ])
    );

    if (error) throw new Error(`Error inserting head: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in insertHead:', error);
    throw error;
  }
}

// Validate interactions with the heads table
export async function validateHeadInteraction({ query, headId }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    // If you want to ensure the head belongs to user_id/chatroom_id,
    // also add .eq('user_id', user_id).eq('chatroom_id', chatroom_id)
    const { data, error } = await supabaseRequest(
      supabase
        .from('heads')
        .select('*')
        .eq('id', headId)
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    if (error) {
      throw new Error(`Error validating head interaction: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`Head with ID ${headId} not found for this user/context.`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in validateHeadInteraction:', error);
    throw error;
  }
}

// Fetch heads by user_id and chatroom_id
export async function getHeads({ query }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase
        .from('heads')
        .select('*')
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
    );

    if (error) throw new Error(`Error fetching heads: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in getHeads:', error);
    throw error;
  }
}

/* -----------------------------------------------------------------------------
 *   Context
 * --------------------------------------------------------------------------- */

// Insert a new context
export async function insertContext({ query, data: contextData }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    if (!user_id || !chatroom_id) {
      throw new Error('Missing user_id or chatroom_id for inserting context.');
    }

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase
        .from('contexts')
        .insert([{ user_id, chatroom_id, data: contextData }])
    );

    if (error) throw new Error(`Error inserting context: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in insertContext:', error);
    throw error;
  }
}
