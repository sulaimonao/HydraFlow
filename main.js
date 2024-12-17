const express = require('express');
const app = express();

app.use(express.json());

// Import API endpoints
app.use('/api/parse-query', require('./api/parse-query'));
app.use('/api/create-subpersona', require('./api/create-subpersona'));
app.use('/api/compress-memory', require('./api/compress-memory'));

const { orchestrateContextWorkflow } = require('./src/logic/workflow_manager');

// Context Management Endpoint
app.post('/api/context-workflow', (req, res) => {
  const { query, memory, logs } = req.body;

  try {
    const result = orchestrateContextWorkflow({ query, memory, logs });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in context workflow:", error);
    res.status(500).json({ error: "Failed to manage context workflow." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
