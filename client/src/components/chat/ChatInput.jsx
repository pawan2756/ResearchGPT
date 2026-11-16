import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function ChatInput({ onSend, disabled = false, placeholder = 'Ask a question...' }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea height up to 160px
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || trimmed.length > 1000) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const isOverLimit = text.length > 1000;

  return (
    <div
      className="rounded-[12px] p-2 sm:p-3 border focus-within:ring-2 transition-all shadow-sm"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: isOverLimit ? 'var(--danger-text)' : 'var(--border-strong)',
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={1100}
        aria-label="Ask ResearchGPT a question"
        className="w-full bg-transparent resize-none outline-none text-[15px] leading-relaxed max-h-[160px] p-1"
        style={{ color: 'var(--text)' }}
      />

      <div className="flex items-center justify-between pt-2 border-t mt-1 border-[var(--border)]">
        <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
          <span className={isOverLimit ? 'font-bold' : ''} style={{ color: isOverLimit ? 'var(--danger-text)' : undefined }}>
            {text.length}/1000
          </span>
          <span className="hidden sm:inline opacity-75">
            <kbd className="px-1 py-0.5 rounded bg-[var(--surface-2)] text-[11px]">Enter</kbd> to send,{' '}
            <kbd className="px-1 py-0.5 rounded bg-[var(--surface-2)] text-[11px]">Shift+Enter</kbd> for line
          </span>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !text.trim() || isOverLimit}
          variant="primary"
          size="sm"
          className="gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
