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
