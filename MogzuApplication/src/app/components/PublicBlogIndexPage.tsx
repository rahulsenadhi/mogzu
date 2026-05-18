// Phase 3 Feature 4 (P3.4) — public blog + announcements index.
//
// Lists blog_post + announcement CMS blocks ordered by effective_at desc.
// Each card links to /p/:slug (existing PublicLandingPage handles detail
// render with JSON-LD Article schema). RSS auto-discovery `<link>` points
// to the Supabase Edge Function feed.

import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Loader2, Rss } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { CmsBlockLive } from '@/lib/cms'

const FUNCTIONS_URL = (import.meta as ImportMeta & { env: Record<string, string> })
  .env.VITE_SUPABASE_FUNCTIONS_URL
const RSS_HREF = FUNCTIONS_URL
  ? `${FUNCTIONS_URL}/make-server-56765691/rss.xml`
  : '/rss.xml'

function setMeta(title: string, description: string) {
  document.title = `${title} · Mogzu`
  let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (!tag) {
    tag = document.createElement('meta')
    tag.name = 'description'
    document.head.appendChild(tag)
  }
  tag.content = description

  let rss = document.querySelector<HTMLLinkElement>('link[rel="alternate"][type="application/rss+xml"]')
  if (!rss) {
    rss = document.createElement('link')
    rss.rel = 'alternate'
    rss.type = 'application/rss+xml'
    document.head.appendChild(rss)
  }
  rss.title = 'Mogzu — Blog & Announcements'
  rss.href = RSS_HREF
}

export default function PublicBlogIndexPage() {
  const [posts, setPosts] = useState<CmsBlockLive[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setMeta(
      'Blog & Announcements',
      'Mogzu blog posts and product announcements covering corporate events, gifting, and spaces.',
    )
    return () => {
      document.title = 'Mogzu'
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    supabase
      .from('cms_blocks_live')
      .select('*')
      .in('kind', ['blog_post', 'announcement'])
      .order('effective_at', { ascending: false })
      .limit(50)
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) setError(err.message)
        setPosts((data ?? []) as CmsBlockLive[])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-[#0e1e3f]">
            Mogzu
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/explore" className="text-sm font-medium text-slate-600 hover:text-[#0e1e3f]">
              Explore
            </Link>
            <a
              href={RSS_HREF}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Rss className="size-3.5" />
              RSS
            </a>
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
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Blog & Announcements
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Product updates, customer stories, and how-to guides for corporate teams.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
            No posts yet — check back soon.
          </div>
        )}

        <ul className="grid gap-6 sm:grid-cols-2">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                to={`/p/${p.slug}`}
                className="block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
              >
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt=""
                    className="aspect-[16/9] w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#2563eb]">
                    <span>{p.kind === 'announcement' ? 'Announcement' : 'Blog'}</span>
                    <span className="text-slate-300">·</span>
                    <time dateTime={p.effective_at} className="text-slate-500">
                      {new Date(p.effective_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {p.title ?? p.slug}
                  </h2>
                  {p.body && (
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                      {p.body}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-slate-500">
          © Mogzu — corporate events, gifting, spaces.
        </div>
      </footer>
    </div>
  )
}
