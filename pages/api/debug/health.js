import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const url = process.env.DATABASE_URL || '';
  const usingDataProxy = url.startsWith('prisma+');
  const hasDbUrl = Boolean(url);

  try {
    const peopleCount = await prisma.person.count();
    const scheduleCount = await prisma.schedule.count().catch(() => null);
    return res.status(200).json({
      ok: true,
      hasDatabaseUrl: hasDbUrl,
      usingDataProxy,
      peopleCount,
      scheduleCount,
      env: process.env.VERCEL ? 'vercel' : 'local',
    });
  } catch (err) {
    // Return safe error info (no secrets)
    return res.status(500).json({
      ok: false,
      hasDatabaseUrl: hasDbUrl,
      usingDataProxy,
      error: {
        name: err?.name || 'Error',
        code: err?.code || err?.errorCode || null,
        message: err?.message?.slice(0, 200) || 'Unknown error',
      },
    });
  }
}
