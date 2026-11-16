import { Router } from 'express';
import { z } from 'zod';
import { signup, login, getMe } from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { authRateLimiter } from '../middleware/rateLimit.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const authSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

router.post('/signup', authRateLimiter, validateBody(authSchema), signup);
router.post('/login', authRateLimiter, validateBody(authSchema), login);
router.get('/me', authMiddleware, getMe);

export default router;
