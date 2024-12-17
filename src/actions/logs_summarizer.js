const { callApi } = require('./action_caller');

async function summarizeLogs(logs) {
  const endpoint = 'https://hydra-flow.vercel.app/api/summarize-logs';
  const payload = { logs };
  return callApi(endpoint, payload);
}

module.exports = { summarizeLogs };
