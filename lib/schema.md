| table_name        | column_name       | data_type                   | is_nullable |
| ----------------- | ----------------- | --------------------------- | ----------- |
| contexts          | id                | integer                     | NO          |
| contexts          | user_id           | text                        | YES         |
| contexts          | chatroom_id       | text                        | YES         |
| contexts          | data              | jsonb                       | YES         |
| contexts          | updated_at        | timestamp with time zone    | YES         |
| debug_logs        | id                | integer                     | NO          |
| debug_logs        | user_id           | text                        | NO          |
| debug_logs        | context_id        | integer                     | YES         |
| debug_logs        | issue             | text                        | NO          |
| debug_logs        | resolution        | text                        | YES         |
| debug_logs        | timestamp         | timestamp with time zone    | YES         |
| feedback_entries  | id                | integer                     | NO          |
| feedback_entries  | response_id       | character varying           | NO          |
| feedback_entries  | user_feedback     | text                        | YES         |
| feedback_entries  | rating            | integer                     | YES         |
| feedback_entries  | timestamp         | timestamp without time zone | YES         |
| gauge_metrics     | id                | integer                     | NO          |
| gauge_metrics     | subpersona_id     | integer                     | YES         |
| gauge_metrics     | token_used        | integer                     | YES         |
| gauge_metrics     | token_total       | integer                     | YES         |
| gauge_metrics     | remaining_tokens  | integer                     | YES         |
| gauge_metrics     | status            | text                        | YES         |
| gauge_metrics     | latency           | numeric                     | YES         |
| gauge_metrics     | engine_load       | text                        | YES         |
| gauge_metrics     | recommendations   | jsonb                       | YES         |
| gauge_metrics     | created_at        | timestamp without time zone | YES         |
| gauge_metrics     | head_id           | integer                     | YES         |
| heads             | id                | integer                     | NO          |
| heads             | name              | text                        | YES         |
| heads             | status            | text                        | YES         |
| heads             | user_id           | text                        | YES         |
| heads             | chatroom_id       | text                        | YES         |
| heads             | capabilities      | jsonb                       | YES         |
| heads             | preferences       | jsonb                       | YES         |
| heads             | subpersona_id     | integer                     | YES         |
| heads             | task_description  | text                        | YES         |
| heads             | trigger_condition | text                        | YES         |
| heads             | createdAt         | timestamp without time zone | YES         |
| heads             | createdat         | bigint                      | YES         |
| memories          | id                | integer                     | NO          |
| memories          | user_id           | text                        | YES         |
| memories          | chatroom_id       | text                        | YES         |
| memories          | memory            | text                        | YES         |
| memories          | updated_at        | timestamp with time zone    | YES         |
| subtasks          | id                | integer                     | NO          |
| subtasks          | task_card_id      | integer                     | YES         |
| subtasks          | description       | text                        | NO          |
| subtasks          | status            | character varying           | YES         |
| subtasks          | created_at        | timestamp without time zone | YES         |
| task_cards        | id                | integer                     | NO          |
| task_cards        | goal              | text                        | NO          |
| task_cards        | priority          | character varying           | YES         |
| task_cards        | created_at        | timestamp without time zone | YES         |
| task_cards        | user_id           | text                        | YES         |
| task_cards        | chatroom_id       | text                        | YES         |
| task_cards        | active            | boolean                     | YES         |
| task_dependencies | id                | integer                     | NO          |
| task_dependencies | subtask_id        | integer                     | YES         |
| task_dependencies | depends_on        | integer                     | YES         |
| templates         | id                | integer                     | NO          |
| templates         | name              | text                        | NO          |
| templates         | configuration     | jsonb                       | NO          |
| templates         | created_at        | timestamp with time zone    | YES         |