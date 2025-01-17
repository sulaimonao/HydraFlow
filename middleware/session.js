//middleware/session.js
import { v4 as uuidv4 } from 'uuid';
import cookie from 'cookie';
import supabase from '../lib/supabaseClient.js';

export const sessionHandler = async (req, res, next) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    let sessionId = cookies.session_id;

    if (!sessionId) {
      sessionId = uuidv4();

      const { error } = await supabase
        .from('user_sessions')
        .insert([{ id: sessionId, created_at: new Date().toISOString() }])
        .select();

      if (error) throw new Error('Failed to create session');

      res.setHeader('Set-Cookie', cookie.serialize('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax',
      }));

      console.log(`✅ New session cookie set: ${sessionId}`);
    }

    const { data, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !data) {
      throw new Error('Invalid session');
    }

    req.sessionId = sessionId;
    req.session = {
      userId: data.user_id,
      chatroomId: data.chatroom_id
    };

    next();
  } catch (error) {
    console.error('❌ Session Error:', error.message);
    res.status(500).json({ error: 'Session handling failed' });
  }
};
