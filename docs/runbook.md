# Operations & Demo Runbook

## 1. Starting & Stopping the Application

### Local Development Start
```powershell
# Terminal 1: Backend Server
cd server
npm run dev

# Terminal 2: Frontend Client
cd client
npm run dev
```

### Stopping
Press `Ctrl + C` in each terminal window to gracefully terminate processes.

## 2. Configuration & Key Management
- Config changes are made in `server/.env`.
- To test with real APIs:
  - Set `GEMINI_API_KEY=your_key`
  - Set `TAVILY_API_KEY=your_key`
  - Set `MOCK_MODE=false`
- To run completely offline or without credentials:
  - Leave `GEMINI_API_KEY` and `TAVILY_API_KEY` blank or set `MOCK_MODE=true`.

## 3. Common Incidents & Troubleshooting
- **Port In Use (EADDRINUSE: 5000 / 5173)**:
  - Check running processes or change `PORT` in `server/.env` and `VITE_API_URL` in `client/.env`.
- **Database Connection Failed**:
  - Ensure local MongoDB daemon is running or verify MongoDB Atlas connection string.
  - Note: Automated tests run with in-memory MongoDB (`mongodb-memory-server`) and do not require external DB.
- **Gemini Rate Limit (HTTP 429)**:
  - The server automatically retries with exponential backoff up to 3 times before returning a user-friendly error. Switch to Mock Mode if testing large batches.
- **Client Disconnects during Research Stream**:
  - Handled cleanly; server terminates internal stream processing upon socket close.

## 4. Demo-Day Viva Walkthrough Plan
1. **Introduction**:
   - Explain the core motivation: Hallucinations and stale training cutoff dates in LLMs.
   - Introduce "Ask first, research on consent" concept.
2. **Direct Answer Demo**:
   - Ask a static query (e.g. "Explain bubble sort in Python").
   - Point out high confidence tag, fast direct answer, zero web overhead.
3. **Research Trigger Demo**:
   - Ask a volatile query (e.g. "What is the latest price and release date of iPhone 16 Pro?").
   - Point out low confidence score, calculated research score ($\ge 3$), and the `ResearchPrompt` banner.
4. **Decline Flow**:
   - Click "No". Show that answer is labeled "Not verified with sources" without any external requests.
5. **Research Consent Flow**:
   - Click "Yes".
   - Notice: **Sources appear first** in the `SourcesPanel` before answer tokens begin streaming!
   - Watch citation numbers `[1][2]` appear in real-time.
   - Click a citation `[n]` to open `CitationDrawer` highlighting the exact passage from the source.
   - Show post-generation claim verification summary (e.g. "Verified claims: 3 of 4").
6. **Benchmark & Analytics Demo**:
   - Show Evaluation page with dual-mode comparison and manual marking.
   - Show Analytics page with decision outcomes, credibility distributions, and step latencies.
