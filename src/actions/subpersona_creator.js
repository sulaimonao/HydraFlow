import { callApi } from './action_caller.js';

export async function createSubPersona(task, description) {
  const endpoint = 'https://hydra-flow.vercel.app/api/create-subpersona';
  const payload = { task, description };
  return callApi(endpoint, payload);
}
