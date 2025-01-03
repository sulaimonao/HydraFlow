// src/util/gauge.js

export const STATUS = {
    SUCCESS: "success",
    ERROR: "error",
  };
  
  export async function fetchGaugeData({ userId, chatroomId }) {
    // Mock implementation or integrate with your database/Supabase
    console.log(`Fetching gauge data for user ${userId} in chatroom ${chatroomId}.`);
    return {
      tokenCount: 42, // Example data
      priority: "Normal",
      activeTasksCount: 5,
    };
  }
  
  export function logInfo(message, data = {}) {
    console.log(`INFO: ${message}`, data);
  }
  
  export function logError(message, data = {}) {
    console.error(`ERROR: ${message}`, data);
  }
  