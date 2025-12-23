import express from 'express';
import { Roadmap, UserGuidance } from '../models/Guidance';

const router = express.Router();

// Get all roadmaps
router.get('/roadmaps', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().select('-__v');
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roadmaps', error });
  }
});

// Get roadmaps by category
router.get('/roadmaps/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const roadmaps = await Roadmap.find({ category }).select('-__v');
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roadmaps by category', error });
  }
});

// Get user's guidance progress
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userGuidance = await UserGuidance.findOne({ userId })
      .populate('bookmarkedResources');
    
    res.json(userGuidance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user guidance', error });
  }
});

// Update user's selected path
router.post('/select-path', async (req, res) => {
  try {
    const { userId, selectedPath } = req.body;
    
    const userGuidance = await UserGuidance.findOneAndUpdate(
      { userId },
      { selectedPath, lastAccessed: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: 'Path selected successfully', userGuidance });
  } catch (error) {
    res.status(500).json({ message: 'Error selecting path', error });
  }
});

// Mark step as completed
router.post('/complete-step', async (req, res) => {
  try {
    const { userId, stepIndex } = req.body;
    
    const userGuidance = await UserGuidance.findOneAndUpdate(
      { userId },
      { 
        $addToSet: { completedSteps: stepIndex },
        lastAccessed: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Step completed successfully', userGuidance });
  } catch (error) {
    res.status(500).json({ message: 'Error completing step', error });
  }
});

export default router;
