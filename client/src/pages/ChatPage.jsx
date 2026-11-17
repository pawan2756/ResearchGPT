import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell.jsx';
import { MessageList } from '../components/chat/MessageList.jsx';
import { ChatInput } from '../components/chat/ChatInput.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Plus, MessageSquare } from 'lucide-react';
import { apiAskQuestion, apiGetChat } from '../api/chats.js';
import { streamResearch } from '../api/sse.js';

export function ChatPage() {
  const { id: routeChatId } = useParams();
  const navigate = useNavigate();

  const [activeChatId, setActiveChatId] = useState(routeChatId || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const abortControllerRef = useRef(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Clean up any pending stream on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setActiveChatId(null);
    setMessages([]);
    setStatus('');
    setIsStreaming(false);
    navigate('/chat');
  };

  const handleSend = async (question) => {
    if (!question.trim() || loading || isStreaming) return;

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

  const handleCancelResearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStatus('');
    setMessages((prev) =>
      prev.map((m) =>
        m.isStreaming
          ? {
              ...m,
              isStreaming: false,
              content: m.content
                ? `${m.content}\n\n*(Research stopped by user)*`
                : '*(Research cancelled by user)*',
            }
          : m
      )
    );
    showToast('Research cancelled.', 'info');
  };

  const handleAcceptResearch = async (targetMessage) => {
    if (isStreaming || loading) return;

    // 1. Dismiss the research prompt on the direct-answer message
    setMessages((prev) =>
      prev.map((m) =>
        m.id === targetMessage.id
          ? { ...m, promptDismissed: true }
          : m
      )
    );

    // 2. Find the user question corresponding to this direct answer
    let question = '';
    const msgIdx = messages.findIndex((m) => m.id === targetMessage.id);
    if (msgIdx >= 0) {
      for (let i = msgIdx - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          question = messages[i].content;
          break;
        }
      }
    }

    if (!question) {
      showToast('Could not locate original question to research.', 'error');
      return;
    }

    if (!activeChatId) {
      showToast('Chat context not found.', 'error');
      return;
    }

    // 3. Setup provisional message and abort controller
    const provisionalId = `research-${Date.now()}`;
    const provisionalMsg = {
      id: provisionalId,
      role: 'assistant',
      mode: 'research',
      content: '',
      sources: [],
      excludedCount: 0,
      verification: null,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, provisionalMsg]);
    setIsStreaming(true);
    setStatus('Searching the web...');

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // 4. Initiate SSE Research Stream
    try {
      await streamResearch(
        {
          chatId: activeChatId,
          question,
          messageId: targetMessage.id,
        },
        {
          onStatus: (statusText) => {
            setStatus(statusText);
          },
          onSources: (data) => {
            const sourcesList = Array.isArray(data) ? data : (data?.sources || []);
            const excluded = data?.excludedCount || 0;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === provisionalId
                  ? { ...m, sources: sourcesList, excludedCount: excluded }
                  : m
              )
            );
          },
          onToken: (token) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === provisionalId
                  ? { ...m, content: (m.content || '') + token }
                  : m
              )
            );
          },
          onVerification: (verificationResult) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === provisionalId
                  ? { ...m, verification: verificationResult }
                  : m
              )
            );
          },
          onDone: (doneData) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === provisionalId
                  ? {
                      ...m,
                      id: doneData?.messageId || m.id,
                      isStreaming: false,
                      notFound: doneData?.notFound || false,
                    }
                  : m
              )
            );
            setStatus('');
            setIsStreaming(false);
            abortControllerRef.current = null;
          },
          onError: (errData) => {
            setStatus('');
            setIsStreaming(false);
            abortControllerRef.current = null;
            // Remove empty provisional message or annotate it
            setMessages((prev) =>
              prev.map((m) =>
                m.id === provisionalId
                  ? {
                      ...m,
                      isStreaming: false,
                      content: m.content
                        ? `${m.content}\n\n*(Research error occurred)*`
                        : 'Failed to complete research.',
                    }
                  : m
              )
            );
            showToast(errData.message || 'Research stream error.', 'error');
          },
        },
        abortController.signal
      );
    } catch {
      setStatus('');
      setIsStreaming(false);
      abortControllerRef.current = null;
      showToast('Research stream was interrupted.', 'error');
    }
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
            onCancel={handleCancelResearch}
          />
        </div>

        {/* Bottom Input Area */}
        <div className="pt-3 pb-2 sticky bottom-0 bg-[var(--bg)]">
          <ChatInput
            onSend={handleSend}
            disabled={loading || isStreaming}
            placeholder={
              isStreaming
                ? 'Research in progress...'
                : activeChatId
                  ? 'Ask a follow-up question...'
                  : 'Ask ResearchGPT a question...'
            }
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
