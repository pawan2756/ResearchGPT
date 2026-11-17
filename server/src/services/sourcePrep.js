import {
  extractDomain,
  cleanText,
  chunkText,
  scoreChunkRelevance,
  createSnippet,
  splitIntoWords,
} from '../utils/text.js';

export function prepareSources(rawPages = [], question = '', maxSources = 5) {
  if (!rawPages || !Array.isArray(rawPages)) {
    return [];
  }

  // 1. Deduplicate by normalized URL
  const seenUrls = new Set();
  const dedupedPages = [];

  for (const page of rawPages) {
    if (!page || !page.url) continue;
    const cleanUrl = page.url.trim().toLowerCase().replace(/\/+$/, '');
    if (!seenUrls.has(cleanUrl)) {
      seenUrls.add(cleanUrl);
      dedupedPages.push(page);
    }
  }

  // 2. Extract question keywords for relevance scoring (filter out common stop words)
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'what', 'who', 'how', 'when', 'where', 'why', 'which', 'and', 'or', 'do', 'does', 'did',
  ]);
  const questionWords = splitIntoWords(question.toLowerCase())
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const prepared = [];

  for (const page of dedupedPages) {
    const rawContent = cleanText(page.content || page.snippet || '');
    if (!rawContent) continue;

    // Split text into chunks of ~800 words with 50 words overlap
    const chunks = chunkText(rawContent, 800, 50);

    // Find the chunk with highest keyword overlap
    let bestChunk = chunks[0] || '';
    let bestScore = -1;

    for (const chunk of chunks) {
      const score = scoreChunkRelevance(chunk, questionWords);
      if (score > bestScore) {
        bestScore = score;
        bestChunk = chunk;
      }
    }

    const domain = extractDomain(page.url);
    const snippet = createSnippet(bestChunk || rawContent, 220);

    prepared.push({
      title: (page.title || domain).trim(),
      url: page.url.trim(),
      domain,
      snippet,
      chunk: bestChunk,
    });

    if (prepared.length >= maxSources) {
      break;
    }
  }

  // 3. Number sources sequentially starting from 1
  return prepared.map((source, index) => ({
    id: index + 1,
    ...source,
  }));
}
