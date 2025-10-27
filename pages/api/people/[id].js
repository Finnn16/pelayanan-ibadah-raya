import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });

    // Update person
    if (req.method === 'PUT') {
      const { name, active, roles } = req.body || {};
      if (name == null && active == null && roles == null) {
        return res.status(400).json({ ok: false, error: 'No fields to update' });
      }
      const updateData = {};
      if (typeof name === 'string') updateData.name = name;
      if (typeof active === 'boolean') updateData.active = active;
      if (Array.isArray(roles)) updateData.roles = roles;

      const { data, error } = await supabase.from('people').update(updateData).eq('id', Number(id)).select();
      if (error) {
        console.error('Supabase people update error:', error);
        return res.status(500).json({ ok: false, error: error.message });
      }
      return res.status(200).json({ ok: true, data: data[0] });
    }

    // Delete person
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('people').delete().eq('id', Number(id));
      if (error) {
        console.error('Supabase people delete error:', error);
        return res.status(500).json({ ok: false, error: error.message });
      }
      return res.status(204).end();
    }

    res.setHeader('Allow', 'PUT, DELETE');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
