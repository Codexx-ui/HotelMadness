// api/leaderboard.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing Supabase keys.' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('season', { ascending: false })
        .order('turns', { ascending: false })
        .order('cash', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return res.status(200).json({ success: true, scores: data });
    } catch (err) {
      console.warn('Supabase fetch failed, returning empty list:', err.message);
      // Return empty list so the client can fallback gracefully
      return res.status(200).json({ success: true, scores: [], warning: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nickname, role, turns, season, cash, tips, difficulty, status } = req.body;

      if (!nickname) {
        return res.status(400).json({ error: 'Nickname is required' });
      }

      const { data, error } = await supabase
        .from('leaderboard')
        .insert([{
          nickname: nickname.substring(0, 20),
          role: role || '—',
          turns: parseInt(turns) || 0,
          season: parseInt(season) || 1,
          cash: parseInt(cash) || 0,
          tips: parseInt(tips) || 0,
          difficulty: difficulty || 'Normal',
          status: status || 'Unknown',
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        throw error;
      }

      return res.status(200).json({ success: true, score: data[0] });
    } catch (err) {
      console.error('Supabase insert failed:', err.message);
      return res.status(500).json({ error: 'Failed to insert score: ' + err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
