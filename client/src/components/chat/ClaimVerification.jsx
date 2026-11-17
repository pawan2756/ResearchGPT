import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Quote } from 'lucide-react';

export function ClaimVerification({ verification, onSourceClick }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!verification || !verification.claims || verification.claims.length === 0) {
    return null;
  }

  const { total = 0, supported = 0, claims = [] } = verification;
  const allSupported = total > 0 && supported === total;

  return (
    <div
      className="mt-3 rounded-[10px] border transition-all overflow-hidden"
      style={{
        backgroundColor: 'var(--surface-2)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left cursor-pointer transition-colors hover:opacity-90"
        style={{ color: 'var(--text)' }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {allSupported ? (
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success-text)' }} />
          ) : (
            <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning-text)' }} />
          )}
          <span className="text-[13px] font-semibold">Claim Verification</span>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
            style={{
              backgroundColor: allSupported ? 'var(--success-bg)' : 'var(--warning-bg)',
              color: allSupported ? 'var(--success-text)' : 'var(--warning-text)',
            }}
          >
            {supported}/{total} verified
          </span>
        </div>

        <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <span className="text-[11px]">{isOpen ? 'Hide breakdown' : 'View breakdown'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Breakdown Details */}
      {isOpen && (
        <div className="p-3 pt-0 space-y-2 border-t border-[var(--border)]">
          <div className="space-y-2 pt-2">
            {claims.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-[8px] border text-[13px]"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-start gap-2">
                  {item.supported ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--success-text)' }} />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--danger-text)' }} />
                  )}
                  <div className="flex-1">
                    <p style={{ color: 'var(--text)' }}>{item.claim}</p>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          backgroundColor: item.supported ? 'var(--success-bg)' : 'var(--danger-bg)',
                          color: item.supported ? 'var(--success-text)' : 'var(--danger-text)',
                        }}
                      >
                        {item.supported ? 'Supported' : 'Not directly supported'}
                      </span>

                      {item.sourceId && (
                        <button
                          type="button"
                          onClick={() => onSourceClick && onSourceClick(item.sourceId)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium hover:underline cursor-pointer"
                          style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
                        >
                          Source [{item.sourceId}]
                        </button>
                      )}
                    </div>

                    {item.evidence && (
                      <div
                        className="mt-2 p-2 rounded text-[11px] flex items-start gap-1.5 border"
                        style={{
                          backgroundColor: 'var(--passage-bg)',
                          borderColor: 'var(--passage-border)',
                          color: 'var(--text)',
                        }}
                      >
                        <Quote className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-70" style={{ color: 'var(--primary)' }} />
                        <span className="italic leading-normal">&ldquo;{item.evidence}&rdquo;</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
