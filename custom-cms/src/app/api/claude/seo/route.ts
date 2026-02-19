import { NextRequest, NextResponse } from 'next/server';
import { generateSEO } from '@/lib/claude';

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.content || !body.contentType) {
    return NextResponse.json({ error: 'content and contentType are required' }, { status: 400 });
  }
  const seo = await generateSEO(body.content, body.contentType);
  return NextResponse.json(seo);
}
