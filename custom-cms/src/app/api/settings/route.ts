import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { isAuthenticated } from '@/lib/apiAuth';
import { getCorsHeaders, invalidateCorsCache } from '@/lib/cors';
import { SettingsSchema } from '@/lib/schemas';

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
  const parsed = SettingsSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { siteName, siteDescription, logoUrl, socialLinks, corsOrigins } = parsed.data;
  const existing = db.select().from(siteSettings).get();

  const values = {
    siteName:        siteName ?? 'My CMS',
    siteDescription: siteDescription ?? null,
    logoUrl:         logoUrl ?? null,
    socialLinks:     socialLinks != null ? JSON.stringify(socialLinks) : null,
    corsOrigins:     corsOrigins != null ? JSON.stringify(corsOrigins) : null,
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
