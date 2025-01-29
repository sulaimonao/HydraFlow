// lib/db.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("❌ Supabase configuration error: Missing DATABASE_URL or KEY in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase, supabaseRequest, setSessionContext, withRetry };

/* -----------------------------------------------------------------------------
 *   Task Cards & Subtasks
 * --------------------------------------------------------------------------- */

/**
 * Inserts a new task card.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {string} goal - The goal or title of the task card.
 * @param {string} [priority='High'] - Priority level (default is 'High').
 */
export async function insertTaskCard(userId, chatroomId, goal, priority = 'High') {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    // Insert the task card
    const { data, error } = await supabaseRequest(
      supabase
        .from('task_cards')
        .insert([{ goal, priority, user_id: userId, chatroom_id: chatroomId }])
    );

    if (error) throw new Error(`Error inserting task card: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in insertTaskCard:', error);
    throw error;
  }
}

/**
 * Inserts subtasks for a specific task card.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {number} taskCardId - The ID of the task card.
 * @param {Array} subtasks - Array of subtask objects: [{ description, status }, ...]
 */
export async function insertSubtasks(userId, chatroomId, taskCardId, subtasks) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    // Format and insert subtasks
    const formattedSubtasks = subtasks.map((subtask) => ({
      task_card_id: taskCardId,
      description: subtask.description,
      status: subtask.status || 'pending',
      user_id: userId,
      chatroom_id: chatroomId,
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

/**
 * Fetches all task cards (with subtasks and dependencies).
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 */
export async function fetchTaskCards(userId, chatroomId) {
  try {
    if (!userId || !chatroomId) {
      console.warn("⚠️ userId or chatroomId missing. Attempting to retrieve session details.");
      const session = await getSessionDetails();
      userId = session.user_id;
      chatroomId = session.chatroom_id;
    }

    console.log(`📌 Debug: fetchTaskCards called with user_id=${userId}, chatroom_id=${chatroomId}`);

    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context confirmed for fetchTaskCards`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('task_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
    );

    if (error) {
      console.error(`❌ Error fetching task cards: ${error.message}`);
      throw new Error(`Failed to fetch task cards: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Error in fetchTaskCards:', error);
    throw error;
  }
}

/**
 * Updates the status of a subtask.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {number} subtaskId - The subtask ID.
 * @param {string} status - New status (e.g. 'completed', 'pending', etc.)
 */
export async function updateSubtaskStatus(userId, chatroomId, subtaskId, status) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('subtasks')
        .update({ status })
        .eq('id', subtaskId)
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
    );

    if (error) throw new Error(`Error updating subtask status: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in updateSubtaskStatus:', error);
    throw error;
  }
}

/**
 * Fetch subtask details by task card ID.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {number} taskCardId - The ID of the task card.
 */
export async function fetchSubtasksByTaskCard(userId, chatroomId, taskCardId) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('subtasks')
        .select('*')
        .eq('task_card_id', taskCardId)
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
    );

    if (error) throw new Error(`Error fetching subtasks: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in fetchSubtasksByTaskCard:', error);
    throw error;
  }
}

/**
 * Inserts a new task dependency.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {number} subtaskId - The child subtask ID.
 * @param {number} dependsOn - The parent subtask ID.
 */
export async function insertTaskDependency(userId, chatroomId, subtaskId, dependsOn) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('task_dependencies')
        .insert([
          {
            child_subtask_id: subtaskId,
            parent_subtask_id: dependsOn,
            user_id: userId,
            chatroom_id: chatroomId
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

/**
 * Submit feedback.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {string} responseId - Unique response ID for linking feedback.
 * @param {string} userFeedback - Actual feedback text from user.
 * @param {number} rating - Numeric rating (1-5).
 */
export async function submitFeedback(userId, chatroomId, responseId, userFeedback, rating) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('feedback_entries')
        .insert([
          {
            response_id: responseId,
            user_feedback: userFeedback,
            rating,
            user_id: userId,
            chatroom_id: chatroomId
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

/**
 * Fetch feedback entries.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 */
export async function fetchFeedback(userId, chatroomId) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('feedback_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
    );

    if (error) throw new Error(`Error fetching feedback: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in fetchFeedback:', error);
    throw error;
  }
}

/**
 * Log an issue to `debug_logs`.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {string} issue - Description of the issue.
 * @param {string} resolution - How it was (or might be) resolved.
 */
export async function logIssue(userId, chatroomId, issue, resolution) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('debug_logs')
        .insert([
          {
            user_id: userId,
            context_id: chatroomId,
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

/**
 * Fetch debug logs for a given user/context.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 */
export async function fetchDebugLogs(userId, chatroomId) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('debug_logs')
        .select('*')
        .eq('context_id', chatroomId)
        .eq('user_id', userId)
    );

    if (error) throw new Error(`Error fetching debug logs: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in fetchDebugLogs:', error);
    throw error;
  }
}

/**
 * Fetch templates (global or user-specific).
 * @param {string} userId - The user ID (optional, if you have global templates).
 * @param {string} chatroomId - The chatroom ID (optional).
 */
export async function fetchTemplates(userId, chatroomId) {
  try {
    if (userId && chatroomId) {
      await setSessionContext(userId, chatroomId);
      console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);
    }
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
/**
 * Deletes a task card (cascades to subtasks and dependencies).
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {number} taskCardId - The task card's ID to be deleted.
 */
export async function deleteTaskCard(userId, chatroomId, taskCardId) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('task_cards')
        .delete()
        .eq('id', taskCardId)
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
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

/**
 * Inserts a new head (subpersona).
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {string} name - The head name.
 * @param {object} capabilities - Key/value describing capabilities.
 * @param {object} preferences - Key/value describing preferences.
 */
export async function insertHead(userId, chatroomId, name, capabilities, preferences) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('heads')
        .insert([
          {
            name,
            capabilities,
            preferences,
            user_id: userId,
            chatroom_id: chatroomId,
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

/**
 * Updates a head (subpersona).
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {number} headId - The ID of the head to update.
 * @param {object} updates - An object containing the updates.
 */
export async function updateHead(userId, chatroomId, headId, updates) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('heads')
        .update(updates)
        .eq('id', headId)
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
    );

    if (error) throw new Error(`Error updating head: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in updateHead:', error);
    throw error;
  }
}

/**
 * Validate interactions with the heads table (e.g. check if it belongs to user).
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {number} headId - The ID of the head.
 */
export async function validateHeadInteraction(userId, chatroomId, headId) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('heads')
        .select('*')
        .eq('id', headId)
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
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

/**
 * Fetch heads by user_id and chatroom_id.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 */
export async function getHeads(userId, chatroomId) {
  try {
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('heads')
        .select('*')
        .eq('user_id', userId)
        .eq('chatroom_id', chatroomId)
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

/* -----------------------------------------------------------------------------
 *   Context
 * --------------------------------------------------------------------------- */

/**
 * Inserts a new context row.
 * @param {string} userId - The user ID.
 * @param {string} chatroomId - The chatroom ID.
 * @param {object} contextData - Arbitrary data to store in 'contexts' table.
 */
export async function insertContext(userId, chatroomId, contextData) {
  try {
    if (!userId || !chatroomId) {
      throw new Error('Missing user_id or chatroom_id for inserting context.');
    }
    await setSessionContext(userId, chatroomId);
    console.log(`🔐 Session context set: user_id=${userId}, chatroom_id=${chatroomId}`);

    const { data, error } = await supabaseRequest(
      supabase
        .from('contexts')
        .insert([{ user_id: userId, chatroom_id: chatroomId, data: contextData }])
    );

    if (error) throw new Error(`Error inserting context: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error('Error in insertContext:', error);
    throw error;
  }
}
