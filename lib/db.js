import { sql } from '@vercel/postgres';

// Ensure table exists (idempotent)
export async function ensurePeopleTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS people (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      active BOOLEAN NOT NULL DEFAULT true,
      roles TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
}

export { sql };
