// api/clean.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing Supabase keys.' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Delete all records from leaderboard table
    const { data, error } = await supabase
      .from('leaderboard')
      .delete()
      .neq('nickname', 'GM Μουστάκας'); // Keep any entry named GM Μουστάκας if it exists, delete all others

    if (error) {
      throw error;
    }

    return res.status(200).json({ success: true, message: 'Cleaned leaderboard database successfully!', data });
  } catch (err) {
    console.error('Failed to clean leaderboard:', err.message);
    return res.status(500).json({ error: 'Failed to clean leaderboard: ' + err.message });
  }
}
