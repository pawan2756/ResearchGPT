import { TIME_SENSITIVE_PATTERNS, YEAR_PATTERN } from '../config/constants.js';

export function isTimeSensitive(text = '') {
  const lower = text.toLowerCase();
  const hasKeyword = TIME_SENSITIVE_PATTERNS.some((pattern) => lower.includes(pattern));
  const hasYear = YEAR_PATTERN.test(lower);
  return hasKeyword || hasYear;
}

export function mockDirectAnswer(question = '') {
  const sensitive = isTimeSensitive(question);

  if (sensitive) {
    return {
      answer: `As of my knowledge, this topic involves recent events or frequently changing figures. The latest updates may be outdated in my training data, so real-time verification is recommended.`,
      confidence: 3,
      needs_research: true,
      reason: 'Question pertains to recent developments, current pricing, or volatile real-world roles.',
    };
  }

  return {
    answer: `Here is a foundational overview regarding "${question.trim()}": It is a well-documented subject in standard technical literature with stable, verified principles that do not change frequently over time.`,
    confidence: 9,
    needs_research: false,
    reason: 'Established historical or theoretical knowledge with high consensus.',
  };
}

export function mockTavilySearch(question = '', depth = 'quick') {
  const count = depth === 'deep' ? 6 : 4;
  const baseSources = [
    {
      title: 'National Institute of Standards and Technology - Official Reference',
      url: 'https://www.nist.gov/publications/technology-standards-guide',
      content: `The National Institute of Standards and Technology provides official technical specifications and benchmarking procedures regarding ${question}. Verified standards require strict reproducibility and empirical validation across laboratory testing environments.`,
    },
    {
      title: 'Wikipedia - Comprehensive Topic Overview',
      url: 'https://en.wikipedia.org/wiki/Information_retrieval_and_synthesis',
      content: `Comprehensive encyclopedia summary of ${question}. Research indicates verified cross-referencing between independent databases significantly decreases false positives and factual hallucinations in automated question answering systems.`,
    },
    {
      title: 'Reuters Technology News - Industry Analysis',
      url: 'https://www.reuters.com/technology/ai-industry-standards-2025',
      content: `Industry analysts report that recent releases and modern benchmarks for ${question} demonstrate a measurable shift toward consented, citation-backed AI pipelines in enterprise and educational domains.`,
    },
    {
      title: 'Personal Tech Musings Blog - Unverified Speculation',
      url: 'http://tech-notes-unverified-blog.xyz/post-discussion',
      content: `A casual enthusiast blog post discussing rumors and unverified community claims regarding ${question}. Note: Several user forums claim performance doubled, though no benchmark data was published.`,
    },
    {
      title: 'MIT Computer Science & AI Laboratory Archive',
      url: 'https://www.csail.mit.edu/research/automated-verification',
      content: `Academic publication from CSAIL regarding ${question}. Empirical verification architectures split generative model responses into atomic claims, checking each against retrieved document chunks.`,
    },
    {
      title: 'BBC World News Technology Watch',
      url: 'https://www.bbc.com/news/technology-research-update',
      content: `International coverage on ${question} confirms adoption across major universities. Independent audits highlight the importance of transparency in source credibility scoring.`,
    },
  ];

  return baseSources.slice(0, count);
}

export function mockCitedAnswer(_question = '', sources = []) {
  if (!sources || sources.length === 0) {
    return 'Not found in the sources.';
  }

  return (
    `Based on official technical standards and published documentation, research in this domain emphasizes empirical validation and reproducibility [1]. ` +
    `Cross-referencing independent academic databases significantly reduces false citations and unverified claims [2]. ` +
    `Furthermore, recent industry reports indicate that citation-backed retrieval pipelines are rapidly becoming standard practice [3]. ` +
    `Some unverified community discussions suggest non-standard performance gains, but these lack corroborating peer-reviewed data [4].`
  );
}

export function mockVerification(_answer = '', _sources = []) {
  return {
    total: 4,
    supported: 3,
    claims: [
      {
        claim: 'Official technical standards emphasize empirical validation and reproducibility.',
        supported: true,
        sourceId: 1,
        evidence: 'Verified standards require strict reproducibility and empirical validation',
      },
      {
        claim: 'Cross-referencing independent academic databases significantly reduces false citations.',
        supported: true,
        sourceId: 2,
        evidence: 'Verified cross-referencing between independent databases significantly decreases false positives',
      },
      {
        claim: 'Recent industry reports indicate citation-backed pipelines are becoming standard practice.',
        supported: true,
        sourceId: 3,
        evidence: 'modern benchmarks demonstrate a measurable shift toward consented, citation-backed AI pipelines',
      },
      {
        claim: 'Community claims of doubled performance are confirmed by benchmark tests.',
        supported: false,
        sourceId: null,
        evidence: null,
      },
    ],
  };
}
