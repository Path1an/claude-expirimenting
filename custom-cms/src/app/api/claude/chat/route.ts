import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/claude';

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  const reply = await chat(body.message, body.history ?? []);
  return NextResponse.json({ reply });
}
