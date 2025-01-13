// middleware/authMiddleware.js

import { v4 as uuidv4 } from 'uuid';

export const initializeUserContext = (req, res, next) => {
  try {
    let userId = req.headers['x-user-id'] || req.body.user_id || uuidv4();
    req.userId = userId;

    let chatroomId = req.headers['x-chatroom-id'] || req.session?.chatroomId || uuidv4();
    req.chatroomId = chatroomId;

    next();
  } catch (error) {
    console.error("Error initializing user context:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};
