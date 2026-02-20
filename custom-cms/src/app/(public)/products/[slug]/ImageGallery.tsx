'use client';

import { useState } from 'react';

interface Props {
  images: { url: string; alt: string | null }[];
  productName: string;
}

export default function ImageGallery({ images, productName }: Props) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[selected].url}
        alt={images[selected].alt ?? productName}
        className="w-full rounded-3xl object-cover h-80 lg:h-96 border border-gray-100 dark:border-gray-800 transition-opacity duration-150"
      />
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-colors ${
                i === selected
                  ? 'border-indigo-500'
                  : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt ?? productName} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
