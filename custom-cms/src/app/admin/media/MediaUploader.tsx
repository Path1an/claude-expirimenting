'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api-paths';

export default function MediaUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  async function uploadFile(file: File) {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('alt', file.name.replace(/\.[^.]+$/, ''));
      const res = await fetch(API.media, { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(uploadFile);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
        dragOver
          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
          : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900 text-zinc-500'
      }`}
    >
      <input ref={inputRef} type="file" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
      <div className="text-3xl mb-2">⊡</div>
      {uploading ? (
        <p className="text-sm">Uploading…</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <>
          <p className="text-sm font-medium">Drag & drop files here</p>
          <p className="text-xs mt-1 text-zinc-600">or click to select files</p>
        </>
      )}
    </div>
  );
}
