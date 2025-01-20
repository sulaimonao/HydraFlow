// src/actions/subpersona_creator.js
import { insertHead, getHeads } from '../../lib/db.js';
import { supabaseRequest } from '../../lib/supabaseClient.js';
import { setSessionContext } from '../lib/sessionUtils.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';
import supabase from '../../lib/supabaseClient.js';

const activeHeads = {};

// 🔥 Predefined subpersona templates
const subpersonaTemplates = {
  logAnalyzer: {
    task: "analyze logs",
    description: "This subpersona specializes in log analysis.",
  },
  memoryOptimizer: {
    task: "optimize memory",
    description: "This subpersona specializes in memory optimization.",
  },
};

// ✅ Validate required IDs
const validateIds = (user_id, chatroom_id) => {
  if (!user_id || !chatroom_id) {
    throw new Error("❗ Missing user_id or chatroom_id. Both must be provided.");
  }
};

// 🚀 Create a subpersona from a predefined template
async function createSubpersonaFromTemplate(templateName, query, req) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const { user_id, chatroom_id } = generatedIdentifiers;

    validateIds(user_id, chatroom_id);
    await setSessionContext(user_id, chatroom_id);

    const template = subpersonaTemplates[templateName];
    if (!template) throw new Error(`❗ Unknown template: ${templateName}`);

    // ✅ Check if subpersona already exists
    const existingHeads = await getHeads(user_id, chatroom_id);
    if (existingHeads.some(head => head.name === `Head for ${template.task}`)) {
      return { error: "⚠️ Subpersona already exists." };
    }

    // 📝 Insert subpersona into the database
    const head = await insertHead({
      name: `Head for ${template.task}`,
      capabilities: { task: template.task },
      preferences: { description: template.description },
      user_id,
      chatroom_id
    });

    activeHeads[head.id] = {
      name: head.name,
      task_description: template.description,
      status: "active",
      memory: []
    };

    console.log(`✅ Created subpersona '${head.name}' for user ${user_id}.`);
    return { headId: head.id, name: head.name, status: "active" };
  } catch (error) {
    console.error("❌ Error creating subpersona from template:", error.message);
    return { error: error.message };
  }
}

// 🟢 Activate a subpersona by head ID
function activateSubpersona(headId) {
  if (activeHeads[headId]) {
    activeHeads[headId].status = "active";
    console.log(`✅ Subpersona ${headId} activated.`);
  } else {
    console.warn(`⚠️ Subpersona ${headId} not found.`);
  }
}

// 🔴 Deactivate a subpersona by head ID
function deactivateSubpersona(headId) {
  if (activeHeads[headId]) {
    activeHeads[headId].status = "inactive";
    console.log(`🛑 Subpersona ${headId} deactivated.`);
  } else {
    console.warn(`⚠️ Subpersona ${headId} not found.`);
  }
}

// 🗑️ Prune (delete) a subpersona from memory and database
async function pruneHead(headId) {
  if (!activeHeads[headId]) {
    console.warn(`⚠️ Subpersona ${headId} not found or already pruned.`);
    return { error: "Subpersona not found or already inactive." };
  }

  try {
    delete activeHeads[headId];

    await supabaseRequest(() =>
      supabase.from('heads').delete().eq('id', headId)
    );

    console.log(`🗑️ Subpersona ${headId} has been pruned.`);
    return { success: `Subpersona ${headId} successfully pruned.` };
  } catch (error) {
    console.error(`❌ Error pruning subpersona ${headId}:`, error.message);
    return { error: `Failed to prune subpersona ${headId}.` };
  }
}

// 📋 List all active subpersonas
function listActiveSubpersonas() {
  return Object.entries(activeHeads)
    .filter(([_, head]) => head.status === "active")
    .map(([headId, head]) => ({ headId, ...head }));
}

// 🛠️ Create a custom subpersona with user-defined parameters
export async function createSubpersona(query, name, capabilities, preferences, req) {
  try {
    // Orchestrate the workflow to get user_id and chatroom_id from the request
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const user_id = req.session.userId;
    const chatroom_id = req.session.chatroomId;
    validateIds(user_id, chatroom_id);
    await setSessionContext(user_id, chatroom_id);

    // ✅ Check for existing subpersona
    const { data: existingHead, error } = await supabaseRequest(() =>
      supabase
        .from('heads')
        .select('*')
        .eq('name', name)
        .eq('status', 'active')
        .eq('user_id', user_id)
        .eq('chatroom_id', chatroom_id)
        .maybeSingle()
    );

    if (existingHead) {
      return { error: `⚠️ Subpersona '${name}' already exists.` };
    }

    // 📝 Insert the new subpersona
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
      supabase.from('heads').insert([newSubpersona], { returning: 'representation' })
    );

    if (insertResult.error) {
      throw new Error(`Insert failed: ${insertResult.error.message}`);
    }

    console.log(`✅ Subpersona '${name}' created successfully.`);
    return { message: '✅ Subpersona created successfully.', data: insertResult.data };
  } catch (error) {
    console.error('❌ Error creating subpersona:', error.message);
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
