import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback'

export type GalleryVideo = {
  url: string
  /** Thumbnail shown in the strip; falls back to the first image. */
  poster?: string
  label?: string
}

interface MediaGalleryProps {
  images: string[]
  videos?: GalleryVideo[]
  alt?: string
  className?: string
  /** Notified with the active image index (e.g. to drive a branding overlay). */
  onActiveImageChange?: (index: number) => void
}

/** youtube/vimeo watch URL → embed URL; null = treat as a direct video file. */
function toEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`
  return null
}

/**
 * Reusable product media gallery: a swipeable image scroller (Embla) with
 * arrows + dots + thumbnail strip, plus an optional video lightbox supporting
 * direct files and YouTube/Vimeo embeds. Video UI only renders when `videos`
 * are supplied, so it's a no-op for image-only listings.
 */
export function MediaGallery({
  images,
  videos = [],
  alt = '',
  className = '',
  onActiveImageChange,
}: MediaGalleryProps) {
  const safeImages = images.length > 0 ? images : ['']
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: safeImages.length > 1 })
  const [selected, setSelected] = useState(0)
  const [lightbox, setLightbox] = useState<GalleryVideo | null>(null)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const i = emblaApi.selectedScrollSnap()
    setSelected(i)
    onActiveImageChange?.(i)
  }, [emblaApi, onActiveImageChange])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox])

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  return (
    <div className={className}>
      {/* Main scroller */}
      <div className="relative">
        <div className="overflow-hidden rounded-lg bg-white" ref={emblaRef}>
          <div className="flex">
            {safeImages.map((img, i) => (
              <div className="min-w-0 flex-[0_0_100%]" key={`slide-${i}`}>
                <ImageWithFallback src={img} alt={`${alt} image ${i + 1}`} className="h-72 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
            >
              <ChevronLeft className="size-5 text-[#2563eb]" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
            >
              <ChevronRight className="size-5 text-[#2563eb]" aria-hidden />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {safeImages.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  type="button"
                  aria-label={`Go to image ${i + 1}`}
                  onClick={() => scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all ${selected === i ? 'w-5 bg-[#2563eb]' : 'w-1.5 bg-white/80'}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {/* Thumbnail strip: images + video posters */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {safeImages.map((img, i) => (
          <button
            key={`thumb-${i}`}
            type="button"
            aria-label={`Show image ${i + 1}`}
            onClick={() => scrollTo(i)}
            className={`shrink-0 overflow-hidden rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] ${
              selected === i ? 'ring-2 ring-[#2563eb]' : 'ring-1 ring-slate-200'
            }`}
          >
            <ImageWithFallback src={img} alt="" className="h-16 w-16 object-cover" />
          </button>
        ))}
        {videos.map((v, i) => (
          <button
            key={`video-${i}`}
            type="button"
            aria-label={v.label ?? `Play video ${i + 1}`}
            onClick={() => setLightbox(v)}
            className="relative shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
          >
            <ImageWithFallback src={v.poster ?? safeImages[0]} alt="" className="h-16 w-16 object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Play className="size-5 text-white" fill="white" aria-hidden />
            </span>
          </button>
        ))}
      </div>

      {/* Video lightbox */}
      {lightbox ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close video"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <X className="size-5" aria-hidden />
          </button>
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const embed = toEmbedUrl(lightbox.url)
              return embed ? (
                <iframe
                  src={embed}
                  title={lightbox.label ?? 'Video'}
                  className="aspect-video w-full rounded-lg"
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <video src={lightbox.url} controls autoPlay className="aspect-video w-full rounded-lg bg-black" />
              )
            })()}
          </div>
        </div>
      ) : null}
    </div>
  )
}
