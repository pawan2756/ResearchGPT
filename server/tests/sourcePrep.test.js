import { describe, it, expect } from 'vitest';
import { prepareSources } from '../src/services/sourcePrep.js';

describe('sourcePrep Service', () => {
  it('deduplicates sources by normalized URL', () => {
    const raw = [
      { url: 'https://example.com/page1/', content: 'Content 1' },
      { url: 'https://example.com/page1', content: 'Duplicate content 1' },
      { url: 'https://example.com/page2', content: 'Content 2' },
    ];

    const prepared = prepareSources(raw, 'test query', 5);
    expect(prepared.length).toBe(2);
    expect(prepared[0].url).toBe('https://example.com/page1/');
    expect(prepared[1].url).toBe('https://example.com/page2');
  });

  it('numbers sources starting from 1', () => {
    const raw = [
      { url: 'https://a.com', content: 'Alpha content' },
      { url: 'https://b.com', content: 'Beta content' },
      { url: 'https://c.com', content: 'Gamma content' },
    ];

    const prepared = prepareSources(raw, 'Alpha Beta', 5);
    expect(prepared.map((s) => s.id)).toEqual([1, 2, 3]);
  });

  it('caps at maxSources', () => {
    const raw = [
      { url: 'https://1.com', content: 'Content 1' },
      { url: 'https://2.com', content: 'Content 2' },
      { url: 'https://3.com', content: 'Content 3' },
      { url: 'https://4.com', content: 'Content 4' },
      { url: 'https://5.com', content: 'Content 5' },
    ];

    const prepared = prepareSources(raw, 'Content', 3);
    expect(prepared.length).toBe(3);
    expect(prepared.map((s) => s.id)).toEqual([1, 2, 3]);
  });

  it('selects the chunk with highest keyword relevance', () => {
    const firstChunkText = Array(800).fill('general').join(' ');
    const targetChunkText = Array(400).fill('general').join(' ') + ' quantum teleportation qubits ' + Array(400).fill('general').join(' ');
    const fullText = firstChunkText + ' ' + targetChunkText;

    const raw = [
      {
        url: 'https://physics.org/article',
        content: fullText,
      },
    ];

    const prepared = prepareSources(raw, 'quantum teleportation qubits', 5);
    expect(prepared.length).toBe(1);
    expect(prepared[0].chunk).toContain('quantum teleportation qubits');
  });
});
