// src/actions/subpersona_creator.js
import { insertHead, getHeads } from '../../lib/db.js';
import { setSessionContext } from '../../lib/supabaseClient.js';
import { orchestrateContextWorkflow } from '../logic/workflow_manager.js';
import supabase, { supabaseRequest } from '../../lib/supabaseClient.js';

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

// ✅ Validates required IDs
const validateIds = (user_id, chatroom_id) => {
  if (!user_id || !chatroom_id) {
    throw new Error("❗ Missing user_id or chatroom_id. Both must be provided.");
  }
};

// 🚀 Creates a subpersona based on a predefined template
async function createSubpersonaFromTemplate(templateName, query) {
  try {
    // 🔒 Retrieve persistent IDs from the workflow manager
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const { user_id, chatroom_id } = generatedIdentifiers;

    validateIds(user_id, chatroom_id);
    await setSessionContext(user_id, chatroom_id);

    const template = subpersonaTemplates[templateName];
    if (!template) throw new Error(`❗ Unknown template: ${templateName}`);

    // ✅ Check if a similar subpersona already exists
    const existingHeads = await getHeads(user_id, chatroom_id);
    if (existingHeads.some(head => head.name === `Head for ${template.task}`)) {
      return { error: "⚠️ Subpersona already exists." };
    }

    // 📝 Insert the subpersona into the database
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

    return { headId: head.id, name: head.name, status: "active" };
  } catch (error) {
    console.error("❌ Error creating subpersona from template:", error.message);
    return { error: error.message };
  }
}

// 🟢 Activates a subpersona by head ID
function activateSubpersona(headId) {
  if (activeHeads[headId]) {
    activeHeads[headId].status = "active";
    console.log(`✅ Subpersona ${headId} activated.`);
  } else {
    console.warn(`⚠️ Subpersona ${headId} not found.`);
  }
}

// 🔴 Deactivates a subpersona by head ID
function deactivateSubpersona(headId) {
  if (activeHeads[headId]) {
    activeHeads[headId].status = "inactive";
    console.log(`🛑 Subpersona ${headId} deactivated.`);
  } else {
    console.warn(`⚠️ Subpersona ${headId} not found.`);
  }
}

// 🗑️ Removes a subpersona from both memory and the database
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

// 📋 Lists all active subpersonas
function listActiveSubpersonas() {
  return Object.entries(activeHeads)
    .filter(([_, head]) => head.status === "active")
    .map(([headId, head]) => ({ headId, ...head }));
}

// 🛠️ Creates a custom subpersona with enforced IDs
export async function createSubpersona(query, name, capabilities, preferences) {
  try {
    const { generatedIdentifiers } = await orchestrateContextWorkflow({ query, req });
    const { user_id, chatroom_id } = generatedIdentifiers;

    validateIds(user_id, chatroom_id);
    await setSessionContext(user_id, chatroom_id);

    // ✅ Check for existing subpersona with the same name
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
