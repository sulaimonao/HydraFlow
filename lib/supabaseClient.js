// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
        const { data, error } = await action(...args);
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
