import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
function parseLogs(logs: string): any[] {
    try {
        const logEntries = JSON.parse(logs);

        if (!Array.isArray(logEntries)) {
            throw new Error('Invalid log format. Expecting an array.');
        }

        return logEntries.map((log, index) => {
            try {
                const {
                    timestamp,
                    level,
                    message: { transactionId, details, err = '' },
                } = log;

                if (!timestamp || !level || !transactionId || !details) {
                    throw new Error(`Required fields are missing in log entry at index ${index}`);
                }

                return {
                    timestamp: new Date(timestamp).getTime(),
                    loglevel: level,
                    transactionId,
                    err,
                };
            } catch (error) {
                console.error(`Error parsing log entry at index ${index}:`, log, '\nError:', error);
                return null;
            }
        }).filter((entry) => entry !== null);
    } catch (error) {
        console.error('Error parsing logs:', error);
        return [];
    }
}


app.post('/parse-logs', upload.single('file'), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            throw new Error('No file provided');
        }

        const logs = req.file.buffer.toString();
        console.log('Received logs:', logs);

        const parsedLogs = parseLogs(logs);
        console.log('Parsed logs:', parsedLogs);

        // Filter logs based on log level (error and warn)
        const filteredLogs = parsedLogs.filter((log) => log.loglevel === 'error' || log.loglevel === 'warn');
        
        console.log('Filtered logs:', filteredLogs);

        res.json(filteredLogs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
