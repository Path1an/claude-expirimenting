import { db } from '@/db';
import { media } from '@/db/schema';
import { desc } from 'drizzle-orm';
import MediaUploader from './MediaUploader';

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
        {files.map((file) => (
          <div key={file.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors group">
            {file.mimeType.startsWith('image/') ? (
              <img src={file.url} alt={file.alt ?? file.filename} className="w-full h-32 object-cover" />
            ) : (
              <div className="w-full h-32 bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs font-mono">
                {file.mimeType.split('/')[1]}
              </div>
            )}
            <div className="p-3">
              <p className="text-xs text-zinc-300 truncate font-medium" title={file.filename}>{file.filename}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              <a href={file.url} target="_blank" rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View ↗</a>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <p className="col-span-full text-center text-zinc-600 py-12">No files uploaded yet</p>
        )}
      </div>
    </div>
  );
}
