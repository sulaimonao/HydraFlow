import fetch from 'node-fetch';

async function testEndpoints() {
  const baseUrl = 'http://localhost:3000/api';

  // Test parse-query
  const parseQuery = await fetch(`${baseUrl}/parse-query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Summarize the logs and create a report' })
  }).then(res => res.json());

  console.log('Parse Query Response:', parseQuery);

  // Test compress-memory
  const compressMemory = await fetch(`${baseUrl}/compress-memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memory: 'Very long memory string for summarization.' })
  }).then(res => res.json());

  console.log('Compress Memory Response:', compressMemory);

  // Test create-subpersona
  const createSubpersona = await fetch(`${baseUrl}/create-subpersona`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'Analyze logs', description: 'Analyze server logs' })
  }).then(res => res.json());

  console.log('Create Subpersona Response:', createSubpersona);
}

testEndpoints();
