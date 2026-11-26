import { Router } from 'express';
import { z } from 'zod';
import { askQuestion } from '../controllers/chatController.js';
import { handleResearchStream } from '../controllers/researchController.js';
import { workspaceMiddleware } from '../middleware/workspace.js';
import { chatRateLimiter, researchRateLimiter } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const askSchema = z.object({
  chatId: z.string().nullable().optional(),
  question: z
    .string({ required_error: 'Question is required' })
    .trim()
    .min(1, 'Question cannot be empty')
    .max(1000, 'Question must be under 1000 characters'),
});

const researchSchema = z.object({
  chatId: z.string({ required_error: 'chatId is required' }).min(1),
  question: z
    .string({ required_error: 'Question is required' })
    .trim()
    .min(1, 'Question cannot be empty')
    .max(1000, 'Question must be under 1000 characters'),
  messageId: z.string().optional(),
});

router.post('/ask', workspaceMiddleware, chatRateLimiter, validateBody(askSchema), askQuestion);
router.post('/research', workspaceMiddleware, researchRateLimiter, validateBody(researchSchema), handleResearchStream);

export default router;
