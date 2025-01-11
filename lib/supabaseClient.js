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

// Assuming JWT is stored in process.env.JWT for server-side or localStorage/sessionStorage for client-side
const jwtToken = process.env.JWT || null;

const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
        headers: {
            Authorization: jwtToken ? `Bearer ${jwtToken}` : undefined
        }
    }
});

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
