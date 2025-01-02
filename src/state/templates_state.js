import { supabase } from "../../lib/db.js";
import { logError } from "../util/index.js";

/**
 * Fetch a template by task name.
 * @param {string} task - The task name to fetch the template for.
 * @returns {Object|null} - The template object or null if not found.
 */
export async function fetchTemplate(task) {
  try {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("name", task)
      .single(); // Fetch a single matching template

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

/**
 * Fetch all available templates.
 * @returns {Array} - An array of all templates.
 */
export async function fetchAllTemplates() {
  try {
    const { data, error } = await supabase
      .from("templates")
      .select("*");

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
