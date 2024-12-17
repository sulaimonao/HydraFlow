import express from 'express';
import cors from 'cors';
import { orchestrateContextWorkflow } from './src/logic/workflow_manager.js';
import parseQuery from './api/parse-query.js';
import createSubpersona from './api/create-subpersona.js';
import compressMemory from './api/compress-memory.js';

const app = express();
app.use(express.json());
app.use(cors());

// API Endpoints
app.post('/api/parse-query', parseQuery);
app.post('/api/create-subpersona', createSubpersona);
app.post('/api/compress-memory', compressMemory);

// Context Workflow
app.post('/api/context-workflow', (req, res) => {
  const { query, memory, logs } = req.body;

  if (!query || !memory) {
    return res.status(400).json({ error: "Missing required fields: 'query' or 'memory'." });
  }

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
