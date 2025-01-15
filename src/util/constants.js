// src/util/constants.js
// 🌐 Helper function to build query strings safely
const buildQueryString = (params) => {
  return params && Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
};

// 🚀 Dynamic API Endpoints with scalable parameter support
export const API_ENDPOINTS = {
  PARSE_QUERY: (user_id, chatroom_id) =>
    `/api/parse-query${buildQueryString({ user_id, chatroom_id })}`,

  COMPRESS_MEMORY: (user_id, chatroom_id) =>
    `/api/compress-memory${buildQueryString({ user_id, chatroom_id })}`,

  CREATE_SUBPERSONA: (user_id, chatroom_id) =>
    `/api/create-subpersona${buildQueryString({ user_id, chatroom_id })}`,

  CONTEXT_RECAP: (user_id, chatroom_id) =>
    `/api/context-recap${buildQueryString({ user_id, chatroom_id })}`,

  SUMMARIZE_LOGS: (user_id, chatroom_id) =>
    `/api/summarize-logs${buildQueryString({ user_id, chatroom_id })}`,

  // 🌟 Example of easily adding new endpoints
  FETCH_FEEDBACK: (user_id, chatroom_id) =>
    `/api/feedback${buildQueryString({ user_id, chatroom_id })}`,
};

// 📊 Standardized Status Responses
export const STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// 🎯 Centralized Action Types
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
