// src/actions/log_summarizer.js

import { callApiWithRetry } from './action_caller.js';

async function summarizeLogs(logs) {
  const endpoint = 'https://hydra-flow.vercel.app/api/summarize-logs';
  const payload = { logs };
  return callApiWithRetry(endpoint, payload);
}

export { summarizeLogs };