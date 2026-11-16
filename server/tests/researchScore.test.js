import { describe, it, expect } from 'vitest';
import { computeResearchScore } from '../src/services/researchScore.js';

describe('computeResearchScore Service', () => {
  it('case 1: static question, high confidence, no hedging -> score 0, shouldPrompt false', () => {
    const res = computeResearchScore({
      question: 'Explain the quicksort algorithm',
      answer: 'Quicksort is a divide-and-conquer sorting algorithm with average O(n log n) time complexity.',
      confidence: 9,
      needsResearch: false,
    });
    expect(res.score).toBe(0);
    expect(res.shouldPrompt).toBe(false);
    expect(res.signals.lowConfidence).toBe(false);
  });

  it('case 2: low confidence only (4) -> score 2, shouldPrompt false at threshold 3', () => {
    const res = computeResearchScore({
      question: 'What is the population of ancient Carthage in 200 BC?',
      answer: 'Estimates range from 100,000 to 400,000 citizens.',
      confidence: 4,
      needsResearch: false,
    });
    expect(res.score).toBe(2);
    expect(res.shouldPrompt).toBe(false);
    expect(res.signals.lowConfidence).toBe(true);
  });

  it('case 3: threshold edge test - low confidence (2) + needsResearch (1) -> score 3, shouldPrompt true', () => {
    const res = computeResearchScore({
      question: 'Who won the local regional election?',
      answer: 'Results are contested in several precincts.',
      confidence: 2,
      needsResearch: true,
    });
    expect(res.score).toBe(3);
    expect(res.shouldPrompt).toBe(true);
  });

  it('case 4: needsResearch flag only -> score 1, shouldPrompt false', () => {
    const res = computeResearchScore({
      question: 'How do solar panels work?',
      answer: 'Solar panels convert photons into electricity via photovoltaic effect.',
      confidence: 8,
      needsResearch: true,
    });
    expect(res.score).toBe(1);
    expect(res.shouldPrompt).toBe(false);
  });

  it('case 5: time-sensitive pattern in question ("latest") -> score 2, shouldPrompt false', () => {
    const res = computeResearchScore({
      question: 'What is the latest stability update?',
      answer: 'Standard release notes follow semantic versioning.',
      confidence: 8,
      needsResearch: false,
    });
    expect(res.score).toBe(2);
    expect(res.signals.timeSensitiveQuestion).toBe(true);
    expect(res.shouldPrompt).toBe(false);
  });

  it('case 6: year >= 2024 pattern in question ("2025") -> score 2', () => {
    const res = computeResearchScore({
      question: 'What are the tech trends in 2025?',
      answer: 'Emerging architectures focus on distributed agents.',
      confidence: 8,
      needsResearch: false,
    });
    expect(res.score).toBe(2);
    expect(res.signals.timeSensitiveQuestion).toBe(true);
  });

  it('case 7: answer contains hedging phrase ("as of my knowledge") -> score 2', () => {
    const res = computeResearchScore({
      question: 'Who is leading the team?',
      answer: 'As of my knowledge, the founder was managing direction.',
      confidence: 7,
      needsResearch: false,
    });
    expect(res.score).toBe(2);
    expect(res.signals.hedgingAnswer).toBe(true);
  });

  it('case 8: time-sensitive ("price") + low confidence (3) -> score 4, shouldPrompt true', () => {
    const res = computeResearchScore({
      question: 'What is the price of Bitcoin right now?',
      answer: 'Financial markets fluctuate rapidly every second.',
      confidence: 3,
      needsResearch: false,
    });
    expect(res.score).toBe(4);
    expect(res.shouldPrompt).toBe(true);
  });

  it('case 9: time-sensitive ("news") + answer hedging ("cannot verify") -> score 4, shouldPrompt true', () => {
    const res = computeResearchScore({
      question: 'What is the headline news today?',
      answer: 'I cannot verify real-time news broadcasts without browsing.',
      confidence: 6,
      needsResearch: false,
    });
    expect(res.score).toBe(4);
    expect(res.shouldPrompt).toBe(true);
  });

  it('case 10: all 4 signals active -> score 7 (2+1+2+2), shouldPrompt true', () => {
    const res = computeResearchScore({
      question: 'Who is the current CEO of Twitter now in 2026?',
      answer: 'I do not have access to real-time corporate registry changes.',
      confidence: 1,
      needsResearch: true,
    });
    expect(res.score).toBe(7);
    expect(res.shouldPrompt).toBe(true);
    expect(res.signals.lowConfidence).toBe(true);
    expect(res.signals.needsResearchFlag).toBe(true);
    expect(res.signals.timeSensitiveQuestion).toBe(true);
    expect(res.signals.hedgingAnswer).toBe(true);
  });

  it('case 11: confidence null gives 0 confidence points', () => {
    const res = computeResearchScore({
      question: 'Explain recursion',
      answer: 'A function that calls itself.',
      confidence: null,
      needsResearch: false,
    });
    expect(res.score).toBe(0);
    expect(res.signals.lowConfidence).toBe(false);
  });

  it('case 12: honors custom threshold argument', () => {
    const res = computeResearchScore({
      question: 'Who is the CEO?',
      answer: 'The company executive.',
      confidence: 3, // +2
      needsResearch: false,
      threshold: 5,
    });
    // timeSensitive: +2, lowConfidence: +2 => total 4. With threshold 5 -> false
    expect(res.score).toBe(4);
    expect(res.shouldPrompt).toBe(false);
  });
});
