import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });

    if (req.method === 'PUT') {
      const { name, active, roles } = req.body || {};
      if (name == null && active == null && roles == null) {
        return res.status(400).json({ ok: false, error: 'No fields to update' });
      }
      const updated = await prisma.person.update({
        where: { id: Number(id) },
        data: {
          ...(typeof name === 'string' ? { name } : {}),
          ...(typeof active === 'boolean' ? { active } : {}),
          ...(Array.isArray(roles) ? { tags: roles.map(String) } : {}),
        },
        select: { id: true, name: true, active: true, tags: true },
      });
      return res.status(200).json({ ok: true, data: updated });
    }

    if (req.method === 'DELETE') {
      await prisma.person.delete({ where: { id: Number(id) } });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'PUT, DELETE');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
