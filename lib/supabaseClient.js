// /lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Load environment variables
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase configuration error: Missing DATABASE_URL or KEY in environment variables.");
    process.exit(1);
}

// Create a Supabase client with enhanced error handling
const supabase = createClient(supabaseUrl, supabaseKey);

// Wrapper function for API calls with error handling
export const supabaseRequest = async (action, ...args) => {
    try {
        const result = await action(...args);
        if (result.error) {
            console.error("Supabase API Error:", result.error.message);
            throw new Error(result.error.message);
        }
        return result.data;
    } catch (err) {
        console.error("Supabase Request Failed:", err);
        throw err;
    }
};

// New utility function for bulk updates
export const bulkUpdate = async (table, updates, matchKey) => {
    try {
        const { data, error } = await supabase
            .from(table)
            .upsert(updates, { onConflict: matchKey });

        if (error) {
            throw new Error(`Error performing bulk update: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error("Error in bulkUpdate:", error);
        throw error;
    }
};

export default supabase;