import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SourcesPanel } from '../src/components/chat/SourcesPanel.jsx';

describe('SourcesPanel Component', () => {
  const mockSources = [
    {
      id: 1,
      title: 'Quantum Computing Fundamentals',
      url: 'https://example.com/quantum',
      domain: 'example.com',
      score: 88,
      band: 'high',
      snippet: 'Qubits exploit quantum superposition and entanglement.',
    },
    {
      id: 2,
      title: 'Medium Credibility Blog',
      url: 'https://techblog.org/post',
      domain: 'techblog.org',
      score: 55,
      band: 'medium',
      snippet: 'Quantum chips are being developed by major labs.',
    },
  ];

  it('renders nothing when sources array is empty', () => {
    const { container } = render(<SourcesPanel sources={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders sources panel with titles, domains, and score badges', () => {
    render(<SourcesPanel sources={mockSources} excludedCount={1} />);

    expect(screen.getByText('Sources')).toBeTruthy();
    expect(screen.getByText('(1 low-credibility filtered)')).toBeTruthy();
    expect(screen.getByText('Quantum Computing Fundamentals')).toBeTruthy();
    expect(screen.getByText('High (88)')).toBeTruthy();
    expect(screen.getByText('Medium Credibility Blog')).toBeTruthy();
    expect(screen.getByText('Medium (55)')).toBeTruthy();
  });

  it('toggles expand and collapse when header is clicked', () => {
    render(<SourcesPanel sources={mockSources} />);

    const toggleBtn = screen.getByRole('button', { name: /sources/i });
    expect(screen.getByText('Collapse')).toBeTruthy();

    // Click to collapse
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Expand')).toBeTruthy();
    expect(screen.queryByText('Quantum Computing Fundamentals')).toBeNull();

    // Click to expand again
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Collapse')).toBeTruthy();
    expect(screen.getByText('Quantum Computing Fundamentals')).toBeTruthy();
  });

  it('clicking a source triggers onSelectSource', () => {
    const handleSelect = vi.fn();
    render(<SourcesPanel sources={mockSources} onSelectSource={handleSelect} />);

    const sourceCard = screen.getByText('Quantum Computing Fundamentals').closest('div');
    fireEvent.click(sourceCard);

    expect(handleSelect).toHaveBeenCalledWith(1);
  });
});
