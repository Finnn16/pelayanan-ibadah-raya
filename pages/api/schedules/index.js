import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('schedules').select('*').order('tanggal', { ascending: true });
      if (error) throw error;
      // Pastikan array tidak null
      const result = (data || []).map(item => ({
        ...item,
        singer: Array.isArray(item.singer) ? item.singer : [],
        musik: Array.isArray(item.musik) ? item.musik : [],
        tari: Array.isArray(item.tari) ? item.tari : [],
      }));
      return res.status(200).json({ data: result });
    } catch (error) {
      console.error('Supabase schedules error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { tanggal, bagian, wl, singer = [], musik = [], tari = [] } = req.body;
      if (!tanggal || !bagian) {
        return res.status(400).json({ error: 'tanggal dan bagian wajib diisi' });
      }
      const { data, error } = await supabase.from('schedules').insert([
        {
          tanggal,
          bagian,
          wl,
          singer: Array.isArray(singer) ? singer : [],
          musik: Array.isArray(musik) ? musik : [],
          tari: Array.isArray(tari) ? tari : [],
        }
      ]).select();
      if (error) throw error;
      return res.status(201).json({ data: data[0] });
    } catch (error) {
      console.error('Supabase schedules error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, tanggal, bagian, wl, singer = [], musik = [], tari = [] } = req.body;
      if (!id) return res.status(400).json({ error: 'id jadwal wajib diisi' });
      const { data, error } = await supabase.from('schedules').update({
        tanggal,
        bagian,
        wl,
        singer: Array.isArray(singer) ? singer : [],
        musik: Array.isArray(musik) ? musik : [],
        tari: Array.isArray(tari) ? tari : [],
        updated_at: new Date().toISOString()
      }).eq('id', id).select();
      if (error) throw error;
      return res.status(200).json({ data: data[0] });
    } catch (error) {
      console.error('Supabase schedules error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id jadwal wajib diisi' });
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Supabase schedules error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
