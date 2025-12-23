import { Router } from 'express';
import {
  createOrUpdateStudyPlan,
  getStudyPlan,
  updateStudySchedule,
  addTestScore
} from '../controllers/studyPlan.controller';
import { protect } from '../middlewares/auth';

const router = Router();

// All routes in this file are protected
router.use(protect);

// Get a study plan for the logged-in user and a specific domain
router.get('/', getStudyPlan);

// Create or update a study plan
router.post('/', createOrUpdateStudyPlan);

// Update just the study schedule for a specific plan
router.put('/:planId/schedule', updateStudySchedule);

// Add a test score to a study plan
router.post('/:studyPlanId/scores', addTestScore);

export default router;
