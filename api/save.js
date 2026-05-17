// api/save.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing Supabase keys.' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Authenticate user with their token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  const { nickname, gameState, sceneData, role } = req.body;

  // Upsert the save file for the logged-in user
  const { data, error } = await supabase
    .from('game_saves')
    .upsert({
      user_id: user.id,
      nickname,
      game_state: gameState,
      scene_data: sceneData,
      role,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select();

  if (error) {
    console.error('Database Save Error:', error);
    return res.status(500).json({ error: 'Failed to save game state: ' + error.message });
  }

  return res.status(200).json({ success: true, save: data[0] });
}
