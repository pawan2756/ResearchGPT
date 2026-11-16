import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell.jsx';
import { ChatTable } from '../components/history/ChatTable.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { apiGetChats, apiUpdateChatTitle, apiDeleteChat } from '../api/chats.js';
import { Search, Plus, MessageSquare, ChevronLeft, ChevronRight, X } from 'lucide-react';

export function HistoryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [chats, setChats] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const fetchChats = useCallback(async (page = 1, query = '') => {
    setLoading(true);
    try {
      const data = await apiGetChats({ page, limit: 10, q: query });
      if (data) {
        setChats(data.chats || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
      }
    } catch {
      showToast('Failed to load chat history.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats(1, debouncedSearch);
  }, [debouncedSearch, fetchChats]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchChats(newPage, debouncedSearch);
  };

  const handleRename = async (chatId, newTitle) => {
    try {
      await apiUpdateChatTitle(chatId, newTitle);
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c))
      );
      showToast('Chat title updated.', 'success');
    } catch {
      showToast('Failed to rename chat.', 'error');
    }
  };

  const handleDelete = async (chatId) => {
    try {
      await apiDeleteChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      setPagination((prev) => ({ ...prev, total: Math.max(prev.total - 1, 0) }));
      showToast('Conversation deleted.', 'info');
    } catch {
      showToast('Failed to delete chat.', 'error');
    }
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col max-w-[1000px] w-full mx-auto">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Chat History
            </h2>
            <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
              Search and manage your research conversations.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate('/chat')}
            variant="primary"
            size="md"
            className="gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </Button>
        </div>

        {/* Search Input Filter */}
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations by title..."
            className="w-full pl-10 pr-10 py-2.5 text-[14px] rounded-[8px] border focus-ring transition-colors"
            style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              borderColor: 'var(--border-strong)',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text)]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* History Table or Loading/Empty States */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton height="48px" />
            <Skeleton height="60px" />
            <Skeleton height="60px" />
            <Skeleton height="60px" />
          </div>
        ) : chats.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={searchTerm ? 'No matching conversations' : 'No chats yet'}
            description={
              searchTerm
                ? `No conversations found matching "${searchTerm}". Try another keyword.`
                : 'Start asking questions to build your research history.'
            }
            actionText={searchTerm ? 'Clear Search' : 'Start a Chat'}
            onAction={searchTerm ? () => setSearchTerm('') : () => navigate('/chat')}
          />
        ) : (
          <div className="space-y-4">
            <ChatTable
              chats={chats}
              onRename={handleRename}
              onDelete={handleDelete}
              loading={loading}
            />

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-2 px-1 text-[13px]">
                <span style={{ color: 'var(--text-muted)' }}>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} conversations
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    variant="secondary"
                    size="sm"
                    className="p-1.5"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="font-semibold px-2" style={{ color: 'var(--text)' }}>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    variant="secondary"
                    size="sm"
                    className="p-1.5"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback Toast */}
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
