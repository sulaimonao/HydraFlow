// lib/db.js
import supabase, { supabaseRequest, setSessionContext } from './supabaseClient.js';
import { orchestrateContextWorkflow } from '../src/logic/workflow_manager.js';

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

// Fetch all task cards
export async function fetchTaskCards(query) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase.from('task_cards').select(`
        *,
        subtasks:subtasks!subtasks_task_card_id_fkey (
          *,
          child_dependencies:task_dependencies!fk_child (parent_subtask_id),
          parent_dependencies:task_dependencies!fk_parent (child_subtask_id)
        )
      `).eq('user_id', user_id).eq('chatroom_id', chatroom_id)
    );

    if (error) throw new Error(`Error fetching task cards: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in fetchTaskCards:', error);
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
      supabase.from('task_dependencies').insert([{
        child_subtask_id: subtaskId,
        parent_subtask_id: dependsOn,
        user_id,
        chatroom_id
      }])
    );

    if (error) throw new Error(`Error inserting task dependency: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in insertTaskDependency:', error);
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
      supabase.from('debug_logs').insert([{
        user_id,
        context_id: chatroom_id,
        issue,
        resolution,
        created_at: new Date().toISOString()
      }])
    );

    if (error) throw new Error(`Error logging issue: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in logIssue:', error);
    throw error;
  }
}

// Submit feedback
export async function submitFeedback({ query, responseId, userFeedback, rating }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase.from('feedback_entries').insert([{
        response_id: responseId,
        user_feedback: userFeedback,
        rating,
        user_id,
        chatroom_id
      }])
    );

    if (error) throw new Error(`Error submitting feedback: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    throw error;
  }
}

// Insert a new head
export async function insertHead({ query, name, capabilities, preferences }) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query });
    const { user_id, chatroom_id } = generatedIdentifiers;

    await setSessionContext(user_id, chatroom_id);

    const { data, error } = await supabaseRequest(
      supabase.from('heads').insert([{
        name,
        capabilities,
        preferences,
        user_id,
        chatroom_id,
        status: 'active',
        createdat: new Date().toISOString()
      }])
    );

    if (error) throw new Error(`Error inserting head: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in insertHead:', error);
    throw error;
  }
}

