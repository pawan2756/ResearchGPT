const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Streams research progress and tokens via HTTP POST and ReadableStream.
 * Parses "event:" and "data:" lines robustly across network chunk boundaries.
 *
 * @param {object} body { chatId, question, messageId }
 * @param {object} handlers { onStatus, onSources, onToken, onVerification, onDone, onError }
 * @param {AbortSignal} [signal] Optional AbortSignal from AbortController
 */
export async function streamResearch(body, handlers = {}, signal) {
  const token = localStorage.getItem('token');
  const url = `${API_URL}/api/chat/research`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    if (signal?.aborted) return;
    handlers.onError?.({
      code: 'NETWORK_ERROR',
      message: 'Failed to establish connection for research stream.',
    });
    return;
  }

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    handlers.onError?.({
      code: errorData?.error?.code || 'STREAM_INIT_FAILED',
      message: errorData?.error?.message || `Research stream failed with status ${response.status}`,
    });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  let buffer = '';
  let currentEvent = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Lines can be separated by \n or \r\n
      let lines = buffer.split(/\r?\n/);
      // The last line may be incomplete, hold it in buffer
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === '') {
          // Empty line indicates event boundary in SSE protocol
          currentEvent = null;
          continue;
        }

        if (trimmed.startsWith('event:')) {
          currentEvent = trimmed.slice(6).trim();
          continue;
        }

        if (trimmed.startsWith('data:')) {
          // Remove only the optional separator space after `data:`. A full
          // trim also strips intentional leading spaces from streamed tokens,
          // causing every word in the rendered answer to run together.
          const rawData = line.slice(line.indexOf(':') + 1).replace(/^ /, '');

          let parsedData = rawData;
          try {
            parsedData = JSON.parse(rawData);
          } catch {
            parsedData = rawData;
          }

          switch (currentEvent) {
            case 'status':
              handlers.onStatus?.(typeof parsedData === 'object' ? parsedData.text : parsedData);
              break;
            case 'sources':
              handlers.onSources?.(parsedData);
              break;
            case 'token':
              handlers.onToken?.(typeof parsedData === 'string' ? parsedData : rawData);
              break;
            case 'verification':
              handlers.onVerification?.(parsedData);
              break;
            case 'done':
              handlers.onDone?.(parsedData);
              break;
            case 'error':
              handlers.onError?.(parsedData);
              break;
            default:
              break;
          }
        }
      }
    }
  } catch (streamErr) {
    if (signal?.aborted) return;
    handlers.onError?.({
      code: 'STREAM_READ_ERROR',
      message: streamErr.message || 'Stream reading was interrupted.',
    });
  } finally {
    reader.releaseLock();
  }
}
