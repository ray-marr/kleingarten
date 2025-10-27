"use client";

import Image from "next/image";
import { useState } from "react";

export default function Carousel({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const hasImages = count > 0;

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  if (!hasImages) {
    return (
      <div className="w-full max-w-2xl aspect-video bg-emerald-50 rounded-md flex items-center justify-center text-emerald-700">
        Keine Bilder vorhanden
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative aspect-video bg-black/5 rounded-md overflow-hidden w-2xl"
        style={{ maxWidth: "calc(100vw - 48px)" }}
      >
        <Image
          src={images[index]}
          alt={`${title} Bild ${index + 1}`}
          className="object-contain bg-white"
          sizes="(max-width: 1000px) 1000px, 1000px"
          priority={index === 0}
          fill
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-emerald-900 px-3 py-1 rounded shadow"
              aria-label="Vorheriges Bild"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-emerald-900 px-3 py-1 rounded shadow"
              aria-label="Nächstes Bild"
            >
              ▶
            </button>
          </>
        )}
      </div>
      <div className="mt-2 text-sm text-emerald-900/80 text-center">
        Showing image {index + 1} of {count}
      </div>
    </div>
  );
}
