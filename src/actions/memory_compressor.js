import { callApi } from './action_caller.js';

export async function compressMemory(fullHistory) {
  const endpoint = 'https://hydra-flow.vercel.app/api/compress-memory';
  const payload = { memory: JSON.stringify(fullHistory) };
  return callApi(endpoint, payload);
}
