// lib/db.js
import supabase, { supabaseRequest } from './lib/supabaseClient';

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
