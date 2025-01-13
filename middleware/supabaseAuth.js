// middleware/supabaseAuth.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.DATABASE_URL, process.env.ANON_KEY);

export const verifySupabaseAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];  // Bearer <token>

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.user = user;  // Attach user object to request
    next();
  } catch (error) {
    console.error("Error verifying Supabase token:", error);
    res.status(500).json({ error: "Internal Server Error during authentication." });
  }
};
