// api/test-db.js
import { supabase } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('task_cards')
      .select('*');

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Fetched task cards:', data);
    return res.status(200).json({ data });
  } catch (err) {
    console.error('Unexpected server error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
}
