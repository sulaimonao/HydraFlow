// api/create-subpersona.js
import express from 'express';
import Joi from 'joi';
import { insertHead } from '../lib/db.js';
import { sessionContext } from '../middleware/sessionContext.js';
import { setSessionContext } from '../lib/sessionUtils.js';
import validationMiddleware from '../middleware/validationMiddleware.js';
import winston from 'winston';

const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const schema = Joi.object({
  user_id: Joi.string().required(),
  // other fields
});

const handleCreateSubpersona = async (req, res) => {
  sessionContext(req, res, async () => {
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

      const userId = req.session?.userId;
      const chatroomId = req.session?.chatroomId;
      if (!userId || !chatroomId) {
        return res.status(400).json({ error: 'User ID and Chatroom ID are required.' });
      }

      await setSessionContext(userId, chatroomId);

      const head = await insertHead(userId, chatroomId, name, capabilities, preferences);

      await supabaseRequest(
        supabase.from('debug_logs').insert([
          {
            user_id: userId,
            chatroom_id: chatroomId,
            issue: 'Subpersona creation executed',
            resolution: 'Subpersona created successfully',
            timestamp: new Date().toISOString()
          }
        ])
      );

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
  });
};

router.post('/create-subpersona', validationMiddleware(schema), (req, res) => {
  try {
    handleCreateSubpersona(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack,
    });
  }
});

export default router;
