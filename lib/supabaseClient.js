// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;

// Ensure user_id and chatroom_id are UUID in all insert/update operations
const formatUUID = (id) => {
    if (!id) return uuidv4();
    return typeof id === 'string' ? id : uuidv4();
};

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase configuration error: Missing DATABASE_URL or KEY in environment variables.");
    process.exit(1);
}

// Create Supabase client without JWT
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Executes a Supabase action with proper error handling.
 * @param {Function} action - The Supabase action to execute.
 * @param {...any} args - Arguments for the action.
 * @returns {Promise<any>} - The result of the action.
 */
export const supabaseRequest = async (action, ...args) => {
    try {
        if (typeof action !== 'function') {
            throw new TypeError('The action parameter must be a function');
        }

        console.log("Executing Supabase action with arguments:", args);
        const formattedArgs = args.map(arg => {
            if (arg.user_id) arg.user_id = formatUUID(arg.user_id);
            if (arg.chatroom_id) arg.chatroom_id = formatUUID(arg.chatroom_id);
            return arg;
        });

        const { data, error } = await action(...formattedArgs);
        console.log("Supabase Response:", data);

        if (error) {
            console.error("Supabase API Error:", error.message || error);
            throw new Error(error.message || 'Supabase query failed');
        }

        if (!data || (Array.isArray(data) && data.length === 0)) {
            console.warn("No data returned from Supabase.");
            return null;
        }

        return data;
    } catch (err) {
        console.error("Supabase Request Failed:", err);
        throw err;
    }
};

export default supabase;
