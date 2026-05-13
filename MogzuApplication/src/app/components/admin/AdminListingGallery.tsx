import { useState } from 'react';

export default function AdminListingGallery({ images, title }: { images: string[]; title: string }) {
  const [ix, setIx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const main = images[ix] ?? images[0];
  if (!main) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 aspect-[21/9] flex items-center justify-center text-sm text-slate-500">
        No images
      </div>
    );
  }

  const openLb = (i: number) => {
    setIx(i);
    setLightbox(true);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => openLb(ix)}
        className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-[21/9] block text-left"
        aria-label={`Open image gallery for ${title}`}
      >
        <img src={main} alt="" className="h-full w-full object-cover" />
      </button>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIx(i)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === ix ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20' : 'border-slate-200'
              }`}
              aria-label={`Thumbnail ${i + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white z-10"
            onClick={() => setLightbox(false)}
            aria-label="Close lightbox"
          >
            ✕
          </button>
          <button
            type="button"
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIx((p) => (p - 1 + images.length) % images.length);
            }}
            aria-label="Previous image"
          >
            ‹
          </button>
          <img
            src={images[ix] ?? main}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIx((p) => (p + 1) % images.length);
            }}
            aria-label="Next image"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
