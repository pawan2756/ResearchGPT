import { Router } from 'express';
import { z } from 'zod';
import {
  listChats,
  getChatById,
  updateChatTitle,
  deleteChat,
} from '../controllers/chatsController.js';
import { workspaceMiddleware } from '../middleware/workspace.js';
import { chatRateLimiter } from '../middleware/rateLimit.js';
import { validateBody, validateQuery } from '../middleware/validate.js';

const router = Router();

const listQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().optional(),
});

const updateTitleSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(120, 'Title cannot exceed 120 characters'),
});

router.use(workspaceMiddleware);
router.use(chatRateLimiter);

router.get('/', validateQuery(listQuerySchema), listChats);
router.get('/:id', getChatById);
router.patch('/:id', validateBody(updateTitleSchema), updateChatTitle);
router.delete('/:id', deleteChat);

export default router;
