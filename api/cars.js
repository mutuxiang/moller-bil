export default async function handler(req, res) {
  const { offset = 0, limit = 15 } = req.query;
  const url = `https://www.bruktbil.no/api/cars?offset=${offset}&limit=${limit}`;

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Upstream error' });
    }
    const data = await upstream.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
