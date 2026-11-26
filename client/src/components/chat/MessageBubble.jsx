import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Tag } from '../ui/Tag.jsx';
import { ConfidenceTag } from './ConfidenceTag.jsx';
import { ResearchPrompt } from './ResearchPrompt.jsx';
import { SourcesPanel } from './SourcesPanel.jsx';
import { ClaimVerification } from './ClaimVerification.jsx';
import { Sparkles, Clock, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { CITATION_REGEX } from '../../utils/parseCitations.js';
import { apiSubmitFeedback } from '../../api/feedback.js';

/**
 * Transforms citations like [1] or [1, 2] into markdown links: [cite:1](#cite-1)
 */
function linkifyCitations(text = '') {
  if (!text) return '';
  return text.replace(CITATION_REGEX, (_match, group) => {
    const cleanGroup = group.replace(/\s+/g, '');
    return `[cite:${cleanGroup}](#cite-${cleanGroup})`;
  });
}

export function MessageBubble({ message, onAcceptResearch, onDeclineResearch }) {
  const [activeSourceId, setActiveSourceId] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(null);
  const isUser = message.role === 'user';

  const handleFeedback = async (rating) => {
    if (!message.id || message.isStreaming) return;
    setFeedbackRating(rating);
    try {
      await apiSubmitFeedback({ messageId: message.id, rating });
    } catch {
      // Revert if API fails
      setFeedbackRating(null);
    }
  };

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
  const hasSources = isResearchMode && message.sources && message.sources.length > 0;

  const handleSelectSource = (sourceId) => {
    setActiveSourceId(sourceId);
    if (typeof document !== 'undefined') {
      const el = document.getElementById(`source-card-${sourceId}`);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const processedContent = isResearchMode ? linkifyCitations(message.content) : message.content;

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

      {/* Sources Displayed BEFORE Text Tokens in Research Mode */}
      {hasSources && (
        <SourcesPanel
          sources={message.sources}
          excludedCount={message.excludedCount || 0}
          activeSourceId={activeSourceId}
          onSelectSource={handleSelectSource}
          isStreaming={message.isStreaming}
        />
      )}

      {/* Answer Content */}
      <div
        className="prose prose-sm max-w-none text-[15px] leading-[1.7] break-words"
        style={{ color: 'var(--text)' }}
      >
        <ReactMarkdown
          components={{
            a: ({ href, children, ...props }) => {
              if (href && href.startsWith('#cite-')) {
                const rawIds = href.replace('#cite-', '');
                const ids = rawIds
                  .split(',')
                  .map((s) => parseInt(s.trim(), 10))
                  .filter((n) => !isNaN(n));

                return (
                  <span className="inline-flex items-center gap-1 mx-1 align-baseline select-none">
                    {ids.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelectSource(id);
                        }}
                        className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor:
                            activeSourceId === id ? 'var(--primary)' : 'var(--primary-soft)',
                          color:
                            activeSourceId === id
                              ? 'var(--text-on-primary)'
                              : 'var(--primary)',
                          border: '1px solid var(--border)',
                        }}
                        title={`View Source [${id}]`}
                      >
                        [{id}]
                      </button>
                    ))}
                  </span>
                );
              }
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-80"
                  style={{ color: 'var(--primary)' }}
                  {...props}
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {processedContent || ''}
        </ReactMarkdown>

        {/* Real-time typing cursor during live stream */}
        {message.isStreaming && (
          <span
            className="inline-block w-1.5 h-4 ml-1 align-middle animate-pulse"
            style={{ backgroundColor: 'var(--primary)' }}
          />
        )}
      </div>

      {/* Claim Verification Pass */}
      {isResearchMode && message.verification && (
        <ClaimVerification
          verification={message.verification}
          onSourceClick={handleSelectSource}
        />
      )}

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

      {/* Assistant Message Actions & Feedback */}
      {!message.isStreaming && message.id && (
        <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-[var(--border)] text-[12px]">
          <span style={{ color: 'var(--text-muted)' }} className="text-[11px]">
            Was this response helpful?
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleFeedback('positive')}
              className={`p-1.5 rounded-md hover:bg-[var(--surface-2)] transition-colors flex items-center gap-1 text-[11px] ${
                feedbackRating === 'positive'
                  ? 'text-[var(--success-text)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              title="Helpful response"
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 ${feedbackRating === 'positive' ? 'fill-current' : ''}`}
              />
              <span>Helpful</span>
            </button>

            <button
              type="button"
              onClick={() => handleFeedback('negative')}
              className={`p-1.5 rounded-md hover:bg-[var(--surface-2)] transition-colors flex items-center gap-1 text-[11px] ${
                feedbackRating === 'negative'
                  ? 'text-[var(--danger-text)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              title="Inaccurate or unhelpful"
            >
              <ThumbsDown
                className={`w-3.5 h-3.5 ${feedbackRating === 'negative' ? 'fill-current' : ''}`}
              />
              <span>Inaccurate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
