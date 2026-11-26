import { Router } from 'express';
import { z } from 'zod';
import { workspaceMiddleware } from '../middleware/workspace.js';
import { validateBody } from '../middleware/validate.js';
import { env } from '../config/env.js';
import { getSettings, updateSettings } from '../services/localStore.js';

const router = Router();
const schema = z.object({ depth: z.enum(['quick', 'deep']).optional(), allowlist: z.array(z.string().trim()).optional(), blocklist: z.array(z.string().trim()).optional(), theme: z.enum(['system', 'light', 'dark']).optional() });
router.get('/', workspaceMiddleware, (_req, res) => res.json({ settings: getSettings(), system: { geminiModel: env.GEMINI_MODEL, isMockMode: env.IS_MOCK_MODE, hasGeminiKey: Boolean(env.GEMINI_API_KEY), hasTavilyKey: Boolean(env.TAVILY_API_KEY), researchThreshold: env.RESEARCH_THRESHOLD } }));
router.put('/', workspaceMiddleware, validateBody(schema), (req, res) => res.json({ message: 'Settings updated successfully', settings: updateSettings(req.body) }));
export default router;
