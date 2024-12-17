export async function callApi(endpoint, payload) {  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
}

