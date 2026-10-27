# System Architecture - ResearchGPT

## 1. System Overview Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT (React + Vite)                            |
|                                                                                   |
|  +-------------------+  +--------------------+  +-------------------------------+ |
|  | Auth / Settings   |  | Chat & Messages    |  | Evaluation & Analytics        | |
|  +-------------------+  +--------------------+  +-------------------------------+ |
|  | Components: AppShell, Sidebar, MessageList, SourcesPanel, CitationDrawer,    | |
|  |             ResearchPrompt, CompareView, EvaluationTable, ConfusionMatrix    | |
|  +------------------------------------------------------------------------------+ |
|  | State & Transport: AuthContext, ChatContext, ThemeContext, sse.js (Fetch API)  | |
+-----------------------------------------------------------------------------------+
                                         |
                                HTTP & SSE (JWT)
                                         v
+-----------------------------------------------------------------------------------+
|                                  SERVER (Express REST API)                         |
|                                                                                   |
|  [Middleware]: RequestId -> Helmet -> Cors -> Pino Logger -> Auth -> RateLimits   |
|                                                                                   |
|  [Controllers & Routes]:                                                          |
|    - Auth (/api/auth)                                                             |
|    - Chat & Ask (/api/chat/ask)                                                   |
|    - Research SSE (/api/chat/research)                                            |
|    - Chats History (/api/chats)                                                   |
|    - Feedback (/api/feedback)                                                     |
|    - Evaluation (/api/eval)                                                       |
|    - Analytics (/api/analytics)                                                   |
|    - Settings (/api/settings)                                                     |
|                                                                                   |
|  [Services Pipeline]:                                                             |
|    +--------------------+    +--------------------+    +--------------------+     |
|    |  gemini.js (direct)|    | researchScore.js   |    | cache.js           |     |
|    +--------------------+    +--------------------+    +--------------------+     |
|    |  tavily.js (search)|    | credibility.js     |    | sourcePrep.js      |     |
|    +--------------------+    +--------------------+    +--------------------+     |
|    | researchPipeline.js|    | evalRunner.js      |    | mock.js            |     |
|    +--------------------+    +--------------------+    +--------------------+     |
+-----------------------------------------------------------------------------------+
          |                                               |
          v                                               v
+-----------------------+                    +---------------------------+
|  MongoDB / Mongoose   |                    | External APIs             |
|  (User, Chat, Message,|                    |  - Google Gemini API      |
|   Feedback, Eval,     |                    |  - Tavily Search API      |
|   QueryCache)         |                    | (Fallback to Mock Mode)   |
+-----------------------+                    +---------------------------+
```

## 2. Research Pipeline Sequence & Event Contract

When the user triggers research by clicking **Yes** on `ResearchPrompt`:
1. **Client initiates HTTP POST** `/api/chat/research` with `chatId`, `question`, `messageId` and `Authorization: Bearer <JWT>`.
2. **SSE Stream Initialized** (`utils/sse.js:openSse`).
3. **Step 1 - Status Event**: `event: status`, data: `{"text": "Searching the web..."}`.
4. **Step 2 - Cache Check & Web Retrieval**: Checks `QueryCache`. If missing, calls Tavily search respecting user settings (`depth`, `allowlist`, `blocklist`).
5. **Step 3 - Status Event**: `event: status`, data: `{"text": "Checking sources..."}`.
6. **Step 4 - Source Prep & Credibility Filtering**:
   - `prepareSources`: Deduplication, relevance chunking, domain resolution.
   - `credibility`: Score domains (`.gov`, `.edu`, Wikipedia, news, HTTPS), filter `< 30`.
   - **Crucial Requirement**: Emits `event: sources` with `sources` array and `excludedCount` **BEFORE** streaming any answer tokens.
7. **Step 5 - Status Event**: `event: status`, data: `{"text": "Writing answer from sources..."}`.
8. **Step 6 - Synthesis Streaming**: Prompt instructs LLM to answer using ONLY numbered sources with `[n]` citations. Tokens streamed via `event: token`.
9. **Step 7 - Status Event**: `event: status`, data: `{"text": "Verifying claims..."}`.
10. **Step 8 - Claim Verification**: LLM breaks response into atomic claims, checking supported status and exact evidence snippets. Emits `event: verification`.
11. **Step 9 - Completion**: Message persisted to MongoDB with full verification data and latency. Emits `event: done`, data: `{"messageId": "..."}` and closes stream.

## 3. Security & Isolation Model
- External search API and LLM keys are stored strictly in `server/.env` and never forwarded to client.
- Web text fetched from external sources is treated as untrusted and rendered purely as safe markdown/plain text.
- Prompt injection defenses instruct model to ignore source-embedded instructions.
- Strict Rate Limits: Auth (10/min), Chat (30/min), Research (10/min).
