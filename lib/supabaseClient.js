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
        const { data, error } = await action(...args);
        console.log("Supabase Response:", data);

        if (error) {
            console.error("Supabase API Error:", error.message || error);
            throw new Error(error.message || 'Supabase query failed');
        }

        // If 'data' is null or undefined, that means no rows returned (e.g. .maybeSingle() found no match)
        if (data == null || (Array.isArray(data) && data.length === 0)) {
            console.warn("No data returned from Supabase. Returning null.");
            return null;
        }        

        // If 'data' is an empty array, that might also indicate no rows found (typical for .select without .single)
        // but we can still return the empty array, so you can differentiate between [] vs null
        // If you prefer to treat empty [] as 'no data', you could do:
        // if (Array.isArray(data) && data.length === 0) return null;

        return data; // Return the actual data if we have something
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
