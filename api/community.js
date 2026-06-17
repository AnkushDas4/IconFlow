/**
 * Sednicon API - Community Icons
 * GET  /api/community?page=0&sort=latest|likes   → list published icons
 * POST /api/community { iconId }                 → publish icon to community
 */

export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function verifyJWT(token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

async function supabaseQuery(path, method = 'GET', body = null) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : '',
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const json = (data, status = 200) => new Response(JSON.stringify(data), {
    status, headers: { ...CORS, 'Content-Type': 'application/json' },
  });

  try {
    if (request.method === 'GET') {
      const { searchParams } = new URL(request.url);
      const page = Math.max(0, parseInt(searchParams.get('page') || '0'));
      const sort = searchParams.get('sort') === 'likes' ? 'likes' : 'created_at';
      const provider = searchParams.get('provider') || null;
      const q = searchParams.get('q') || null;
      const limit = 24;
      const offset = page * limit;

      let filter = `hidden=eq.false`;
      if (provider) filter += `&provider=eq.${encodeURIComponent(provider)}`;

      let path = `/icons?${filter}&select=id,prompt,svg,color,size,style,provider,model,likes,created_at&order=${sort}.desc&limit=${limit}&offset=${offset}`;

      const icons = await supabaseQuery(path);

      // Client-side prompt search (Supabase free tier doesn't have full-text search)
      const filtered = q
        ? (icons ?? []).filter(i => i.prompt?.toLowerCase().includes(q.toLowerCase()))
        : (icons ?? []);

      return json({ icons: filtered, page, hasMore: (icons?.length ?? 0) === limit });
    }

    if (request.method === 'POST') {
      const auth = request.headers.get('Authorization');
      if (!auth?.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401);

      const user = await verifyJWT(auth.slice(7));
      const { iconId } = await request.json();
      if (!iconId) return json({ error: 'iconId required' }, 400);

      // Verify the icon belongs to this user
      const icons = await supabaseQuery(`/icons?id=eq.${iconId}&user_id=eq.${user.id}&select=id,hidden`);
      if (!icons?.length) return json({ error: 'Icon not found or not owned by you' }, 404);
      if (!icons[0].hidden === false) {
        // Already published (hidden = false means visible to public)
        return json({ published: true, url: `https://sednicon.sednium.com/icon/${iconId}` });
      }

      // Publish: set hidden = false
      await supabaseQuery(`/icons?id=eq.${iconId}`, 'PATCH', { hidden: false });

      return json({ published: true, url: `https://sednicon.sednium.com/icon/${iconId}` });
    }

    return json({ error: 'Method not allowed' }, 405);

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
}
