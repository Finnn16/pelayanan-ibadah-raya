import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('schedules').select('*').order('tanggal', { ascending: true });
      if (error) throw error;
      return res.status(200).json({ data });
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
        { tanggal, bagian, wl, singer, musik, tari }
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
      const { data, error } = await supabase.from('schedules').update({ tanggal, bagian, wl, singer, musik, tari, updated_at: new Date().toISOString() }).eq('id', id).select();
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
