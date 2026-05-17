// api/load.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

  // Fetch the save file for the logged-in user
  const { data, error } = await supabase
    .from('game_saves')
    .select('nickname, game_state, scene_data, role, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Database Load Error:', error);
    return res.status(500).json({ error: 'Failed to load game state: ' + error.message });
  }

  if (!data) {
    return res.status(404).json({ message: 'No saved game found for this user.' });
  }

  return res.status(200).json({ success: true, save: data });
}
