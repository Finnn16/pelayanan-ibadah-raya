import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const people = await prisma.person.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, active: true, tags: true },
      });
      return res.status(200).json({ ok: true, data: people });
    }

    if (req.method === 'POST') {
      const body = req.body;
      const names = Array.isArray(body?.names) ? body.names : [];
      if (names.length === 0) {
        return res.status(400).json({ ok: false, error: 'names must be a non-empty array' });
      }
      const ops = names
        .map((n) => String(n || '').trim())
        .filter(Boolean)
        .map((name) =>
          prisma.person.upsert({
            where: { name },
            update: {},
            create: { name },
          })
        );
      await Promise.all(ops);
      const people = await prisma.person.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, active: true, tags: true } });
      return res.status(201).json({ ok: true, data: people });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
