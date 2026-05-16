import { useRef, type ReactNode } from 'react'

const scrollRow = (container: HTMLDivElement | null, direction: 'left' | 'right') => {
  if (!container) return
  container.scrollBy({ left: direction === 'left' ? -240 : 240, behavior: 'smooth' })
}

type HorizontalScrollRowProps = {
  children: ReactNode
  className?: string
}

export const HorizontalScrollRow = ({ children, className = '' }: HorizontalScrollRowProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => scrollRow(scrollRef.current, 'left')}
        className="h-8 w-8 shrink-0 rounded-full border border-slate-300/40 bg-white/70 text-[#475569] backdrop-blur-sm transition-colors hover:border-[#93c5fd] hover:text-[#0e1e3f]"
        aria-label="Scroll left"
      >
        <span className="text-sm">‹</span>
      </button>
      <div
        ref={scrollRef}
        className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scrollRow(scrollRef.current, 'right')}
        className="h-8 w-8 shrink-0 rounded-full border border-slate-300/40 bg-white/70 text-[#475569] backdrop-blur-sm transition-colors hover:border-[#93c5fd] hover:text-[#0e1e3f]"
        aria-label="Scroll right"
      >
        <span className="text-sm">›</span>
      </button>
    </div>
  )
}
