import { sql } from '@vercel/postgres';

const DEFAULTS = [
  'Anggiat','Sorta','Andika','Joshua Sianturi','Sheren','Jeven','Rianida','Egi','Juju','Parlin','July','Aldo','Ay','Sele','Martin','Duma','Sahata','Revi','Johanes','Roni','Adi','Riqfi','Mey','Ayu','Endang','Derric','Boyan','Farren','Beniah','Yoseph','Debo','Renti','Nathan','Marvel','Axel','Andi','Viona','Putri','Vania','Intan','Loide','Marchelia','Ferdinan','Jevin','Asen','Erica','Dennis','Erwin','Petrus','Matthew','Samuel','Lisbet','Paula','Diana','Nelson','Jocelin','Magdalena','Sianturi','Ocep','Imman','Amy','Ria','Rouli','Jeni','Vina','Sondang'
];

async function main() {
  await sql`CREATE TABLE IF NOT EXISTS people (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT true,
    roles TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`;

  for (const name of DEFAULTS) {
    await sql`INSERT INTO people (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING;`;
  }

  const { rows } = await sql`SELECT COUNT(*) FROM people;`;
  console.log('People rows:', rows?.[0]?.count ?? 'unknown');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
