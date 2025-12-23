import { Request, Response } from 'express';
import { MockInterview, IMockInterview } from '../models/Interview';

// @desc    Schedule a mock interview
// @route   POST /api/interviews/schedule
// @access  Private
export const scheduleInterview = async (req: Request, res: Response) => {
  const { domain, interviewer, date, duration, notes } = req.body;
  const userId = req.user._id;

  try {
    const interview = new MockInterview({
      userId,
      domain,
      interviewer,
      date,
      duration,
      notes,
      status: 'scheduled',
    });

    await interview.save();

    // In a real app, you would send a confirmation email/notification here

    res.status(201).json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's interviews
// @route   GET /api/interviews
// @access  Private
export const getUserInterviews = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const interviews = await MockInterview.find(query).sort({ date: -1 });
    res.json(interviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get interview details
// @route   GET /api/interviews/:id
// @access  Private
export const getInterviewDetails = async (req: Request, res: Response) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel an interview
// @route   PUT /api/interviews/:id/cancel
// @access  Private
export const cancelInterview = async (req: Request, res: Response) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed interview' });
    }

    interview.status = 'cancelled';
    await interview.save();

    // In a real app, you would send a cancellation email/notification here

    res.json({ message: 'Interview cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add interview feedback (admin only)
// @route   PUT /api/interviews/:id/feedback
// @access  Private/Admin
export const addInterviewFeedback = async (req: Request, res: Response) => {
  try {
    const { feedback } = req.body;
    
    const interview = await MockInterview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.feedback = {
      ...feedback,
      overallScore: calculateOverallScore(feedback),
    };
    interview.status = 'completed';
    
    await interview.save();

    // In a real app, you would send a notification to the user about the feedback

    res.json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate overall score from individual feedback categories
const calculateOverallScore = (feedback: any): number => {
  const { technicalSkills, problemSolving, communication } = feedback;
  // Simple average, but you could weight these differently
  return Math.round((technicalSkills + problemSolving + communication) / 3 * 2); // Scale to 1-10
};
