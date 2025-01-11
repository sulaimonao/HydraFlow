// test-workflow.js

import axios from 'axios';

// Replace with your deployed URL
const BASE_URL = 'https://hydra-flow.vercel.app/api';

// Helper function to log responses
const logResult = (action, success, message) => {
  const status = success ? '✅ SUCCESS' : '❌ FAILED';
  console.log(`${status} - ${action}: ${message}`);
};

// 1️⃣ Test Subpersona Creation
async function testSubpersonaCreation() {
  try {
    const response = await axios.post(`${BASE_URL}/create-subpersona`, {
      name: "Optimizer",
      capabilities: { analyze: true },
      preferences: { priority: "high" }
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

// 2️⃣ Test Memory Compression
async function testMemoryCompression() {
  try {
    const response = await axios.post(`${BASE_URL}/compress-memory`, {
      memory: "Sample memory data..."
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

// 3️⃣ Test Full Workflow Execution
async function testWorkflowExecution() {
  try {
    const response = await axios.post(`${BASE_URL}/parse-query`, {
      query: "HydraFlow, optimize workflow by compressing memory and creating subpersonas"
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

// 4️⃣ Run All Tests
async function runAllTests() {
  console.log('🚀 Starting Workflow Tests...\n');

  await testSubpersonaCreation();
  await testMemoryCompression();
  await testWorkflowExecution();

  console.log('\n📝 Testing Completed!');
}

runAllTests();
