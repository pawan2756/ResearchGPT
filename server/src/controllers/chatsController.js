import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export async function listChats(req, res, next) {
  try {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const q = (req.query.q || '').trim();

    const filter = { userId };
    if (q) {
      filter.title = { $regex: q, $options: 'i' };
    }

    const total = await Chat.countDocuments(filter);
    const chats = await Chat.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Enrich chats with last message preview and message count
    const enriched = await Promise.all(
      chats.map(async (chat) => {
        const messageCount = await Message.countDocuments({ chatId: chat._id });
        const lastMessage = await Message.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 })
          .select('mode content createdAt')
          .lean();

        return {
          id: chat._id.toString(),
          title: chat.title,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          messageCount,
          lastMode: lastMessage?.mode || 'direct',
          lastPreview: lastMessage?.content ? lastMessage.content.slice(0, 100) : '',
        };
      })
    );

    res.status(200).json({
      chats: enriched,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getChatById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(id);
    if (!chat) {
      throw new NotFoundError('Chat not found');
    }
    if (chat.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to view this chat');
    }

    const messages = await Message.find({ chatId: chat._id })
      .sort({ createdAt: 1 })
      .lean();

    const transformedMessages = messages.map((m) => ({
      ...m,
      id: m._id.toString(),
      _id: undefined,
      __v: undefined,
    }));

    res.status(200).json({
      chat: chat.toJSON(),
      messages: transformedMessages,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateChatTitle(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title } = req.body;

    const chat = await Chat.findById(id);
    if (!chat) {
      throw new NotFoundError('Chat not found');
    }
    if (chat.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to modify this chat');
    }

    chat.title = title.trim();
    await chat.save();

    res.status(200).json({ chat: chat.toJSON() });
  } catch (err) {
    next(err);
  }
}

export async function deleteChat(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(id);
    if (!chat) {
      throw new NotFoundError('Chat not found');
    }
    if (chat.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to delete this chat');
    }

    // Cascade delete associated messages
    await Message.deleteMany({ chatId: chat._id });
    await Chat.deleteOne({ _id: chat._id });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
