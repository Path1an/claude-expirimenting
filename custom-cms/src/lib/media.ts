import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { db } from '@/db';
import { media, type NewMedia } from '@/db/schema';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function saveUpload(file: File, alt?: string) {
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
