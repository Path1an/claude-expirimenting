import { db } from '@/db';
import { media } from '@/db/schema';
import { desc } from 'drizzle-orm';
import MediaUploader from './MediaUploader';
import MediaGrid from './MediaGrid';

export default async function MediaPage() {
  const files = await db.select().from(media).orderBy(desc(media.createdAt));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Media</h1>
        <p className="text-zinc-500 text-sm mt-1">{files.length} file{files.length !== 1 ? 's' : ''}</p>
      </div>

      <MediaUploader />

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <MediaGrid files={files} />
      </div>
    </div>
  );
}
