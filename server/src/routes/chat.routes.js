import { Router } from 'express';
import { z } from 'zod';
import { askQuestion } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';
import { chatRateLimiter } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const askSchema = z.object({
  chatId: z.string().optional(),
  question: z
    .string({ required_error: 'Question is required' })
    .trim()
    .min(1, 'Question cannot be empty')
    .max(1000, 'Question must be under 1000 characters'),
});

router.post('/ask', authMiddleware, chatRateLimiter, validateBody(askSchema), askQuestion);

export default router;
