import type { MouseEvent, ReactNode } from 'react'
import { ImageWithFallback } from '../figma/ImageWithFallback'

type ListingCardImageGalleryProps = {
  images: string[]
  alt: string
  activeIndex: number
  onPrev: (e: MouseEvent<HTMLButtonElement>) => void
  onNext: (e: MouseEvent<HTMLButtonElement>) => void
  className?: string
  children?: ReactNode
}

export const ListingCardImageGallery = ({
  images,
  alt,
  activeIndex,
  onPrev,
  onNext,
  className = '',
  children,
}: ListingCardImageGalleryProps) => {
  const safeIndex = images.length > 0 ? activeIndex % images.length : 0
  const activeSrc = images[safeIndex] ?? images[0] ?? ''

  return (
    <div className={`relative h-52 overflow-hidden ${className}`.trim()}>
      <ImageWithFallback
        src={activeSrc}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label={`Previous image for ${alt}`}
            onClick={onPrev}
            className="absolute left-2.5 top-1/2 z-[5] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#dbe3f2] bg-white/90 text-sm font-bold text-[#334155] shadow-sm hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={`Next image for ${alt}`}
            onClick={onNext}
            className="absolute right-2.5 top-1/2 z-[5] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#dbe3f2] bg-white/90 text-sm font-bold text-[#334155] shadow-sm hover:bg-white"
          >
            ›
          </button>
          <div className="absolute bottom-2.5 left-1/2 z-[5] flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/35 px-2 py-1">
            {images.slice(0, 5).map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1.5 rounded-full transition-all ${dotIdx === safeIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/55'}`}
              />
            ))}
          </div>
        </>
      )}
      {children}
    </div>
  )
}
