// src/util/context.js

export async function fetchContext(userId, chatroomId) {
    // Mock implementation or integrate with your database/Supabase
    console.log(`Fetching context for user ${userId} in chatroom ${chatroomId}.`);
    return { priority: "Normal", keywords: ["example", "test"] }; // Example context data
  }
  
  export async function upsertContext(userId, chatroomId, context) {
    // Mock implementation or integrate with your database/Supabase
    console.log(`Upserting context for user ${userId} in chatroom ${chatroomId}.`, context);
    return true; // Example success
  }
  
  export function logInfo(message, data = {}) {
    console.log(`INFO: ${message}`, data);
  }
  
  export function logError(message, data = {}) {
    console.error(`ERROR: ${message}`, data);
  }
  
  export async function logDebugIssue(userId, chatroomId, title, details) {
    // Mock debug issue logging
    console.warn(`DEBUG: Issue for user ${userId} in chatroom ${chatroomId}: ${title} - ${details}`);
  }
  