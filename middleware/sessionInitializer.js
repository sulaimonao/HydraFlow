// middleware/sessionInitializer.js (Local SQLite Version)
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
// Removed Supabase import
//import { supabase } from '../lib/db.js';
// Removed setSessionContext import
//import { setSessionContext } from '../lib/sessionUtils.js';

import { isValidUUID } from '../src/util/helpers.js';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

async function initializeSession(req, res, next) {
    try {
        let sessionId = req.headers['x-hydra-session-id'];
        let userId, chatroomId;

        if (sessionId && sessionId.includes(':')) {
            [userId, chatroomId] = sessionId.split(':');

            if (!isValidUUID(userId) || !isValidUUID(chatroomId)) {
                console.warn("⚠️ Invalid session ID format.");
                return res.status(400).json({ error: "Invalid session ID format." });
            }

            console.log(`🔍 Valid session ID: userId=${userId}, chatroomId=${chatroomId}`);

            // Removed Supabase session check.  express-session handles this.
            /*
            const { data: sessionData, error: sessionError } = await supabase
              .from('user_sessions')
              .select('*')
              .eq('user_id', userId)
              .eq('chatroom_id', chatroomId)
              .single();

            if (sessionError || !sessionData) {
              console.warn("⚠️ Session not found or invalid.");
              return res.status(401).json({ error: "Session not found or invalid." });
            }
            */

            console.log(`✅ Session validated for userId=${userId}, chatroomId=${chatroomId}`);
            // Set session variables directly
            req.session.userId = userId;
            req.session.chatroomId = chatroomId;
            // Set the X-Hydra-Session-ID
            res.setHeader('X-Hydra-Session-ID', sessionId);

        } else {
            // Generate new IDs
            userId = uuidv4();
            chatroomId = uuidv4();
            sessionId = `${userId}:${chatroomId}`;

            console.log(`🔄 Creating new session: userId=${userId}, chatroomId=${chatroomId}`);

            // Removed Supabase session creation. express-session handles this.
            /*
            const { error: creationError } = await supabase
              .from('user_sessions')
              .insert([{ user_id: userId, chatroom_id: chatroomId }]);

            if (creationError) {
              console.error("❌ Error creating session:", creationError);
              return res.status(500).json({ error: "Failed to create session." });
            }
            */

            // Set session variables, and the header
            req.session.userId = userId;
            req.session.chatroomId = chatroomId;
            res.setHeader('X-Hydra-Session-ID', sessionId);
            console.log(`✅ New session created: userId=${userId}, chatroomId=${chatroomId}`);
        }
        // Removed setSessionContext
        // try {
        //     await setSessionContext(userId, chatroomId);
        //     console.log(`🔐 Session context set: userId=${userId}, chatroomId=${chatroomId}`);
        // } catch (contextError) {
        //     logger.error("❌ Error setting session context:", contextError);
        //     return res.status(500).json({ error: 'Failed to set session context.' });
        // }

        next();
    } catch (error) {
        logger.error("❌ Error initializing session:", error);
        res.status(500).json({ error: 'Failed to initialize session.' });
    }
}
// Export as default, for consistency with other middleware
export default initializeSession;