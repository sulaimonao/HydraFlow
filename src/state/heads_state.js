// src/state/heads_state.js
import { db } from "../../lib/db.js";

const heads = []; // In-memory fallback for testing or offline usage

export async function addHead(name, status, userId, chatroomId) {
  const newHead = { name, status, createdAt: Date.now(), userId, chatroomId };

  heads.push(newHead); // Retain in-memory functionality
  await db.heads.insert(newHead); // Store in the database

  return newHead;
}

export async function getHeads(userId, chatroomId) {
  const dbHeads = await db.heads.find({ userId, chatroomId }).toArray();
  return dbHeads.length ? dbHeads : heads; // Fallback to in-memory heads
}
