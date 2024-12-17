export default function handler(req, res) {
    if (req.method === 'POST') {
      const { history, compressedMemory } = req.body;
      const recap = `Recap: ${compressedMemory}\nDetails: ${history}`;
  
      res.status(200).json({ recap });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  