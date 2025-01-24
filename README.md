# HydraFlow

HydraFlow is a dynamic, API-driven workflow and state management system designed to integrate with Supabase for database operations. It supports real-time metric tracking, feedback collection, and task management, enabling scalable and efficient application workflows.

---

## **Features**

### 1. **Gauge Metrics**
- Tracks system metrics (e.g., memory usage, CPU load) and database performance.
- Logs API response times and real-time metrics to the `api_metrics` table.

### 2. **Feedback Management**
- Collects user feedback and ratings via the `/api/feedback` endpoint.
- Stores feedback in the `feedback_entries` table with timestamps.
- Generates summaries for insights into user feedback trends.

### 3. **Task Card Workflow**
- Supports task card creation, subtask management, and dependencies.
- Updates `task_cards` and `subtasks` tables dynamically via Supabase.

### 4. **State Management**
- Maintains context, memory, and head states using:
  - `context_state`
  - `memory_state`
  - `heads_state`
- Updates and retrieves stateful data efficiently.

---

## **Folder Structure**

### **Root Directory**
- `.gitignore`: Specifies files and directories to exclude from version control.
- `HydraFlow_actions.yaml`: Defines workflows and actions for the system.
- `server.js`: Core backend server logic.
- `package.json`: Project dependencies and scripts.
- `vercel.json`: Deployment configuration.

### **Directories**
- `api/`: Contains API endpoint logic.
- `lib/`: Utility modules, including Supabase client (`supabaseClient.js`).
- `routes/`: Express routes for managing workflows (e.g., feedback).
- `src/`: Core logic for state management and dynamic workflows.

---

## **Installation**

### **Prerequisites**
- Node.js (v16+)
- Supabase Account

### **Steps**
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd HydraFlow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory with the following:
     ```env
     DATABASE_URL=<Your Supabase URL>
     KEY=<Your Supabase API Key>
     ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

---

## **Endpoints**

### **1. Feedback Management**
- **POST `/api/feedback`**: Submit user feedback.
  - **Payload**:
    ```json
    {
      "userFeedback": "Great workflow!",
      "rating": 5
    }
    ```
  - **Response**:
    ```json
    {
      "message": "Feedback submitted successfully.",
      "data": { ... }
    }
    ```

### **2. Gauge Metrics**
- **GET `/api/gauge`**: Fetch system and database metrics.
  - **Response**:
    ```json
    {
      "metrics": {
        "systemMetrics": { ... },
        "dbMetrics": { ... },
        "timestamp": "..."
      }
    }
    ```

---

## **Key Files**

### **1. `lib/supabaseClient.js`**
- Sets up the Supabase client with error handling.
- Provides a wrapper for API calls.

### **2. `src/logic/gauge_logic.js`**
- Collects and tracks system and database metrics.

### **3. `src/actions/feedback_collector.js`**
- Handles feedback collection and summary generation.

### **4. `src/state/context_state.js`**
- Manages and updates token usage and response latency.

---

## **Testing**

### **Local Testing**
- Use `npm run test` for unit tests.
- Example test scripts include feedback submission, task creation, and metric tracking.

### **API Testing**
- Test endpoints using tools like Postman or cURL.

---

## **Contributing**

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/<feature-name>
   ```
3. Commit changes:
   ```bash
   git commit -m "Add <feature-name>"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/<feature-name>
   ```
5. Open a pull request.

---

## **License**
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## **Troubleshooting**

### Common Issues

1. **Session Context Issues**
   - Ensure that the `X-Hydra-Session-ID` header is included in all requests.
   - Verify that the session initialization middleware is correctly configured.

2. **Endpoint Not Found**
   - Check that the endpoint paths are correctly defined in the API routes.
   - Ensure that the server is running and the routes are properly registered.

3. **Permission Issues**
   - Verify that the database row-level security policies are correctly configured.
   - Ensure that the user has the necessary permissions to access the data.

4. **Query/Parameter Errors**
   - Ensure that all required parameters are included in the request.
   - Validate the input data to match the expected format.

---