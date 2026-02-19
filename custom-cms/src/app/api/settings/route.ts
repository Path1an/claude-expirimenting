import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { isAuthenticated } from '@/lib/apiAuth';
import { getCorsHeaders, invalidateCorsCache } from '@/lib/cors';

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const row = db.select().from(siteSettings).get();
  const data = row ?? { siteName: 'My CMS', siteDescription: null, logoUrl: null, socialLinks: null, corsOrigins: null };
  return NextResponse.json(data, { headers: getCorsHeaders(origin) });
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const existing = db.select().from(siteSettings).get();

  const values = {
    siteName:        body.siteName ?? 'My CMS',
    siteDescription: body.siteDescription ?? null,
    logoUrl:         body.logoUrl ?? null,
    socialLinks:     body.socialLinks != null ? JSON.stringify(body.socialLinks) : null,
    corsOrigins:     Array.isArray(body.corsOrigins) ? JSON.stringify(body.corsOrigins) : null,
    updatedAt:       new Date().toISOString(),
  };

  let result;
  if (existing) {
    const [updated] = await db.update(siteSettings).set(values).returning();
    result = updated;
  } else {
    const [created] = await db.insert(siteSettings).values(values).returning();
    result = created;
  }

  invalidateCorsCache();
  return NextResponse.json(result);
}
