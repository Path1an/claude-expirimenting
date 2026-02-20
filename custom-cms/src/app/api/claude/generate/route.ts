import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/claude';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validContexts = ['page', 'post', 'product'] as const;
  if (!body.prompt || !validContexts.includes(body.context)) {
    return NextResponse.json({ error: 'prompt is required and context must be page, post, or product' }, { status: 400 });
  }
  const content = await generateContent(body.prompt, body.context);
  return NextResponse.json({ content });
}
