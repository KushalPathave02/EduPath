import express from 'express';
import { InterviewQuestion, CodingChallenge, MockInterview } from '../models/Interview';
import { handleMockInterviewChat } from '../controllers/ollama.controller';

const router = express.Router();

// Get interview questions by category
router.get('/questions/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const questions = await InterviewQuestion.find({ category }).select('-__v');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interview questions', error });
  }
});

// Get all interview questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await InterviewQuestion.find().select('-__v');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interview questions', error });
  }
});

// Get coding challenges
router.get('/challenges', async (req, res) => {
  try {
    const challenges = await CodingChallenge.find().select('-__v');
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coding challenges', error });
  }
});

// Get coding challenges by difficulty
router.get('/challenges/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    const challenges = await CodingChallenge.find({ difficulty }).select('-__v');
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coding challenges', error });
  }
});

// Start mock interview
router.post('/mock-interview', async (req, res) => {
  try {
    const { userId, questionIds, duration } = req.body;
    
    const mockInterview = new MockInterview({
      userId,
      questions: questionIds,
      duration
    });

    await mockInterview.save();
    res.status(201).json({ message: 'Mock interview started', mockInterview });
  } catch (error) {
    res.status(500).json({ message: 'Error starting mock interview', error });
  }
});

// Complete mock interview
router.put('/mock-interview/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;
    
    const mockInterview = await MockInterview.findByIdAndUpdate(
      id,
      { 
        score,
        feedback,
        completedAt: new Date()
      },
      { new: true }
    );

    res.json({ message: 'Mock interview completed', mockInterview });
  } catch (error) {
    res.status(500).json({ message: 'Error completing mock interview', error });
  }
});

// Get user's mock interview history
router.get('/mock-interviews/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const interviews = await MockInterview.find({ userId })
      .populate('questions')
      .sort({ createdAt: -1 });
    
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mock interviews', error });
  }
});

// Handle mock interview chat with AI
router.post('/mock-interview/chat', handleMockInterviewChat);

export default router;
