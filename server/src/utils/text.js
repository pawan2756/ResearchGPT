/**
 * Extracts a normalized hostname from a URL.
 */
export function extractDomain(url) {
  try {
    const parsed = new URL(url);
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }
    return hostname;
  } catch {
    return 'unknown';
  }
}

/**
 * Normalizes and cleans raw HTML/whitespace text.
 */
export function cleanText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, ' ') // strip tags if any
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits text into approximate words.
 */
export function splitIntoWords(text) {
  if (!text) return [];
  return text.trim().split(/\s+/).filter(Boolean);
}

/**
 * Chunks text into word chunks of given size with overlap.
 */
export function chunkText(text, chunkSizeWords = 800, overlapWords = 50) {
  const words = splitIntoWords(text);
  if (words.length <= chunkSizeWords) {
    return [words.join(' ')];
  }

  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSizeWords);
    chunks.push(chunkWords.join(' '));
    i += chunkSizeWords - overlapWords;
    if (i >= words.length - overlapWords) break;
  }
  return chunks;
}

/**
 * Scores a chunk based on how many unique question keywords it contains.
 */
export function scoreChunkRelevance(chunk, questionKeywords) {
  if (!chunk || !questionKeywords || questionKeywords.length === 0) return 0;
  const lowerChunk = chunk.toLowerCase();
  let score = 0;
  for (const kw of questionKeywords) {
    if (lowerChunk.includes(kw)) {
      score += 1;
    }
  }
  return score;
}

/**
 * Creates a clean snippet under maxLength characters.
 */
export function createSnippet(text, maxLength = 220) {
  const cleaned = cleanText(text);
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trim() + '...';
}
