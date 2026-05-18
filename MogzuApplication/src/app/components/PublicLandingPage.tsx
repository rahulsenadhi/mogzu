// Phase 3 Feature 2 (P3.2) — public landing page driven by cms_blocks_live.
//
// Route /p/:slug looks up the matching CMS block (kind = hero / promo_banner
// / blog_post / announcement). Emits JSON-LD structured data + manual
// document.title + meta description so the page is SEO-indexable.

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Loader2 } from 'lucide-react'
import { getLiveBlockBySlug, type CmsBlockLive } from '@/lib/cms'

function setMeta(title: string | null, description: string | null) {
  if (title) document.title = `${title} · Mogzu`
  let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (!tag) {
    tag = document.createElement('meta')
    tag.name = 'description'
    document.head.appendChild(tag)
  }
  tag.content = description ?? ''
}

function jsonLdFor(block: CmsBlockLive): Record<string, unknown> {
  switch (block.kind) {
    case 'blog_post':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: block.title,
        articleBody: block.body,
        image: block.image_url ? [block.image_url] : undefined,
        datePublished: block.effective_at,
      }
    case 'promo_banner':
    case 'hero':
    default:
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: block.title,
        description: block.body,
        image: block.image_url ?? undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      }
  }
}

export default function PublicLandingPage() {
  const { slug } = useParams<{ slug: string }>()
  const [block, setBlock] = useState<CmsBlockLive | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    getLiveBlockBySlug(slug).then(({ data, error: err }) => {
      if (cancelled) return
      if (err) setError(err)
      setBlock(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!block) return
    setMeta(block.title, block.body?.slice(0, 160) ?? null)
    return () => {
      // Reset on unmount so other routes get default title.
      document.title = 'Mogzu'
    }
  }, [block])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error || !block) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-lg font-bold text-slate-900">Not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || `No published page at /p/${slug}.`}
          </p>
          <Link
            to="/explore"
            className="mt-4 inline-block rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
          >
            Browse catalogue
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFor(block)) }}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-[#0e1e3f]">
            Mogzu
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/explore" className="text-sm font-medium text-slate-600 hover:text-[#0e1e3f]">
              Explore
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-[#2563eb] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {block.image_url && (
          <img
            src={block.image_url}
            alt=""
            className="mb-8 aspect-[16/9] w-full rounded-2xl object-cover"
          />
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {block.title}
        </h1>
        {block.body && (
          <div className="prose prose-slate mt-6 max-w-none whitespace-pre-wrap text-base text-slate-700">
            {block.body}
          </div>
        )}
        {block.cta_label && block.cta_href && (
          <div className="mt-8">
            <Link
              to={block.cta_href}
              className="inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              {block.cta_label}
            </Link>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-slate-500">
          © Mogzu — corporate events, gifting, spaces.
        </div>
      </footer>
    </div>
  )
}
