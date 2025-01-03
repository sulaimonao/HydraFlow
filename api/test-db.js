// api/test-db.js
import { supabase } from '../lib/db.js';
import { createLogger, format, transports } from "winston";

// Configure logger
const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from('task_cards').select('*');

    if (error) {
      logger.error('Supabase query error:', error);
      return res.status(500).json({ error: error.message });
    }

    logger.info('Fetched task cards:', data);
    return res.status(200).json({ data });
  } catch (err) {
    logger.error('Unexpected server error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
}
