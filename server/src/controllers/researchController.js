import { Chat } from '../models/Chat.js';
import { User } from '../models/User.js';
import { openSse } from '../utils/sse.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { runResearch } from '../services/researchPipeline.js';

export async function handleResearchStream(req, res, next) {
  const userId = req.user.id;
  const { chatId, question } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new NotFoundError('Chat not found');
    }
    if (chat.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this chat');
    }

    const user = await User.findById(userId).lean();
    const userSettings = user?.settings || {
      depth: 'quick',
      allowlist: [],
      blocklist: [],
    };

    // Open Server-Sent Events stream
    openSse(res);

    // Run full research pipeline
    await runResearch({
      req,
      res,
      chatId: chat._id,
      question: question.trim(),
      userSettings,
    });
  } catch (err) {
    if (!res.headersSent) {
      return next(err);
    }
    // If headers were already sent, client handles stream error
    res.end();
  }
}
