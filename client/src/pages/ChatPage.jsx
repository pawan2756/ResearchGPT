import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell.jsx';
import { MessageList } from '../components/chat/MessageList.jsx';
import { ChatInput } from '../components/chat/ChatInput.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Plus, MessageSquare } from 'lucide-react';
import { apiAskQuestion, apiGetChat } from '../api/chats.js';

export function ChatPage() {
  const { id: routeChatId } = useParams();
  const navigate = useNavigate();

  const [activeChatId, setActiveChatId] = useState(routeChatId || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Load existing chat messages when URL has chatId
  const loadChat = useCallback(async (chatId) => {
    setLoading(true);
    try {
      const data = await apiGetChat(chatId);
      if (data?.chat) {
        setActiveChatId(data.chat.id);
        setMessages(data.messages || []);
      }
    } catch {
      showToast('Failed to load conversation history.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (routeChatId && routeChatId !== activeChatId) {
      loadChat(routeChatId);
    } else if (!routeChatId) {
      setActiveChatId(null);
      setMessages([]);
    }
  }, [routeChatId, activeChatId, loadChat]);

  const handleStartNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setStatus('');
    navigate('/chat');
  };

  const handleSend = async (question) => {
    if (!question.trim() || loading) return;

    // Immediately show user question in message list
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: question,
      mode: 'direct',
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);
    setStatus('Thinking...');

    try {
      const res = await apiAskQuestion({
        chatId: activeChatId,
        question,
      });

      setStatus('');

      if (!activeChatId && res?.chatId) {
        setActiveChatId(res.chatId);
        navigate(`/chat/${res.chatId}`, { replace: true });
      }

      if (res?.message) {
        // Attach research prompt signal info to message
        const assistantMsg = {
          ...res.message,
          researchScore: res.researchScore,
          signals: res.signals,
          shouldPrompt: res.shouldPrompt,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      setStatus('');
      showToast(err.message || 'Failed to generate answer. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineResearch = (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, promptDismissed: true, notVerified: true }
          : m
      )
    );
    showToast('Direct answer retained (not verified with sources).', 'info');
  };

  const handleAcceptResearch = (_message) => {
    // Handled in M6 Research Pipeline
    showToast('Starting online research...', 'info');
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col h-full max-w-[760px] w-full mx-auto">
        {/* Chat Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h2 className="text-[17px] font-semibold" style={{ color: 'var(--text)' }}>
              {activeChatId ? 'Research Conversation' : 'New Chat'}
            </h2>
          </div>

          <Button
            type="button"
            onClick={handleStartNewChat}
            variant="secondary"
            size="sm"
            className="gap-1.5"
            title="Start a new chat"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <MessageList
            messages={messages}
            status={status}
            loading={loading}
            onExampleClick={handleSend}
            onAcceptResearch={handleAcceptResearch}
            onDeclineResearch={handleDeclineResearch}
          />
        </div>

        {/* Bottom Input Area */}
        <div className="pt-3 pb-2 sticky bottom-0 bg-[var(--bg)]">
          <ChatInput
            onSend={handleSend}
            disabled={loading}
            placeholder={activeChatId ? 'Ask a follow-up question...' : 'Ask ResearchGPT a question...'}
          />
        </div>

        {/* Global Feedback Toast */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage('')}
          />
        )}
      </div>
    </AppShell>
  );
}
