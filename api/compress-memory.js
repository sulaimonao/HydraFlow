export default function handler(req, res) {
  if (req.method === 'POST') {
    const { memory } = req.body;

    // Simulate compression by truncating the text
    const compressedMemory = memory.length > 50 
      ? `Compressed: ${memory.slice(0, 50)}...` 
      : `Compressed: ${memory}`;

    res.status(200).json({ compressedMemory });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
