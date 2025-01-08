// api/context-recap.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { history, compressedMemory, additionalNotes } = req.body;

    // Validate inputs
    if (!compressedMemory || !history) {
      return res.status(400).json({ error: "Both 'history' and 'compressedMemory' are required." });
    }

    if (additionalNotes && typeof additionalNotes !== 'string') {
      return res.status(400).json({ error: "'additionalNotes' must be a string if provided." });
    }

    const recap = `
      === Context Recap ===
      Compressed Memory:
      ${compressedMemory}

      Conversation History:
      ${history}

      ${additionalNotes ? `Additional Notes:
      ${additionalNotes}
` : ''}
    `;

    res.status(200).json({ recap: recap.trim() });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
