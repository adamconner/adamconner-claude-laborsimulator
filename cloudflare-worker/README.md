# Gemini API Proxy - Cloudflare Worker

This Cloudflare Worker proxies requests to Google's Gemini API for the AI Labor Market Simulator.

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Deploy to Cloudflare Workers

#### Option A: Using Wrangler CLI (Recommended)

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Create a new worker:
   ```bash
   cd cloudflare-worker
   wrangler init gemini-proxy
   ```

4. Replace the generated `src/index.js` with `gemini-proxy.js`

5. Add your API key as a secret:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```
   (Paste your Gemini API key when prompted)

6. Deploy:
   ```bash
   wrangler deploy
   ```

#### Option B: Using Cloudflare Dashboard

1. Go to https://dash.cloudflare.com/
2. Click "Workers & Pages" in the sidebar
3. Click "Create application" → "Create Worker"
4. Name it `gemini-proxy`
5. Click "Deploy"
6. Click "Edit code"
7. Replace the code with the contents of `gemini-proxy.js`
8. Click "Save and Deploy"
9. Go to Settings → Variables
10. Add a new variable:
    - Name: `GEMINI_API_KEY`
    - Value: Your Gemini API key
    - Check "Encrypt" to keep it secure
11. Save

### 3. Configure Custom Domain (Optional)

If your worker URL is different from `gemini-proxy.adamconner7.workers.dev`:

1. Update the `proxyEndpoint` in these files:
   - `src/services/ai-scenario-enhancer.js`
   - `src/services/ai-summary.js`
   - `src/services/model-trainer.js`
   - `src/services/simulation-sharing.js`

### 4. Test the Worker

```bash
curl -X POST https://gemini-proxy.adamconner7.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Say hello!"}]
    }]
  }'
```

You should get a response with generated text from Gemini.

## Troubleshooting

- **ERR_NETWORK_CHANGED**: Worker not deployed or URL incorrect
- **API key not configured**: Add `GEMINI_API_KEY` environment variable
- **403 Forbidden**: Check Gemini API key is valid and has quota
- **CORS errors**: Make sure worker returns proper CORS headers

## Cost

Google Gemini offers a free tier with generous limits:
- 15 requests per minute
- 1 million tokens per minute
- 1,500 requests per day

For most usage, this should be completely free.
