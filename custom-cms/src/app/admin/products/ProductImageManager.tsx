'use client';
import { useEffect, useState, useCallback } from 'react';

interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  sortOrder: number;
}

interface MediaItem {
  id: number;
  url: string;
  alt: string | null;
  mimeType: string;
  filename: string;
}

export default function ProductImageManager({ productId }: { productId: number }) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    const res = await fetch(`/api/products/${productId}/images`);
    if (res.ok) setImages(await res.json());
  }, [productId]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  useEffect(() => {
    if (!pickerOpen || mediaList.length > 0) return;
    fetch('/api/media').then(r => r.json()).then(setMediaList);
  }, [pickerOpen, mediaList.length]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPickerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pickerOpen]);

  async function handleAdd(mediaId: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to add image');
        return;
      }
      await fetchImages();
      setPickerOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(imageId: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/images/${imageId}`, { method: 'DELETE' });
      if (!res.ok) {
        setError('Failed to remove image');
        return;
      }
      await fetchImages();
    } finally {
      setLoading(false);
    }
  }

  const imageMedia = mediaList.filter(m => m.mimeType.startsWith('image/'));

  return (
    <div className="mt-6 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-300">Product Images</h3>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          + Add image
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-3">{error}</p>
      )}

      {images.length === 0 ? (
        <p className="text-zinc-600 text-xs py-4 text-center">No images yet</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {images.map(img => (
            <div key={img.id} className="relative group w-20 h-20 rounded-md overflow-hidden border border-zinc-700 bg-zinc-900 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt ?? ''} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(img.id)}
                disabled={loading}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 disabled:opacity-50"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h4 className="text-sm font-medium text-zinc-200">Select an image</h4>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              {imageMedia.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-8">
                  No images in media library.{' '}
                  <a href="/admin/media" className="underline hover:text-zinc-300">Upload one first.</a>
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {imageMedia.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleAdd(m.id)}
                      disabled={loading}
                      className="group relative rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800 aspect-square hover:border-indigo-500 transition-colors disabled:opacity-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt={m.alt ?? m.filename} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
