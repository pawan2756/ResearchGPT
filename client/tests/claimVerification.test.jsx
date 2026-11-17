import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClaimVerification } from '../src/components/chat/ClaimVerification.jsx';

describe('ClaimVerification Component', () => {
  const mockVerification = {
    total: 2,
    supported: 2,
    claims: [
      {
        claim: 'Superposition enables parallel state evaluation.',
        supported: true,
        sourceId: 1,
        evidence: 'Qubits exist in linear combinations of states.',
      },
      {
        claim: 'Entanglement correlates multiple qubits.',
        supported: true,
        sourceId: 2,
        evidence: 'Entangled states cannot be factored independently.',
      },
    ],
  };

  it('renders nothing if verification is null or has empty claims', () => {
    const { container } = render(<ClaimVerification verification={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders verification summary tag and verified count', () => {
    render(<ClaimVerification verification={mockVerification} />);

    expect(screen.getByText('Claim Verification')).toBeTruthy();
    expect(screen.getByText('2/2 verified')).toBeTruthy();
    expect(screen.getByText('View breakdown')).toBeTruthy();
  });

  it('expands breakdown and triggers onSourceClick when source button is clicked', () => {
    const handleSourceClick = vi.fn();
    render(
      <ClaimVerification
        verification={mockVerification}
        onSourceClick={handleSourceClick}
      />
    );

    // Expand
    const headerBtn = screen.getByRole('button', { name: /claim verification/i });
    fireEvent.click(headerBtn);

    expect(screen.getByText('Superposition enables parallel state evaluation.')).toBeTruthy();
    expect(screen.getByText('“Qubits exist in linear combinations of states.”')).toBeTruthy();

    const sourceBtn = screen.getByRole('button', { name: /source \[1\]/i });
    fireEvent.click(sourceBtn);

    expect(handleSourceClick).toHaveBeenCalledWith(1);
  });
});
