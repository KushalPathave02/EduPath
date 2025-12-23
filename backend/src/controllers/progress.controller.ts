import { Request, Response } from 'express';
import StudyPlan from '../models/StudyPlan';
import QuizResult from '../models/QuizResult';
import { MockInterview } from '../models/Interview';

// @desc    Get user progress overview with detailed analytics
// @route   GET /api/progress/overview
// @access  Private
export const getProgressOverview = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all necessary data in parallel
    const [quizResults, studyPlan] = await Promise.all([
      QuizResult.find({ userId }).sort({ createdAt: 'asc' }), // Sort oldest to newest for trends
      StudyPlan.findOne({ userId, isActive: true }),
    ]);

    // 2. Calculate Detailed Progress Metrics

    // Overall Score (%)
    const totalCorrectAnswers = quizResults.reduce((sum, result) => {
        return sum + result.answers.filter(a => a.isCorrect).length;
    }, 0);
    const totalAttemptedQuestions = quizResults.reduce((sum, result) => sum + result.totalQuestions, 0);
    const overallScore = totalAttemptedQuestions > 0 ? (totalCorrectAnswers / totalAttemptedQuestions) * 100 : 0;

    // Study Completion (%)
    const completedTopics = studyPlan ? studyPlan.topics.filter(t => t.completed).length : 0;
    const totalTopics = studyPlan ? studyPlan.topics.length : 0;
    const studyCompletion = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    // Test Score Trend (for line graph)
    const testScoreTrend = quizResults.map(result => ({
      date: result.createdAt,
      score: result.score,
    }));

    // Domain-wise Strengths/Weaknesses
    const domainScores: { [key: string]: { scores: number[]; count: number } } = {};
    quizResults.forEach(result => {
      if (!domainScores[result.domain]) {
        domainScores[result.domain] = { scores: [], count: 0 };
      }
      domainScores[result.domain].scores.push(result.score);
      domainScores[result.domain].count++;
    });

    const domainAverages = Object.entries(domainScores).map(([domain, data]) => ({
      domain,
      averageScore: data.scores.reduce((a, b) => a + b, 0) / data.count,
    }));

    const strengths = domainAverages.filter(d => d.averageScore >= 75);
    const weaknesses = domainAverages.filter(d => d.averageScore < 75);

    // Growth Tracking
    let growth = { message: 'Not enough data to track growth.', trend: 'stable' };
    if (quizResults.length >= 10) {
      const recentScores = quizResults.slice(-5).map(r => r.score);
      const pastScores = quizResults.slice(-10, -5).map(r => r.score);
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const pastAvg = pastScores.reduce((a, b) => a + b, 0) / pastScores.length;

      if (recentAvg > pastAvg) {
        growth = { message: 'You\'re improving!', trend: 'improving' };
      } else {
        growth = { message: 'Focus more on weak areas.', trend: 'declining' };
      }
    }

    // 3. Structure the response payload
    const responsePayload = {
      overallScore: Math.round(overallScore),
      studyCompletion: Math.round(studyCompletion),
      testScoreTrend,
      domainAnalysis: {
        strengths,
        weaknesses,
      },
      growth,
    };

    res.json(responsePayload);

  } catch (error) {
    console.error('Error fetching progress overview:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

