//lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("❌ Supabase configuration error: Missing DATABASE_URL or KEY in environment variables.");
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Validates provided IDs to ensure they are non-null.
 * @param {string} user_id - The user's unique ID.
 * @param {string} chatroom_id - The chatroom's unique ID.
 * @throws {Error} - If either ID is missing.
 */
const validateUserAndChatroom = (user_id, chatroom_id) => {
    if (!user_id || !chatroom_id) {
        throw new Error("❌ user_id and chatroom_id must be provided and cannot be null.");
    }
};

/**
 * Retry mechanism for database operations.
 */
async function withRetry(task, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await task();
        } catch (error) {
            console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
            if (attempt === retries) throw error;
        }
    }
}

/**
 * Inserts a new session into the user_sessions table if it doesn't exist.
 */
const createSession = async (user_id, chatroom_id) => {
    validateUserAndChatroom(user_id, chatroom_id);
    console.log(`Creating session for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);

    try {
        const { data: existingSession, error: checkError } = await withRetry(() =>
            supabase.from('user_sessions')
                .select('*')
                .eq('user_id', user_id)
                .eq('chatroom_id', chatroom_id)
                .single()
        );

        if (checkError && checkError.code !== 'PGRST116') {
            throw new Error(`Failed to check existing session: ${checkError.message}`);
        }

        if (!existingSession) {
            const { data, error } = await withRetry(() =>
                supabase.from('user_sessions')
                    .insert([{ user_id, chatroom_id }])
            );

            if (error) {
                console.error("❌ Failed to create user session:", error.message);
                throw new Error(`Failed to create user session: ${error.message}`);
            }
            console.log("✅ Session created:", data);
        } else {
            console.log("ℹ️ Session already exists. Skipping insertion.");
        }
    } catch (error) {
        console.error("🔥 Error in createSession:", error.message);
        throw error;
    }
};

/**
 * Sets session context in the user_sessions table.
 */
const setSessionContext = async (user_id, chatroom_id) => {
    validateUserAndChatroom(user_id, chatroom_id);

    const { error } = await withRetry(() =>
        supabase.from('user_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('user_id', user_id)
            .eq('chatroom_id', chatroom_id)
    );

    if (error) {
        console.error(`❌ Failed to update session context: ${error.message}`);
        throw new Error(`Failed to update session context: ${error.message}`);
    }

    console.log(`✅ Session context set for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
};

/**
 * Executes a Supabase action with session context and error handling.
 */
export const supabaseRequest = async (action, user_id, chatroom_id) => {
    try {
        validateUserAndChatroom(user_id, chatroom_id);
        await setSessionContext(user_id, chatroom_id);

        console.log("🚀 Executing Supabase action with retries...");
        const { data, error } = await withRetry(() => action);

        if (error) {
            console.error("❌ Supabase API Error:", error.message || error);
            throw new Error(error.message || 'Supabase query failed');
        }

        console.log("✅ Supabase Response:", data);
        return data;
    } catch (err) {
        console.error("🔥 Supabase Request Failed:", err.message);
        throw err;
    }
};

export { supabase, setSessionContext, createSession };
export default supabase;
