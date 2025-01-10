//src/actions/subpersona_creator.js

import { insertHead } from '../../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

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

async function createSubpersona(templateName, user_id, chatroom_id) {
  const template = subpersonaTemplates[templateName];
  if (!template) {
    throw new Error(`Unknown template: ${templateName}`);
  }

  const headId = `head_${uuidv4()}`;
  const name = `Head for ${template.task}`;

  console.log('Creating sub-persona with:', { name, user_id, chatroom_id });

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

export { createSubpersona, deactivateSubpersona };
