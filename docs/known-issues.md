# Known Limitations & Issues

1. **Source Reliability vs Absolute Truth**:
   - The research pipeline guarantees faithfulness to retrieved web sources; however, if retrieved search results themselves contain inaccuracies or disinformation, the generated answer reflects those sources.
2. **Faithfulness is Not Factuality**:
   - Claim verification checks whether a claim is directly supported by the extracted source text, not whether the source text is objectively accurate in the physical world.
3. **Rule-Based Trigger Limitations**:
   - The heuristic research score combines confidence thresholds, temporal keyword patterns, and hedging detection. While fast and transparent, it can produce edge cases where non-temporal questions match keywords or novel temporal phrasing is missed.
4. **Free-Tier API Rate Limits**:
   - Google Gemini free tier and Tavily free tier are subject to requests-per-minute (RPM) and monthly query limits. The app includes automatic backoff and Mock Mode fallback to mitigate this.
5. **Evaluation Sample Size**:
   - The built-in 40-question evaluation benchmark is tailored for qualitative academic viva demonstration rather than exhaustive industrial LLM alignment.
