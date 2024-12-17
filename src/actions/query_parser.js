import { callApi } from './action_caller.js';

export async function parseQuery(userInput) {
  const endpoint = 'https://hydra-flow.vercel.app/api/parse-query';
  const payload = { query: userInput };
  return callApi(endpoint, payload);
}
