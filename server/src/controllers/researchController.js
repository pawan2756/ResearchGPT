import { Chat } from '../models/Chat.js';
import { User } from '../models/User.js';
import { openSse } from '../utils/sse.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { runResearch } from '../services/researchPipeline.js';
import { getChat, getSettings } from '../services/localStore.js';

export async function handleResearchStream(req, res, next) {
  const { chatId, question, messageId } = req.body;

  try {
    const chat = getChat(chatId);
    if (!chat) {
      throw new NotFoundError('Chat not found');
    }
    const userSettings = getSettings();

    // Open Server-Sent Events stream
    openSse(res);

    // Run full research pipeline
    await runResearch({
      req,
      res,
      chatId: chat.id,
      question: question.trim(),
      userSettings,
      targetMessageId: messageId,
    });
  } catch (err) {
    if (!res.headersSent) {
      return next(err);
    }
    // If headers were already sent, client handles stream error
    res.end();
  }
}
