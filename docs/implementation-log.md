# Implementation & Verification Log

This file tracks every command executed, files modified, and factual test output obtained throughout development.

## [2026-10-28] Milestone M1: Initial Scaffolding

### Tasks Executed
1. **Git Initialization**:
   - Command: `git init`
   - Output: Initialized empty Git repository.
2. **Security & Configuration**:
   - Created `.gitignore` ignoring `.env`, `node_modules`, `dist`, `logs`.
   - Created `AGENTS.md` and documentation suite in `docs/` (`task-plan.md`, `design-system.md`, `decision-log.md`, `prd.md`, `architecture.md`, `build.md`, `checklist.md`, `known-issues.md`, `runbook.md`, `implementation-log.md`).
3. **Server Initialization**:
   - Configured `server/package.json` with Express, Helmet, Cors, Zod, JWT, Bcrypt, Pino, Mongoose, @google/genai, Vitest, Supertest, mongodb-memory-server.
   - Installed 408 packages via `npm install`.
   - Implemented `env.js`, `constants.js`, `logger.js`, `errors.js`, `hash.js`, `text.js`, `sse.js`.
   - Implemented `requestId.js`, `errorHandler.js`, `validate.js`.
   - Implemented `healthController.js` and `health.routes.js`.
   - Implemented `createApp()` in `server/src/app.js` and `server/src/index.js`.
   - Verified server linting: `cd server; npm run lint` -> Clean 0 errors.
   - Verified server tests: `cd server; npm test` -> 1 test passed (`tests/health.test.js`).
4. **Client Initialization**:
   - Configured `client/package.json` with React 19, Vite 6, Tailwind CSS 4, React Router 7, Recharts, React Markdown, Lucide React, Vitest.
   - Installed 434 packages via `npm install`.
   - Configured `vite.config.js`, `index.html` with IBM Plex fonts, `src/styles/design-tokens.css`, `src/index.css`.
   - Verified client build: `cd client; npm run build` -> Built in 1.54s.
   - Verified client linting: `cd client; npm run lint` -> Clean 0 errors.
   - Verified client test: `cd client; npm test` -> 1 test passed (`tests/smoke.test.js`).

## [2026-11-17] Milestone M2: Auth & Foundations

### Tasks Executed
1. **User Model**:
   - Created `server/src/models/User.js` with email (unique, lowercase), passwordHash, settings (depth, allowlist, blocklist, theme), and toJSON transformation stripping passwordHash.
2. **Auth Services & Controllers**:
   - Implemented `server/src/services/authService.js` with `signupUser`, `loginUser`, `getCurrentUser`, and `signToken`.
   - Implemented `server/src/controllers/authController.js` handling `/signup`, `/login`, `/me`.
   - Implemented `server/src/middleware/rateLimit.js` with 10/min per IP rate limiter on auth routes.
   - Implemented `server/src/middleware/auth.js` validating Bearer JWT.
   - Wired `server/src/routes/auth.routes.js`.
3. **Automated Auth Tests**:
   - Implemented `server/tests/helpers/db.js` with `mongodb-memory-server` isolation.
   - Implemented `server/tests/auth.test.js` validating 201 signup, 409 duplicate email, 400 validation error, 200 login, 401 wrong password, 401 unauthenticated `/me`, 200 authenticated `/me`, and ensuring passwordHash is never leaked.
   - Command: `cd server; npm test`
   - Result: 8 tests passed across 2 test files (health + auth).
4. **Client Authentication, Theme & UI Primitives**:
   - Implemented `client/src/api/client.js` with auto-bearer auth headers and 401 cleanup.
   - Implemented `client/src/api/auth.js` (`apiSignup`, `apiLogin`, `apiGetMe`, `apiGetHealth`).
   - Implemented `ThemeContext.jsx` with system/light/dark mode toggle and DOM attribute updating.
   - Implemented `AuthContext.jsx` with persistent token/user state and logout handling.
   - Built 10 UI primitives in `client/src/components/ui/` (`Button`, `Input`, `Card`, `Tag`, `Toggle`, `Toast`, `Skeleton`, `EmptyState`, `ErrorState`, `ProgressBar`).
   - Built layout components (`ProtectedRoute`, `Sidebar`, `AppShell`) respecting mobile (< 768px) and desktop layouts, design tokens, and mock mode banner.
   - Implemented `AuthPage.jsx` with two-column layout, navy brand panel, and 380px auth card.
   - Verified client build: `cd client; npm run build` -> Built in 9.17s.
   - Verified client linting: `cd client; npm run lint` -> 0 errors.
   - Verified client test: `cd client; npm test` -> 1 test passed.

## [2026-11-17] Milestone M3: Direct Chat & Research Scoring Engine

### Tasks Executed
1. **Data Models**:
   - Implemented `server/src/models/Message.js` containing confidence, needsResearch, researchScore, signals, sources array, excludedCount, verification breakdown, notFound flag, and latencyMs.
   - Updated `server/src/models/Chat.js` with userId foreign key and timestamps.
2. **Deterministic Mock Service & Gemini SDK Service**:
   - Implemented `server/src/services/mock.js` with `mockDirectAnswer`, `mockTavilySearch`, `mockCitedAnswer`, and `mockVerification`.
   - Implemented `server/src/services/gemini.js` with structured JSON output, `withRetry` exponential backoff, parsing retry fallback, and mock mode support.
3. **Research Score Rule Engine**:
   - Implemented `server/src/services/researchScore.js` evaluating low confidence (+2), needsResearch flag (+1), time-sensitive patterns/years (+2), and answer hedging (+2).
   - Tested 12 distinct unit test cases including threshold boundary in `server/tests/researchScore.test.js`.
4. **Direct Chat API & Validation**:
   - Implemented `askQuestion` controller in `server/src/controllers/chatController.js` and wired `/api/chat/ask`.
   - Applied `chatRateLimiter` (30/min per user) and Zod validation (1-1000 chars).
   - Validated automated tests in `server/tests/chat.test.js` (valid ask, chat auto-creation, message persistence, empty question 400, question > 1000 chars 400, cross-user isolation 403, unauthenticated 401).
   - Full server test run: 26 passed across 4 test suites.
5. **Frontend Chat UI**:
   - Implemented `ChatInput.jsx` with auto-growing textarea, char counter (max 1000), Enter-to-send keyboard shortcut.
   - Implemented `ConfidenceTag.jsx` with color-coded confidence levels.
   - Implemented `MessageBubble.jsx` with clean user bubble and assistant card view with Markdown rendering.
   - Implemented `MessageList.jsx` with sample suggested questions and scroll-to-bottom behavior.
   - Implemented `ChatPage.jsx` supporting conversation state, follow-ups, and new chat creation.
   - Client linting and build verified clean.

## [2026-11-17] Milestone M4: History & Conversation Management

### Tasks Executed
1. **History Controllers & Endpoints**:
   - Implemented `server/src/controllers/chatsController.js` with `listChats`, `getChatById`, `updateChatTitle`, and `deleteChat`.
   - Wired `server/src/routes/chats.routes.js` with authentication, rate limiting, and Zod query/body validations.
   - Implemented cascade deletion of all messages when a chat is deleted.
   - Enforced strict authorization preventing cross-user chat access (403 Forbidden).
2. **Automated History Tests**:
   - Implemented `server/tests/chats.test.js` validating pagination (`page`, `limit`), title search regex (`q`), chat message retrieval, renaming, deletion (204 No Content), and cross-user security boundaries.
   - Command: `cd server; npm test`
   - Result: 31 tests passed across 5 test suites (health, auth, researchScore, chat, chats).
3. **Frontend History UI**:
   - Implemented `useDebounce.js` custom hook for search debounce.
   - Implemented `format.js` date and timestamp formatters.
   - Implemented `ChatTable.jsx` with responsive table layout, inline title renaming, delete confirmation state, mode badges, message counters, and navigation links.
   - Implemented `HistoryPage.jsx` with debounced search bar, empty states, pagination controls, and status toasts.
   - Verified client build: `cd client; npm run build` -> Clean.
   - Verified client linting: `cd client; npm run lint` -> 0 errors, 0 warnings.

## [2026-11-17] Milestone M5: Research Score & Consent Interaction

### Tasks Executed
1. **Consent UI Component**:
   - Implemented `ResearchPrompt.jsx` using design tokens (`--consent-bg`, `--consent-border`, `--warning-bg`).
   - Integrated dynamic signal breakdown pills (time-sensitive topic, low model confidence, hedging phrases, volatile role).
   - Provided distinct "Yes, research online" and "No, keep direct answer" actions.
2. **Decline Workflow Integration**:
   - Integrated `ResearchPrompt` inside `MessageBubble.jsx` under direct answers when `message.shouldPrompt` is true.
   - Wired `handleDeclineResearch` in `ChatPage.jsx`: clicking "No" dismisses prompt, marks message with `notVerified = true`, renders permanent label *"Not verified with sources"*, and prevents any external network request.
3. **Automated Component Tests**:
   - Installed `jsdom` and `@testing-library/react` for Vite test runner.
   - Implemented `client/tests/researchPrompt.test.jsx` verifying prompt rendering, Yes callback execution, and confirming that clicking No does NOT trigger network requests (`global.fetch`).
   - Command: `cd client; npm test` -> 4 tests passed across 2 suites.
   - Verified client lint: `npm run lint` -> 0 errors, 0 warnings.
