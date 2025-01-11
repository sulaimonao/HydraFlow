// src/actions/subpersona_creator.js

import { insertHead, getHeads } from '../../lib/db.js';
import { v4 as uuidv4 } from 'uuid';
import supabase, { supabaseRequest } from '../../lib/supabaseClient.js';

const activeHeads = {}; // Store active heads temporarily

// Template-based creation (optional)
const subpersonaTemplates = {
  logAnalyzer: {
    task: "analyze logs",
    description: "This sub-persona specializes in log analysis.",
  },
  memoryOptimizer: {
    task: "optimize memory",
    description: "This sub-persona specializes in memory optimization.",
  },
};

/**
 * Create a subpersona from a known template
 * - This remains available if you need it in other parts of your code.
 */
async function createSubpersonaFromTemplate(templateName, user_id, chatroom_id) {
  const template = subpersonaTemplates[templateName];
  if (!template) {
    throw new Error(`Unknown template: ${templateName}`);
  }

  const headId = `head_${uuidv4()}`;
  const name = `Head for ${template.task}`;

  const generatedUserId = user_id || uuidv4();
  const generatedChatroomId = chatroom_id || uuidv4();

  console.log('Generated UUIDs:', {
    user_id: generatedUserId,
    chatroom_id: generatedChatroomId
  });

  // Check if there's already a head for this user+chatroom
  const existingHeads = await getHeads(generatedUserId, generatedChatroomId);
  if (existingHeads.length > 0) {
    console.warn(
      `Sub-persona already exists for user_id: ${generatedUserId} and chatroom_id: ${generatedChatroomId}`
    );
    return { error: "Sub-persona already exists", details: existingHeads };
  }

  console.log('Creating sub-persona with:', {
    name,
    user_id: generatedUserId,
    chatroom_id: generatedChatroomId
  });

  try {
    const head = await insertHead({
      name,
      capabilities: { task: template.task },
      preferences: { description: template.description },
      user_id: generatedUserId,
      chatroom_id: generatedChatroomId
    });

    activeHeads[headId] = {
      name: head.name,
      task_description: template.description,
      status: "active",
      memory: []
    };

    console.log('Sub-persona created successfully:', head);
    return { headId, name: head.name, status: "active" };
  } catch (error) {
    console.error('Failed to create sub-persona:', error.message);
    return { error: "Failed to create sub-persona", details: error.message };
  }
}

/**
 * Deactivate a subpersona in memory
 */
function deactivateSubpersona(headId) {
  if (activeHeads[headId]) {
    activeHeads[headId].status = "inactive";
    console.log(`Sub-persona ${headId} deactivated.`);
  } else {
    console.warn(`Sub-persona ${headId} not found.`);
  }
}

/**
 * Prune (delete) a subpersona from the database + our in-memory store
 */
async function pruneHead(headId) {
  if (!activeHeads[headId]) {
    console.warn(`Sub-persona ${headId} does not exist or is already pruned.`);
    return { error: "Sub-persona not found or already inactive." };
  }

  try {
    delete activeHeads[headId];

    await supabaseRequest(() =>
      supabase.from('heads').delete().eq('id', headId)
    );

    console.log(`Sub-persona ${headId} has been pruned.`);
    return { success: `Sub-persona ${headId} has been successfully pruned.` };
  } catch (error) {
    console.error(`Error pruning sub-persona ${headId}:`, error);
    return { error: `Failed to prune sub-persona ${headId}.` };
  }
}

/**
 * Create a new subpersona (head) only if there's no
 * existing active head with the same name for this user & chatroom.
 *
 * @param {string} name - The subpersona name (e.g., "Optimizer")
 * @param {string} user_id - The user ID to associate with this subpersona
 * @param {string} chatroom_id - The chatroom ID to associate with this subpersona
 * @param {object} capabilities - JSON object describing capabilities
 * @param {object} preferences - JSON object describing preferences
 * @returns {object} - { message, data } on success, or { error } if fails
 */
export async function createSubpersona(name, user_id, chatroom_id, capabilities, preferences) {
  try {
    // 1️⃣ Query for existing active head
    const existingHeadResult = await supabaseRequest(() =>
      supabase
        .from('heads')
        .select('*')
        .eq('name', name)
        .eq('status', 'active')
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
        .maybeSingle()
    );

    // 2️⃣ Check if 'existingHeadResult' is null
    if (existingHeadResult === null) {
      console.log("No active subpersona with that name found. Proceeding to create...");
      // => That means no row found
    } else {
      // existingHeadResult is a row/object
      console.warn(`An active subpersona '${name}' already exists for user_id=${user_id}, chatroom_id=${chatroom_id}`);
      return { error: `Subpersona '${name}' already exists and is active.` };
    }

    // 3️⃣ Insert new subpersona
    const newSubpersona = {
      name,
      status: 'active',
      user_id,
      chatroom_id,
      capabilities: capabilities || {},
      preferences: preferences || {},
      createdat: new Date().toISOString(),
    };

    const insertResult = await supabaseRequest(() =>
      supabase
        .from('heads')
        .insert([newSubpersona])
        .select()
    );

    // 4️⃣ If insertResult is null, that would be odd—likely means the insert returned no rows
    if (insertResult === null) {
      console.warn("Insert returned no data. Possibly the row was not created?");
      return { error: "Failed to create subpersona." };
    }

    // 'insertResult' might be an array containing the inserted row, or an object—depends on your setup
    console.log('Subpersona created successfully:', insertResult);
    return { message: 'Subpersona created successfully', data: insertResult };
  } catch (error) {
    console.error('Error creating subpersona:', error);
    return { error: error.message };
  }
}

// Export updated functions
export {
  createSubpersonaFromTemplate,
  deactivateSubpersona,
  pruneHead
};
