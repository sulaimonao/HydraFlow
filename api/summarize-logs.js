// api/summarize-logs.js
import express from 'express';
import { sessionContext } from '../middleware/sessionContext.js';
//  Import your log summarization function (replace with your actual function)
import { myLogSummarizationFunction } from '../src/util/logUtils.js'; // Example import


const router = express.Router();

router.post('/', sessionContext, async (req, res) => {
    try {
        const { userId, chatroomId } = req.session;
        const { logs } = req.body;

        if (!logs || !Array.isArray(logs)) {
            return res.status(400).json({ error: 'Logs must be provided as an array.' });
        }

        const summarizedLogs = myLogSummarizationFunction(logs); // Replace with your logic

        res.status(200).json({
            message: 'Logs summarized successfully.',
            summary: summarizedLogs,
            userId,
            chatroomId,
        });

    } catch (error) {
        console.error('Error summarizing logs:', error);
        res.status(500).json({ error: 'Failed to summarize logs.' });
    }
});

export default router;