import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import type { ClientLogoItem } from '@/app/lib/marketingClients'
import { logoSizeClassesForSlug } from '@/app/lib/clientLogoAssets'

type Props = {
  clients: ClientLogoItem[]
  title?: string
  subtitle?: string
}

function LogoTile({ client, variant = 'marquee' }: { client: ClientLogoItem; variant?: 'marquee' | 'grid' }) {
  const sizeClasses = logoSizeClassesForSlug(client.id)

  const logo = client.logoUrl ? (
    <img
      src={client.logoUrl}
      alt=""
      aria-hidden
      className={`${sizeClasses} w-auto object-contain`}
      loading="lazy"
      decoding="async"
    />
  ) : (
    <span className="text-center text-base font-black tracking-tight text-[#0e1e3f] leading-tight">
      {client.name}
    </span>
  )

  const sizeClass =
    variant === 'grid'
      ? 'h-36 w-full'
      : 'h-36 w-[270px] flex-shrink-0'

  const className = `group/logo flex ${sizeClass} items-center justify-center rounded-2xl border-3 border-black bg-white px-8 py-5 shadow-[6px_6px_0_0_#15D39D] transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#15D39D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#15D39D]`

  if (client.href) {
    return (
      <a
        href={client.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={`${client.name} — Mogzu client`}
      >
        {logo}
      </a>
    )
  }

  return (
    <div className={className} role="img" aria-label={client.name}>
      {logo}
    </div>
  )
}

export function ClientLogoScroller({ clients, title, subtitle }: Props) {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  if (clients.length === 0) return null

  const headline = title ?? 'Trusted by leading corporates'
  const track = reduceMotion ? clients : [...clients, ...clients]

  return (
    <section
      className="relative overflow-hidden border-y-3 border-black bg-[#0e1e3f] py-20 md:py-24"
      aria-label="Clients who use Mogzu"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(21,211,157,0.14),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#15D39D]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-xl border-3 border-black bg-[#15D39D] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#0e1e3f] shadow-[3px_3px_0_0_#000]">
            <Building2 className="size-4" aria-hidden />
            Our clients
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-white md:text-5xl">
            {headline}
          </h2>
          {subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-lg font-bold text-gray-300 md:text-xl">
              {subtitle}
            </p>
          ) : null}
        </div>

        {reduceMotion ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {clients.map((client) => (
              <LogoTile key={client.id} client={client} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="group/marquee relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#0e1e3f] via-[#0e1e3f]/90 to-transparent md:w-28" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#0e1e3f] via-[#0e1e3f]/90 to-transparent md:w-28" />

            <div className="overflow-hidden py-2">
              <div className="animate-client-marquee flex w-max items-center gap-8 py-2 group-hover/marquee:[animation-play-state:paused]">
                {track.map((client, idx) => (
                  <LogoTile key={`${client.id}-${idx}`} client={client} />
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-sm font-bold text-gray-500">
              Hover to pause · Official brand logos
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes client-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-client-marquee {
          animation: client-marquee 55s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-client-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
