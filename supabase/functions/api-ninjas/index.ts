// PULSE — secure proxy for the API Ninjas Health/Wellness APIs.
//
// The API Ninjas key lives ONLY here as a Supabase secret (API_NINJAS_KEY),
// never in the browser bundle. The function adds CORS so the web app can call
// it, and only forwards a whitelist of fitness endpoints.
//
// Deploy:   supabase functions deploy api-ninjas
// Secret:   supabase secrets set API_NINJAS_KEY=your_key_here
//
// (You can also do both from the Supabase dashboard — see the app README.)

const ALLOWED = new Set(['exercises', 'nutrition', 'caloriesburned', 'recipe'])

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

// @ts-ignore - Deno global is provided by the Supabase Edge runtime
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405)

  let body: { endpoint?: string; params?: Record<string, string | number> }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const endpoint = String(body.endpoint || '')
  if (!ALLOWED.has(endpoint)) return json({ error: `Endpoint "${endpoint}" not allowed` }, 400)

  // @ts-ignore - Deno global
  const key = Deno.env.get('API_NINJAS_KEY')
  if (!key) return json({ error: 'API_NINJAS_KEY secret is not set on the server' }, 500)

  const params = body.params || {}
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  ).toString()

  try {
    const upstream = await fetch(`https://api.api-ninjas.com/v1/${endpoint}?${qs}`, {
      headers: { 'X-Api-Key': key },
    })
    const text = await upstream.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = { error: text } }
    return json(data, upstream.status)
  } catch (e) {
    return json({ error: String(e) }, 502)
  }
})
