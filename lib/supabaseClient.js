import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase configuration error: Missing DATABASE_URL or KEY in environment variables.");
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Persistent session variables
let persistentUserId = null;
let persistentChatroomId = null;

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
 * Inserts a new session into the user_sessions table.
 * @param {string} user_id - Unique user ID.
 * @param {string} chatroom_id - Unique chatroom ID.
 */
const createSession = async (user_id, chatroom_id) => {
    validateUserAndChatroom(user_id, chatroom_id);  // ✅ Validate IDs

    try {
        // Check if the session already exists
        const { data: existingSession, error: checkError } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', user_id)
            .eq('chatroom_id', chatroom_id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw new Error(`Failed to check existing session: ${checkError.message}`);
        }

        if (!existingSession) {
            // ✅ Insert session without auto-generating IDs
            const { data, error } = await supabase
                .from('user_sessions')
                .insert([{ user_id, chatroom_id }]);

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
 * Initializes a persistent session without generating new IDs.
 * IDs must come from the workflow.
 */
const initializeSession = async (user_id, chatroom_id) => {
    validateUserAndChatroom(user_id, chatroom_id);  // ✅ Validate IDs

    persistentUserId = user_id;
    persistentChatroomId = chatroom_id;

    console.log(`🔒 Initializing persistent session: user_id=${persistentUserId}, chatroom_id=${persistentChatroomId}`);
    await createSession(persistentUserId, persistentChatroomId);
    await setSessionContext(persistentUserId, persistentChatroomId);
};

/**
 * Sets session context for RLS policies.
 * @param {string} user_id - The user's unique ID.
 * @param {string} chatroom_id - The chatroom's unique ID.
 */
const setSessionContext = async (user_id, chatroom_id) => {
    const contextUpdates = [
        supabase.rpc('set_config', { key: 'user_sessions.user_id', value: user_id }),
        supabase.rpc('set_config', { key: 'user_sessions.chatroom_id', value: chatroom_id })
    ];

    const results = await Promise.all(contextUpdates);

    results.forEach(({ error }, index) => {
        if (error) {
            const key = index === 0 ? 'user_id' : 'chatroom_id';
            console.error(`❌ Failed to set session context for ${key}:`, error.message);
            throw new Error(`Failed to set session context for ${key}`);
        }
    });

    console.log(`✅ Session context set for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
};

/**
 * Executes a Supabase action with session context and error handling.
 * @param {Promise} action - The Supabase query action.
 * @returns {Promise<any>} - Query result.
 */
export const supabaseRequest = async (action, user_id, chatroom_id) => {
    try {
        validateUserAndChatroom(user_id, chatroom_id);  // ✅ Validate IDs

        await setSessionContext(user_id, chatroom_id);

        console.log("🚀 Executing Supabase action...");
        const { data, error } = await action;

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

export { supabase, setSessionContext, createSession, initializeSession };
export default supabase;
