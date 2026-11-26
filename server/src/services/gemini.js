import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { mockDirectAnswer, providerUnavailableAnswer } from './mock.js';
import { generateFallbackText } from './fallbackLlm.js';

const directAnswerSchema = z.object({
  answer: z.string().min(1),
  confidence: z.number().int().min(0).max(10).nullable().optional(),
  needs_research: z.boolean().default(false),
  reason: z.string().optional().default(''),
});

let aiClient = null;
let lastProviderFailure = null;
let providerCooldownUntil = 0;
const PROVIDER_COOLDOWN_MS = 60 * 1000;

export function getGeminiProviderStatus() {
  const retryAfterSeconds = Math.max(0, Math.ceil((providerCooldownUntil - Date.now()) / 1000));
  return retryAfterSeconds > 0
    ? { available: false, failure: lastProviderFailure, retryAfterSeconds }
    : { available: true, failure: null, retryAfterSeconds: 0 };
}

function summarizeProviderError(error) {
  const detail = String(error?.message || '')
    .replace(/AIza[\w-]+/g, '[redacted]')
    .replace(/key=[^\s&]+/gi, 'key=[redacted]')
    .slice(0, 240);
  if (error?.status || error?.statusCode) {
    return `Gemini API returned HTTP ${error.status || error.statusCode}${detail ? `: ${detail}` : '.'}`;
  }
  if (error?.code) {
    return `Gemini connection failed (${error.code}).`;
  }
  return 'Gemini connection failed before receiving an API response.';
}
function getGenAI() {
  if (!aiClient && env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return aiClient;
}

function parseProviderJson(text) {
  const normalized = String(text || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');
  return JSON.parse(normalized);
}

/**
 * Executes an async function with exponential backoff on 429 rate limit errors.
 */
export async function withRetry(fn, tries = 3, delayMs = 1500) {
  let attempt = 0;
  let currentDelay = delayMs;

  while (attempt < tries) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      const isRateLimit =
        err?.status === 429 ||
        err?.statusCode === 429 ||
        err?.status === 503 ||
        err?.statusCode === 503 ||
        (err?.message && (err.message.includes('429') || err.message.includes('503') || err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('rate limit') || err.message.toLowerCase().includes('high demand')));

      if (isRateLimit && attempt < tries) {
        logger.warn(
          { attempt, delayMs: currentDelay, err: err.message },
          'Gemini API rate limit encountered. Retrying with exponential backoff...'
        );
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= 2;
      } else {
        if (attempt >= tries) {
          logger.error({ tries, err: err.message }, 'Gemini API retries exhausted.');
        }
        throw err;
      }
    }
  }
}

/**
 * Generates direct answer from Gemini in structured JSON format.
 */
export async function generateDirectAnswer(question) {
  if (env.IS_MOCK_MODE || !env.GEMINI_API_KEY) {
    return mockDirectAnswer(question);
  }

  const ai = getGenAI();
  if (!ai) {
    return mockDirectAnswer(question);
  }

  const systemInstruction =
    'You are a helpful assistant. Answer the question from your own knowledge. Return only JSON: {"answer": string, "confidence": integer 0-10, "needs_research": boolean, "reason": string}. confidence is how sure you are the answer is correct AND current. Set needs_research to true if the question depends on recent events, prices, versions, or people currently holding a role.';

  async function callModel() {
    // Use exactly the configured, currently supported model. Retired fallback
    // names turn one failed request into several slow 404 requests.
    const candidateModels = [env.GEMINI_MODEL].filter(Boolean);

    let lastError = null;
    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: question }] }],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });
        return response.text || '';
      } catch (err) {
        lastError = err;
        logger.warn({ model: modelName, err: err.message }, 'Gemini model call failed, trying next candidate if available...');
      }
    }
    throw lastError;
  }

  const fallbackRequest = () => generateFallbackText({
    systemInstruction,
    prompt: `Question: ${question}`,
    jsonMode: true,
  });

  let rawText = '';
  if (!getGeminiProviderStatus().available) {
    const fallback = await fallbackRequest();
    if (!fallback) return providerUnavailableAnswer(question, { providerBusy: true });
    logger.info({ provider: fallback.provider }, 'Direct answer generated by fallback LLM during Gemini cooldown.');
    rawText = fallback.text;
  } else try {
    // One brief retry handles Gemini's transient 503 demand spikes without
    // keeping the chat UI waiting through several long retries.
    rawText = await withRetry(callModel, 2, 750);
    lastProviderFailure = null;
    providerCooldownUntil = 0;
  } catch (apiErr) {
    logger.warn({ err: apiErr.message }, 'Gemini direct answer call failed. Reporting provider unavailability.');
    lastProviderFailure = summarizeProviderError(apiErr);
    const fallback = await fallbackRequest();
    if (fallback) {
      logger.info({ provider: fallback.provider }, 'Direct answer generated by fallback LLM provider.');
      rawText = fallback.text;
    } else if (apiErr?.status === 503 || apiErr?.statusCode === 503) {
      providerCooldownUntil = Date.now() + PROVIDER_COOLDOWN_MS;
      return providerUnavailableAnswer(question, { providerBusy: true });
    } else {
      return providerUnavailableAnswer(question);
    }
  }

  // Parse and validate with Zod
  try {
    const parsed = parseProviderJson(rawText);
    const validated = directAnswerSchema.parse(parsed);
    return {
      answer: validated.answer,
      confidence: validated.confidence ?? null,
      needs_research: validated.needs_research,
      reason: validated.reason,
    };
  } catch {
    // Retry once if JSON is malformed
    try {
      logger.info('Gemini response was invalid JSON. Retrying once...');
      rawText = await withRetry(callModel, 2, 1000);
      const secondParsed = parseProviderJson(rawText);
      const validated = directAnswerSchema.parse(secondParsed);
      return {
        answer: validated.answer,
        confidence: validated.confidence ?? null,
        needs_research: validated.needs_research,
        reason: validated.reason,
      };
    } catch {
      logger.warn('Gemini retry also failed JSON validation. Falling back to raw text with null confidence.');
      return {
        answer: rawText || 'Unable to parse assistant response.',
        confidence: null,
        needs_research: false,
        reason: 'Malformed JSON fallback',
      };
    }
  }
}
