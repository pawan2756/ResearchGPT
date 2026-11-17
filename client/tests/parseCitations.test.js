import { describe, it, expect } from 'vitest';
import { extractCitationIds, countCitations, parseCitations } from '../src/utils/parseCitations.js';

describe('parseCitations Utility', () => {
  it('extractCitationIds extracts sorted unique source numbers', () => {
    const text = 'First claim [1], second claim [2], combined claim [1, 3], repeated [2].';
    const ids = extractCitationIds(text);
    expect(ids).toEqual([1, 2, 3]);
  });

  it('extractCitationIds returns empty array on empty text or text without citations', () => {
    expect(extractCitationIds('')).toEqual([]);
    expect(extractCitationIds('No citations here.')).toEqual([]);
  });

  it('countCitations accurately tallies occurrences of each source', () => {
    const text = 'Claim [1] and another [2], then both [1, 2] and [1].';
    const counts = countCitations(text);
    expect(counts).toEqual({
      1: 3,
      2: 2,
    });
  });

  it('parseCitations splits text into text and citation objects', () => {
    const text = 'Alpha [1] Beta [2, 3] Gamma';
    const segments = parseCitations(text);

    expect(segments).toEqual([
      { type: 'text', value: 'Alpha ' },
      { type: 'citation', sourceIds: [1], raw: '[1]' },
      { type: 'text', value: ' Beta ' },
      { type: 'citation', sourceIds: [2, 3], raw: '[2, 3]' },
      { type: 'text', value: ' Gamma' },
    ]);
  });
});
