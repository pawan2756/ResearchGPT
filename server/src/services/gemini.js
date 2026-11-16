import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { mockDirectAnswer } from './mock.js';

const directAnswerSchema = z.object({
  answer: z.string().min(1),
  confidence: z.number().int().min(0).max(10).nullable().optional(),
  needs_research: z.boolean().default(false),
  reason: z.string().optional().default(''),
});

let aiClient = null;
function getGenAI() {
  if (!aiClient && env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return aiClient;
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
        (err?.message && (err.message.includes('429') || err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('rate limit')));

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
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: question }],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    return response.text || '';
  }

  let rawText = '';
  try {
    rawText = await withRetry(callModel, 3, 1000);
  } catch (apiErr) {
    logger.warn({ err: apiErr.message }, 'Gemini direct answer call failed. Falling back to mock answer.');
    return mockDirectAnswer(question);
  }

  // Parse and validate with Zod
  try {
    const parsed = JSON.parse(rawText);
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
      const secondParsed = JSON.parse(rawText);
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
