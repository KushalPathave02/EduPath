import { Request, Response } from 'express';
import fetch from 'node-fetch';

import Groq from 'groq-sdk';

const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/chat';
const OLLAMA_MODEL = 'gemma2:2b';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getAIResponse = async (prompt: string) => {
  try {
    // Try Groq first as it's more reliable than local Ollama
    if (process.env.GROQ_API_KEY) {
      console.log('--- Using Groq AI for Interview ---');
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' },
      });
      return JSON.parse(completion.choices[0].message.content || '{}');
    }

    // Fallback to Ollama if GROQ_API_KEY is not available
    console.log('--- Falling back to Ollama for Interview ---');
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API responded with status ${response.status}`);
    }

    const data = (await response.json()) as { message: { content: string } };
    // The actual JSON content from the model is in the 'message.content' property as a string
    try {
      return JSON.parse(data.message.content);
    } catch (parseError) {
      console.error('Failed to parse JSON response from Ollama:', data.message.content);
      // Return a structured error that the frontend can handle
      return {
        feedback: 'The AI response was not in the correct format. Please try again.',
        nextQuestion: 'Could you please repeat your last answer?',
      };
    }
  } catch (error) {
    console.error('Error communicating with Ollama:', error);
    throw new Error('Failed to get response from AI model.');
  }
};

export const handleMockInterviewChat = async (req: Request, res: Response) => {
  const { history, isFinished, interviewType } = req.body; // Added interviewType

  // --- Specialized System Prompts ---
  const prompts = {
    hr: `You are an expert AI interviewer for an HR (Human Resources) round. Your goal is to assess a candidate's personality, soft skills, and cultural fit. Ask behavioral questions (e.g., 'Tell me about a time you faced a conflict'). Your entire response must be in a valid JSON format like this: {"feedback": "your_feedback", "nextQuestion": "your_next_question"}.`,
    technical: `You are an expert AI technical interviewer for a software engineering role. Your goal is to assess a candidate's technical knowledge and understanding of core computer science concepts (e.g., data structures, algorithms, system design). Your entire response must be in a valid JSON format like this: {"feedback": "your_feedback", "nextQuestion": "your_next_question"}.`,
    coding: `You are an expert AI coding interviewer. Your goal is to provide a coding challenge. Your entire response must be in a valid JSON format. Do not include any other text or markdown. The JSON object should have these exact keys: 'type', 'question', 'languages', 'testCases'. The 'testCases' should be an array of objects, each with 'input' and 'expectedOutput'. Example format: {"type": "coding", "question": "Reverse a string.", "languages": ["javascript", "python", "java"], "testCases": [{"input": "hello", "expectedOutput": "olleh"}]}`,
  };

  const systemPrompt = prompts[interviewType as keyof typeof prompts] || prompts.technical; // Default to technical

  const finalReportPrompt = `The interview is now finished. Based on the entire conversation history, provide a final feedback report. The report should include sections for 'strengths', 'weaknesses', 'areasForImprovement', and an 'overallScore' out of 10. Your entire response must be in a valid JSON format like this: {"finalReport": {"strengths": "...", "weaknesses": "...", "areasForImprovement": "...", "overallScore": ...}}.`;

  try {
    let prompt;
    if (isFinished) {
      prompt = `${finalReportPrompt}\n\nInterview History:\n${JSON.stringify(history, null, 2)}`;
    } else if (history.length === 0) {
      prompt = `${systemPrompt}\n\nStart the interview by asking the first question. A good first question is 'Tell me about yourself.'`;
    } else {
      prompt = `${systemPrompt}\n\nInterview History:\n${JSON.stringify(history, null, 2)}\n\nBased on the last answer, provide feedback and the next question.`;
    }

    const aiResponse = await getAIResponse(prompt);

    if (isFinished) {
      console.log('--- AI Final Report Response ---', JSON.stringify(aiResponse, null, 2));
      res.json({ finalFeedback: aiResponse.finalReport });
    } else {
      res.json(aiResponse);
    }
  } catch (error) {
    console.error('Error in handleMockInterviewChat:', error);
    res.status(500).json({ message: 'Error processing your request with the AI model.' });
  }
};
