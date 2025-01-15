// middleware/supabaseAuth.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.DATABASE_URL, process.env.ANON_KEY);

/**
 * Middleware to verify Supabase authentication tokens.
 */
export const verifySupabaseAuth = async (req, res, next) => {
  try {
    // === 🔍 Extract Token from Multiple Sources ===
    let token =
      req.headers.authorization?.split(' ')[1] ||      // Bearer <token>
      req.cookies?.access_token ||                    // Cookie support
      req.query?.access_token;                        // Query parameter

    if (!token) {
      console.warn("⚠️ Missing authentication token.");
      return res.status(401).json({ error: 'Unauthorized: Missing authentication token.' });
    }

    // === 🔒 Verify Token with Supabase ===
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      if (error.message.includes("JWT expired")) {
        console.warn("⚠️ Token expired.");
        return res.status(401).json({ error: 'Unauthorized: Token has expired. Please log in again.' });
      }

      console.error("❌ Invalid token:", error.message);
      return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }

    if (!user) {
      console.warn("⚠️ No user found for provided token.");
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }

    // ✅ Attach user object to request for downstream access
    req.user = user;
    res.locals.user = user;  // Optional: attach to response locals for middleware

    console.log(`🔐 Authenticated user: ${user.id}`);
    next();

  } catch (error) {
    console.error("🔥 Error during authentication:", error);
    res.status(500).json({ error: "Internal Server Error during authentication." });
  }
};
