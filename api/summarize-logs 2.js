// summarize-logs.js
import winston from 'winston';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { logs } = req.body;

    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
      ],
    });

    const errorPattern = /error|fail|exception/i;
    const errorCount = (logs.match(errorPattern) || []).length;

    const summaryReport = {
      totalEntries: logs.split('\n').length,
      errorCount,
    };

    logger.info('Logs analyzed', summaryReport);

    res.status(200).json({ summaryReport });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}