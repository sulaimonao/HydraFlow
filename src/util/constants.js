// src/util/constants.js
// 🌐 Helper function to build query strings safely
const buildQueryString = (params) => {
  return params && Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
};

// 🚀 Dynamic API Endpoints with scalable parameter support
export const API_ENDPOINTS = {
  PARSE_QUERY: (req) =>
    `/api/parse-query${buildQueryString({ userId: req.session.userId, chatroomId: req.session.chatroomId })}`,

  COMPRESS_MEMORY: (req) =>
    `/api/compress-memory${buildQueryString({ userId: req.session.userId, chatroomId: req.session.chatroomId })}`,

  CREATE_SUBPERSONA: (req) =>
    `/api/create-subpersona${buildQueryString({ userId: req.session.userId, chatroomId: req.session.chatroomId })}`,

  CONTEXT_RECAP: (req) =>
    `/api/context-recap${buildQueryString({ userId: req.session.userId, chatroomId: req.session.chatroomId })}`,

  SUMMARIZE_LOGS: (req) =>
    `/api/summarize-logs${buildQueryString({ userId: req.session.userId, chatroomId: req.session.chatroomId })}`,

  // 🌟 Example of easily adding new endpoints
  FETCH_FEEDBACK: (req) =>
    `/api/feedback${buildQueryString({ userId: req.session.userId, chatroomId: req.session.chatroomId })}`,
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
