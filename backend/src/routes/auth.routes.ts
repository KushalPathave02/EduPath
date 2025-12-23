import { Router } from 'express';
import { body } from 'express-validator';
import { 
  registerUser, 
  authUser, 
  getUserProfile, 
  updateUserProfile 
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth';

const router = Router();

// Public routes
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  registerUser
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  authUser
);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
