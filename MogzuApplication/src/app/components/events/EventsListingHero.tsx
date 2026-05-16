import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ImageWithFallback } from '../figma/ImageWithFallback'

export type EventsHeroSlide = {
  title: string
  chip: string
  subtitle: string
  cta: string
  image: string
  onCtaClick: () => void
}

type EventsListingHeroProps = {
  slides: EventsHeroSlide[]
}

export const EventsListingHero = ({ slides }: EventsListingHeroProps) => {
  const [slide, setSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered || slides.length <= 1) return
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000)
    return () => window.clearInterval(timer)
  }, [isHovered, slides.length])

  if (slides.length === 0) return null

  return (
    <div
      className="group relative mb-6 h-[200px] overflow-hidden rounded-3xl border border-white/60 bg-white/45 shadow-[0_18px_40px_rgba(37,99,235,0.18)] backdrop-blur-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((item, idx) => (
        <div
          key={`${item.title}-${idx}`}
          className={`absolute inset-0 transition-opacity duration-500 ${slide === idx ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#ebf1ff_0%,#f5f8ff_45%,#e9efff_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(67,121,238,0.08)_0%,rgba(67,121,238,0)_65%)]" />
          <div className="relative flex h-[200px]">
            <div className="flex w-[55%] flex-col justify-center px-8 py-6">
              <div className="mb-3 inline-flex w-fit items-center rounded-full bg-[#ebf1ff] px-2.5 py-1 text-[12px] font-medium text-[#475569]">
                {item.chip}
              </div>
              <h2 className="line-clamp-2 text-[24px] font-bold leading-tight text-[#0e1e3f]">{item.title}</h2>
              <p className="mb-5 mt-2 max-w-[380px] text-[14px] leading-[1.6] text-[#64748b]">{item.subtitle}</p>
              <button
                type="button"
                onClick={item.onCtaClick}
                className="h-11 w-fit rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] px-6 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {item.cta}
              </button>
            </div>
            <div className="relative w-[45%] overflow-hidden">
              <ImageWithFallback src={item.image} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => setSlide((s) => (s - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-white"
          >
            <ChevronLeft className="h-[18px] w-[18px] text-[#2563eb]" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setSlide((s) => (s + 1) % slides.length)}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-white"
          >
            <ChevronRight className="h-[18px] w-[18px] text-[#2563eb]" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`transition-all duration-300 ease-in-out ${slide === i ? 'h-2 w-6 rounded-full bg-[#4379ee]' : 'h-2 w-2 rounded-full bg-[#d1d5db]'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
