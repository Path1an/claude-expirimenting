'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MediaFile {
  id: number;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string | null;
}

export default function MediaGrid({ files }: { files: MediaFile[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: number, filename: string) {
    if (!confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    setDeleting(id);
    setError(null);
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setError('Failed to delete file. It may be in use.');
        return;
      }
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  if (files.length === 0) {
    return <p className="col-span-full text-center text-gray-400 dark:text-zinc-600 py-12">No files uploaded yet</p>;
  }

  return (
    <>
      {error && (
        <p className="col-span-full text-red-500 dark:text-red-400 text-sm mb-2">{error}</p>
      )}
      {files.map((file) => (
        <div key={file.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:border-gray-300 dark:hover:border-zinc-700 transition-colors group relative">
          {file.mimeType.startsWith('image/') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.url} alt={file.alt ?? file.filename} className="w-full h-32 object-cover" />
          ) : (
            <div className="w-full h-32 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 text-xs font-mono">
              {file.mimeType.split('/')[1]}
            </div>
          )}
          <button
            onClick={() => handleDelete(file.id, file.filename)}
            disabled={deleting === file.id}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 disabled:opacity-50"
            aria-label="Delete file"
          >
            ×
          </button>
          <div className="p-3">
            <p className="text-xs text-gray-700 dark:text-zinc-300 truncate font-medium" title={file.filename}>{file.filename}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-600 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
            <a href={file.url} target="_blank" rel="noreferrer"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">View ↗</a>
          </div>
        </div>
      ))}
    </>
  );
}
