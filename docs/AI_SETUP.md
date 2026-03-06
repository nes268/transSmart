# AI Tools Setup

## Smart Match & Route Optimization (Groq AI)

**Smart Match** and **Optimize Route** use Groq's LLM for intelligent matching and route selection:

- **Smart Match**: Ranks trucks for a job using AI—considers capacity, availability, fuel type, eco-friendliness, and returns scored suggestions with reasons.
- **Optimize Route**: Uses OSRM for route candidates, then Groq AI selects the best route by objective (eco, fastest, cheapest).

### Required: Groq API Key

1. Add to `backend/.env`:
   ```
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=llama-3.3-70b-versatile
   ```
2. Get a free API key at [console.groq.com](https://console.groq.com)
