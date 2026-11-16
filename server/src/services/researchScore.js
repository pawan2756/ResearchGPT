import { TIME_SENSITIVE_PATTERNS, YEAR_PATTERN, HEDGING_PATTERNS } from '../config/constants.js';
import { env } from '../config/env.js';

export function computeResearchScore({
  question = '',
  answer = '',
  confidence = null,
  needsResearch = false,
  threshold = env.RESEARCH_THRESHOLD,
}) {
  const qLower = (question || '').toLowerCase();
  const aLower = (answer || '').toLowerCase();

  // 1. Confidence < 5 (+2)
  const isConfidenceLow = typeof confidence === 'number' && confidence < 5;
  const confidencePoints = isConfidenceLow ? 2 : 0;

  // 2. needsResearch is true (+1)
  const hasNeedsResearchFlag = Boolean(needsResearch);
  const needsResearchPoints = hasNeedsResearchFlag ? 1 : 0;

  // 3. Time-sensitive patterns in question (+2)
  const hasTimeKeyword = TIME_SENSITIVE_PATTERNS.some((pat) => qLower.includes(pat));
  const hasYear = YEAR_PATTERN.test(qLower);
  const isTimeSensitive = hasTimeKeyword || hasYear;
  const timePoints = isTimeSensitive ? 2 : 0;

  // 4. Hedging in answer (+2)
  const hasHedging = HEDGING_PATTERNS.some((pat) => aLower.includes(pat));
  const hedgingPoints = hasHedging ? 2 : 0;

  const totalScore = confidencePoints + needsResearchPoints + timePoints + hedgingPoints;
  const shouldPrompt = totalScore >= threshold;

  return {
    score: totalScore,
    shouldPrompt,
    signals: {
      lowConfidence: isConfidenceLow,
      lowConfidencePoints: confidencePoints,
      needsResearchFlag: hasNeedsResearchFlag,
      needsResearchPoints,
      timeSensitiveQuestion: isTimeSensitive,
      timeSensitivePoints: timePoints,
      hedgingAnswer: hasHedging,
      hedgingPoints,
    },
  };
}
