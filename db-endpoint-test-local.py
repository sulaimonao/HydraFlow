import requests

# Base URL for the deployed API
base_url = "http://localhost:3000/api"  # Use localhost for local testing

# 1. Test Insert Task Card
print("Testing Insert Task Card...")
task_payload = {
    "goal": "Test Goal for Validation",
    "priority": "High",
    "subtasks": [{"description": "First Subtask"}, {"description": "Second Subtask"}],
}
insert_response = requests.post(
    f"{base_url}/task", json=task_payload, headers={"Content-Type": "application/json"}
)
print("Insert Task Response:", insert_response.json())

# 2. Test Fetch Task Cards
print("Testing Fetch Task Cards...")
fetch_response = requests.get(f"{base_url}/task")
print("Fetch Task Cards Response:", fetch_response.json())

# 3. Test Update Subtask Status
if insert_response.status_code == 201:
    subtasks = insert_response.json().get("subtasks", [])
    if subtasks:
        subtask_id = subtasks[0]["id"]
        update_payload = {"subtaskId": subtask_id, "status": "completed"}
        update_response = requests.put(
            f"{base_url}/task", json=update_payload, headers={"Content-Type": "application/json"}
        )
        print("Update Subtask Response:", update_response.json())

# 4. Test Delete Task Card
if insert_response.status_code == 201:
    task_card_id = insert_response.json().get("taskCard", {}).get("id")
    if task_card_id:
        delete_payload = {"taskCardId": task_card_id}
        delete_response = requests.delete(
            f"{base_url}/task", json=delete_payload, headers={"Content-Type": "application/json"}
        )
        print("Delete Task Card Response:", delete_response.json())

# 5. Test Gauge Endpoint
print("Testing Gauge Endpoint...")
gauge_response = requests.get(
    f"{base_url}/gauge", params={"user_id": "test_user", "chatroom_id": "general"}
)
print("Gauge Data Response:", gauge_response.json())
