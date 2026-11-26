import { apiClient } from './client.js';

export async function apiGetEvalQuestions() {
  return apiClient('/api/eval/questions');
}

export async function apiRunEval(sampleSize = 40) {
  return apiClient('/api/eval/run', {
    method: 'POST',
    body: JSON.stringify({ sampleSize }),
  });
}

export async function apiGetEvalResults() {
  return apiClient('/api/eval/results');
}
