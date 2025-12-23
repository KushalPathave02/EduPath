import express from 'express';
import { getProgressOverview } from '../controllers/progress.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

// @desc    Get user progress overview with detailed analytics
// @route   GET /api/progress/overview
// @access  Private
router.get('/overview', protect, getProgressOverview);

export default router;
