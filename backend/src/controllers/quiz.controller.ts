import { Request, Response } from 'express';
import { QuizResponse } from '../models/Quiz';


// @desc    Get progress dashboard data
// @route   GET /api/quiz/progress
// @access  Private
export const getProgressData = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const quizHistory = await QuizResponse.find({ userId }).sort({ completedAt: -1 });

    if (quizHistory.length === 0) {
      return res.json({
        overallScore: 0,
        performanceOverTime: [],
        strengths: [],
        weaknesses: [],
        quizHistory: [],
      });
    }

    // Overall Score
    const totalQuizzes = quizHistory.length;
    const totalScore = quizHistory.reduce((acc, quiz) => acc + quiz.score, 0);
    const overallScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

    // Performance Over Time
    const performanceOverTime = quizHistory.map(quiz => ({
      date: quiz.completedAt,
      score: quiz.percent,
    })).reverse(); // oldest to newest

    // Strengths and Weaknesses
    const subjectStats: { [key: string]: { totalScore: number; count: number } } = {};

    quizHistory.forEach(quiz => {
      const subject = quiz.subject;
      if (!subjectStats[subject]) {
        subjectStats[subject] = { totalScore: 0, count: 0 };
      }
      subjectStats[subject].totalScore += quiz.percent;
      subjectStats[subject].count += 1;
    });

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const subject in subjectStats) {
      const avgScore = subjectStats[subject].totalScore / subjectStats[subject].count;
      if (avgScore > 75) {
        strengths.push(subject);
      } else {
        weaknesses.push(subject);
      }
    }

    res.json({
      overallScore,
      performanceOverTime,
      strengths,
      weaknesses,
      quizHistory: quizHistory.map(q => ({
        subject: q.subject,
        score: q.score,
        totalQuestions: q.totalQuestions,
        date: q.completedAt,
      })),
    });

  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
