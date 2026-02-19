import { db } from '@/db';
import { siteSettings } from '@/db/schema';

let cachedOrigins: string[] | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60_000;

function getAllowedOrigins(): string[] {
  const now = Date.now();
  if (cachedOrigins !== null && now - cacheTime < CACHE_TTL_MS) return cachedOrigins;

  const row = db.select({ corsOrigins: siteSettings.corsOrigins }).from(siteSettings).get();
  try {
    cachedOrigins = row?.corsOrigins ? JSON.parse(row.corsOrigins) : [];
  } catch {
    cachedOrigins = [];
  }
  cacheTime = now;
  return cachedOrigins!;
}

export function invalidateCorsCache() {
  cachedOrigins = null;
}

export function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  if (!requestOrigin) return {};
  const allowed = getAllowedOrigins();
  if (allowed.length === 0 || !allowed.includes(requestOrigin)) return {};
  return {
    'Access-Control-Allow-Origin': requestOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
