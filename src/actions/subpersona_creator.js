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
 */
async function createSubpersonaFromTemplate(templateName, user_id, chatroom_id) {
  const template = subpersonaTemplates[templateName];
  if (!template) {
    throw new Error(`Unknown template: ${templateName}`);
  }

  const headId = `head_${uuidv4()}`;
  const name = `Head for ${template.task}`;

  const existingHeads = await getHeads(user_id, chatroom_id);
  if (existingHeads.length > 0) {
    return { error: "Sub-persona already exists", details: existingHeads };
  }

  try {
    const head = await insertHead({
      name,
      capabilities: { task: template.task },
      preferences: { description: template.description },
      user_id,
      chatroom_id
    });

    activeHeads[headId] = {
      name: head.name,
      task_description: template.description,
      status: "active",
      memory: []
    };

    return { headId, name: head.name, status: "active" };
  } catch (error) {
    return { error: "Failed to create sub-persona", details: error.message };
  }
}

/**
 * Activate a previously deactivated subpersona
 */
function activateSubpersona(headId) {
  if (activeHeads[headId]) {
    activeHeads[headId].status = "active";
    console.log(`Sub-persona ${headId} activated.`);
  } else {
    console.warn(`Sub-persona ${headId} not found.`);
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
 * List all active subpersonas
 */
function listActiveSubpersonas() {
  return Object.entries(activeHeads)
    .filter(([_, head]) => head.status === "active")
    .map(([headId, head]) => ({ headId, ...head }));
}

/**
 * Create a new subpersona with RLS-compliant user_id
 */
export async function createSubpersona(name, user_id, chatroom_id, capabilities, preferences) {
  try {
    const existingHead = await supabaseRequest(() =>
      supabase
        .from('heads')
        .select('*')
        .eq('name', name)
        .eq('status', 'active')
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
        .maybeSingle()
    );

    if (existingHead !== null) {
      return { error: `Subpersona '${name}' already exists.` };
    }

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
        .insert([newSubpersona], { returning: 'representation' })
    );

    if (insertResult.error) {
      throw new Error(`Insert failed: ${insertResult.error.message}`);
    }

    return { message: 'Subpersona created successfully', data: insertResult.data };
  } catch (error) {
    console.error('Insert failed:', error.message);
    return { error: error.message };
  }
}

export {
  createSubpersonaFromTemplate,
  activateSubpersona,
  deactivateSubpersona,
  pruneHead,
  listActiveSubpersonas
};
