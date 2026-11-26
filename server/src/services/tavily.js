import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { mockTavilySearch } from './mock.js';

let lastProviderFailure = null;

export function getTavilyProviderStatus() {
  return lastProviderFailure
    ? { available: false, failure: lastProviderFailure }
    : { available: true, failure: null };
}

export async function searchTavily(query, { depth = 'quick', allowlist = [], blocklist = [] } = {}) {
  if (env.IS_MOCK_MODE || !env.TAVILY_API_KEY) {
    logger.info('Tavily search running in Mock Mode.');
    return mockTavilySearch(query, depth);
  }

  if (!env.TAVILY_API_KEY.startsWith('tvly-')) {
    lastProviderFailure = 'Tavily key is missing or has an invalid format.';
    throw new Error(lastProviderFailure);
  }

  const maxResults = depth === 'deep' ? 8 : 5;
  const searchDepth = depth === 'deep' ? 'advanced' : 'basic';

  const payload = {
    api_key: env.TAVILY_API_KEY,
    query,
    search_depth: searchDepth,
    max_results: maxResults,
    include_raw_content: false,
  };

  if (allowlist && allowlist.length > 0) {
    payload.include_domains = allowlist;
  }
  if (blocklist && blocklist.length > 0) {
    payload.exclude_domains = blocklist;
  }

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const errText = await res.text();
      lastProviderFailure = `Tavily API returned HTTP ${res.status}.`;
      logger.warn({ status: res.status, body: errText }, 'Tavily API responded with non-200.');
      throw new Error(lastProviderFailure);
    }

    const data = await res.json();
    const results = data.results || [];

    lastProviderFailure = null;
    return results.map((item) => ({
      title: item.title || '',
      url: item.url || '',
      content: item.content || item.snippet || '',
    }));
  } catch (err) {
    if (!String(err?.message || '').startsWith('Tavily API returned HTTP')) {
      lastProviderFailure = err.name === 'TimeoutError'
        ? 'Tavily search timed out after 15 seconds.'
        : 'Tavily search connection failed.';
    }
    logger.error({ err: err.message }, 'Tavily search request failed.');
    throw new Error(lastProviderFailure);
  }
}
