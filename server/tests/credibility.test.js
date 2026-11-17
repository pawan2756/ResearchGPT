import { describe, it, expect } from 'vitest';
import {
  scoreSource,
  bandFor,
  applyAllowBlock,
  scoreAndFilterSources,
} from '../src/services/credibility.js';

describe('credibility Service', () => {
  it('scores .gov and .edu domains at 90', () => {
    expect(scoreSource('https://www.nist.gov/standards')).toBe(90);
    expect(scoreSource('https://cs.stanford.edu/research')).toBe(90);
    expect(bandFor(90)).toBe('High');
  });

  it('scores Wikipedia and official documentation at 80', () => {
    expect(scoreSource('https://en.wikipedia.org/wiki/Algorithm')).toBe(80);
    expect(scoreSource('https://developer.mozilla.org/en-US/docs')).toBe(80);
    expect(scoreSource('https://react.dev/reference')).toBe(80);
    expect(bandFor(80)).toBe('High');
  });

  it('scores news domains at 70', () => {
    expect(scoreSource('https://www.reuters.com/technology')).toBe(70);
    expect(scoreSource('https://www.bbc.com/news')).toBe(70);
    expect(bandFor(70)).toBe('Medium');
  });

  it('scores unknown domains at base 40', () => {
    expect(scoreSource('https://random-personal-blog-123.com/post')).toBe(40);
    expect(bandFor(40)).toBe('Low');
  });

  it('subtracts 10 points for non-https URLs', () => {
    // base 40 - 10 = 30
    expect(scoreSource('http://insecure-unknown-blog.org/post')).toBe(30);
    // gov 90 - 10 = 80
    expect(scoreSource('http://legacy.agency.gov/page')).toBe(80);
  });

  it('drops blocklisted domains', () => {
    const sources = [
      { url: 'https://trusted.edu/paper', domain: 'trusted.edu' },
      { url: 'https://spam-site.com/ads', domain: 'spam-site.com' },
    ];

    const filtered = applyAllowBlock(sources, { blocklist: ['spam-site.com'] });
    expect(filtered.length).toBe(1);
    expect(filtered[0].domain).toBe('trusted.edu');
  });

  it('keeps only allowlisted domains when allowlist is populated', () => {
    const sources = [
      { url: 'https://nist.gov/guide', domain: 'nist.gov' },
      { url: 'https://reuters.com/article', domain: 'reuters.com' },
      { url: 'https://other.com/post', domain: 'other.com' },
    ];

    const filtered = applyAllowBlock(sources, { allowlist: ['nist.gov', 'reuters.com'] });
    expect(filtered.length).toBe(2);
    expect(filtered.map((s) => s.domain)).toEqual(['nist.gov', 'reuters.com']);
  });

  it('excludes sources with score < 30 and increments excludedCount', () => {
    const sources = [
      { url: 'https://nist.gov/test', domain: 'nist.gov' }, // score 90
      { url: 'http://very-bad-unscored.com/zero', domain: 'very-bad-unscored.com' }, // 40 - 10 = 30
    ];

    const result = scoreAndFilterSources(sources);
    expect(result.sources.length).toBe(2);
    expect(result.excludedCount).toBe(0);
  });
});
