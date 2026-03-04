# AI Tools Setup

## Smart Match (No API Key Required)

The **Smart Match** feature uses rule-based scoring and does **not** require any external API key. It:

- Scans all truck profiles in the database
- Scores trucks by: capacity fit, availability, fuel type preference
- Returns the top 10 best matches for the selected job

## Optional: External AI APIs

If you want to add LLM-powered features (e.g., natural language explanations, smarter reasoning), you can integrate:

### Option 1: Ollama (Local, No API Key)
- Run models locally with [Ollama](https://ollama.ai)
- No API key needed
- Example: `OLLAMA_BASE_URL=http://localhost:11434`

### Option 2: OpenAI
- Requires `OPENAI_API_KEY`
- [Get key](https://platform.openai.com/api-keys)

### Option 3: Groq (Free Tier)
- Requires `GROQ_API_KEY`
- [Get key](https://console.groq.com)

### Option 4: Hugging Face Inference
- Requires `HUGGINGFACE_API_KEY`
- [Get token](https://huggingface.co/settings/tokens)
