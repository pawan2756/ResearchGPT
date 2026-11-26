import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { generateDirectAnswer } from '../services/gemini.js';
import { computeResearchScore } from '../services/researchScore.js';
import { logStep } from '../utils/logger.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { createChat, getChat, saveMessage } from '../services/localStore.js';

export async function askQuestion(req, res, next) {
  const startTime = Date.now();
  const reqId = req.id;
  const { chatId, question } = req.body;

  try {
    let activeChat;

    if (chatId) {
      activeChat = getChat(chatId);
      if (!activeChat) {
        throw new NotFoundError('Chat not found');
      }
    } else {
      // Create new chat with clean title from first 40 chars of question
      const cleanTitle = question.trim().slice(0, 40) + (question.trim().length > 40 ? '...' : '');
      activeChat = createChat(cleanTitle || 'New Research Chat');
    }

    // Save user message
    saveMessage({
      chatId: activeChat.id,
      role: 'user',
      content: question.trim(),
      mode: 'direct',
    });

    // Generate direct answer from Gemini (or mock)
    const geminiStart = Date.now();
    const directResult = await generateDirectAnswer(question.trim());
    const geminiLatency = Date.now() - geminiStart;

    logStep(reqId, 'direct_answer', geminiLatency, {
      confidence: directResult.confidence,
      needsResearch: directResult.needs_research,
    });

    // Compute research score & signals
    const scoreStart = Date.now();
    const { score, shouldPrompt, signals } = computeResearchScore({
      question: question.trim(),
      answer: directResult.answer,
      confidence: directResult.confidence,
      needsResearch: directResult.needs_research,
    });
    const scoreLatency = Date.now() - scoreStart;

    logStep(reqId, 'research_score', scoreLatency, {
      score,
      shouldPrompt,
    });

    const totalLatency = Date.now() - startTime;

    // Save assistant message
    const assistantMessage = saveMessage({
      chatId: activeChat.id,
      role: 'assistant',
      content: directResult.answer,
      mode: 'direct',
      confidence: directResult.confidence,
      needsResearch: directResult.needs_research,
      researchScore: score,
      shouldPrompt,
      signals,
      latencyMs: totalLatency,
    });

    res.status(200).json({
      chatId: activeChat.id,
      message: assistantMessage,
      researchScore: score,
      signals,
      shouldPrompt,
    });
  } catch (err) {
    next(err);
  }
}
