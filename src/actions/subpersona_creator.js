//src/actions/subpersona_creator.js

import { insertHead, getHeads } from '../../lib/db.js';
import { v4 as uuidv4 } from 'uuid';
import supabase, { supabaseRequest } from '../../lib/supabaseClient.js';

const activeHeads = {}; // Store active heads temporarily

// Template-based creation
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

// **Renamed to avoid conflict**
async function createSubpersonaFromTemplate(templateName, user_id, chatroom_id) {
  const template = subpersonaTemplates[templateName];
  if (!template) {
    throw new Error(`Unknown template: ${templateName}`);
  }

  const headId = `head_${uuidv4()}`;
  const name = `Head for ${template.task}`;

  const generatedUserId = user_id || uuidv4();
  const generatedChatroomId = chatroom_id || uuidv4();

  console.log('Generated UUIDs:', { user_id: generatedUserId, chatroom_id: generatedChatroomId });

  const existingHeads = await getHeads(generatedUserId, generatedChatroomId);
  if (existingHeads.length > 0) {
    console.warn(`Sub-persona already exists for user_id: ${generatedUserId} and chatroom_id: ${generatedChatroomId}`);
    return { error: "Sub-persona already exists", details: existingHeads };
  }

  console.log('Creating sub-persona with:', { name, user_id: generatedUserId, chatroom_id: generatedChatroomId });

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

// Lifecycle management
function deactivateSubpersona(headId) {
  if (activeHeads[headId]) {
    activeHeads[headId].status = "inactive";
    console.log(`Sub-persona ${headId} deactivated.`);
  } else {
    console.warn(`Sub-persona ${headId} not found.`);
  }
}

/**
 * Prunes (removes) inactive or redundant subpersonas.
 * @param {string} headId - The ID of the subpersona to prune.
 * @returns {Object} - Success or error message.
 */
async function pruneHead(headId) {
  if (!activeHeads[headId]) {
    console.warn(`Sub-persona ${headId} does not exist or is already pruned.`);
    return { error: "Sub-persona not found or already inactive." };
  }

  try {
    delete activeHeads[headId];

    await supabaseRequest(() => supabase.from('heads').delete().eq('id', headId)
    );

    console.log(`Sub-persona ${headId} has been pruned.`);
    return { success: `Sub-persona ${headId} has been successfully pruned.` };
  } catch (error) {
    console.error(`Error pruning sub-persona ${headId}:`, error);
    return { error: `Failed to prune sub-persona ${headId}.` };
  }
}

// **Keep this as the main exported function**
export async function createSubpersona(name, user_id, chatroom_id, capabilities, preferences) {
  try {
    const { data: context, error: contextError } = await supabaseRequest(
      supabase.from('subpersonas').select('*').eq('name', name).single()
    );

    if (contextError && contextError.message !== "No rows found") {
      return { error: 'Failed to verify existing context.' };
    }

    const subPersona = {
      name,
      capabilities: capabilities || {},
      preferences: preferences || {},
      user_id,
      chatroom_id,
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabaseRequest(
      supabase.from('subpersonas').insert([subPersona])
    );

    if (error) {
      return { error: 'Failed to create subpersona.' };
    }

    return data;
  } catch (error) {
    console.error('Error creating subpersona:', error);
    return { error: error.message };
  }
}

// Export updated functions
export { createSubpersonaFromTemplate, deactivateSubpersona, pruneHead };
