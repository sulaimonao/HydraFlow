// src/util/constants.js

// Dynamic API Endpoints with optional user_id and chatroom_id
export const API_ENDPOINTS = {
  PARSE_QUERY: (user_id, chatroom_id) =>
    `/api/parse-query${user_id && chatroom_id ? `?user_id=${user_id}&chatroom_id=${chatroom_id}` : ''}`,

  COMPRESS_MEMORY: (user_id, chatroom_id) =>
    `/api/compress-memory${user_id && chatroom_id ? `?user_id=${user_id}&chatroom_id=${chatroom_id}` : ''}`,

  CREATE_SUBPERSONA: (user_id, chatroom_id) =>
    `/api/create-subpersona${user_id && chatroom_id ? `?user_id=${user_id}&chatroom_id=${chatroom_id}` : ''}`,

  CONTEXT_RECAP: (user_id, chatroom_id) =>
    `/api/context-recap${user_id && chatroom_id ? `?user_id=${user_id}&chatroom_id=${chatroom_id}` : ''}`,

  SUMMARIZE_LOGS: (user_id, chatroom_id) =>
    `/api/summarize-logs${user_id && chatroom_id ? `?user_id=${user_id}&chatroom_id=${chatroom_id}` : ''}`,
};

// Standardized Status Responses
export const STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// Centralized Action Types
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
