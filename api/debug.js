//api/debug.js
// Log an issue
app.post('/debug/log', async (req, res) => {
    try {
      const { userId, contextId, issue, resolution } = req.body;
      const log = await logIssue({ userId, contextId, issue, resolution });
      res.status(200).json(log);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Fetch debug logs
  app.get('/debug/logs/:contextId', async (req, res) => {
    try {
      const { contextId } = req.params;
      const logs = await fetchDebugLogs(contextId);
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  