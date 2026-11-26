import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

function contentText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((part) => part?.text || '').join('');
  return '';
}

async function chatCompletion({ name, url, apiKey, model, systemInstruction, prompt, jsonMode = false }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new Error(`${name} returned HTTP ${response.status}`);
  const body = await response.json();
  const text = contentText(body?.choices?.[0]?.message?.content).trim();
  if (!text) throw new Error(`${name} returned an empty answer`);
  return { provider: name, text };
}

/**
 * Tries independent OpenAI-compatible providers after Gemini. Keys stay on
 * the server, and provider failures are deliberately not surfaced as secrets.
 */
export async function generateFallbackText({ systemInstruction, prompt, jsonMode = false }) {
  const providers = [
    env.MISTRAL_API_KEY && {
      name: 'Mistral', url: 'https://api.mistral.ai/v1/chat/completions',
      apiKey: env.MISTRAL_API_KEY, model: 'mistral-small-latest',
    },
    env.OPENROUTER_API_KEY && {
      name: 'OpenRouter', url: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: env.OPENROUTER_API_KEY, model: 'openrouter/free',
    },
    env.OLLAMA_API_KEY && env.OLLAMA_BASE_URL && {
      name: 'Ollama', url: `${env.OLLAMA_BASE_URL.replace(/\/$/, '')}/v1/chat/completions`,
      apiKey: env.OLLAMA_API_KEY, model: 'llama3.2',
    },
  ].filter(Boolean);

  for (const provider of providers) {
    try {
      return await chatCompletion({ ...provider, systemInstruction, prompt, jsonMode });
    } catch (error) {
      logger.warn({ provider: provider.name, err: error.message }, 'Fallback LLM provider failed.');
    }
  }
  return null;
}
