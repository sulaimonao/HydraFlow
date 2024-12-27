-- /lib/feedback_schema.sql
-- Feedback Entries Table
CREATE TABLE feedback_entries (
    id SERIAL PRIMARY KEY,
    response_id VARCHAR(50) NOT NULL,
    user_feedback TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback Summary (Optional Materialized View)
CREATE MATERIALIZED VIEW feedback_summary AS
SELECT 
    COUNT(*) AS total_feedback,
    AVG(rating) AS average_rating
FROM feedback_entries;
