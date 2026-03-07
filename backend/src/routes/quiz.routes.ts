import express from 'express';
import { getProgressData } from '../controllers/quiz.controller';
import { protect } from '../middlewares/auth';
import axios from 'axios';
import { QuizQuestion, QuizResponse } from '../models/Quiz';
import { QuizSchema, QuizSubmissionSchema } from '../schemas/quiz';

const router = express.Router();

// Generate dynamic quiz using Gemini API
router.post('/start', protect, async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in the environment variables.");
    }

    const { level = "easy", count = 6, context } = req.body || {};
    let subject = req.body.subject;

    // Personalization logic (same as before)
    if (!subject && req.user) {
      const userId = req.user._id;
      const history = await QuizResponse.find({ userId }).sort({ completedAt: -1 });
      if (history.length > 0) {
        const subjectPerformance: { [key: string]: { totalScore: number; count: number } } = {};
        history.forEach(h => {
          if (!subjectPerformance[h.subject]) {
            subjectPerformance[h.subject] = { totalScore: 0, count: 0 };
          }
          subjectPerformance[h.subject].totalScore += h.score / h.totalQuestions;
          subjectPerformance[h.subject].count++;
        });

        let weakestSubject = "";
        let lowestScore = 1.1;
        for (const sub in subjectPerformance) {
          const avgScore = subjectPerformance[sub].totalScore / subjectPerformance[sub].count;
          if (avgScore < lowestScore) {
            lowestScore = avgScore;
            weakestSubject = sub;
          }
        }
        if (weakestSubject) {
          subject = weakestSubject;
          console.log(`--- Personalizing quiz for user ${userId}. Weakest subject: ${subject} ---`);
        }
      }
    }

    if (!subject) {
      subject = "Computer Science";
    }

    const prompt = `
Generate ${count} multiple choice questions about ${subject} (${level} level).

Response MUST be a JSON array only.

Format:
[
  {
    "question": "What is JavaScript?",
    "options": ["Language", "Fruit", "Car", "City"],
    "correct": "A",
    "explanation": "JavaScript is a programming language."
  }
]

Rules:
1. "correct" MUST be "A", "B", "C", or "D".
2. No markdown, no "json" tags, no preamble.
`;

    console.log('--- Sending request to Groq API ---');

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt.trim()
          }
        ],
        temperature: 0.3,
        max_tokens: 700
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text = response.data.choices[0].message.content;
    console.log('--- Received response from Groq API ---');

    try {
      // Clean the response text to ensure it's valid JSON
      let cleanedText = text.trim();
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.split('```json')[1].split('```')[0].trim();
      } else if (cleanedText.includes('```')) {
        cleanedText = cleanedText.split('```')[1].split('```')[0].trim();
      }

      const questionsArray = JSON.parse(cleanedText);

      if (!Array.isArray(questionsArray)) {
        throw new Error("AI did not return an array of questions");
      }

      // Normalize to your schema
      const optionIndexMap: Record<string, number> = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
      };

      const normalizedQuiz = {
        subject: subject || "General",
        level: level || "medium",
        questions: questionsArray.map((q: any, index: number) => {
          const optionIndexMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
          let correctIndex: number | undefined;

          // Case 1: A/B/C/D
          if (typeof q.correct === "string" && optionIndexMap[q.correct] !== undefined) {
            correctIndex = optionIndexMap[q.correct];
          }

          // Case 2: full option text
          if (correctIndex === undefined && Array.isArray(q.options)) {
            correctIndex = q.options.findIndex(
              (opt: string) =>
                opt.trim().toLowerCase() === String(q.correct).trim().toLowerCase()
            );
          }

          // Final safety check
          if (correctIndex === undefined || correctIndex < 0) {
            console.error("Invalid correct answer from Groq:", q.correct);
            throw new Error("Invalid correct answer format from AI");
          }

          return {
            id: String(index + 1),
            question: q.text || q.question,
            options: q.options,
            correctIndex,
            explanation: q.explanation || "Refer official documentation"
          };
        })
      };

      // NOW validate
      const validatedQuiz = QuizSchema.parse(normalizedQuiz);
      console.log('Quiz generated and validated successfully');
      res.json({ ok: true, quiz: validatedQuiz });
    } catch (parseError: any) {
      console.error('--- Failed to parse or validate quiz JSON from Groq ---');
      console.error('Zod/JSON Parse Error:', parseError.message);
      console.error('Raw Response from Groq:', text);
      console.error('---------------------------------------------');
      res.status(500).json({ 
        ok: false, 
        error: 'Failed to process the quiz data from the AI model.',
        details: parseError.message,
        rawResponse: text 
      });
    }
  } catch (err: any) {
    console.error('--- Unhandled Quiz Generation Error (Groq) ---');
    console.error(err);
    return res.status(500).json({ ok: false, error: "An unexpected error occurred during quiz generation.", detail: String(err) });
  }
});

// Submit quiz and get score
router.post('/submit', protect, async (req, res) => {
  try {
    const { quiz, answers } = req.body;

    console.log('--- QUIZ SUBMISSION ---');
    console.log('Received Quiz Object:', JSON.stringify(quiz, null, 2));
    console.log('Received Answers Array:', JSON.stringify(answers, null, 2));
    console.log('-----------------------');
    const userId = req.user._id;
    const submission = QuizSubmissionSchema.parse({ quiz, answers });
    const submittedQuiz = submission.quiz;
    const userAnswers = submission.answers;
    const { questions, subject, level } = submittedQuiz;

    let score = 0;
    const detailedResults = questions.map((q, index) => {
      console.log(`--- Checking Question ${index + 1} ---`);
      console.log(`User Answer Index: ${userAnswers[index]}, Correct Index: ${q.correctIndex}`);
      const userAnswerIndex = userAnswers[index];
      const isCorrect = userAnswerIndex === q.correctIndex;
      if (isCorrect) {
        score++;
      }
      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        userAnswerIndex: userAnswerIndex,
        isCorrect: isCorrect,
      };
    });

    const percent = Math.round((score / questions.length) * 100);

    if (userId) {
      const quizResponse = new QuizResponse({
        userId,
        subject,
        level,
        score,
        percent,
        totalQuestions: questions.length,
        answers: detailedResults.map(r => ({
          questionId: r.questionId,
          selectedAnswer: r.userAnswerIndex,
          isCorrect: r.isCorrect,
        })),
        completedAt: new Date(),
      });

      await quizResponse.save();
    }

    return res.json({
      ok: true,
      score,
      percent,
      totalQuestions: questions.length,
      detailedResults: {
        quiz: submittedQuiz,
        userAnswers: userAnswers,
      },
    });
  } catch (e: any) {
    console.error('--- Quiz Submission Error ---');
    console.error(e);
    console.error('-----------------------------');
    return res.status(400).json({ ok: false, error: e.message });
  }
});

// Get progress dashboard data
router.get('/progress', protect, getProgressData);

// Get all quiz questions (fallback)
router.get('/questions', async (req, res) => {
  try {
    const questions = await QuizQuestion.find().select('-__v');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz questions', error });
  }
});

// Get user's quiz results
// Get the authenticated user's quiz results
router.get('/results', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const results = await QuizResponse.find({ userId }).sort({ completedAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz results', error });
  }
});

export default router;
