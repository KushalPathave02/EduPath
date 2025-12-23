import { Request, Response } from 'express';
import StudyPlan, { IStudyPlan } from '../models/StudyPlan';
import mongoose from 'mongoose';

// Create or update a study plan
export const createOrUpdateStudyPlan = async (req: Request, res: Response) => {
  const { userId, domain, topics, studySchedule, targetCompletionDate } = req.body;

  if (!userId || !domain || !targetCompletionDate) {
    return res.status(400).json({ message: 'User ID, domain, and target completion date are required.' });
  }

  try {
    let plan = await StudyPlan.findOne({ userId, domain });

    if (plan) {
      // Update existing plan
      plan.topics = topics || plan.topics;
      plan.studySchedule = studySchedule || plan.studySchedule;
      plan.targetCompletionDate = targetCompletionDate || plan.targetCompletionDate;
      plan.isActive = true; // Reactivate if it was inactive
    } else {
      // Create new plan
      plan = new StudyPlan({
        userId,
        domain,
        topics,
        studySchedule,
        targetCompletionDate,
      });
    }

    const savedPlan = await plan.save();
    res.status(201).json(savedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating or updating study plan.', error });
  }
};

// Get a user's study plan for a specific domain
export const getStudyPlan = async (req: Request, res: Response) => {
  const { userId, domain } = req.query;

  if (!userId || !domain) {
    return res.status(400).json({ message: 'User ID and domain are required.' });
  }

  try {
    const plan = await StudyPlan.findOne({ userId, domain, isActive: true });
    if (!plan) {
      return res.status(404).json({ message: 'Active study plan not found for this domain.' });
    }
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching study plan.', error });
  }
};

// Update study schedule
export const updateStudySchedule = async (req: Request, res: Response) => {
    const { planId } = req.params;
    const { studySchedule } = req.body;

    if (!mongoose.Types.ObjectId.isValid(planId)) {
        return res.status(400).json({ message: 'Invalid study plan ID.' });
    }

    try {
        const plan = await StudyPlan.findByIdAndUpdate(
            planId,
            { $set: { studySchedule } },
            { new: true }
        );

        if (!plan) {
            return res.status(404).json({ message: 'Study plan not found.' });
        }

        res.status(200).json(plan);
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating study schedule', error: error.message });
    }
};

// Add a test score to a study plan
export const addTestScore = async (req: Request, res: Response) => {
  const { studyPlanId } = req.params;
  const { topic, score } = req.body;

  if (!topic || score === undefined) {
    return res.status(400).json({ message: 'Topic and score are required.' });
  }

  try {
    const plan = await StudyPlan.findById(studyPlanId);

    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found.' });
    }

    plan.testScores.push({ topic, score, date: new Date() });
    await plan.save();

    res.status(201).json(plan);
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding test score', error: error.message });
  }
};
