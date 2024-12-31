// lib/db.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Insert a new debug log
export async function insertDebugLog({ userId, contextId, issue, resolution }) {
  try {
    const { data, error } = await supabase
      .from("debug_logs")
      .insert([{ user_id: userId, context_id: contextId, issue, resolution }])
      .select();
    if (error) throw new Error(`Error inserting debug log: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error("Error in insertDebugLog:", error);
    throw error;
  }
}

// Fetch debug logs
export async function fetchDebugLogs({ userId, contextId }) {
  try {
    const { data, error } = await supabase
      .from("debug_logs")
      .select("id, issue, resolution, timestamp")
      .eq("user_id", userId)
      .eq("context_id", contextId);
    if (error) throw new Error(`Error fetching debug logs: ${error.message}`);
    return data;
  } catch (error) {
    console.error("Error in fetchDebugLogs:", error);
    throw error;
  }
}

// Insert a new template
export async function insertTemplate({ name, configuration }) {
  try {
    const { data, error } = await supabase
      .from("templates")
      .insert([{ name, configuration }])
      .select();
    if (error) throw new Error(`Error inserting template: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error("Error in insertTemplate:", error);
    throw error;
  }
}

// Fetch templates
export async function fetchTemplates() {
  try {
    const { data, error } = await supabase
      .from("templates")
      .select("id, name, configuration, created_at");
    if (error) throw new Error(`Error fetching templates: ${error.message}`);
    return data;
  } catch (error) {
    console.error("Error in fetchTemplates:", error);
    throw error;
  }
}

// Fetch heads with capabilities and preferences
export async function fetchHeads({ userId, chatroomId }) {
  try {
    const { data, error } = await supabase
      .from("heads")
      .select("id, name, status, capabilities, preferences")
      .eq("user_id", userId)
      .eq("chatroom_id", chatroomId);
    if (error) throw new Error(`Error fetching heads: ${error.message}`);
    return data;
  } catch (error) {
    console.error("Error in fetchHeads:", error);
    throw error;
  }
}

// Insert a new head with capabilities and preferences
export async function insertHead({ userId, chatroomId, name, status, capabilities, preferences }) {
  try {
    const { data, error } = await supabase
      .from("heads")
      .insert([{ user_id: userId, chatroom_id: chatroomId, name, status, capabilities, preferences }])
      .select();
    if (error) throw new Error(`Error inserting head: ${error.message}`);
    return data[0];
  } catch (error) {
    console.error("Error in insertHead:", error);
    throw error;
  }
}
