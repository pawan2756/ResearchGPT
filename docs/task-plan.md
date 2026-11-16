# ResearchGPT: Task Plan & Milestones

## Milestones Overview

| Milestone | Scope | Status | Risks & Mitigations |
| :--- | :--- | :--- | :--- |
| **M1: Scaffold** | Repo setup, `.gitignore`, `AGENTS.md`, `docs/`, `server/`, `client/`, lint/format, config, health check, logger, error handling | Completed | Missing env keys handled gracefully by fallback config; port conflicts avoided via sensible defaults. |
| **M2: Auth & Foundations** | User model, JWT auth, rate limits, tests, UI design tokens, primitives, responsive layout (AppShell, Sidebar) | Completed | Secure password hashing with bcrypt, strict Zod schema validation, accessible token-based theme switching. |
| **M3: Direct Chat** | Gemini integration + Mock mode, Chat/Message models, `/api/chat/ask`, ChatPage, confidence indicator | In Progress | Rate limit / 429 on free tier handled with exponential backoff; JSON parsing errors fall back gracefully. |
| **M4: History** | Chat management endpoints, HistoryPage, debounced search, rename/delete modals, pagination | Pending | Data scoping per authenticated user strictly enforced. |
| **M5: Research Score & Consent** | `computeResearchScore` rule engine, unit tests, `ResearchPrompt` UI component, consent decline path | Pending | Boundary tests around threshold (3) to prevent false positives/negatives. |
| **M6: Research Pipeline** | Tavily search + mock, sourcePrep (chunking & scoring), query cache, SSE streaming, SourcesPanel, StatusLine | Pending | SSE connection drops handled via client-side abort controllers and server-side request closing. |
| **M7: Trust & Verification** | Credibility scoring (.gov/.edu/etc.), domain allow/blocklist, CitationDrawer, claim verification service, ClaimTag | Pending | Prompt-injection inside scraped page text neutralized via prompt sandboxing & untrusted text guidelines. |
| **M8: Feedback & Observability** | Feedback API, rating buttons, pipeline step latency logging, safe metadata logging, CompareView | Pending | Ensure no sensitive query or prompt tokens leak into server logs. |
| **M9: Evaluation Framework** | Eval models, Question CRUD UI, evaluation runner, metrics aggregation, confusion matrix, honest empty states | Pending | Free-tier throttling on bulk runs prevented by inserting delays between sequential model calls. |
| **M10: Analytics & Settings** | MongoDB aggregations, Analytics charts (Recharts), Settings page (search depth, domains), pipeline integration | Pending | Empty data states handled safely without dividing by zero. |
| **M11: Hardening & Verification** | Comprehensive test execution, security review, responsive screenshot audits, documentation completion | Pending | Ensure zero unverified claims and flawless local setup experience from `README.md`. |

## Key Technical Risks & Mitigation Strategies
1. **Gemini Free-Tier Rate Limits (15 RPM / 429 Errors)**:
   - *Mitigation*: Implement exponential backoff in `withRetry`, deterministic mock fallbacks when keys are absent, and polite pacing (1.5s delay) in evaluation runners.
2. **Untrusted Web Source Injection**:
   - *Mitigation*: Strict system prompting instructing the model to treat retrieved source text as raw untrusted data, plus regex-safe sanitization and markdown-safe rendering.
3. **SSE Incompatibility & Network Interruption**:
   - *Mitigation*: Use pure `fetch` with `ReadableStream` reader (not native `EventSource`) to support `POST` payloads with JWT headers; handle disconnection by terminating server jobs immediately.
4. **CSS Token Consistency**:
   - *Mitigation*: Enforce centralized CSS variables in `design-tokens.css` with dark mode support and 4.5:1 contrast compliance.
