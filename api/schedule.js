// GET  /api/schedule  -> jadvalni qaytaradi (hamma uchun ochiq)
// PUT  /api/schedule  -> jadvalni saqlaydi (X-Admin-Password sarlavhasi kerak)
const crypto = require('crypto');
const { neon } = require('@neondatabase/serverless');

const DEFAULT = {
  updated: '2026-10-18T09:00:00.000Z',
  slots: [
    { n: 1, s: '8:00', e: '9:20' },
    { n: 2, s: '9:30', e: '10:50' },
    { n: 3, s: '11:00', e: '12:20' },
    { n: 4, s: '13:30', e: '14:50' },
    { n: 5, s: '15:00', e: '16:20' },
    { n: 6, s: '16:30', e: '17:50' },
    { n: 7, s: '18:00', e: '19:20' }
  ],
  days: ['Dushanba', 'Sheshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'],
  lessons: [
    { id: 'l01', day: 3, slot: 6, title: 'Digital Sustainability', kind: '', teacher: 'Urakboyev', room: '238 Lecture Room', groups: ['24-309', '24-310'], color: 4 },
    { id: 'l02', day: 3, slot: 7, title: 'Advanced Programming', kind: 'Practice', teacher: 'Islomboyev Botir', room: '227 Room', groups: ['24-310'], color: 1 },
    { id: 'l03', day: 5, slot: 2, title: 'Internet of Things', kind: '', teacher: 'Rezayei Sardareh', room: '107 Lecture Room', groups: ['24-309', '24-310'], color: 0 },
    { id: 'l04', day: 5, slot: 3, title: 'Internet of Things', kind: '', teacher: 'Rezayei Sardareh', room: '238 Lecture Room', groups: ['24-309', '24-310'], color: 0 },
    { id: 'l05', day: 5, slot: 4, title: 'Advanced Programming', kind: 'Lecture', teacher: 'Islomboyev Botir', room: '133 Lecture Room', groups: ['24-310', '24-311', '24-312'], color: 1 },
    { id: 'l06', day: 5, slot: 5, title: 'Advanced Programming', kind: 'Lecture', teacher: 'Islomboyev Botir', room: '133 Lecture Room', groups: ['24-310', '24-311', '24-312'], color: 1 },
    { id: 'l07', day: 5, slot: 6, title: 'Advanced Programming', kind: 'Practice', teacher: 'Islomboyev Botir', room: '227 Room', groups: ['24-310'], color: 1 },
    { id: 'l08', day: 6, slot: 2, title: 'Risk Analysis and Systems Testing', kind: '', teacher: 'Mazaitov Jamshid', room: '236 Lecture Room', groups: ['24-309', '24-310'], color: 3 },
    { id: 'l09', day: 6, slot: 3, title: 'Advanced Programming', kind: 'Practice', teacher: 'Islomboyev Botir', room: '227 Room', groups: ['24-310'], color: 1 },
    { id: 'l10', day: 6, slot: 4, title: 'Advanced Programming', kind: 'Practice', teacher: 'Islomboyev Botir', room: '227 Room', groups: ['24-310'], color: 1 },
    { id: 'l11', day: 6, slot: 5, title: 'Falsafa', kind: '', teacher: 'Baxranov Lazizjon', room: '323 Lecture Room', groups: ['24-309', '24-310'], color: 2 },
    { id: 'l12', day: 6, slot: 6, title: 'Falsafa', kind: '', teacher: 'Baxranov Lazizjon', room: '323 Lecture Room', groups: ['24-309', '24-310'], color: 2 }
  ]
};

function str(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max);
}

function clean(body) {
  if (!body || !Array.isArray(body.lessons) || body.lessons.length > 200) {
    throw new Error("Jadval ma'lumoti noto'g'ri.");
  }
  const seen = new Set();
  const lessons = body.lessons.map((l, i) => {
    const day = Number(l.day);
    const slot = Number(l.slot);
    if (!Number.isInteger(day) || day < 0 || day > 6 || !Number.isInteger(slot) || slot < 1 || slot > 7) {
      throw new Error("Kun yoki para noto'g'ri.");
    }
    const key = day + '-' + slot;
    if (seen.has(key)) throw new Error('Bir katakda ikkita dars bo\'lishi mumkin emas.');
    seen.add(key);
    const title = str(l.title, 120);
    if (!title) throw new Error('Fan nomi bo\'sh bo\'lmasligi kerak.');
    return {
      id: str(l.id, 40) || 'l' + Date.now().toString(36) + i,
      day,
      slot,
      title,
      kind: ['', 'Lecture', 'Practice'].includes(l.kind) ? l.kind : '',
      teacher: str(l.teacher, 80),
      room: str(l.room, 60),
      groups: (Array.isArray(l.groups) ? l.groups : []).slice(0, 12).map((g) => str(g, 20)).filter(Boolean),
      color: Math.min(7, Math.max(0, Number(l.color) | 0))
    };
  });
  return { updated: new Date().toISOString(), slots: DEFAULT.slots, days: DEFAULT.days, lessons };
}

function passwordOk(given) {
  const real = process.env.ADMIN_PASSWORD || '';
  if (!real || !given) return false;
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(real).digest();
  return crypto.timingSafeEqual(a, b);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (!process.env.DATABASE_URL) {
      res.status(500).json({ error: 'DATABASE_URL sozlanmagan.' });
      return;
    }
    const sql = neon(process.env.DATABASE_URL);
    await sql`CREATE TABLE IF NOT EXISTS schedule (id integer PRIMARY KEY, data jsonb NOT NULL)`;

    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM schedule WHERE id = 1`;
      if (rows.length) {
        res.status(200).json(rows[0].data);
        return;
      }
      await sql`INSERT INTO schedule (id, data) VALUES (1, ${JSON.stringify(DEFAULT)}::jsonb) ON CONFLICT (id) DO NOTHING`;
      res.status(200).json(DEFAULT);
      return;
    }

    if (req.method === 'PUT') {
      if (!passwordOk(req.headers['x-admin-password'])) {
        res.status(401).json({ error: "Parol noto'g'ri." });
        return;
      }
      let data;
      try {
        data = clean(req.body);
      } catch (e) {
        res.status(400).json({ error: e.message });
        return;
      }
      await sql`INSERT INTO schedule (id, data) VALUES (1, ${JSON.stringify(data)}::jsonb)
                ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
      res.status(200).json(data);
      return;
    }

    res.setHeader('Allow', 'GET, PUT');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server xatosi.' });
  }
};
