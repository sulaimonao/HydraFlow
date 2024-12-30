import requests

# Base URL for the deployed API
base_url = "https://hydra-flow.vercel.app/api"

# 1. Test Insert Task Card (POST /api/task)
task_payload = {
    "goal": "Test Goal for Endpoint Validation",
    "priority": "High",
    "subtasks": [{"description": "First Subtask"}, {"description": "Second Subtask"}],
}
insert_response = requests.post(
    f"{base_url}/task", json=task_payload, headers={"Content-Type": "application/json"}
)
insert_data = insert_response.json()
print("Insert Task Response:", insert_data)

# 2. Test Fetch Task Cards (GET /api/task)
fetch_response = requests.get(f"{base_url}/task")
fetch_data = fetch_response.json()
print("Fetch Task Cards Response:", fetch_data)

# 3. Test Update Subtask Status (PUT /api/task)
if insert_data.get("subtasks"):
    subtask_id = insert_data["subtasks"][0]["id"]  # Get ID of the first subtask
    update_payload = {"subtaskId": subtask_id, "status": "completed"}
    update_response = requests.put(
        f"{base_url}/task", json=update_payload, headers={"Content-Type": "application/json"}
    )
    update_data = update_response.json()
    print("Update Subtask Response:", update_data)
else:
    print("No subtasks available to update.")

# 4. Test Delete Task Card (DELETE /api/task)
if insert_data.get("taskCard"):
    task_card_id = insert_data["taskCard"]["id"]
    delete_payload = {"taskCardId": task_card_id}
    delete_response = requests.delete(
        f"{base_url}/task", json=delete_payload, headers={"Content-Type": "application/json"}
    )
    delete_data = delete_response.json()
    print("Delete Task Card Response:", delete_data)
else:
    print("No task card available to delete.")

# 5. Test Gauge Endpoint (GET /api/gauge)
gauge_response = requests.get(f"{base_url}/gauge", params={"user_id": "test_user", "chatroom_id": "general"})
gauge_data = gauge_response.json()
print("Gauge Data Response:", gauge_data)
