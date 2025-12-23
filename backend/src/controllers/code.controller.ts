import { Request, Response } from 'express';
import fetch from 'node-fetch';

interface Judge0Submission {
  token: string;
}

interface Judge0Result {
  status_id: number;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  status?: { description: string };
}

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const RAPIDAPI_HOST = 'judge0-ce.p.rapidapi.com';

const LANGUAGE_ID_MAP: { [key: string]: number } = {
  javascript: 93, // Node.js
  python: 71,   // Python 3.8.1
  java: 62,     // Java (OpenJDK 13.0.1)
};

const getSubmissionResult = async (token: string): Promise<any> => {
    const url = `${JUDGE0_API_URL}/${token}?base64_encoded=false&fields=*`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Host': RAPIDAPI_HOST,
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '',
        },
    };

    let result: Judge0Result;
    while (true) {
        const response = await fetch(url, options);
        result = await response.json() as Judge0Result;
        if (result.status_id > 2) {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    return result;
};

export const runCode = async (req: Request, res: Response) => {
    const { code, language, input } = req.body;

    if (!code || !language) {
        return res.status(400).json({ message: 'Code and language are required.' });
    }

    const language_id = LANGUAGE_ID_MAP[language];
    if (!language_id) {
        return res.status(400).json({ message: `Unsupported language: ${language}` });
    }
    
    if (!process.env.JUDGE0_API_KEY) {
        console.error('JUDGE0_API_KEY is not set in environment variables.');
        return res.status(500).json({ message: 'Code execution service is not configured.' });
    }

    try {
        const submissionResponse = await fetch(`${JUDGE0_API_URL}?base64_encoded=false&wait=false`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Host': RAPIDAPI_HOST,
                'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            },
            body: JSON.stringify({
                language_id,
                source_code: code,
                stdin: input || '',
            }),
        });

        const submissionData = await submissionResponse.json() as Judge0Submission;
        if (submissionData.token) {
            const result = await getSubmissionResult(submissionData.token);
            res.status(200).json(result);
        } else {
            throw new Error('Failed to create submission.');
        }
    } catch (error) {
        console.error('Error executing code with Judge0:', error);
        res.status(500).json({ message: 'An error occurred while running the code.' });
    }
};
