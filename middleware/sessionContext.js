// middleware/sessionContext.js (Local SQLite Version)
// Removed setSessionContext import
//import { setSessionContext } from '../lib/sessionUtils.js';
import { v4 as uuidv4 } from 'uuid';
import { isValidUUID } from '../src/util/helpers.js';
import winston from 'winston';
// Removed supabase import
//import { supabase } from '../lib/db.js';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

/**
 * Middleware to validate and set session context.
 */
export async function sessionContext(req, res, next) {
    console.log('🔍 Checking session context middleware execution...');
    try {
        // Ensure req.session is initialized (should be handled by express-session)
        if (!req.session) {
          return res.status(500).json({error: 'Session not initialized. Check express-session setup.'})
        }

        // Check for x-hydra-session-id header
        let sessionId = req.headers['x-hydra-session-id'];
        if (!sessionId) {
            return res.status(400).json({ error: 'x-hydra-session-id header is required.' });
        }

        let [userId, chatroomId] = sessionId.split(':');

        if (!isValidUUID(userId) || !isValidUUID(chatroomId)) {
            return res.status(400).json({ error: 'Invalid session ID format.' });
        }

        // Fetch session from the database (No need with express-session)
        /* Removed Supabase session check
        const { data: sessionData, error: sessionError } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('chatroom_id', chatroomId)
          .single();

        if (sessionError || !sessionData) {
          return res.status(401).json({ error: 'Session not found or invalid.' });
        }
        */
        console.log(`🔐 Using user_id: ${userId}, chatroom_id: ${chatroomId}`);

        //Removed setSessionContext
        // try {
        //   await setSessionContext(userId, chatroomId);
        // } catch (error) {
        //   logger.error('❌ Error setting session context:', error);
        // }

        // Set session values (should already be handled by sessionInitializer)
        req.session.userId = userId;
        req.session.chatroomId = chatroomId;

        next();
    } catch (error) {
        logger.error('❌ Error in session context middleware:', error);
        res.status(500).json({ error: 'Failed to initialize session context.' });
    }
}