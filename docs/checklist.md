# Quality, Security & Acceptance Checklist

## 1. Security & Authentication
- [ ] User signup with bcrypt password hashing (min length 8)
- [ ] Duplicate email returns 409 Conflict
- [ ] Passwords never returned in any response or logged
- [ ] All protected routes enforce valid JWT in `Authorization: Bearer`
- [ ] Unauthenticated requests return 401 Unauthorized
- [ ] Cross-user data isolation enforced (users can only access own chats/evals)
- [ ] Helmet security headers active
- [ ] Strict CORS limited to `CLIENT_ORIGIN`
- [ ] Express rate-limiters on Auth (10/min), Chat (30/min), Research (10/min)
- [ ] Prompt injection defense verified (test with source containing instruction override)

## 2. Core Functional Flow
- [ ] Ask question returns direct answer, confidence (0-10), and `needs_research` flag
- [ ] Research score calculated from confidence, temporal cues, and hedging patterns
- [ ] When score >= threshold (3), `ResearchPrompt` renders with Yes/No
- [ ] Selecting No leaves answer labeled "Not verified with sources" without web request
- [ ] Selecting Yes streams research pipeline via SSE
- [ ] Sources displayed in `SourcesPanel` *BEFORE* any answer token is streamed
- [ ] Answer streams with inline citations `[n]` referencing numbered sources
- [ ] Post-generation claim verification tags claims as Verified or Unverified
- [ ] "Not found in the sources" fallback triggered when sources do not contain answer
- [ ] Query caching active for repeat searches

## 3. UI, Themes & Accessibility
- [ ] Light and Dark mode toggle working via design tokens
- [ ] Contrast ratio $\ge$ 4.5:1 across both themes
- [ ] Responsive layout functional at 1280px (desktop) and 375px (mobile)
- [ ] Sources panel switches to mobile bottom sheet on narrow screens
- [ ] Keyboard navigation and visible focus rings active
- [ ] `aria-live` regions for streaming status messages

## 4. History, Evaluation & Analytics
- [ ] Chat history searchable, paginated, with rename and delete (204)
- [ ] Evaluation question management (add, edit, delete, ground truth)
- [ ] Evaluation runner executes direct & research modes sequentially with polite delay
- [ ] Manual marking interface (Correct / Partial / Wrong / Abstained)
- [ ] Confusion matrix and accuracy stats computed from real saved data
- [ ] Analytics dashboard computes accurate breakdowns without division by zero
- [ ] Settings page controls search depth (3 vs 8) and domain allow/block lists

## 5. Reliability & Mock Mode
- [ ] Automatic fallback to Mock Mode when API keys are omitted
- [ ] Mock mode clearly indicated in UI sidebar
- [ ] Comprehensive unit & integration tests passing with in-memory MongoDB
