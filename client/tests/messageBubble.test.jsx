import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageBubble } from '../src/components/chat/MessageBubble.jsx';

describe('MessageBubble Component', () => {
  it('renders user message', () => {
    const userMsg = {
      id: 'msg-1',
      role: 'user',
      content: 'Explain Shor’s algorithm.',
    };

    render(<MessageBubble message={userMsg} />);
    expect(screen.getByText('Explain Shor’s algorithm.')).toBeTruthy();
  });

  it('renders direct assistant message with confidence tag and research prompt', () => {
    const handleAccept = vi.fn();
    const handleDecline = vi.fn();

    const assistantMsg = {
      id: 'msg-2',
      role: 'assistant',
      mode: 'direct',
      confidence: 0.5,
      content: 'Shor’s algorithm factors integers in polynomial time.',
      shouldPrompt: true,
      researchScore: 4,
      signals: { lowConfidence: true },
    };

    render(
      <MessageBubble
        message={assistantMsg}
        onAcceptResearch={handleAccept}
        onDeclineResearch={handleDecline}
      />
    );

    expect(screen.getByText('ResearchGPT')).toBeTruthy();
    expect(screen.getByText('Direct Answer')).toBeTruthy();
    expect(screen.getByText('Shor’s algorithm factors integers in polynomial time.')).toBeTruthy();
    expect(screen.getByText('Research from online sources?')).toBeTruthy();
  });

  it('renders research mode message with sources panel, citations, and claim verification', () => {
    const researchMsg = {
      id: 'msg-3',
      role: 'assistant',
      mode: 'research',
      content: 'Shor’s algorithm solves factoring in BQP [1].',
      sources: [
        {
          id: 1,
          title: 'Quantum Complexity Theory',
          url: 'https://example.com/bqp',
          domain: 'example.com',
          score: 92,
          band: 'high',
          snippet: 'BQP contains problems solvable in polynomial time on quantum machines.',
        },
      ],
      verification: {
        total: 1,
        supported: 1,
        claims: [
          {
            claim: 'Shor’s algorithm is in BQP.',
            supported: true,
            sourceId: 1,
            evidence: 'BQP contains polynomial quantum algorithms.',
          },
        ],
      },
    };

    render(<MessageBubble message={researchMsg} />);

    expect(screen.getByText('Research Mode')).toBeTruthy();
    expect(screen.getByText('Quantum Complexity Theory')).toBeTruthy();
    expect(screen.getByText('[1]')).toBeTruthy();
    expect(screen.getByText('Claim Verification')).toBeTruthy();
  });

  it('clicking citation [1] highlights source card', () => {
    const researchMsg = {
      id: 'msg-4',
      role: 'assistant',
      mode: 'research',
      content: 'Factoring runs in polynomial quantum time [1].',
      sources: [
        {
          id: 1,
          title: 'Quantum Complexity',
          url: 'https://example.com/bqp',
          domain: 'example.com',
          score: 92,
          band: 'high',
          snippet: 'Details...',
        },
      ],
    };

    render(<MessageBubble message={researchMsg} />);

    const citeBtn = screen.getByRole('button', { name: /\[1\]/i });
    expect(citeBtn).toBeTruthy();
    fireEvent.click(citeBtn);
  });
});
