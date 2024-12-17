import { callApi } from './action_caller.mjs';

export async function contextRecap(history, compressedMemory) {
  const endpoint = 'https://hydra-flow.vercel.app/api/context-recap';
  const payload = {
    history: JSON.stringify(history),
    compressedMemory: compressedMemory || ""
  };
  return callApi(endpoint, payload);
}
