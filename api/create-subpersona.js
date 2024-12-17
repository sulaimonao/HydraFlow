export default function handler(req, res) {
    if (req.method === 'POST') {
      const { task, description } = req.body;
  
      const head = {
        subPersonaName: `Head-${task.replace(/\s/g, '_')}`,
        status: 'active'
      };
  
      res.status(200).json(head);
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  