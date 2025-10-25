export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${supabaseUrl}/rest/v1/person?active=eq.true&order=name.asc`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      if (!response.ok) throw new Error(`Supabase error: ${response.statusText}`);
      const data = await response.json();
      return res.status(200).json({ ok: true, data });
    }

    if (req.method === 'POST') {
      const body = req.body;
      const names = Array.isArray(body?.names) ? body.names : [];
      if (names.length === 0) {
        return res.status(400).json({ ok: false, error: 'names must be a non-empty array' });
      }

      const records = names
        .map((n) => String(n || '').trim())
        .filter(Boolean)
        .map((name) => ({ name, active: true }));

      const response = await fetch(`${supabaseUrl}/rest/v1/person`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(records),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Supabase error:', error);
        throw new Error(error);
      }

      const data = await response.json();
      return res.status(201).json({ ok: true, data });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error', details: err.message });
  }
}
