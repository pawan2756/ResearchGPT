import React from 'react';
import { Search, AlertCircle, X, Check } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Tag } from '../ui/Tag.jsx';

export function ResearchPrompt({
  score = 0,
  signals = {},
  onAccept,
  onDecline,
  disabled = false,
}) {
  const signalLabels = [];
  if (signals.timeSensitiveQuestion) signalLabels.push('Recent or time-sensitive topic');
  if (signals.lowConfidence) signalLabels.push('Low model confidence');
  if (signals.hedgingAnswer) signalLabels.push('Hedging / uncertainty detected');
  if (signals.needsResearchFlag) signalLabels.push('Marked as volatile by model');

  return (
    <div
      role="region"
      aria-label="Online research consent"
      className="mt-3 p-4 rounded-[12px] border transition-all animate-in fade-in slide-in-from-top-2"
      style={{
        backgroundColor: 'var(--consent-bg)',
        borderColor: 'var(--consent-border)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}
        >
          <Search className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <h4 className="text-[15px] font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <span>Research from online sources?</span>
              <Tag variant="warning" size="xs">
                Score: {score}
              </Tag>
            </h4>
          </div>

          <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
            This answer may be out of date or lacks verified real-time sources. We can search trusted web sources, show references first, and verify each claim.
          </p>

          {signalLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {signalLabels.map((lbl, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    color: 'var(--text)',
                  }}
                >
                  <AlertCircle className="w-3 h-3 opacity-60" />
                  {lbl}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="button"
              onClick={onAccept}
              disabled={disabled}
              variant="primary"
              size="sm"
              className="gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Yes, research online</span>
            </Button>

            <Button
              type="button"
              onClick={onDecline}
              disabled={disabled}
              variant="secondary"
              size="sm"
              className="gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>No, keep direct answer</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
