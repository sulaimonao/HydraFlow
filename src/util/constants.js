// src/util/constants.js (Local SQLite Version - Modified)

// 🌐 Helper function to build query strings safely (Keep this)
const buildQueryString = (params) => {
  return params && Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';
};

// 🚀 Dynamic API Endpoints (Modified for local server)
export const API_ENDPOINTS = {
  PARSE_QUERY: (req) => `/api/parse-query`, // No query parameters needed

  COMPRESS_MEMORY: (req) => `/api/compress-memory`, // No query parameters needed

  CREATE_SUBPERSONA: (req) => `/api/create-subpersona`, // No query parameters needed

  CONTEXT_RECAP: (req) => `/api/context-recap`, // No query parameters needed

  SUMMARIZE_LOGS: (req) => `/api/summarize-logs`, // No query parameters needed

  // 🌟 Example of easily adding new endpoints
  FETCH_FEEDBACK: (req) => `/api/feedback`, // No query parameters needed
};

// 📊 Standardized Status Responses (Keep this)
export const STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// 🎯 Centralized Action Types (Keep this)
export const ACTION_TYPES = {
  COMPRESS_MEMORY: 'compressMemory',
  CREATE_SUBPERSONA: 'createSubpersona',
  CONTEXT_RECAP: 'contextRecap',
  SUMMARIZE_LOGS: 'summarizeLogs',
  GENERATE_RESPONSE: 'generateResponse',
  PRIORITIZE_TASKS: 'prioritizeTasks',
  LIMIT_RESPONSES: 'limitResponses',
  SIMPLIFY_RESPONSES: 'simplifyResponses',
};