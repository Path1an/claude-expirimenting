import { NextRequest, NextResponse } from 'next/server';
import { generateSEO } from '@/lib/claude';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validTypes = ['page', 'post', 'product'] as const;
  if (!body.content || !validTypes.includes(body.contentType)) {
    return NextResponse.json({ error: 'content is required and contentType must be page, post, or product' }, { status: 400 });
  }
  const seo = await generateSEO(body.content, body.contentType);
  return NextResponse.json(seo);
}
