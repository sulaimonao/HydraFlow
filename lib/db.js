// lib/db.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Insert a new task card
export async function insertTaskCard({ goal, priority = "High" }) {
  try {
    const { data, error } = await supabase
      .from("task_cards")
      .insert([{ goal, priority, active: true }])
      .select();
    if (error) throw new Error(`Error inserting task card: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error("Error in insertTaskCard:", error);
    throw error;
  }
}

// Insert subtasks for a task card
export async function insertSubtasks({ taskCardId, subtasks }) {
  try {
    const formattedSubtasks = subtasks.map((subtask) => ({
      task_card_id: taskCardId,
      description: subtask.description,
      status: subtask.status || "pending",
    }));

    const { data, error } = await supabase.from("subtasks").insert(formattedSubtasks).select();
    if (error) throw new Error(`Error inserting subtasks: ${error.message}`);
    return data;
  } catch (error) {
    console.error("Error in insertSubtasks:", error);
    throw error;
  }
}

// Fetch task cards and subtasks
export async function fetchTaskCards() {
  try {
    const { data, error } = await supabase
      .from("task_cards")
      .select(`
        id, goal, priority, active, created_at,
        subtasks (
          id, description, status, created_at
        )
      `)
      .eq("active", true);

    if (error) throw new Error(`Error fetching task cards: ${error.message}`);
    return data;
  } catch (error) {
    console.error("Error in fetchTaskCards:", error);
    throw error;
  }
}

// Update subtask status
export async function updateSubtaskStatus({ subtaskId, status }) {
  try {
    const { data, error } = await supabase
      .from("subtasks")
      .update({ status })
      .eq("id", subtaskId)
      .select();

    if (error) throw new Error(`Error updating subtask status: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error("Error in updateSubtaskStatus:", error);
    throw error;
  }
}

// Mark task card as inactive (instead of deleting)
export async function markTaskCardInactive({ taskCardId }) {
  try {
    const { data, error } = await supabase
      .from("task_cards")
      .update({ active: false })
      .eq("id", taskCardId)
      .select();

    if (error) throw new Error(`Error marking task card inactive: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error("Error in markTaskCardInactive:", error);
    throw error;
  }
}

// Append to memory for user and chatroom
export async function appendMemory({ userId, chatroomId, memoryChunk }) {
  try {
    const { data, error } = await supabase
      .from("memories")
      .upsert({ user_id: userId, chatroom_id: chatroomId, memory: memoryChunk })
      .select();
    if (error) throw new Error(`Error appending memory: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error("Error in appendMemory:", error);
    throw error;
  }
}

// Fetch memory for a user and chatroom
export async function fetchMemory({ userId, chatroomId }) {
  try {
    const { data, error } = await supabase
      .from("memories")
      .select("memory")
      .eq("user_id", userId)
      .eq("chatroom_id", chatroomId);

    if (error) throw new Error(`Error fetching memory: ${error.message}`);
    return data.map((row) => row.memory).join(" ");
  } catch (error) {
    console.error("Error in fetchMemory:", error);
    throw error;
  }
}

// Fetch gauge data
export async function fetchGaugeData({ userId, chatroomId }) {
  try {
    const tasks = await fetchTaskCards();
    const memory = await fetchMemory({ userId, chatroomId });
    const { data: heads } = await supabase
      .from("heads")
      .select("*")
      .eq("user_id", userId)
      .eq("chatroom_id", chatroomId);

    return {
      contextSnapshot: { memory },
      headCount: heads ? heads.length : 0,
      activeTasksCount: tasks.filter((task) =>
        task.subtasks.some((subtask) => subtask.status !== "completed")
      ).length,
    };
  } catch (error) {
    console.error("Error in fetchGaugeData:", error);
    throw error;
  }
}
