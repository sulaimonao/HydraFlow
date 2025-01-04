# HydraFlow Actions API

HydraFlow dynamically manages memory, parses queries, generates sub-personas, and summarizes logs.

## Deployed Endpoints
Update `servers` in your `HydraFlow_actions.yaml` with your live Vercel domain:
```
https://hydra-flow.vercel.app/api
```

## API Endpoints
HydraFlow provides the following endpoints to manage workflows:

### 1. **`POST /compress-memory`**
- **Description**: Summarizes and compresses long memory input.
- **Input**:
   ```json
   { "memory": "string" }
   ```
- **Output**:
   ```json
   { "compressedMemory": "string" }
   ```
- **Test Command**:
   ```bash
   curl -X POST https://hydra-flow.vercel.app/api/compress-memory \
   -H "Content-Type: application/json" \
   -d '{"memory": "This is a long memory for testing compression."}'
   ```

### 2. **`POST /parse-query`**
- **Description**: Extracts actionable keywords and tasks from user queries.
- **Input**:
   ```json
   { "query": "string" }
   ```
- **Output**:
   ```json
   { "keywords": ["string"], "actionItems": ["string"] }
   ```
- **Test Command**:
   ```bash
   curl -X POST https://hydra-flow.vercel.app/api/parse-query \
   -H "Content-Type: application/json" \
   -d '{"query": "Summarize logs and compress memory."}'
   ```

### 3. **`POST /create-subpersona`**
- **Description**: Dynamically generates a specialized sub-persona for a specific task.
- **Input**:
   ```json
   { "task": "string", "description": "string" }
   ```
- **Output**:
   ```json
   { "subPersonaName": "string", "status": "string" }
   ```
- **Test Command**:
   ```bash
   curl -X POST https://hydra-flow.vercel.app/api/create-subpersona \
   -H "Content-Type: application/json" \
   -d '{"task": "Analyze logs", "description": "Sub-persona for analyzing log data."}'
   ```

### 4. **`POST /context-recap`**
- **Description**: Provides a recap of the context and compressed memory.
- **Input**:
   ```json
   { "history": "string", "compressedMemory": "string" }
   ```
- **Output**:
   ```json
   { "recap": "string" }
   ```
- **Test Command**:
   ```bash
   curl -X POST https://hydra-flow.vercel.app/api/context-recap \
   -H "Content-Type: application/json" \
   -d '{"history": "Conversation history", "compressedMemory": "Compressed summary."}'
   ```

### 5. **`POST /summarize-logs`**
- **Description**: Analyzes and summarizes log data for insights.
- **Input**:
   ```json
   { "logs": "string" }
   ```
- **Output**:
   ```json
   { "summaryReport": "string" }
   ```
- **Test Command**:
   ```bash
   curl -X POST https://hydra-flow.vercel.app/api/summarize-logs \
   -H "Content-Type: application/json" \
   -d '{"logs": "Error at line 45: module not found."}'
   ```

## Deployment Instructions
1. **Clone this repository**:
   ```bash
   git clone https://github.com/sulaimonao/HydraFlow.git
   cd hydraflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Deploy to Vercel**:
   Link your clone to website to generate your project link.
   ```bash
   vercel deploy
   ```

4. **Update API configurations**:
   Replace the domain in `HydraFlow_actions.yaml` with your deployed URL:
   ```
   https://hydra-flow.vercel.app/api
   ```

5. **Test the endpoints**:
   Use the provided cURL commands above or a tool like Postman to validate all API endpoints.

---

## Troubleshooting
- Ensure you have the latest version of Node.js installed.
- Verify the deployment logs on [Vercel Dashboard](https://vercel.com/dashboard) if any errors occur.
- Confirm the endpoints are responding correctly using `cURL` or Postman.
