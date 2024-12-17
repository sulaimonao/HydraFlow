export default function handler(req, res) {
    if (req.method === 'POST') {
      const { query } = req.body;
      const keywords = query.split(' ').filter(word => word.length > 3);
      const actionItems = [];
  
      if (query.includes('summarize logs')) actionItems.push('summarize logs');
      if (query.includes('create head')) actionItems.push('create head');
  
      res.status(200).json({ keywords, actionItems });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  