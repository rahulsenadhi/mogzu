import { useEffect, useState } from 'react'
import { getLiveBlockBySlug, type CmsBlockLive } from '@/lib/cms'

/** Loads optional published CMS copy for marketing pages (slug matches cms_blocks.slug). */
export function useMarketingCms(slug: string) {
  const [block, setBlock] = useState<CmsBlockLive | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void getLiveBlockBySlug(slug).then(({ data, error: err }) => {
      if (cancelled) return
      setBlock(data)
      setError(err)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  return {
    block,
    fromCms: Boolean(block),
    loading,
    error,
  }
}
