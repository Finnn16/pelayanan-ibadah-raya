export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/schedule?order=date.asc`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      if (!response.ok) throw new Error(`Supabase error: ${response.statusText}`);
      const data = await response.json();
      return res.status(200).json({ data });
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { date, section, wl, singer, musik, tari } = req.body;

      if (!date || !section) {
        return res.status(400).json({ error: 'date and section are required' });
      }

      // Check if exists
      const checkResponse = await fetch(
        `${supabaseUrl}/rest/v1/schedule?date=eq.${encodeURIComponent(date)}&section=eq.${encodeURIComponent(section)}`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      const existing = await checkResponse.json();

      let response;
      if (existing && existing.length > 0) {
        // UPDATE
        response = await fetch(`${supabaseUrl}/rest/v1/schedule?date=eq.${encodeURIComponent(date)}&section=eq.${encodeURIComponent(section)}`, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ wl, singer, musik, tari, updated_at: new Date().toISOString() }),
        });
      } else {
        // INSERT
        response = await fetch(`${supabaseUrl}/rest/v1/schedule`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ date, section, wl, singer, musik, tari }),
        });
      }

      if (!response.ok) throw new Error(`Supabase error: ${response.statusText}`);
      const data = await response.json();
      return res.status(200).json({ data: data[0] || data });
    } catch (error) {
      console.error('Error saving schedule:', error);
      return res.status(500).json({ error: 'Failed to save schedule', details: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { date, section } = req.body;

      if (!date || !section) {
        return res.status(400).json({ error: 'date and section are required' });
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/schedule?date=eq.${encodeURIComponent(date)}&section=eq.${encodeURIComponent(section)}`,
        {
          method: 'DELETE',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      if (!response.ok) throw new Error(`Supabase error: ${response.statusText}`);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return res.status(500).json({ error: 'Failed to delete schedule', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
