# ResearchGPT — "Ask First, Research on Consent"

ResearchGPT is an academic and developer-focused chatbot designed around deliberate, consented AI research.

Instead of silently executing web searches for every single query or halluncinating from stale parametric knowledge, ResearchGPT evaluates confidence, temporal signals, and hedging patterns. If uncertainty or temporal volatility is detected, it asks the user for consent. When granted, it fetches online sources using Tavily, filters and scores their credibility, presents the sources **first**, streams a strictly cited answer, and performs an automated claim-by-claim verification pass.

---

## Key Features
- **Ask First, Research on Consent**: Parametric LLM answer first with confidence assessment (0-10); triggers research prompt when score $\ge 3$.
- **Transparent Credibility**: Automatically evaluates domain authority (`.gov`, `.edu`, official documentation, reputable news vs low-credibility blogs).
- **Sources First Presentation**: Retrieved sources are rendered before answer tokens begin streaming.
- **Strictly Faithful Answers**: Answers are synthesized exclusively from cited sources `[1][2]` with zero outside knowledge.
- **Claim Verification**: Automated post-generation breakdown into claims tagged as `Verified` or `Unverified` with exact source quotes.
- **Fallback to Mock Mode**: Fully runnable and testable without API keys.
- **Evaluation & Benchmark Suite**: Built-in 40-question dual-mode runner with manual viva marking and confusion matrices.
- **Analytics & Observability**: Latency-per-step tracking, query distribution charts, credibility mix, and decision outcomes.

---

## Repository Structure

```
researchgpt/
  AGENTS.md             # Coding and behavioral guidelines
  README.md             # Project overview and run instructions
  .gitignore            # Ignored files (node_modules, .env, dist, logs)
  docs/                 # Architecture, PRD, Task Plan, Checklists, Logs
  server/               # Express backend API & services
    src/                # App, controllers, models, routes, services, utils
    tests/              # Vitest & Supertest unit & integration tests
  client/               # React + Vite + Tailwind CSS frontend
    src/                # Components, pages, hooks, contexts, design tokens
```

---

## Environment Variables

### Backend (`server/.env`)
Create `server/.env` based on `server/.env.example`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/researchgpt` |
| `JWT_SECRET` | Secret key for JWT signing ($\ge 8$ chars) | Development default |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `GEMINI_API_KEY` | Google Gemini API Key (optional for mock mode) | `""` |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.5-flash` |
| `TAVILY_API_KEY` | Tavily Search API Key (optional for mock mode) | `""` |
| `CLIENT_ORIGIN` | Allowed CORS frontend origin | `http://localhost:5174` |
| `RESEARCH_THRESHOLD` | Threshold score to prompt research consent | `3` |
| `MOCK_MODE` | Force mock mode (`true` / `false` / unset for auto) | Auto-detected |

### Frontend (`client/.env`)
Create `client/.env` based on `client/.env.example`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of ResearchGPT backend | `http://localhost:5000` |

---

## Quickstart & Local Setup

### 1. Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 2. Run the Application

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

```bash
# Terminal 1: for both frontend and backend using one terminal
npm run dev
```

Visit `http://localhost:5174` in your browser.

### 3. Run Automated Tests

```bash
# Backend tests (runs in-memory MongoDB)
cd server
npm test

# Frontend tests
cd client
npm test
```
