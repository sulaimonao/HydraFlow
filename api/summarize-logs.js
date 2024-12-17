export default function handler(req, res) {
    if (req.method === 'POST') {
      const { logs } = req.body;
      const summaryReport = `Logs Summary: ${logs.split('\n').slice(0, 5).join('\n')}...`;
  
      res.status(200).json({ summaryReport });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  