// context-recap.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { history, compressedMemory } = req.body;

    const recap = `
      === Context Recap ===
      Compressed Memory:
      ${compressedMemory}

      Conversation History:
      ${history}
    `;

    res.status(200).json({ recap });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}