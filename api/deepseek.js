export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY not set' });
  }

  const url = 'https://api.deepseek.com/chat/completions';

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
