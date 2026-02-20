import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { db } from '@/db';
import { media, type NewMedia } from '@/db/schema';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm',
  'application/pdf',
]);

export async function saveUpload(file: File, alt?: string) {
  if (file.size > MAX_SIZE) {
    throw Object.assign(new Error('File exceeds 10 MB limit'), { status: 413 });
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw Object.assign(new Error('File type not allowed'), { status: 415 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name);
  const storedName = `${randomUUID()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const record: NewMedia = {
    filename:  file.name,
    storedName,
    mimeType:  file.type,
    size:      file.size,
    url:       `/uploads/${storedName}`,
    alt:       alt ?? null,
  };

  const [inserted] = await db.insert(media).values(record).returning();
  return inserted;
}
