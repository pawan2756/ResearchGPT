import { Router } from 'express';
import { workspaceMiddleware } from '../middleware/workspace.js';
import { getAllMessages, listChats } from '../services/localStore.js';

const router = Router();
router.get('/summary', workspaceMiddleware, (_req, res) => {
  const messages = getAllMessages();
  const assistants = messages.filter((message) => message.role === 'assistant');
  const direct = assistants.filter((message) => message.mode === 'direct');
  const research = assistants.filter((message) => message.mode === 'research');
  const sources = research.flatMap((message) => message.sources || []);
  const claims = research.reduce((all, message) => all.concat(message.verification?.claims || []), []);
  const average = (items) => items.length ? Math.round(items.reduce((sum, item) => sum + (item.latencyMs || 0), 0) / items.length) : 0;
  res.json({ totalChats: listChats().length, totalMessages: messages.length, directCount: direct.length, researchCount: research.length, researchRate: assistants.length ? Number((research.length / assistants.length * 100).toFixed(1)) : 0, avgDirectLatencyMs: average(direct), avgResearchLatencyMs: average(research), avgConfidence: direct.length ? Number((direct.reduce((sum, message) => sum + (message.confidence || 0), 0) / direct.length).toFixed(1)) : 0, credibilityBreakdown: { high: sources.filter((source) => source.band === 'High' || source.score >= 70).length, medium: sources.filter((source) => source.band === 'Medium' || (source.score >= 40 && source.score < 70)).length, low: sources.filter((source) => source.band === 'Low' || source.score < 40).length }, verification: { totalClaims: claims.length, supportedClaims: claims.filter((claim) => claim.supported).length, supportRate: claims.length ? Number((claims.filter((claim) => claim.supported).length / claims.length * 100).toFixed(1)) : 0 }, recentActivity: assistants.slice(0, 10).map((message) => ({ id: message.id, mode: message.mode, latencyMs: message.latencyMs || 0, confidence: message.confidence, sourcesCount: message.sources?.length || 0, supportedClaims: message.verification?.supported || 0, totalClaims: message.verification?.total || 0, createdAt: message.createdAt })) });
});
export default router;
