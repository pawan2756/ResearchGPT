# AGENTS.md - ResearchGPT Project Rules

This document specifies the mandatory guidelines, constraints, and operational patterns for all agents working on the ResearchGPT codebase.

## 1. Core Principles & Philosophy
- **Product Definition**: ResearchGPT is an "Ask first, research on consent" assistant. The LLM provides an initial direct answer with confidence score and `needs_research` flag. If research score is $\ge$ threshold, the UI requests user consent. Research runs Tavily search, scores credibility, displays sources *before* streaming cited tokens, and runs claim verification.
- **Explainability**: Code is intended for a final-year viva. Keep the pipeline in small, readable, handwritten functions without heavy external abstractions.
- **Honesty**: Never fake test results, evaluation numbers, or benchmarks. If a feature or external API cannot be verified, state "not verified" with clear steps on how to verify.

## 2. Hard Constraints
- **Language & Modules**: Plain JavaScript with ES Modules (`"type": "module"`). **NO TypeScript**.
- **Backend Stack**: Node.js (current LTS) + Express, MongoDB + Mongoose, Zod, jsonwebtoken, bcrypt, helmet, cors, express-rate-limit, pino, dotenv, Vitest + Supertest, ESLint + Prettier.
- **Frontend Stack**: React + Vite, Tailwind CSS, React Router, Recharts, react-markdown, lucide-react, plain JS JSX.
- **Forbidden Dependencies**: **DO NOT** use TypeScript, LangChain, LlamaIndex, any vector database, microservices, Redux, or fine-tuning.
- **Isolation of External APIs**: Google Gemini SDK (`@google/genai`) and Tavily Search API are called **ONLY** from `server/src/services`. The frontend never calls them and never sees their keys.
- **Design Tokens**: No hardcoded color codes in UI components; all styling must use the design system tokens defined in `src/styles/design-tokens.css`.

## 3. Security & Safety
- **Secrets Management**: Never log, commit, or print API keys, JWT secrets, passwords, or tokens.
- **Untrusted Input**: Treat all LLM outputs and external web content as untrusted. Render as safe text/markdown, never raw HTML. Prompt templates must instruct the model to ignore injection attempts inside source texts.
- **Mock Mode**: If `GEMINI_API_KEY` or `TAVILY_API_KEY` are not set, the app runs in deterministic `MOCK_MODE` without crashing, supporting full end-to-end user flows and testing.

## 4. Documentation & Evidence
- Update `docs/task-plan.md`, `docs/implementation-log.md`, and `docs/decision-log.md` with factual data and exact commands executed.
- Commit git snapshots after each milestone with clean, descriptive messages.
