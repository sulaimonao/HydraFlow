-- lib/task_manager_schema.sql
-- Task Cards Table
CREATE TABLE task_cards (
    id SERIAL PRIMARY KEY,
    goal TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'High',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subtasks Table
CREATE TABLE subtasks (
    id SERIAL PRIMARY KEY,
    task_card_id INT REFERENCES task_cards(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status VARCHAR(10) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Dependencies Table
CREATE TABLE task_dependencies (
    id SERIAL PRIMARY KEY,
    subtask_id INT REFERENCES subtasks(id) ON DELETE CASCADE,
    depends_on INT REFERENCES subtasks(id) ON DELETE CASCADE
);
