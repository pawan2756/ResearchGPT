# Product Requirements Document (PRD) - ResearchGPT

## 1. Product Overview
ResearchGPT is an "Ask first, research on consent" web chatbot created for students and developers. It provides rapid answers from LLM parametric memory, accompanied by confidence assessment and research triggers. If uncertainty or temporal volatility is detected, the user is offered a consent prompt to retrieve, synthesize, cite, and verify web sources.

## 2. Goals & Non-Goals
### Goals
- Direct, low-latency responses for general/static knowledge queries.
- Transparent confidence scoring (0-10) and research triggers based on temporal cues, confidence thresholds, and hedging.
- Real-time online research via Tavily with source credibility assessment (.gov, .edu, Wikipedia, official docs vs blogs).
- Strict citation enforcement `[n]` written solely from retrieved sources with zero outside hallucination.
- Post-generation claim verification (Verified vs Unverified) with source quotations.
- Complete auditability: Chat history, user feedback, 40-question hand-evaluated benchmark, and analytics dashboard.

### Non-Goals
- Vector database embedding indexing (direct retrieval and query-based chunking is used).
- Autonomous web browsing or multi-hop agent crawling.
- Replacing comprehensive academic literature review engines (e.g. Consensus/Semantic Scholar).

## 3. User Flows & Scenarios
1. **Direct Answer Flow**: User submits question -> Direct answer generated + Confidence score (0-10) + `needs_research` flag -> Research score computed.
2. **Consent Prompt Flow**: If research score $\ge$ 3, UI renders prompt: *"Research from online sources?"* with [Yes] and [No].
   - **User selects No**: Direct answer remains labeled *"Not verified with sources"*. No external network query is executed.
   - **User selects Yes**: SSE stream initiates -> Displays SourcesPanel immediately upon retrieval -> Streams cited answer -> Computes and renders claim verification tags.
3. **Exploration & Audit**:
   - Clicking citations `[n]` opens CitationDrawer showing exact passage and source URL.
   - Thumbs up/down feedback recorded with diagnostic reasoning.
   - 40-question benchmark runner comparing direct vs research performance.
   - Analytics dashboard displaying credibility distribution, latency breakdowns, and decision outcomes.

## 4. API Endpoints
- `POST /api/auth/signup` - Register user (email, password)
- `POST /api/auth/login` - Authenticate user, returns JWT
- `GET /api/auth/me` - Authenticate profile & preferences
- `POST /api/chat/ask` - Submit question, receive direct answer + research score
- `POST /api/chat/research` - Streamed SSE research pipeline with citation & verification
- `GET /api/chats` - List chats with pagination & search
- `GET /api/chats/:id` - Fetch single chat details
- `PATCH /api/chats/:id` - Rename chat
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/feedback` - Record user feedback
- `GET /api/eval/questions` - List evaluation questions
- `POST /api/eval/questions` - Create evaluation question
- `PATCH /api/eval/questions/:id` - Update question
- `DELETE /api/eval/questions/:id` - Delete question
- `POST /api/eval/run` - Trigger dual-mode evaluation run
- `GET /api/eval/run/:runId` - Check run status
- `GET /api/eval/results` - Fetch evaluation results
- `PATCH /api/eval/results/:id` - Save manual mark
- `GET /api/analytics/summary` - Aggregate metrics across range
- `GET /api/settings` - Retrieve user search depth, allow/block lists, theme
- `PUT /api/settings` - Update user settings
- `GET /api/health` - Health check (DB ping & runtime mode)

## 5. Data Model
- **User**: `email`, `passwordHash`, `settings` (depth, allowlist, blocklist, theme), `createdAt`.
- **Chat**: `userId`, `title`, timestamps.
- **Message**: `chatId`, `role`, `content`, `mode`, `confidence`, `needsResearch`, `researchScore`, `signals`, `sources`, `excludedCount`, `verification`, `notFound`, `latencyMs`, timestamps.
- **Feedback**: `messageId`, `userId`, `rating`, `reason`.
- **EvalQuestion**: `userId`, `question`, `category`, `groundTruth`.
- **EvalResult**: `userId`, `questionId`, `runId`, `mode`, `answer`, `sources`, `mark`, `triggerSuggested`, `latencyMs`, timestamps.
- **QueryCache**: `queryHash`, `results`, `expiresAt`.
