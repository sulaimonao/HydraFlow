// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase configuration error: Missing DATABASE_URL or KEY in environment variables.");
    process.exit(1);
}

// Create Supabase client without JWT
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to ensure UUID format for user_id and chatroom_id.
 * @param {string} id - The ID to validate.
 * @returns {string} - Formatted UUID.
 */
const formatUUID = (id) => {
    if (!id) return uuidv4();
    return typeof id === 'string' ? id : uuidv4();
};

/**
 * Validates the presence of user_id and chatroom_id in payload.
 * @param {Object} payload - The data object.
 * @throws {Error} - If either ID is missing.
 */
const validateUserAndChatroom = (payload) => {
    if (!payload.user_id || !payload.chatroom_id) {
        throw new Error("Missing user_id or chatroom_id in request payload.");
    }
};

/**
 * Executes a Supabase action with improved error handling.
 * @param {Promise} action - Direct Supabase query action.
 * @returns {Promise<any>} - Query result.
 */
export const supabaseRequest = async (action) => {
    try {
        // Ensure the action is a Supabase query (Promise)
        if (!(action instanceof Promise)) {
            throw new TypeError('The action parameter must be a Supabase query promise');
        }

        console.log("Executing Supabase action...");

        const { data, error } = await action;

        if (error) {
            console.error("❌ Supabase API Error:", error.message || error);
            throw new Error(error.message || 'Supabase query failed');
        }

        if (!data || (Array.isArray(data) && data.length === 0)) {
            console.warn("⚠️ No data returned from Supabase.");
            return null;
        }

        console.log("✅ Supabase Response:", data);
        return data;
    } catch (err) {
        console.error("🔥 Supabase Request Failed:", err.message);
        throw err;
    }
};

export default supabase;
