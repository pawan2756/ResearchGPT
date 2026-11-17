import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { mockTavilySearch } from './mock.js';

export async function searchTavily(query, { depth = 'quick', allowlist = [], blocklist = [] } = {}) {
  if (env.IS_MOCK_MODE || !env.TAVILY_API_KEY) {
    logger.info('Tavily search running in Mock Mode.');
    return mockTavilySearch(query, depth);
  }

  const maxResults = depth === 'deep' ? 8 : 5;
  const searchDepth = depth === 'deep' ? 'advanced' : 'basic';

  const payload = {
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
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.warn({ status: res.status, body: errText }, 'Tavily API responded with non-200. Falling back to mock.');
      return mockTavilySearch(query, depth);
    }

    const data = await res.json();
    const results = data.results || [];

    return results.map((item) => ({
      title: item.title || '',
      url: item.url || '',
      content: item.content || item.snippet || '',
    }));
  } catch (err) {
    logger.error({ err: err.message }, 'Tavily search network request failed. Falling back to mock.');
    return mockTavilySearch(query, depth);
  }
}
