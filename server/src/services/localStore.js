import crypto from 'crypto';

const chats = new Map();
const messages = new Map();
const settings = { depth: 'quick', allowlist: [], blocklist: [], theme: 'system' };
const feedback = new Map();
const evalQuestions = [];
const evalResults = [];
const id = () => crypto.randomBytes(12).toString('hex');

export function createChat(title) {
  const chat = { id: id(), title, createdAt: new Date(), updatedAt: new Date() };
  chats.set(chat.id, chat);
  return chat;
}
export function getChat(chatId) { return chats.get(chatId) || null; }
export function listChats() { return [...chats.values()].sort((a, b) => b.updatedAt - a.updatedAt); }
export function renameChat(chatId, title) { const chat = chats.get(chatId); if (!chat) return null; chat.title = title; chat.updatedAt = new Date(); return chat; }
export function removeChat(chatId) { const existed = chats.delete(chatId); for (const [messageId, message] of messages) if (message.chatId === chatId) messages.delete(messageId); return existed; }
export function saveMessage(input) {
  const message = { id: id(), createdAt: new Date(), sources: [], excludedCount: 0, verification: null, ...input };
  messages.set(message.id, message);
  const chat = chats.get(message.chatId);
  if (chat) chat.updatedAt = new Date();
  return message;
}
export function updateMessage(messageId, changes) {
  const message = messages.get(messageId);
  if (!message) return null;
  Object.assign(message, changes);
  return message;
}
export function getMessages(chatId) { return [...messages.values()].filter((message) => message.chatId === chatId).sort((a, b) => a.createdAt - b.createdAt); }
export function getSettings() { return { ...settings, allowlist: [...settings.allowlist], blocklist: [...settings.blocklist] }; }
export function updateSettings(input) { Object.assign(settings, input); return getSettings(); }
export function saveFeedback(input) { feedback.set(input.messageId, { ...input, updatedAt: new Date() }); return feedback.get(input.messageId); }
export function getFeedback(messageId) { return feedback.get(messageId) || null; }
export function seedEvalQuestions(items) { if (!evalQuestions.length) evalQuestions.push(...items.map((item) => ({ ...item, id: id(), createdAt: new Date() }))); return [...evalQuestions]; }
export function getEvalQuestions() { return [...evalQuestions]; }
export function saveEvalResult(input) { const result = { id: id(), createdAt: new Date(), ...input }; evalResults.push(result); return result; }
export function getLatestEvalResults() { if (!evalResults.length) return []; const runId = evalResults.at(-1).runId; return evalResults.filter((result) => result.runId === runId); }
export function getAllMessages() { return [...messages.values()].sort((a, b) => b.createdAt - a.createdAt); }
