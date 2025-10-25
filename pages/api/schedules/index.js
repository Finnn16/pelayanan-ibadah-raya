import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const schedules = await prisma.schedule.findMany({
        orderBy: { date: 'asc' },
      });
      return res.status(200).json({ data: schedules });
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { date, section, wl, singer, musik, tari } = req.body;

      if (!date || !section) {
        return res.status(400).json({ error: 'date and section are required' });
      }

      const schedule = await prisma.schedule.upsert({
        where: { date_section: { date, section } },
        update: { wl, singer, musik, tari, updatedAt: new Date() },
        create: { date, section, wl, singer, musik, tari },
      });

      return res.status(200).json({ data: schedule });
    } catch (error) {
      console.error('Error saving schedule:', error);
      return res.status(500).json({ error: 'Failed to save schedule' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { date, section } = req.body;

      if (!date || !section) {
        return res.status(400).json({ error: 'date and section are required' });
      }

      await prisma.schedule.deleteMany({
        where: { date, section },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return res.status(500).json({ error: 'Failed to delete schedule' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
