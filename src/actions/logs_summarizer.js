import { callApi } from './action_caller.js';

export async function summarizeLogs(logs) {
  const endpoint = 'https://hydra-flow.vercel.app/api/summarize-logs';
  const payload = { logs };
  return callApi(endpoint, payload);
}
