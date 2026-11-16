import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from '../ui/Tag.jsx';
import { Button } from '../ui/Button.jsx';
import { ExternalLink, Edit2, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '../../utils/format.js';

export function ChatTable({
  chats = [],
  onRename,
  onDelete,
  loading = false,
}) {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const startRename = (chat) => {
    setEditingId(chat.id);
    setEditingTitle(chat.title);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const saveRename = async (chatId) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) return;
    await onRename(chatId, trimmed);
    setEditingId(null);
  };

  const confirmDelete = async (chatId) => {
    await onDelete(chatId);
    setDeletingId(null);
  };

  if (chats.length === 0 && !loading) {
    return null;
  }

  return (
    <div
      className="w-full rounded-[12px] border overflow-hidden shadow-xs"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px] border-collapse">
          <thead>
            <tr
              className="border-b text-[12px] uppercase tracking-wider font-semibold"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <th className="py-3 px-4">Title & Preview</th>
              <th className="py-3 px-4 w-[110px]">Mode</th>
              <th className="py-3 px-4 w-[140px]">Last Active</th>
              <th className="py-3 px-4 w-[80px] text-center">Msgs</th>
              <th className="py-3 px-4 w-[170px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {chats.map((chat) => {
              const isEditing = editingId === chat.id;
              const isDeleting = deletingId === chat.id;

              return (
                <tr
                  key={chat.id}
                  className="hover:bg-[var(--surface-2)]/50 transition-colors"
                >
                  {/* Title & Preview */}
                  <td className="py-3.5 px-4 align-top">
                    {isEditing ? (
                      <div className="flex items-center gap-2 max-w-md">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(chat.id);
                            if (e.key === 'Escape') cancelRename();
                          }}
                          autoFocus
                          className="px-2 py-1 text-[14px] rounded border focus-ring w-full"
                          style={{
                            backgroundColor: 'var(--surface)',
                            color: 'var(--text)',
                            borderColor: 'var(--border-strong)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => saveRename(chat.id)}
                          className="p-1 rounded text-green-600 hover:bg-green-100 dark:hover:bg-green-950/40"
                          title="Save title"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelRename}
                          className="p-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={() => navigate(`/chat/${chat.id}`)}
                          className="font-semibold text-left hover:underline text-[15px] block line-clamp-1 cursor-pointer"
                          style={{ color: 'var(--text)' }}
                        >
                          {chat.title}
                        </button>
                        {chat.lastPreview && (
                          <p
                            className="text-[12px] line-clamp-1 mt-0.5"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {chat.lastPreview}
                          </p>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Mode */}
                  <td className="py-3.5 px-4 align-top">
                    <Tag
                      variant={chat.lastMode === 'research' ? 'info' : 'default'}
                      size="xs"
                    >
                      {chat.lastMode === 'research' ? 'Research' : 'Direct'}
                    </Tag>
                  </td>

                  {/* Date */}
                  <td
                    className="py-3.5 px-4 align-top text-[12px] whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {formatDateTime(chat.updatedAt || chat.createdAt)}
                  </td>

                  {/* Message count */}
                  <td
                    className="py-3.5 px-4 align-top text-center text-[13px] font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {chat.messageCount}
                  </td>

                  {/* Action buttons */}
                  <td className="py-3.5 px-4 align-top text-right">
                    {isDeleting ? (
                      <div className="flex items-center justify-end gap-1.5 animate-in fade-in">
                        <span className="text-[11px] font-semibold flex items-center gap-1 text-[var(--danger-text)]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Delete?
                        </span>
                        <Button
                          onClick={() => confirmDelete(chat.id)}
                          variant="danger"
                          size="sm"
                          className="py-1 px-2 text-[11px]"
                        >
                          Yes
                        </Button>
                        <Button
                          onClick={() => setDeletingId(null)}
                          variant="secondary"
                          size="sm"
                          className="py-1 px-2 text-[11px]"
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/chat/${chat.id}`)}
                          className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--primary)] transition-colors"
                          title="Open chat"
                          aria-label="Open chat"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startRename(chat)}
                          className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          title="Rename title"
                          aria-label="Rename title"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(chat.id)}
                          className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--danger-text)] transition-colors"
                          title="Delete conversation"
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
