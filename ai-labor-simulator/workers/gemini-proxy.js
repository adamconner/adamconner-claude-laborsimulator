/**
 * Cloudflare Worker - Gemini API Proxy + Public Simulation Storage
 *
 * Features:
 * 1. Gemini API proxy with rate limiting (keeps API key secure)
 * 2. Public simulation storage (save/load/list simulations)
 *
 * Endpoints:
 * - POST /              - Gemini API proxy (existing)
 * - POST /simulations   - Save a new simulation
 * - GET /simulations/:id - Load a simulation by ID
 * - GET /simulations    - List recent public simulations
 * - DELETE /simulations/:id - Delete a simulation (with auth)
 *
 * Setup:
 * 1. Environment Variables:
 *    - GEMINI_API_KEY (secret): Your Gemini API key
 *    - ALLOWED_ORIGIN: https://adamconner.github.io
 *    - DAILY_LIMIT: 1000 (AI requests per day)
 *    - SIM_DAILY_LIMIT: 100 (simulation saves per day)
 *
 * 2. KV Namespace Bindings:
 *    - RATE_LIMIT_KV: For rate limiting
 *    - SIMULATIONS_KV: For storing simulations
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Check origin
    const origin = request.headers.get('Origin');
    if (env.ALLOWED_ORIGIN && origin && origin !== env.ALLOWED_ORIGIN) {
      return jsonResponse({ error: 'Unauthorized origin' }, 403, corsHeaders);
    }

    try {
      // Route requests
      if (path === '/' && request.method === 'POST') {
        // Gemini API proxy
        return await handleGeminiProxy(request, env, corsHeaders);
      }

      if (path === '/simulations' && request.method === 'POST') {
        // Save simulation
        return await handleSaveSimulation(request, env, corsHeaders);
      }

      if (path === '/simulations' && request.method === 'GET') {
        // List simulations
        return await handleListSimulations(request, env, corsHeaders);
      }

      if (path.startsWith('/simulations/') && request.method === 'GET') {
        // Load simulation
        const id = path.split('/simulations/')[1];
        return await handleLoadSimulation(id, env, corsHeaders);
      }

      if (path.startsWith('/simulations/') && request.method === 'DELETE') {
        // Delete simulation
        const id = path.split('/simulations/')[1];
        return await handleDeleteSimulation(id, request, env, corsHeaders);
      }

      return jsonResponse({ error: 'Not found' }, 404, corsHeaders);

    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ error: 'Internal server error', message: error.message }, 500, corsHeaders);
    }
  }
};

/**
 * Helper: JSON response
 */
function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

/**
 * Helper: Generate unique ID
 */
function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Helper: Check rate limit
 */
async function checkRateLimit(env, limitKey, dailyLimit) {
  const today = new Date().toISOString().split('T')[0];
  const rateLimitKey = `${limitKey}:${today}`;

  let currentCount = parseInt(await env.RATE_LIMIT_KV.get(rateLimitKey)) || 0;

  if (currentCount >= dailyLimit) {
    return { allowed: false, count: currentCount, limit: dailyLimit };
  }

  await env.RATE_LIMIT_KV.put(rateLimitKey, String(currentCount + 1), {
    expirationTtl: 172800 // 48 hours
  });

  return { allowed: true, count: currentCount + 1, limit: dailyLimit };
}

/**
 * Handle Gemini API proxy requests
 */
async function handleGeminiProxy(request, env, corsHeaders) {
  const dailyLimit = parseInt(env.DAILY_LIMIT) || 1000;
  const rateCheck = await checkRateLimit(env, 'gemini', dailyLimit);

  if (!rateCheck.allowed) {
    return jsonResponse({
      error: 'Daily AI analysis limit reached. Please try again tomorrow.',
      limit: rateCheck.limit,
      used: rateCheck.count
    }, 429, corsHeaders);
  }

  const body = await request.json();
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;

  const geminiResponse = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const geminiData = await geminiResponse.json();

  return jsonResponse({
    ...geminiData,
    _quota: {
      used: rateCheck.count,
      limit: rateCheck.limit,
      remaining: rateCheck.limit - rateCheck.count
    }
  }, geminiResponse.status, corsHeaders);
}

/**
 * Handle saving a simulation
 */
async function handleSaveSimulation(request, env, corsHeaders) {
  // Check if SIMULATIONS_KV is bound
  if (!env.SIMULATIONS_KV) {
    return jsonResponse({ error: 'Simulation storage not configured' }, 503, corsHeaders);
  }

  // Rate limit simulation saves
  const dailyLimit = parseInt(env.SIM_DAILY_LIMIT) || 100;
  const rateCheck = await checkRateLimit(env, 'sim-save', dailyLimit);

  if (!rateCheck.allowed) {
    return jsonResponse({
      error: 'Daily simulation save limit reached. Please try again tomorrow.',
      limit: rateCheck.limit,
      used: rateCheck.count
    }, 429, corsHeaders);
  }

  const body = await request.json();

  // Validate required fields
  if (!body.name || !body.scenario || !body.results) {
    return jsonResponse({ error: 'Missing required fields: name, scenario, results' }, 400, corsHeaders);
  }

  // Generate unique ID
  let id = generateId();
  let attempts = 0;
  while (await env.SIMULATIONS_KV.get(`sim:${id}`) && attempts < 5) {
    id = generateId();
    attempts++;
  }

  // Create simulation record
  const simulation = {
    id,
    name: body.name.substring(0, 100), // Limit name length
    description: (body.description || '').substring(0, 500), // Limit description
    scenario: body.scenario,
    results: body.results,
    summary: body.summary || null,
    createdAt: new Date().toISOString(),
    views: 0
  };

  // Store simulation (expire after 90 days)
  await env.SIMULATIONS_KV.put(`sim:${id}`, JSON.stringify(simulation), {
    expirationTtl: 7776000 // 90 days
  });

  // Add to recent list
  await addToRecentList(env, id, simulation.name, simulation.createdAt);

  return jsonResponse({
    success: true,
    id,
    url: `${env.ALLOWED_ORIGIN}/ai-labor-simulator/?sim=${id}`,
    expiresIn: '90 days'
  }, 201, corsHeaders);
}

/**
 * Handle loading a simulation
 */
async function handleLoadSimulation(id, env, corsHeaders) {
  if (!env.SIMULATIONS_KV) {
    return jsonResponse({ error: 'Simulation storage not configured' }, 503, corsHeaders);
  }

  const data = await env.SIMULATIONS_KV.get(`sim:${id}`);

  if (!data) {
    return jsonResponse({ error: 'Simulation not found' }, 404, corsHeaders);
  }

  const simulation = JSON.parse(data);

  // Increment view count
  simulation.views = (simulation.views || 0) + 1;
  await env.SIMULATIONS_KV.put(`sim:${id}`, JSON.stringify(simulation), {
    expirationTtl: 7776000 // Refresh expiration
  });

  return jsonResponse(simulation, 200, corsHeaders);
}

/**
 * Handle listing recent simulations
 */
async function handleListSimulations(request, env, corsHeaders) {
  if (!env.SIMULATIONS_KV) {
    return jsonResponse({ error: 'Simulation storage not configured' }, 503, corsHeaders);
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 50);

  // Get recent list
  const recentData = await env.SIMULATIONS_KV.get('recent-simulations');
  const recent = recentData ? JSON.parse(recentData) : [];

  return jsonResponse({
    simulations: recent.slice(0, limit),
    total: recent.length
  }, 200, corsHeaders);
}

/**
 * Handle deleting a simulation (requires matching delete key)
 */
async function handleDeleteSimulation(id, request, env, corsHeaders) {
  if (!env.SIMULATIONS_KV) {
    return jsonResponse({ error: 'Simulation storage not configured' }, 503, corsHeaders);
  }

  // For now, only allow deletion via admin key
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_KEY}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  await env.SIMULATIONS_KV.delete(`sim:${id}`);
  await removeFromRecentList(env, id);

  return jsonResponse({ success: true }, 200, corsHeaders);
}

/**
 * Helper: Add simulation to recent list
 */
async function addToRecentList(env, id, name, createdAt) {
  const recentData = await env.SIMULATIONS_KV.get('recent-simulations');
  const recent = recentData ? JSON.parse(recentData) : [];

  // Add to front
  recent.unshift({ id, name, createdAt });

  // Keep only last 100
  const trimmed = recent.slice(0, 100);

  await env.SIMULATIONS_KV.put('recent-simulations', JSON.stringify(trimmed));
}

/**
 * Helper: Remove simulation from recent list
 */
async function removeFromRecentList(env, id) {
  const recentData = await env.SIMULATIONS_KV.get('recent-simulations');
  if (!recentData) return;

  const recent = JSON.parse(recentData);
  const filtered = recent.filter(s => s.id !== id);

  await env.SIMULATIONS_KV.put('recent-simulations', JSON.stringify(filtered));
}
