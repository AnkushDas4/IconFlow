/**
 * Sednicon API - The Unified Icon Engine v4
 * Audit fixes: arch-1 (modular), arch-2 (parallel+cache), api-1 (rate-limit),
 *             api-4 (SVG sanitization), api-6 (anon key + RLS)
 */

export const config = { runtime: 'edge' };

// ─── 1. CUSTOM BRAND LIBRARY ────────────────────────────────────────────────
const BRAND_ICONS = {
  google: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.98h5.36c-.28 1.6-1.65 4.38-5.36 4.38-3.23 0-5.85-2.65-5.85-5.96s2.62-5.96 5.85-5.96c1.83 0 3.14.78 3.84 1.44l2.25-2.28C16.7 4.29 14.54 3.5 12.18 3.5c-5.18 0-9.38 4.2-9.38 9.38s4.2 9.38 9.38 9.38c5.4 0 8.98-3.8 8.98-9.14 0-.74-.08-1.42-.16-1.92z"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.17 6 13.54 6c1.14 0 2.32.2 2.32.2v2.55h-1.3c-1.25 0-1.63.77-1.63 1.56V12h2.87l-.46 3h-2.41v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>',
  apple: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.5 1.3 0 2.52.88 3.33.88.82 0 2.37-1.09 3.98-.93 1.12.09 2.15.65 2.72 1.48-2.61 1.35-2.18 5.25.46 6.43-.54 1.57-1.35 3.12-2.6 4.75zM15 5.58c.67-1.15.54-2.73 0-3.58-.8 0-2.07.49-2.75 1.66-.58.98-.44 2.56.03 3.52.74.05 1.99-.5 2.72-1.6z"/></svg>',
  developer: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
};

// ─── 2. ICON SET ROUTING TABLE ───────────────────────────────────────────────
const BRAND_SET = new Set([
  'github','google','apple','microsoft','amazon','meta','twitter','x',
  'linkedin','youtube','netflix','spotify','discord','slack','figma',
  'notion','vercel','docker','kubernetes','android','windows','facebook',
  'instagram','tiktok','whatsapp','telegram','reddit','twitch','stripe',
  'paypal','shopify','wordpress','react','vue','angular','svelte','nextjs',
  'tailwindcss','typescript','javascript','python','rust','golang','kotlin',
  'swift','flutter','firebase','supabase','mongodb','postgresql','mysql',
  'redis','graphql','openai','anthropic','huggingface','cloudflare',
  'netlify','heroku','digitalocean','aws','gcp','azure','npm','github',
  'gitlab','bitbucket','jira','trello','asana','linear','notion',
  'airtable','clickup','zoom','teams','meet','whereby','loom',
]);

// Fallback chain per query type: first hit wins
const FALLBACK_SETS = [
  'material-symbols',
  'lucide',
  'heroicons',
  'tabler',
  'phosphor',
  'mdi',
  'fluent',
  'carbon',
  'ion',
  'feather',
  'simple-icons',
  'game-icons',
  'logos',
  'skill-icons',
  'flat-color-icons',
  'emojione',
];

// [arch-2] Top 3 sets to probe in parallel before falling back to sequential
const PARALLEL_PROBE_SETS = ['material-symbols', 'lucide', 'heroicons'];

const FALLBACK_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>';

// [api-1] Rate limiting — in-memory sliding window per IP
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 120;           // 120 requests per minute per IP
const rateLimitMap = new Map();       // ip → { count, windowStart }

function checkRateLimit(ip) {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);

  if (!entry || (now - entry.windowStart) > RATE_LIMIT_WINDOW_MS) {
    entry = { count: 1, windowStart: now };
    rateLimitMap.set(ip, entry);

    // Evict stale entries periodically (keep map from growing unbounded)
    if (rateLimitMap.size > 10_000) {
      for (const [key, val] of rateLimitMap) {
        if (now - val.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(key);
      }
    }
    return true;
  }

  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// ─── SVG SANITIZER [api-4] ───────────────────────────────────────────────────

// Regex to match javascript: or data: URLs in href/xlink:href
const DANGEROUS_URL_RE = /^(javascript|data|vbscript):/i;

/**
 * Sanitize an SVG string to prevent XSS attacks.
 * Strips: <script>, event handlers (on*), javascript:/data: URLs, foreignObject
 */
function sanitizeSvg(svgString) {
  // Quick check — if there's nothing dangerous, fast-path return
  if (!/<script|<iframe|<object|<embed|<foreignObject| on|javascript:|data:/i.test(svgString)) {
    return svgString;
  }

  let svg = svgString;

  // 1. Remove dangerous tags entirely
  svg = svg.replace(/<script[\s\S]*?<\/script\s*>/gi, '');
  svg = svg.replace(/<iframe[\s\S]*?<\/iframe\s*>/gi, '');
  svg = svg.replace(/<object[\s\S]*?<\/object\s*>/gi, '');
  svg = svg.replace(/<embed[\s\S]*?>/gi, '');
  svg = svg.replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, '');
  svg = svg.replace(/<applet[\s\S]*?<\/applet\s*>/gi, '');
  svg = svg.replace(/<link[\s\S]*?>/gi, '');
  svg = svg.replace(/<meta[\s\S]*?>/gi, '');

  // 2. Remove event handler attributes (onclick, onload, onerror, etc.)
  svg = svg.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // 3. Remove dangerous href/xlink:href values
  svg = svg.replace(/(href|xlink:href)\s*=\s*["']([^"']*)["']/gi, (match, attr, val) => {
    if (DANGEROUS_URL_RE.test(val.trim())) return '';
    return match;
  });

  // 4. Remove style attributes that could contain expressions or url(javascript:)
  svg = svg.replace(/style\s*=\s*["']([^"']*)["']/gi, (match, styleVal) => {
    if (/expression\s*\(|url\s*\(\s*["']?\s*(javascript|data|vbscript):/i.test(styleVal)) return '';
    return match;
  });

  return svg;
}

// ─── LRU CACHE [arch-2] ──────────────────────────────────────────────────────

const MAX_CACHE_SIZE = 2000;
const svgCache = new Map(); // key → { svg, source, timestamp }

function cacheGet(key) {
  const entry = svgCache.get(key);
  if (!entry) return null;
  // Move to end (most recently used) for LRU eviction
  svgCache.delete(key);
  svgCache.set(key, entry);
  return entry;
}

function cacheSet(key, svg, source) {
  if (svgCache.has(key)) svgCache.delete(key);
  svgCache.set(key, { svg, source, timestamp: Date.now() });
  // Evict oldest entries when over limit
  if (svgCache.size > MAX_CACHE_SIZE) {
    const iter = svgCache.keys();
    for (let i = 0; i < svgCache.size - MAX_CACHE_SIZE; i++) {
      svgCache.delete(iter.next().value);
    }
  }
}

// Cache TTL: 1 hour
const CACHE_TTL_MS = 3_600_000;

function cacheGetFresh(key) {
  const entry = cacheGet(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    svgCache.delete(key);
    return null;
  }
  return entry;
}

// ─── MODULAR RESOLVERS [arch-1] ──────────────────────────────────────────────

/** Fetch SVG from Iconify; returns string or null */
async function fetchIconify(prefix, name) {
  try {
    const url = `https://api.iconify.design/${prefix}/${name}.svg`;
    const res = await fetch(url, { headers: { 'Accept': 'image/svg+xml' } });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    // Iconify returns text/html for 404s — reject those
    if (!ct.includes('svg') && !ct.includes('xml') && !ct.includes('plain')) return null;
    const text = await res.text();
    // Extra guard: real SVG starts with < and contains <svg
    if (!text.trim().startsWith('<') || !text.includes('<svg')) return null;
    return text;
  } catch {
    return null;
  }
}

/** [arch-1] Brand Resolver: instant, no network */
function brandResolver(q) {
  if (BRAND_ICONS[q]) return { svg: BRAND_ICONS[q], source: 'custom-brand' };
  return null;
}

/** [arch-1] AI Resolver: fetch from Supabase with anon key + RLS [api-6] */
async function aiResolver(q) {
  if (!q.startsWith('ai:')) return null;
  const iconId = q.slice(3).trim();
  if (!iconId) return null;

  try {
    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/icons?id=eq.${iconId}&select=svg,hidden&limit=1`,
      {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,       // [api-6] anon key, not service key
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows?.[0]?.svg) return null;
    // RLS will enforce: only non-hidden icons visible to anon
    return { svg: sanitizeSvg(rows[0].svg), source: 'ai-generated' }; // [api-4] sanitize
  } catch {
    return null;
  }
}

/** [arch-1] Iconify Resolver: explicit prefix, brand routing, parallel+sequential fallback */
async function iconifyResolver(q, setHint) {
  // ── Explicit prefix in query (e.g. "lucide:home") ──
  if (q.includes(':')) {
    const colonIdx = q.indexOf(':');
    const prefix = q.slice(0, colonIdx);
    const name   = q.slice(colonIdx + 1);
    const svg = await fetchIconify(prefix, name);
    if (svg) return { svg, source: `iconify:${prefix}` };
    return null;
  }

  // ── Explicit ?set= parameter override ──
  if (setHint) {
    const svg = await fetchIconify(setHint, q.replace(/_/g, '-'));
    if (svg) return { svg, source: `iconify:${setHint}` };
  }

  // ── Brand → simple-icons ──
  if (BRAND_SET.has(q)) {
    const svg = await fetchIconify('simple-icons', q);
    if (svg) return { svg, source: 'iconify:simple-icons' };
  }

  // ── [arch-2] Parallel-probe top 3 sets first ──
  const hyphenName = q.replace(/_/g, '-');
  const probeResults = await Promise.all(
    PARALLEL_PROBE_SETS.map(async (prefix) => {
      const svg = await fetchIconify(prefix, hyphenName);
      return svg ? { svg, source: `iconify:${prefix}` } : null;
    })
  );
  const probeHit = probeResults.find(r => r !== null);
  if (probeHit) return probeHit;

  // ── Sequential fallback for remaining sets (skip already-probed) ──
  for (const prefix of FALLBACK_SETS) {
    if (PARALLEL_PROBE_SETS.includes(prefix)) continue; // already tried
    const svg = await fetchIconify(prefix, hyphenName);
    if (svg) return { svg, source: `iconify:${prefix}` };
  }

  // ── Full-text search fallback ──
  const searchResult = await searchIconifyFallback(q.replace(/[-_]/g, ' '));
  if (searchResult) return { svg: searchResult, source: 'iconify:search' };

  return null;
}

/** Last resort: search Iconify's full index for the closest matching icon */
async function searchIconifyFallback(query) {
  try {
    const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=1`);
    if (!res.ok) return null;
    const data = await res.json();
    const icons = data.icons || [];
    if (!icons.length) return null;
    const [prefix, name] = icons[0].split(':');
    return await fetchIconify(prefix, name);
  } catch {
    return null;
  }
}

/** [arch-1] SVG Transformer: apply size & color to a raw SVG string */
function svgTransformer(svgRaw, size, cleanColor) {
  // Strip existing width/height
  let svg = svgRaw
    .replace(/\s+width="[^"]*"/g, '')
    .replace(/\s+height="[^"]*"/g, '');

  // Inject size on root <svg>
  svg = svg.replace(/^<svg/, `<svg width="${size}" height="${size}"`);

  // Replace currentColor
  svg = svg.replace(/currentColor/gi, cleanColor);

  // Replace explicit fills (skip 'none')
  svg = svg.replace(/fill="(?!none\b)[^"]+"/gi, `fill="${cleanColor}"`);

  // Replace explicit strokes (skip 'none')
  svg = svg.replace(/stroke="(?!none\b)[^"]+"/gi, `stroke="${cleanColor}"`);

  // If still no fill attr, add to root
  if (!/fill=/.test(svg)) {
    svg = svg.replace(/^<svg/, `<svg fill="${cleanColor}"`);
  }

  return svg;
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────
export default async function handler(request) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // [api-1] Rate limiting — extract client IP from Vercel headers
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(clientIp)) {
    return new Response(
      '<svg viewBox="0 0 24 24" fill="currentColor"><text x="12" y="16" text-anchor="middle" font-size="10" fill="#ef4444">429</text></svg>',
      {
        status: 429,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Retry-After': '60',
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Window': '60s',
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const q       = (searchParams.get('q') || 'circle').toLowerCase().trim();
  const color   = searchParams.get('color') || 'black';
  const sizeRaw = parseInt(searchParams.get('size') || '24', 10);
  const size    = Number.isFinite(sizeRaw) ? Math.min(2048, Math.max(1, sizeRaw)) : 24;
  const setHint = searchParams.get('set') || null; // optional: ?set=lucide

  // Sanitise color: bare hex → prepend #; reject anything that isn't a hex or CSS color keyword
  const cleanColor = /^[0-9a-fA-F]{3,8}$/.test(color)
    ? `#${color}`
    : /^[a-zA-Z]+$/.test(color) ? color : '#000000';

  // [arch-2] Check LRU cache first
  const cacheKey = `${q}:${cleanColor}:${size}:${setHint || ''}`;
  const cached = cacheGetFresh(cacheKey);
  if (cached) {
    return new Response(cached.svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Vary': 'Accept',
        'X-Sednicon-Source': cached.source,
        'X-Sednicon-Cache': 'HIT',
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Window': '60s',
      },
    });
  }

  // ── Resolve through modular pipeline [arch-1] ──
  let svgRaw = null;
  let source = 'fallback';

  // Strategy 0: AI-generated icon
  const aiResult = await aiResolver(q);
  if (aiResult) {
    svgRaw = aiResult.svg;    // already sanitized inside aiResolver
    source = aiResult.source;
  }

  // Strategy 1: Custom brand library (instant, no network)
  if (!svgRaw) {
    const brandResult = brandResolver(q);
    if (brandResult) {
      svgRaw = brandResult.svg;
      source = brandResult.source;
    }
  }

  // Strategy 2-6: Iconify resolution (parallel + sequential)
  if (!svgRaw) {
    const iconifyResult = await iconifyResolver(q, setHint);
    if (iconifyResult) {
      svgRaw = iconifyResult.svg;
      source = iconifyResult.source;
    }
  }

  // Strategy 7: Hardcoded fallback
  if (!svgRaw) {
    svgRaw = FALLBACK_SVG;
    source = 'generic-fallback';
  }

  // [api-4] Sanitize ALL SVG output (defense-in-depth, even for Brand icons)
  svgRaw = sanitizeSvg(svgRaw);

  // Apply style transforms
  const output = svgTransformer(svgRaw, size, cleanColor);

  // Cache the result [arch-2]
  cacheSet(cacheKey, output, source);

  return new Response(output, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Vary': 'Accept',
      'X-Sednicon-Source': source,
      'X-Sednicon-Cache': 'MISS',
      'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
      'X-RateLimit-Window': '60s',
    },
  });
}
