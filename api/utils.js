// api/utils.js
import { compressMemory } from '../../src/actions/memory_compressor.js';
import { contextRecap } from '../../src/actions/context_recapper.js';

export default async function handler(req, res) {
  try {
    const { action } = req.query;

    if (action === 'compress') {
      const { memory } = req.body;
      if (!memory) {
        return res.status(400).json({ error: 'Memory is required for compression.' });
      }
      const compressedMemory = compressMemory(memory);
      return res.status(200).json({ compressedMemory });
    } else if (action === 'recap') {
      const { history, compressedMemory } = req.body;
      if (!history || !compressedMemory) {
        return res.status(400).json({ error: 'History and compressedMemory are required.' });
      }
      const recap = contextRecap(history, compressedMemory);
      return res.status(200).json({ recap });
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "compress" or "recap".' });
    }
  } catch (error) {
    console.error('Error in utils API:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}
