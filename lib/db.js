// lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function insertFeedback({ userFeedback, rating }) {
  const client = await pool.connect();
  try {
    const query = 'INSERT INTO feedback (user_feedback, rating) VALUES ($1, $2)';
    const values = [userFeedback, rating];
    await client.query(query, values);
  } finally {
    client.release();
  }
}
