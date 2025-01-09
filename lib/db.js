// lib/db.js
import supabase, { supabaseRequest } from './supabaseClient';

// Insert a new task card
export async function insertTaskCard({ goal, priority = 'High' }) {
  try {
    const { data, error } = await supabase
      .from('task_cards')
      .insert([{ goal, priority }])
      .select();

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

    const { data, error } = await supabase
      .from('subtasks')
      .insert(formattedSubtasks)
      .select();

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
    const { data, error } = await supabase
      .from('task_cards')
      .select(`
        *,
        subtasks (
          *,
          task_dependencies (*)
        )
      `);

    if (error) {
      throw new Error(`Error fetching task cards: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in fetchTaskCards:', error);
    throw error;
  }
}

// Update the status of a subtask
export async function updateSubtaskStatus({ subtaskId, status }) {
  try {
    const { data, error } = await supabase
      .from('subtasks')
      .update({ status })
      .eq('id', subtaskId)
      .select();

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
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_card_id', taskCardId);

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
export async function insertTaskDependency({ subtaskId, dependsOn }) {
  try {
    const { data, error } = await supabase
      .from('task_dependencies')
      .insert([{ subtask_id: subtaskId, depends_on: dependsOn }])
      .select();

    if (error) {
      throw new Error(`Error inserting task dependency: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in insertTaskDependency:', error);
    throw error;
  }
}

// Fetch task dependencies for a specific subtask
export async function fetchTaskDependencies(subtaskId) {
  try {
    const { data, error } = await supabase
      .from('task_dependencies')
      .select('*')
      .eq('subtask_id', subtaskId);

    if (error) {
      throw new Error(`Error fetching task dependencies: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in fetchTaskDependencies:', error);
    throw error;
  }
}

// Submit feedback
export async function submitFeedback({ responseId, userFeedback, rating }) {
  try {
    const { data, error } = await supabase
      .from('feedback_entries')
      .insert([{ response_id: responseId, user_feedback: userFeedback, rating }])
      .select();

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
    const { data, error } = await supabase
      .from('feedback_entries')
      .select('*');

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
    const { data, error } = await supabase
      .from('debug_logs')
      .insert([{ user_id: userId, context_id: contextId, issue, resolution }])
      .select();

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
    const { data, error } = await supabase
      .from('debug_logs')
      .select('*')
      .eq('context_id', contextId);

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
    const { data, error } = await supabase
      .from('templates')
      .select('*');

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
    const { data, error } = await supabase
      .from('task_cards')
      .delete()
      .eq('id', taskCardId)
      .select();

    if (error) {
      throw new Error(`Error deleting task card: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in deleteTaskCard:', error);
    throw error;
  }
}
