//middleware/session.js
import { v4 as uuidv4 } from 'uuid';
import cookie from 'cookie';
import supabase from '../lib/supabaseClient';

export const withSession = (handler) => {
  return async (req, res) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    let sessionId = cookies.session_id;

    if (!sessionId) {
      // Generate a new session UUID
      sessionId = uuidv4();

      // Insert new session into Supabase
      const { error } = await supabase
        .from('user_sessions')
        .insert([{ session_id: sessionId }]);

      if (error) {
        return res.status(500).json({ error: 'Failed to create session' });
      }

      // Set session ID in cookie
      res.setHeader('Set-Cookie', cookie.serialize('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,  // 30 days
        path: '/',
        sameSite: 'lax',
      }));
    } else {
      // Validate session
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !data) {
        return res.status(403).json({ error: 'Invalid session' });
      }
    }

    req.sessionId = sessionId;
    return handler(req, res);
  };
};
