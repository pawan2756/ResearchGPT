/**
 * Regex matching individual and clustered citations like [1] or [1][2] or [1, 2]
 */
export const CITATION_REGEX = /\[(\d+(?:\s*,\s*\d+)*)\]/g;

/**
 * Extracts unique cited source IDs from text.
 * @param {string} text Text containing citations
 * @returns {number[]} Array of unique numbers, e.g. [1, 2]
 */
export function extractCitationIds(text = '') {
  if (!text) return [];
  const matches = [...text.matchAll(CITATION_REGEX)];
  const ids = new Set();

  for (const match of matches) {
    const numbers = match[1].split(',').map((n) => parseInt(n.trim(), 10));
    for (const num of numbers) {
      if (!isNaN(num)) {
        ids.add(num);
      }
    }
  }

  return Array.from(ids).sort((a, b) => a - b);
}

/**
 * Counts citation frequency for each source ID.
 * @param {string} text Text containing citations
 * @returns {Record<number, number>} Map of sourceId -> count
 */
export function countCitations(text = '') {
  const counts = {};
  if (!text) return counts;
  const matches = [...text.matchAll(CITATION_REGEX)];

  for (const match of matches) {
    const numbers = match[1].split(',').map((n) => parseInt(n.trim(), 10));
    for (const num of numbers) {
      if (!isNaN(num)) {
        counts[num] = (counts[num] || 0) + 1;
      }
    }
  }

  return counts;
}

/**
 * Splits text into text chunks and citation clusters for rich interactive rendering.
 * @param {string} text Full markdown or plain text
 * @returns {Array<{ type: 'text'|'citation', value?: string, sourceIds?: number[], raw?: string }>}
 */
export function parseCitations(text = '') {
  if (!text) return [];

  const segments = [];
  let lastIndex = 0;
  const regex = new RegExp(CITATION_REGEX);
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        value: text.slice(lastIndex, matchIndex),
      });
    }

    const numbers = match[1]
      .split(',')
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n));

    segments.push({
      type: 'citation',
      sourceIds: numbers,
      raw: match[0],
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      value: text.slice(lastIndex),
    });
  }

  return segments;
}
