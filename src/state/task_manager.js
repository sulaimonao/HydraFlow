// src/state/task_manager.js
import supabase, { supabaseRequest } from '../../lib/supabaseClient';

export const createTaskCard = async (goal, subtasks) => {
  const taskCard = {
    goal,
    priority: "High",
    subtasks: subtasks.map((task, index) => ({
      description: task,
      status: "pending",
      dependencies: [],
    })),
    createdAt: new Date().toISOString(),
  };

  const data = await supabaseRequest(
    supabase.from('task_cards').insert([taskCard])
  );
  return data[0];
};

export const addDependency = async (taskId, dependencyId) => {
  const data = await supabaseRequest(
    supabase.from('subtasks').update({ dependencies: dependencyId }).eq('id', taskId)
  );
  return data;
};

export const updateTaskStatus = async (taskId, status) => {
  const data = await supabaseRequest(
    supabase.from('subtasks').update({ status }).eq('id', taskId)
  );
  return data;
};

export const getTaskCard = async (taskId) => {
  const data = await supabaseRequest(
    supabase.from('task_cards').select('*').eq('id', taskId)
  );
  return data[0];
};
