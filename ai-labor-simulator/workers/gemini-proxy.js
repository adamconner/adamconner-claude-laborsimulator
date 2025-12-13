/**
 * Cloudflare Worker - Gemini API Proxy with Rate Limiting
 *
 * This worker proxies requests to Google's Gemini API while:
 * 1. Keeping your API key secure (server-side)
 * 2. Enforcing daily request limits to control costs
 * 3. Restricting access to your domain only
 *
 * Setup Instructions:
 * 1. Create a Cloudflare account at https://cloudflare.com
 * 2. Go to Workers & Pages > Create Worker
 * 3. Paste this code
 * 4. Go to Settings > Variables > Add:
 *    - GEMINI_API_KEY (secret): Your Gemini API key
 *    - ALLOWED_ORIGIN: https://adamconner.github.io (your GitHub Pages URL)
 *    - DAILY_LIMIT: 1000 (requests per day)
 * 5. Go to Settings > KV Namespace Bindings > Add:
 *    - Variable name: RATE_LIMIT_KV
 *    - Create a new KV namespace called "gemini-rate-limits"
 * 6. Deploy and note your worker URL (e.g., gemini-proxy.yourname.workers.dev)
 */

export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check origin (optional but recommended)
    const origin = request.headers.get('Origin');
    if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) {
      return new Response(JSON.stringify({ error: 'Unauthorized origin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting using KV
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const rateLimitKey = `requests:${today}`;
    const dailyLimit = parseInt(env.DAILY_LIMIT) || 1000;

    try {
      // Get current count
      let currentCount = parseInt(await env.RATE_LIMIT_KV.get(rateLimitKey)) || 0;

      if (currentCount >= dailyLimit) {
        return new Response(JSON.stringify({
          error: 'Daily limit reached. Please try again tomorrow.',
          limit: dailyLimit,
          used: currentCount
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Increment counter (expires after 48 hours to auto-cleanup)
      await env.RATE_LIMIT_KV.put(rateLimitKey, String(currentCount + 1), {
        expirationTtl: 172800 // 48 hours in seconds
      });

      // Get request body
      const body = await request.json();

      // Call Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;

      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const geminiData = await geminiResponse.json();

      // Return response with remaining quota info
      return new Response(JSON.stringify({
        ...geminiData,
        _quota: {
          used: currentCount + 1,
          limit: dailyLimit,
          remaining: dailyLimit - currentCount - 1
        }
      }), {
        status: geminiResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
