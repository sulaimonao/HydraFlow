# HydraFlow Actions API

HydraFlow is a dynamic conversational AI system that manages memory, parses queries, generates sub-personas (heads), summarizes logs, and **now** provides a **gauge endpoint** for real-time self-awareness. It also includes advanced capabilities for context recapping, feedback aggregation, and autonomous task handling.

---

## Deployed Endpoints

Make sure to update the `servers` section in your `HydraFlow_actions.yaml` to reflect your live Vercel domain:

```
https://hydra-flow.vercel.app/api
```

---

## API Endpoints

HydraFlow provides the following endpoints to manage workflows effectively:

1. **`POST /compress-memory`**  
   - **Description**: Summarizes and compresses long memory input to improve context management.  
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

2. **`POST /parse-query`**  
   - **Description**: Extracts actionable keywords and tasks from user queries.  
   - **Input**:
     ```json
     { "query": "string" }
     ```
   - **Output**:
     ```json
     { 
       "keywords": ["string"], 
       "actionItems": ["string"], 
       "taskCard": {
         "goal": "string",
         "priority": "string",
         "subtasks": [
           { "task": "string", "status": "string" }
         ]
       }
     }
     ```
   - **Test Command**:
     ```bash
     curl -X POST https://hydra-flow.vercel.app/api/parse-query \
     -H "Content-Type: application/json" \
     -d '{"query": "Summarize logs and compress memory."}'
     ```

3. **`POST /create-subpersona`**  
   - **Description**: Dynamically generates a specialized sub-persona for a specific task.  
   - **Input**:
     ```json
     { "task": "string", "description": "string" }
     ```
   - **Output**:
     ```json
     { 
       "subPersonaName": "string", 
       "status": "string" 
     }
     ```
   - **Test Command**:
     ```bash
     curl -X POST https://hydra-flow.vercel.app/api/create-subpersona \
     -H "Content-Type: application/json" \
     -d '{"task": "Analyze logs", "description": "Sub-persona for analyzing log data."}'
     ```

4. **`POST /context-recap`**  
   - **Description**: Provides a recap of the conversation history and compressed memory.  
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

5. **`POST /summarize-logs`**  
   - **Description**: Analyzes and summarizes log data for key insights and error patterns.  
   - **Input**:
     ```json
     { "logs": "string" }
     ```
   - **Output**:
     ```json
     {
       "totalEntries": "integer",
       "errorCount": "integer",
       "firstFiveLines": "string"
     }
     ```
   - **Test Command**:
     ```bash
     curl -X POST https://hydra-flow.vercel.app/api/summarize-logs \
     -H "Content-Type: application/json" \
     -d '{"logs": "Error at line 45: module not found."}'
     ```

6. **`GET /feedback/summary`**  
   - **Description**: Retrieves a summary of user feedback, including average ratings and comments.  
   - **Output**:
     ```json
     {
       "totalFeedback": "integer",
       "averageRating": "float",
       "feedbackEntries": [
         {
           "responseId": "string",
           "userFeedback": "string",
           "rating": "integer",
           "timestamp": "string"
         }
       ]
     }
     ```
   - **Test Command**:
     ```bash
     curl -X GET https://hydra-flow.vercel.app/api/feedback/summary
     ```

7. **`GET /gauge`**  
   - **Description**: Provides real-time “instrument cluster” data (context info, memory usage, sub-personas, active tasks) for any given user/session.  
   - **Query Parameters**:
     - `user_id` (optional)  
     - `chatroom_id` (optional)  
   - **Output**: Returns a JSON snapshot of HydraFlow’s internal state:
     ```json
     {
       "status": "success",
       "environment": "string",
       "user_id": "string",
       "chatroom_id": "string",
       "contextSnapshot": {
         "priority": "string",
         "keywords": []
       },
       "memoryUsage": 123,
       "headCount": 2,
       "activeTasksCount": 1,
       "limitationNotes": [
         "Example: Max heads = 5",
         "Token limit = 1000"
       ]
     }
     ```
   - **Test Command**:
     ```bash
     curl "https://hydra-flow.vercel.app/api/gauge?user_id=alice123&chatroom_id=general"
     ```

---

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
   ```bash
   vercel deploy
   ```

4. **Update API configurations**:
   - Replace the domain in `HydraFlow_actions.yaml` with your deployed URL:
     ```
     https://hydra-flow.vercel.app/api
     ```
   - Ensure you’ve configured your environment variables in Vercel (e.g., `DATABASE_URL`, `KEY` for Supabase).

5. **Test the endpoints**:
   - Use the provided cURL commands or a tool like Postman to validate each endpoint.

---

## Troubleshooting

- Make sure you have the latest Node.js installed.
- Check your Vercel deployment logs for any build or runtime errors.
- Verify each endpoint with cURL or Postman.
- Confirm your `.env` variables (like Supabase keys) are set in Vercel.

---

## Recent Updates

- **Gauge Endpoint**: Added `/gauge` for real-time self-awareness data (heads, memory usage, active tasks).
- **Memory Compression**: Automatic compression triggers on token usage or conversation length thresholds.
- **Workflow Manager Enhancements**: The `orchestrateContextWorkflow` logic now integrates gauge checks and sub-persona limits.
- **Feedback System**: `/feedback/summary` aggregates and returns user feedback statistics.
- **Log Summaries**: `/summarize-logs` now includes entry counts and error-detection features.

---

HydraFlow is designed for adaptive memory management, dynamic task orchestration, and advanced self-awareness. We welcome feedback and contributions to expand its capabilities even further!