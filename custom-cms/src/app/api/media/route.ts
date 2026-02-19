import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { media } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { saveUpload } from '@/lib/media';
import { getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request.headers.get('origin')) });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const results = await db.select().from(media).orderBy(desc(media.createdAt));
  return NextResponse.json(results, { headers: getCorsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }
  const alt = formData.get('alt') as string | undefined;
  const record = await saveUpload(file, alt ?? undefined);
  return NextResponse.json(record, { status: 201 });
}
