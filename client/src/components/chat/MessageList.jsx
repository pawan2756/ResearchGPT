import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble.jsx';
import { StatusLine } from './StatusLine.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';
import { Sparkles, Compass } from 'lucide-react';

export function MessageList({ messages = [], status = '', loading = false, onExampleClick }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status, loading]);

  const exampleQuestions = [
    'Explain the differences between DFS and BFS with complexity.',
    'What is the latest release date and price of NVIDIA RTX 5090?',
    'Who is the current CEO of Microsoft in 2026?',
    'How does public-key cryptography work mathematically?',
  ];

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto my-auto select-none">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
          style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
        >
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-[22px] font-bold mb-2 tracking-tight" style={{ color: 'var(--text)' }}>
          ResearchGPT
        </h2>
        <p className="text-[15px] leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
          Answers you can trace to a source. Ask a question to get a fast direct answer. If research is recommended, you decide whether to explore online sources.
        </p>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {exampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onExampleClick && onExampleClick(q)}
              className="p-3 rounded-[8px] text-[13px] border hover:border-[var(--primary)] transition-all cursor-pointer flex items-start gap-2"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              <Compass className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-4">
      {messages.map((msg, index) => (
        <MessageBubble key={msg.id || index} message={msg} />
      ))}

      {status && (
        <div className="py-2">
          <StatusLine status={status} />
        </div>
      )}

      {loading && !status && (
        <div className="w-full my-4 rounded-[12px] p-5 border space-y-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Skeleton width="24px" height="24px" rounded="rounded-full" />
            <Skeleton width="120px" height="16px" />
          </div>
          <Skeleton height="18px" width="90%" />
          <Skeleton height="18px" width="75%" />
          <Skeleton height="18px" width="40%" />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
