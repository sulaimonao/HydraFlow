//src/state/templates_state.js
import { supabase } from "../../lib/db.js";
import { logError } from "../util/logging/logger.js";

export async function fetchTemplate(task) {
  try {
    const { data, error } = await supabase.from("templates").select("*").eq("name", task).single();

    if (error) {
      logError(`Error fetching template for task "${task}": ${error.message}`);
      return null;
    }

    return data || null;
  } catch (error) {
    logError(`Unexpected error fetching template for task "${task}": ${error.message}`);
    return null;
  }
}

export async function fetchAllTemplates() {
  try {
    const { data, error } = await supabase.from("templates").select("*");

    if (error) {
      logError(`Error fetching all templates: ${error.message}`);
      return [];
    }

    return data || [];
  } catch (error) {
    logError(`Unexpected error fetching all templates: ${error.message}`);
    return [];
  }
}
