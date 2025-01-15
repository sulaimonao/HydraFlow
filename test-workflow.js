// test-workflow.js
// 🚀 Test Workflow Execution with Persistent Session
import { v4 as uuidv4, validate as validateUUID } from 'uuid';

import axios from 'axios';

// ✅ Replace with your deployed URL
const BASE_URL = 'https://hydra-flow.vercel.app/api';

// 🔒 Persistent session IDs for the entire test run
const persistentUserId = req.userId;
const persistentChatroomId = req.chatroomId;

if (!validateUUID(persistentUserId) || !validateUUID(persistentChatroomId)) {
  throw new Error("Invalid session IDs for user or chatroom.");
}

/**
 * Logs the result of each test case
 * @param {string} action - The action being tested
 * @param {boolean} success - Whether the test passed or failed
 * @param {string} message - The result message
 */
const logResult = (action, success, message) => {
  const status = success ? '✅ SUCCESS' : '❌ FAILED';
  console.log(`${status} - ${action}: ${message}`);
};

/**
 * ✅ Test Subpersona Creation with Persistent Session
 */
async function testSubpersonaCreation() {
  try {
    const response = await axios.post(`${BASE_URL}/create-subpersona`, {
      name: "Optimizer",
      capabilities: { analyze: true },
      preferences: { priority: "high" },
      user_id: persistentUserId,       // 🔒 Reuse session user_id
      chatroom_id: persistentChatroomId // 🔒 Reuse session chatroom_id
    });

    if (response.status === 200) {
      logResult('Subpersona Creation', true, 'Subpersona created successfully');
    } else {
      logResult('Subpersona Creation', false, response.data.error || 'Unknown error');
    }
  } catch (error) {
    logResult('Subpersona Creation', false, error.message);
  }
}

/**
 * 2️⃣ Test Memory Compression with Persistent Session
 */
async function testMemoryCompression() {
  try {
    const response = await axios.post(`${BASE_URL}/compress-memory`, {
      user_id: persistentUserId,        // 🔒 Reuse session user_id
      chatroom_id: persistentChatroomId, // 🔒 Reuse session chatroom_id
      memory: "Sample memory data..."   // ✅ Memory data to compress
    });

    if (response.status === 200) {
      logResult('Memory Compression', true, 'Memory compressed successfully');
    } else {
      logResult('Memory Compression', false, response.data.error || 'Unknown error');
    }
  } catch (error) {
    logResult('Memory Compression', false, error.message);
  }
}

/**
 * 3️⃣ Test Full Workflow Execution with Persistent Session
 */
async function testWorkflowExecution() {
  try {
    const response = await axios.post(`${BASE_URL}/parse-query`, {
      query: "HydraFlow, optimize workflow by compressing memory and creating subpersonas",
      user_id: persistentUserId,        // 🔒 Reuse session user_id
      chatroom_id: persistentChatroomId // 🔒 Reuse session chatroom_id
    });

    if (response.status === 200) {
      logResult('Workflow Execution', true, 'Workflow executed successfully');
    } else {
      logResult('Workflow Execution', false, response.data.error || 'Unknown error');
    }
  } catch (error) {
    logResult('Workflow Execution', false, error.message);
  }
}

/**
 * 4️⃣ Run All Tests with Persistent Session
 */
async function runAllTests() {
  console.log(`🚀 Starting Workflow Tests with Session: user_id=${persistentUserId}, chatroom_id=${persistentChatroomId}\n`);

  await testSubpersonaCreation();    // ✅ Test subpersona creation
  await testMemoryCompression();     // ✅ Test memory compression
  await testWorkflowExecution();     // ✅ Test full workflow execution

  console.log('\n📝 Testing Completed!');
}

// 🔥 Execute all workflow tests
runAllTests();
