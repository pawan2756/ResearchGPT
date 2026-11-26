import { Router } from 'express';
import { z } from 'zod';
import { workspaceMiddleware } from '../middleware/workspace.js';
import { validateBody } from '../middleware/validate.js';
import { saveFeedback, getFeedback } from '../services/localStore.js';

const router = Router();
const schema = z.object({ messageId: z.string().min(1), rating: z.enum(['positive', 'negative']), reason: z.string().optional().default('') });
router.post('/', workspaceMiddleware, validateBody(schema), (req, res) => res.json({ message: 'Feedback submitted successfully', feedback: saveFeedback(req.body) }));
router.get('/message/:messageId', workspaceMiddleware, (req, res) => res.json({ feedback: getFeedback(req.params.messageId) }));
export default router;
