// lib/db.js
import supabase, { supabaseRequest } from './supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

// Insert a new task card
export async function insertTaskCard({ goal, priority = 'High', user_id, chatroom_id }) {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('task_cards').insert([{ goal, priority, user_id, chatroom_id }])
    );

    if (error) {
      throw new Error(`Error inserting task card: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in insertTaskCard:', error);
    throw error;
  }
}

// Insert subtasks for a specific task card
export async function insertSubtasks({ taskCardId, subtasks }) {
  try {
    const formattedSubtasks = subtasks.map((subtask) => ({
      task_card_id: taskCardId,
      description: subtask.description,
      status: subtask.status || 'pending',
    }));

    const { data, error } = await supabaseRequest(() =>
      supabase.from('subtasks').insert(formattedSubtasks)
    );

    if (error) {
      throw new Error(`Error inserting subtasks: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in insertSubtasks:', error);
    throw error;
  }
}

// Fetch all task cards with their subtasks and dependencies
export async function fetchTaskCards() {
  try {
    // 1️⃣ Call supabaseRequest and assign to 'result'
    const result = await supabaseRequest(() =>
      supabase.from('task_cards').select(`
        *,
        subtasks (
          *,
          child_links:task_dependencies!fk_child (*),
          parent_links:task_dependencies!fk_parent (*)
        )
      `)
    );

    // 2️⃣ If 'result' is null, that means Supabase found no rows or returned no data
    if (result === null) {
      console.warn("No task cards found. Returning empty array.");
      return [];
    }

    // 3️⃣ At this point, 'result' is non-null. 
    //    If supabaseRequest is returning an array of rows, 'result' might be the array itself.
    //    If supabaseRequest is returning an object with { data, error }, see below.

    return result;  // e.g. an array of task_cards
  } catch (error) {
    console.error('Error in fetchTaskCards:', error);
    throw error;
  }
}

// Update the status of a subtask
export async function updateSubtaskStatus({ subtaskId, status }) {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('subtasks').update({ status }).eq('id', subtaskId)
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
export async function fetchSubtasksByTaskCard(taskCardId) {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('subtasks').select('*').eq('task_card_id', taskCardId)
    );

    if (error) {
      throw new Error(`Error fetching subtasks: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in fetchSubtasksByTaskCard:', error);
    throw error;
  }
}

// Insert a new task dependency
export async function insertTaskDependency({ childSubtaskId, parentSubtaskId }) {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('task_dependencies').insert([{
        child_subtask_id: childSubtaskId,
        parent_subtask_id: parentSubtaskId
      }])
    );

    if (error) {
      throw new Error(`Error inserting task dependency: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in insertTaskDependency:', error);
    throw error;
  }
}

// Submit feedback
export async function submitFeedback({ responseId, userFeedback, rating }) {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('feedback_entries').insert([{ response_id: responseId, user_feedback: userFeedback, rating }])
    );

    if (error) {
      throw new Error(`Error submitting feedback: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    throw error;
  }
}

// Fetch feedback entries
export async function fetchFeedback() {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('feedback_entries').select('*')
    );

    if (error) {
      throw new Error(`Error fetching feedback: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in fetchFeedback:', error);
    throw error;
  }
}

// Log an issue to debug_logs
export async function logIssue({ userId, contextId, issue, resolution }) {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('debug_logs').insert([{ user_id: userId, context_id: contextId, issue, resolution }])
    );

    if (error) {
      throw new Error(`Error logging issue: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in logIssue:', error);
    throw error;
  }
}

// Fetch debug logs
export async function fetchDebugLogs(contextId) {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('debug_logs').select('*').eq('context_id', contextId)
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
export async function fetchTemplates() {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('templates').select('*')
    );

    if (error) {
      throw new Error(`Error fetching templates: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in fetchTemplates:', error);
    throw error;
  }
}

// Delete a task card (cascades to subtasks and dependencies)
export async function deleteTaskCard({ taskCardId }) {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('task_cards').delete().eq('id', taskCardId)
    );

    if (error) {
      throw new Error(`Error deleting task card: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in deleteTaskCard:', error);
    throw error;
  }
}

// Insert a new head
export async function insertHead({ name, capabilities, preferences, user_id, chatroom_id }) {
  try {
    const { data, error } = await supabaseRequest(() =>
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

    if (error) {
      throw new Error(`Error inserting head: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in insertHead:', error);
    throw error;
  }
}

// Validate interactions with the heads table
export async function validateHeadInteraction(headId) {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('heads').select('*').eq('id', headId)
    );

    if (error) {
      throw new Error(`Error validating head interaction: ${error.message}`);
    }

    if (data.length === 0) {
      throw new Error(`Head with ID ${headId} not found.`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in validateHeadInteraction:', error);
    throw error;
  }
}

// Fetch heads by user_id and chatroom_id
export async function getHeads(user_id, chatroom_id) {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('heads').select('*').eq('user_id', user_id).eq('chatroom_id', chatroom_id)
    );

    if (error) {
      throw new Error(`Error fetching heads: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getHeads:', error);
    throw error;
  }
}

// Insert a new context
export async function insertContext({ user_id, chatroom_id, data }) {
  try {
    const { data, error } = await supabaseRequest(() =>
      supabase.from('contexts').insert([{ user_id, chatroom_id, data }])
    );

    if (error) {
      throw new Error(`Error inserting context: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in insertContext:', error);
    throw error;
  }
}
