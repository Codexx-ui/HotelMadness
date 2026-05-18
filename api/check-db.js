// api/check-db.js
export default async function handler(req, res) {
  const envKeys = Object.keys(process.env);
  const dbKeys = envKeys.filter(k => k.includes('POSTGRES') || k.includes('DATABASE') || k.includes('DB'));
  return res.status(200).json({ success: true, dbKeys });
}
