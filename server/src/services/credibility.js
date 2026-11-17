import { extractDomain } from '../utils/text.js';
import { NEWS_DOMAINS, OFFICIAL_DOC_DOMAINS, CREDIBILITY_BANDS } from '../config/constants.js';

export function scoreSource(url = '') {
  if (!url) return 30;

  let domain = extractDomain(url);
  let isHttps = false;
  try {
    const parsed = new URL(url);
    isHttps = parsed.protocol === 'https:';
  } catch {
    isHttps = false;
  }

  let score = 40; // Base score for unknown domain

  if (domain.endsWith('.gov') || domain.endsWith('.edu')) {
    score = 90;
  } else if (
    domain.includes('wikipedia.org') ||
    OFFICIAL_DOC_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))
  ) {
    score = 80;
  } else if (NEWS_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) {
    score = 70;
  }

  if (!isHttps) {
    score -= 10;
  }

  return Math.max(Math.min(score, 100), 0);
}

export function bandFor(score) {
  if (score >= 75) return CREDIBILITY_BANDS.HIGH;
  if (score >= 50) return CREDIBILITY_BANDS.MEDIUM;
  return CREDIBILITY_BANDS.LOW;
}

export function matchesDomainList(domain, list = []) {
  if (!list || list.length === 0) return false;
  const cleanDomain = domain.toLowerCase();
  return list.some((item) => {
    const cleanItem = item.trim().toLowerCase();
    if (!cleanItem) return false;
    return cleanDomain === cleanItem || cleanDomain.endsWith(`.${cleanItem}`);
  });
}

export function applyAllowBlock(sources = [], settings = {}) {
  const allowlist = settings.allowlist || [];
  const blocklist = settings.blocklist || [];

  return sources.filter((source) => {
    const domain = source.domain || extractDomain(source.url);

    // Drop blocklist matches
    if (matchesDomainList(domain, blocklist)) {
      return false;
    }

    // If allowlist is populated, keep only matching domains
    if (allowlist.length > 0) {
      return matchesDomainList(domain, allowlist);
    }

    return true;
  });
}

export function scoreAndFilterSources(sources = [], settings = {}) {
  // Apply allowlist and blocklist first
  const allowedSources = applyAllowBlock(sources, settings);

  const scored = [];
  let excludedCount = 0;

  for (const src of allowedSources) {
    const score = scoreSource(src.url);
    if (score < 30) {
      excludedCount += 1;
      continue;
    }

    scored.push({
      ...src,
      score,
      band: bandFor(score),
    });
  }

  return {
    sources: scored,
    excludedCount,
  };
}
