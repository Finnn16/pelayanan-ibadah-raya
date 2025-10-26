import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Ambil semua data dari tabel people
    const { data, error } = await supabase.from('people').select('*');
    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }
    res.status(200).json({ ok: true, data });
    return;
  }
  if (req.method === 'POST') {
    // Tambah data baru ke tabel people
    const { name } = req.body;
    const { data, error } = await supabase.from('people').insert([{ name }]);
    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }
    res.status(201).json({ ok: true, data });
    return;
  }
  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}