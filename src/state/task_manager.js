//src/state/task_manager.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  const { data, error } = await supabase.from('task_cards').insert([taskCard]);
  if (error) throw new Error(`Error creating task card: ${error.message}`);
  return data[0];
};

export const addDependency = async (taskId, dependencyId) => {
  const { data, error } = await supabase.from('subtasks').update({ dependencies: dependencyId }).eq('id', taskId);
  if (error) throw new Error(`Error adding dependency: ${error.message}`);
  return data;
};

export const updateTaskStatus = async (taskId, status) => {
  const { data, error } = await supabase.from('subtasks').update({ status }).eq('id', taskId);
  if (error) throw new Error(`Error updating task status: ${error.message}`);
  return data;
};

export const getTaskCard = async (taskId) => {
  const { data, error } = await supabase.from('task_cards').select('*').eq('id', taskId);
  if (error) throw new Error(`Error fetching task card: ${error.message}`);
  return data[0];
};
