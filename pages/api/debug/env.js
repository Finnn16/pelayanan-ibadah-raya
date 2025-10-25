export default async function handler(req, res) {
  const url = process.env.DATABASE_URL || '';
  const hasDatabaseUrl = Boolean(url);
  const usingDataProxy = url.startsWith('prisma+');
  const isLikelyPostgresDirect = url.startsWith('postgres://');
  res.status(200).json({
    ok: true,
    hasDatabaseUrl,
    usingDataProxy,
    isLikelyPostgresDirect,
    sample: url ? url.slice(0, 24) + '...' : null,
    env: process.env.VERCEL ? 'vercel' : 'local',
  });
}
