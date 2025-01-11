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

// Wrapper function for API calls with detailed error handling and debug logging
export const supabaseRequest = async (action, ...args) => {
    try {
        if (typeof action !== 'function') {
            throw new TypeError('The action parameter must be a function');
        }

        console.log("Executing Supabase action with arguments:", args);
        const result = await action(...args);
        console.log("Supabase Response:", result);

        if (result.error) {
            console.error("Supabase API Error:", result.error.message || result.error);
            throw new Error(result.error.message || 'Supabase query failed');
        }

        if (!result.data) {
            console.warn("No data returned from Supabase. Using fallback data.");
            return { message: 'No data available', data: [] };  // Provide fallback data
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
        console.log(`Performing bulk update on table: ${table}`);
        const { data, error } = await supabase
            .from(table)
            .upsert(updates, { onConflict: matchKey });

        if (error) {
            console.error(`Error performing bulk update on ${table}:`, error.message);
            throw new Error(`Error performing bulk update: ${error.message}`);
        }

        console.log("Bulk update successful:", data);
        return data;
    } catch (error) {
        console.error("Error in bulkUpdate:", error);
        throw error;
    }
};

export default supabase;
