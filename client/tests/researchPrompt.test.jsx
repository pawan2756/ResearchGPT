import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResearchPrompt } from '../src/components/chat/ResearchPrompt.jsx';

describe('ResearchPrompt Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders research prompt with score and signal badges', () => {
    render(
      <ResearchPrompt
        score={4}
        signals={{ timeSensitiveQuestion: true, lowConfidence: true }}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />
    );

    expect(screen.getByText('Research from online sources?')).toBeTruthy();
    expect(screen.getByText('Score: 4')).toBeTruthy();
    expect(screen.getByText('Recent or time-sensitive topic')).toBeTruthy();
    expect(screen.getByText('Low model confidence')).toBeTruthy();
  });

  it('clicking "Yes, research online" triggers onAccept', () => {
    const handleAccept = vi.fn();
    const handleDecline = vi.fn();

    render(
      <ResearchPrompt
        score={3}
        signals={{ timeSensitiveQuestion: true }}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    );

    const yesBtn = screen.getByRole('button', { name: /yes, research online/i });
    fireEvent.click(yesBtn);

    expect(handleAccept).toHaveBeenCalledTimes(1);
    expect(handleDecline).not.toHaveBeenCalled();
  });

  it('clicking "No, keep direct answer" triggers onDecline and sends NO network request', () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const handleAccept = vi.fn();
    const handleDecline = vi.fn();

    render(
      <ResearchPrompt
        score={3}
        signals={{ lowConfidence: true }}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    );

    const noBtn = screen.getByRole('button', { name: /no, keep direct answer/i });
    fireEvent.click(noBtn);

    expect(handleDecline).toHaveBeenCalledTimes(1);
    expect(handleAccept).not.toHaveBeenCalled();
    // Confirms NO web/network request is made when declined
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
