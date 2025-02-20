// api/create-subpersona.js (Local SQLite Version)
import express from 'express';
import Joi from 'joi';
// Removed supabase import
//import { supabase, supabaseRequest } from '../lib/db.js';
import * as db from '../lib/db.js'; // Import SQLite db module
//Remove setSessionContext import
//import { setSessionContext } from '../lib/sessionUtils.js';
import validationMiddleware from '../middleware/validationMiddleware.js';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

const router = express.Router();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

// Remove user_id from the schema, as it will come from the session
const schema = Joi.object({
    name: Joi.string().required(), // Add name to schema
    capabilities: Joi.object(), // Add capabilities to schema
    preferences: Joi.object(),    // Add preferences to schema
});

const handleCreateSubpersona = async (req, res) => {
    try {
        const { name, capabilities, preferences } = req.body;

        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Valid subpersona name is required.' });
        }

        if (capabilities && typeof capabilities !== 'object') {
            return res.status(400).json({ error: 'Capabilities must be an object.' });
        }
        if (preferences && typeof preferences !== 'object') {
            return res.status(400).json({ error: 'Preferences must be an object.' });
        }

        // Use session data for userId and chatroomId
        const userId = req.session.userId;
        const chatroomId = req.session.chatroomId;

        if (!userId || !chatroomId) {
            return res.status(400).json({ error: 'User ID and Chatroom ID are required.' });
        }
        // Removed setSessionContext
        //await setSessionContext(userId, chatroomId);

        const head = await db.insertHead(userId, chatroomId, name, capabilities, preferences);

        // Use the logIssue function from the db module
        await db.logIssue(userId, chatroomId, 'Subpersona creation executed', 'Subpersona created successfully');

        return res.status(200).json({
            success: true,
            message: 'Subpersona created successfully.',
            data: head,
            user_id: userId,
            chatroom_id: chatroomId
        });
    } catch (error) {
        logger.error("❌ Error in create-subpersona:", error);
        res.status(500).json({
            success: false,
            error: 'Unexpected error occurred.',
            details: error.message
        });
    }
};

// Use validationMiddleware and directly call handleCreateSubpersona
router.post('/', validationMiddleware(schema), async (req, res) => { // Added async
  try {
    await handleCreateSubpersona(req, res); // Await the handler
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack,
    });
  }
});

export default router;