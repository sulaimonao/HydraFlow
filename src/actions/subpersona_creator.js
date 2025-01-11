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
 * Main exported function: Create a new subpersona
 * - Does NOT use a template
 * - Checks if a subpersona with the same name already exists
 * - Avoids .single() to prevent the "JSON object requested..." error
 */
export async function createSubpersona(name, user_id, chatroom_id, capabilities, preferences) {
  try {
    // Attempt to find if a subpersona with this name already exists
    // .maybeSingle() returns `data` as null if no row found, or the row if exactly one row found
    const { data: existingSubpersona, error: findError } = await supabaseRequest(() =>
      supabase
        .from('heads')
        .select('*')
        .eq('name', name)
        .maybeSingle() 
    );

    if (findError) {
      console.error('Failed to verify existing subpersona name:', findError);
      return { error: 'Failed to verify existing subpersona name.' };
    }

    // If we found a subpersona with the same name, bail out
    if (existingSubpersona) {
      console.warn(`Subpersona '${name}' already exists:`, existingSubpersona);
      return { error: `Subpersona '${name}' already exists.`, details: existingSubpersona };
    }

    // Otherwise, proceed to create
    const subPersona = {
      name,
      capabilities: capabilities || {},
      preferences: preferences || {},
      user_id,
      chatroom_id,
      createdAt: new Date().toISOString(),
    };

    // Insert new record
    const { data, error } = await supabaseRequest(() =>
      supabase
        .from('heads')
        .insert([subPersona])
        .select() // Return created record(s)
    );

    if (error) {
      console.error('Error inserting new subpersona:', error);
      return { error: 'Failed to create subpersona.' };
    }

    console.log('Subpersona created successfully:', data);
    return { message: 'Subpersona created successfully', data };
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
