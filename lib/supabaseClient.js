//lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("❌ Supabase configuration error: Missing DATABASE_URL or KEY in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const validateUserAndChatroom = (user_id, chatroom_id) => {
    if (!user_id || !chatroom_id) {
        console.error(`❌ user_id or chatroom_id is null. user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
        throw new Error("❌ user_id and chatroom_id must be provided and cannot be null.");
    }
};

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

const createSession = async (user_id, chatroom_id) => {
    validateUserAndChatroom(user_id, chatroom_id);
    console.log(`Creating session for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

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
                    .insert([{
                        user_id,
                        chatroom_id,
                        created_at: now,
                        updated_at: now,
                        expires_at: expiresAt,
                        is_active: true
                    }])
                    .select()
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

export const setSessionContext = async (user_id, chatroom_id) => {
    validateUserAndChatroom(user_id, chatroom_id);
  
    console.log(`🔐 Setting session context for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
  
    const { error } = await withRetry(() =>
      supabase.rpc('set_rls_context', { user_id, chatroom_id })
    );
  
    if (error) {
      console.error(`❌ Failed to set session context: ${error.message}`);
      throw new Error(`Failed to set session context: ${error.message}`);
    }
  
    console.log(`✅ Session context set for user_id: ${user_id}, chatroom_id: ${chatroom_id}`);
  };

export const supabaseRequest = async (action, req) => {
    try {
        validateUserAndChatroom(req.session.user_id, req.session.chatroom_id);
        await setSessionContext(req.session.user_id, req.session.chatroom_id);

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
