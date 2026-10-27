export const TIME_SENSITIVE_PATTERNS = [
  'latest',
  'current',
  'currently',
  'today',
  'now',
  'recent',
  'this year',
  'news',
  'price',
  'version',
  'release',
  'who is the',
  'ceo',
  'score',
  'weather',
];

export const YEAR_PATTERN = /\b(202[4-9]|20[3-9]\d)\b/;

export const HEDGING_PATTERNS = [
  'not sure',
  'cannot verify',
  'as of my knowledge',
  'may be outdated',
  "i don't have access to real-time",
  'i do not have access to real-time',
  'my knowledge is limited',
  'up to my last update',
  'i cannot browse',
];

export const NEWS_DOMAINS = [
  'reuters.com',
  'apnews.com',
  'bbc.com',
  'bbc.co.uk',
  'nytimes.com',
  'wsj.com',
  'theguardian.com',
  'bloomberg.com',
  'cnn.com',
  'npr.org',
  'techcrunch.com',
  'theverge.com',
  'wired.com',
  'arstechnica.com',
  'nature.com',
  'sciencedirect.com',
];

export const OFFICIAL_DOC_DOMAINS = [
  'developer.mozilla.org',
  'docs.python.org',
  'nodejs.org',
  'react.dev',
  'github.com',
  'learn.microsoft.com',
  'cloud.google.com',
  'aws.amazon.com',
  'stackoverflow.com',
  'en.wikipedia.org',
  'wikipedia.org',
];

export const SEARCH_DEPTHS = {
  quick: 3,
  deep: 8,
};

export const CREDIBILITY_BANDS = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};
