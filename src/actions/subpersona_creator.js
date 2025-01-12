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

  const generatedUserId = user_id || uuidv4();
  const generatedChatroomId = chatroom_id || uuidv4();

  const existingHeads = await getHeads(generatedUserId, generatedChatroomId);
  if (existingHeads.length > 0) {
    return { error: "Sub-persona already exists", details: existingHeads };
  }

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

    return { headId, name: head.name, status: "active" };
  } catch (error) {
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
 * Create a new subpersona with RLS-compliant user_id
 */
export async function createSubpersona(name, user_id, chatroom_id, capabilities, preferences) {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData) {
      return { error: 'Authentication error. Cannot create subpersona.' };
    }

    const authenticatedUserId = authData.user.id;

    const existingHead = await supabaseRequest(() =>
      supabase
        .from('heads')
        .select('*')
        .eq('name', name)
        .eq('status', 'active')
        .eq('user_id', authenticatedUserId)
        .eq('chatroom_id', chatroom_id)
        .maybeSingle()
    );

    if (existingHead === null) {
      console.log(`No active subpersona named '${name}' found. Proceeding to create...`);
    } else {
      return { error: `Subpersona '${name}' already exists.` };
    }

    const newSubpersona = {
      name,
      status: 'active',
      user_id: authenticatedUserId,
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

    if (insertResult === null) {
      return { error: "Failed to create subpersona." };
    }

    return { message: 'Subpersona created successfully', data: insertResult };
  } catch (error) {
    return { error: error.message };
  }
}

export {
  createSubpersonaFromTemplate,
  deactivateSubpersona,
  pruneHead
};
