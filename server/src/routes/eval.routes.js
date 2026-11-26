import { Router } from 'express';
import { SEED_QUESTIONS } from '../services/evalSeed.js';
import { generateDirectAnswer } from '../services/gemini.js';
import { computeResearchScore } from '../services/researchScore.js';
import { workspaceMiddleware } from '../middleware/workspace.js';
import { seedEvalQuestions, getEvalQuestions, saveEvalResult, getLatestEvalResults } from '../services/localStore.js';

const router = Router();
const metrics = (results) => {
  const total = results.length;
  const passed = results.filter((result) => result.mark === 'passed').length;
  const tp = results.filter((r) => r.expectedMode === 'research' && r.actualMode === 'research').length;
  const fp = results.filter((r) => r.expectedMode === 'direct' && r.actualMode === 'research').length;
  const fn = results.filter((r) => r.expectedMode === 'research' && r.actualMode === 'direct').length;
  const tn = results.filter((r) => r.expectedMode === 'direct' && r.actualMode === 'direct').length;
  return { total, passed, failed: total - passed, accuracy: total ? Number((passed / total * 100).toFixed(1)) : 0, precision: tp + fp ? Number((tp / (tp + fp) * 100).toFixed(1)) : 0, recall: tp + fn ? Number((tp / (tp + fn) * 100).toFixed(1)) : 0, confusionMatrix: { tp, fp, fn, tn } };
};
router.get('/questions', workspaceMiddleware, (_req, res) => res.json({ questions: seedEvalQuestions(SEED_QUESTIONS) }));
router.post('/run', workspaceMiddleware, async (req, res, next) => {
  try {
    const questions = seedEvalQuestions(SEED_QUESTIONS).slice(0, Math.min(Number(req.body?.sampleSize) || 40, 40));
    const runId = 'run-' + Date.now();
    const results = [];
    for (const question of questions) {
      const start = Date.now();
      const direct = await generateDirectAnswer(question.question);
      const research = computeResearchScore({ question: question.question, answer: direct.answer, confidence: direct.confidence, needsResearch: direct.needs_research });
      const actualMode = research.shouldPrompt ? 'research' : 'direct';
      results.push(saveEvalResult({ runId, questionId: question.id, question: question.question, category: question.category, expectedMode: question.expectedMode, actualMode, researchScore: research.score, shouldPrompt: research.shouldPrompt, directAnswer: direct.answer, directConfidence: direct.confidence, mark: actualMode === question.expectedMode ? 'passed' : 'failed', latencyMs: Date.now() - start }));
    }
    res.json({ runId, ...metrics(results), results });
  } catch (error) { next(error); }
});
router.get('/results', workspaceMiddleware, (_req, res) => { const results = getLatestEvalResults(); res.json({ hasRuns: results.length > 0, results, ...(results.length ? metrics(results) : { metrics: null }) }); });
export default router;
