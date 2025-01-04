// context-recap.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { history, compressedMemory } = req.body;

    // Validate inputs
    if (!compressedMemory || !history) {
      return res.status(400).json({ error: "Both 'history' and 'compressedMemory' are required." });
    }

    const recap = `
      === Context Recap ===
      Compressed Memory:
      ${compressedMemory}

      Conversation History:
      ${history}
    `;

    res.status(200).json({ recap: recap.trim() });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
