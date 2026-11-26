import { NotFoundError } from '../utils/errors.js';
import { getChat, getMessages, listChats as getStoredChats, renameChat, removeChat } from '../services/localStore.js';

export async function listChats(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const query = String(req.query.q || '').trim().toLowerCase();
    const all = getStoredChats().filter((chat) => !query || chat.title.toLowerCase().includes(query));
    const chats = all.slice((page - 1) * limit, page * limit).map((chat) => {
      const chatMessages = getMessages(chat.id);
      const last = chatMessages.at(-1);
      return { ...chat, messageCount: chatMessages.length, lastMode: last?.mode || 'direct', lastPreview: last?.content?.slice(0, 100) || '' };
    });
    res.json({ chats, pagination: { total: all.length, page, limit, pages: Math.max(1, Math.ceil(all.length / limit)) } });
  } catch (error) { next(error); }
}

export async function getChatById(req, res, next) {
  try {
    const chat = getChat(req.params.id);
    if (!chat) throw new NotFoundError('Chat not found');
    const messages = getMessages(chat.id).map((message) => ({
      ...message,
      shouldPrompt: message.role === 'assistant' && message.mode === 'direct' && !message.promptDismissed && (message.shouldPrompt || message.researchScore >= 3),
    }));
    res.json({ chat, messages });
  } catch (error) { next(error); }
}

export async function updateChatTitle(req, res, next) {
  try {
    const chat = renameChat(req.params.id, req.body.title.trim());
    if (!chat) throw new NotFoundError('Chat not found');
    res.json({ chat });
  } catch (error) { next(error); }
}
export async function deleteChat(req, res, next) {
  try {
    if (!removeChat(req.params.id)) throw new NotFoundError('Chat not found');
    res.status(204).end();
  } catch (error) { next(error); }
}
