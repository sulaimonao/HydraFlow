// src/state/heads_state.js

import { fetchHeads, insertHead } from "../util/db_helpers.js";

export async function addHead(name, status, user_id, chatroom_id) {
  const newHead = {
    name,
    status,
    createdAt: new Date().toISOString(),
    user_id,
    chatroom_id,
  };
  await insertHead(newHead);
  return newHead;
}

export async function getHeads(user_id, chatroom_id) {
  return await fetchHeads(user_id, chatroom_id);
}
