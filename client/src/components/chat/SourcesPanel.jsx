import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

export function SourcesPanel({ sources = [], excludedCount = 0, activeSourceId = null, onSelectSource }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!sources || sources.length === 0) {
    return null;
  }

  const getBandBadge = (band, score) => {
    if (band === 'high' || score >= 70) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium"
          style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}
          title={`Credibility Score: ${score}/100 (High)`}
        >
          <ShieldCheck className="w-3 h-3" />
          High ({score})
        </span>
      );
    }
    if (band === 'medium' || score >= 40) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium"
          style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}
          title={`Credibility Score: ${score}/100 (Medium)`}
        >
          <Shield className="w-3 h-3" />
          Medium ({score})
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium"
        style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)' }}
        title={`Credibility Score: ${score}/100 (Low)`}
      >
        <ShieldAlert className="w-3 h-3" />
        Low ({score})
      </span>
    );
  };

  return (
    <div
      className="my-3 rounded-[10px] border transition-all overflow-hidden"
      style={{
        backgroundColor: 'var(--surface-2)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Panel Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left cursor-pointer transition-colors hover:opacity-90"
        style={{ color: 'var(--text)' }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold">Sources</span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
          >
            {sources.length}
          </span>
          {excludedCount > 0 && (
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              ({excludedCount} low-credibility filtered)
            </span>
          )}
        </div>
        <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <span className="text-[11px]">{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Sources Grid / List */}
      {isOpen && (
        <div className="p-3 pt-0 space-y-2 border-t border-[var(--border)]">
          <div className="grid grid-cols-1 gap-2 pt-2">
            {sources.map((source) => {
              const isHighlighted = activeSourceId === source.id;
              return (
                <div
                  key={source.id}
                  id={`source-card-${source.id}`}
                  onClick={() => onSelectSource && onSelectSource(source.id)}
                  className={`p-3 rounded-[8px] border transition-all text-left ${
                    isHighlighted ? 'ring-2 ring-[var(--primary)]' : ''
                  }`}
                  style={{
                    backgroundColor: isHighlighted ? 'var(--passage-bg)' : 'var(--surface)',
                    borderColor: isHighlighted ? 'var(--primary)' : 'var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold"
                        style={{ backgroundColor: 'var(--primary)', color: 'var(--text-on-primary)' }}
                      >
                        {source.id}
                      </span>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] font-medium hover:underline flex items-center gap-1 break-all"
                        style={{ color: 'var(--primary)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{source.title || source.domain || 'Source'}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-75" />
                      </a>
                    </div>

                    <div className="flex-shrink-0">
                      {getBandBadge(source.band, source.score ?? source.credibilityScore ?? 75)}
                    </div>
                  </div>

                  {source.snippet && (
                    <p
                      className="text-[12px] leading-relaxed line-clamp-3 mt-1.5 p-2 rounded border"
                      style={{
                        backgroundColor: 'var(--passage-bg)',
                        borderColor: 'var(--passage-border)',
                        color: 'var(--text)',
                      }}
                    >
                      {source.snippet}
                    </p>
                  )}

                  <div className="mt-1.5 flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{source.domain}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
