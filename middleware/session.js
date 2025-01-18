//middleware/session.js
import { v4 as uuidv4 } from 'uuid';
import cookie from 'cookie';
import supabase from '../lib/supabaseClient.js';

export const sessionHandler = async (req, res, next) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    let sessionId = cookies.session_id;

    // STEP 1: If no session, create one with user_id and chatroom_id
    if (!sessionId) {
      const userId = uuidv4();
      const chatroomId = uuidv4();
      sessionId = uuidv4();

      const { error } = await supabase
        .from('user_sessions')
        .insert([{
          id: sessionId,
          user_id: userId,
          chatroom_id: chatroomId,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30-day expiration
          is_active: true
        }])
        .select();

      if (error) {
        console.error('❌ Failed to create session in Supabase:', error.message);
        throw new Error('Failed to create session');
      }

      // Set secure session cookie
      res.setHeader('Set-Cookie', cookie.serialize('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'lax',
      }));

      console.log(`✅ New session initialized: session_id=${sessionId}, user_id=${userId}, chatroom_id=${chatroomId}`);
    }

    // STEP 2: Validate existing session
    const { data, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !data || !data.is_active) {
      console.error(`❌ Invalid or inactive session: ${sessionId}`);
      throw new Error('Invalid or inactive session');
    }

    // STEP 3: Pass session to the request object
    req.sessionId = sessionId;
    req.session = {
      userId: data.user_id,
      chatroomId: data.chatroom_id
    };

    console.log(`🔐 Session restored: session_id=${sessionId}, user_id=${data.user_id}, chatroom_id=${data.chatroom_id}`);
    
    next();
  } catch (error) {
    console.error('❌ Session Error:', error.message);
    res.status(500).json({ error: 'Session handling failed' });
  }
};
