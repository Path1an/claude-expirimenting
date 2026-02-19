import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/claude';

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.prompt || !body.context) {
    return NextResponse.json({ error: 'prompt and context are required' }, { status: 400 });
  }
  const content = await generateContent(body.prompt, body.context);
  return NextResponse.json({ content });
}
