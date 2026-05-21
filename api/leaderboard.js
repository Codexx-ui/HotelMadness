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
        .limit(1000);

      if (error) {
        throw error;
      }

      // Deduplicate by nickname and role, keeping the highest score
      const uniqueMap = new Map();
      const motdEntries = [];

      for (const entry of data) {
        if (entry.nickname === '__MOTD__') {
          motdEntries.push(entry);
          continue;
        }

        const nicknameKey = (entry.nickname || '').trim().toLowerCase();
        const roleKey = (entry.role || '').trim().toLowerCase();
        const key = `${nicknameKey}_${roleKey}`;

        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, entry);
        } else {
          // Compare and keep the better score
          const existing = uniqueMap.get(key);
          const currentSeason = entry.season || 1;
          const existingSeason = existing.season || 1;
          
          let isCurrentBetter = false;
          if (currentSeason > existingSeason) {
            isCurrentBetter = true;
          } else if (currentSeason === existingSeason) {
            const currentTurns = entry.turns || 0;
            const existingTurns = existing.turns || 0;
            if (currentTurns > existingTurns) {
              isCurrentBetter = true;
            } else if (currentTurns === existingTurns) {
              const currentCash = entry.cash || 0;
              const existingCash = existing.cash || 0;
              if (currentCash > existingCash) {
                isCurrentBetter = true;
              }
            }
          }

          if (isCurrentBetter) {
            uniqueMap.set(key, entry);
          }
        }
      }

      const deduplicated = [...uniqueMap.values()];
      deduplicated.sort((a, b) => {
        const seasonA = a.season || 1;
        const seasonB = b.season || 1;
        if (seasonB !== seasonA) return seasonB - seasonA;

        const turnsA = a.turns || 0;
        const turnsB = b.turns || 0;
        if (turnsB !== turnsA) return turnsB - turnsA;

        const cashA = a.cash || 0;
        const cashB = b.cash || 0;
        return cashB - cashA;
      });

      const finalScores = [...motdEntries, ...deduplicated];

      return res.status(200).json({ success: true, scores: finalScores });
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


  if (req.method === 'DELETE') {
    try {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'ID is required to delete' });
      }

      const { error } = await supabase.from('leaderboard').delete().eq('id', id);
      if (error) {
        throw error;
      }

      return res.status(200).json({ success: true, deleted_id: id });
    } catch (err) {
      console.error('Supabase delete failed:', err.message);
      return res.status(500).json({ error: 'Failed to delete score: ' + err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });

}
