import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Tag } from '../ui/Tag.jsx';
import { ConfidenceTag } from './ConfidenceTag.jsx';
import { ResearchPrompt } from './ResearchPrompt.jsx';
import { Sparkles, Clock, AlertTriangle } from 'lucide-react';

export function MessageBubble({ message, onAcceptResearch, onDeclineResearch }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end w-full my-3">
        <div
          className="max-w-[80%] rounded-[12px] rounded-br-[2px] px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words"
          style={{
            backgroundColor: 'var(--user-bubble-bg)',
            color: 'var(--user-bubble-text)',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant Message Card
  const isResearchMode = message.mode === 'research';

  return (
    <div
      className="w-full my-4 rounded-[12px] p-4 sm:p-5 border transition-all shadow-xs"
      style={{
        backgroundColor: 'var(--assistant-bg)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
      }}
    >
      {/* Assistant Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[var(--border)] text-[12px]">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-[13px]" style={{ color: 'var(--text)' }}>
            ResearchGPT
          </span>
          <Tag variant={isResearchMode ? 'info' : 'default'} size="xs">
            {isResearchMode ? 'Research Mode' : 'Direct Answer'}
          </Tag>
          {!isResearchMode && <ConfidenceTag confidence={message.confidence} />}
        </div>

        {message.latencyMs && (
          <div className="flex items-center gap-1 text-[11px] opacity-70" style={{ color: 'var(--text-muted)' }}>
            <Clock className="w-3 h-3" />
            <span>{(message.latencyMs / 1000).toFixed(1)}s</span>
          </div>
        )}
      </div>

      {/* Answer Content */}
      <div
        className="prose prose-sm max-w-none text-[15px] leading-[1.7] break-words"
        style={{ color: 'var(--text)' }}
      >
        <ReactMarkdown>{message.content || ''}</ReactMarkdown>
      </div>

      {/* Research Consent Prompt Banner */}
      {!isResearchMode && message.shouldPrompt && !message.promptDismissed && (
        <ResearchPrompt
          score={message.researchScore}
          signals={message.signals || {}}
          onAccept={() => onAcceptResearch && onAcceptResearch(message)}
          onDecline={() => onDeclineResearch && onDeclineResearch(message.id)}
        />
      )}

      {/* Label for Direct Answer when user declined or research not run */}
      {message.mode === 'direct' && message.notVerified && (
        <div
          className="mt-3 pt-2 text-[12px] flex items-center gap-1.5 border-t border-[var(--border)]"
          style={{ color: 'var(--text-muted)' }}
        >
          <AlertTriangle className="w-3.5 h-3.5 opacity-75" />
          <em>Not verified with sources</em>
        </div>
      )}
    </div>
  );
}

