import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

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
 * Ensures the provided ID is a valid UUID or generates one.
 * @param {string|null} id - The ID to validate.
 * @returns {string} - Valid UUID.
 */
const formatUUID = (id) => {
    return id && typeof id === 'string' ? id : uuidv4();
};

/**
 * Inserts a new session into the user_sessions table if it doesn't exist.
 * @param {string} user_id - Unique user ID.
 * @param {string} chatroom_id - Unique chatroom ID.
 */
const createSession = async (user_id, chatroom_id) => {
    try {
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
 * Initializes a persistent session only once.
 */
const initializeSession = async (user_id, chatroom_id) => {
    persistentUserId = formatUUID(user_id || persistentUserId);
    persistentChatroomId = formatUUID(chatroom_id || persistentChatroomId);

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
        user_id = formatUUID(user_id || persistentUserId);
        chatroom_id = formatUUID(chatroom_id || persistentChatroomId);

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
