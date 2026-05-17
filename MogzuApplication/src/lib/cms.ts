// Phase 2 Feature 8 — CMS service. Admin CRUD + public read helpers.

import { supabase } from './supabase'

export type CmsBlockKind =
  | 'hero'
  | 'feature_card'
  | 'promo_banner'
  | 'blog_post'
  | 'announcement'
  | 'footer_link_group'

export type CmsBlockStatus = 'draft' | 'scheduled' | 'published' | 'archived'

export const CMS_BLOCK_KINDS: { value: CmsBlockKind; label: string; description: string }[] = [
  { value: 'hero', label: 'Hero banner', description: 'Top-of-page banner with headline + CTA' },
  { value: 'feature_card', label: 'Feature card', description: 'Highlight tile (icon + heading + body)' },
  { value: 'promo_banner', label: 'Promo banner', description: 'Landing page promotional strip' },
  { value: 'blog_post', label: 'Blog post', description: 'Long-form post (title + body + cover image)' },
  { value: 'announcement', label: 'Announcement', description: 'Short notice / changelog entry' },
  { value: 'footer_link_group', label: 'Footer link group', description: 'Footer column (heading + link list in payload)' },
]

export type CmsBlock = {
  id: string
  slug: string
  kind: CmsBlockKind
  title: string | null
  body: string | null
  image_path: string | null
  image_url: string | null
  cta_label: string | null
  cta_href: string | null
  payload: Record<string, unknown>
  display_order: number
  status: CmsBlockStatus
  scheduled_publish_at: string | null
  published_at: string | null
  published_by: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type CmsBlockLive = Pick<
  CmsBlock,
  | 'id'
  | 'slug'
  | 'kind'
  | 'title'
  | 'body'
  | 'image_path'
  | 'image_url'
  | 'cta_label'
  | 'cta_href'
  | 'payload'
  | 'display_order'
> & { effective_at: string }

export type CmsBlockUpsert = {
  id?: string
  slug: string
  kind: CmsBlockKind
  title?: string | null
  body?: string | null
  image_path?: string | null
  image_url?: string | null
  cta_label?: string | null
  cta_href?: string | null
  payload?: Record<string, unknown>
  display_order?: number
}

// ─── Public reads ───────────────────────────────────────────────────────────

export async function listLiveBlocks(
  kind?: CmsBlockKind,
): Promise<{ data: CmsBlockLive[]; error: string | null }> {
  let q = supabase
    .from('cms_blocks_live')
    .select('*')
    .order('display_order', { ascending: true })
  if (kind) q = q.eq('kind', kind)
  const { data, error } = await q
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as CmsBlockLive[], error: null }
}

// ─── Admin reads ────────────────────────────────────────────────────────────

export async function listAllBlocks(): Promise<{ data: CmsBlock[]; error: string | null }> {
  const { data, error } = await supabase
    .from('cms_blocks')
    .select('*')
    .order('kind', { ascending: true })
    .order('display_order', { ascending: true })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as CmsBlock[], error: null }
}

// ─── Admin writes ───────────────────────────────────────────────────────────

export async function upsertBlock(
  block: CmsBlockUpsert,
  createdBy: string,
): Promise<{ data: CmsBlock | null; error: string | null }> {
  const row = {
    slug: block.slug,
    kind: block.kind,
    title: block.title ?? null,
    body: block.body ?? null,
    image_path: block.image_path ?? null,
    image_url: block.image_url ?? null,
    cta_label: block.cta_label ?? null,
    cta_href: block.cta_href ?? null,
    payload: block.payload ?? {},
    display_order: block.display_order ?? 0,
  }

  if (block.id) {
    const { data, error } = await supabase
      .from('cms_blocks')
      .update(row)
      .eq('id', block.id)
      .select('*')
      .single()
    if (error) return { data: null, error: error.message }
    return { data: data as CmsBlock, error: null }
  }

  const { data, error } = await supabase
    .from('cms_blocks')
    .insert({ ...row, created_by: createdBy, status: 'draft' })
    .select('*')
    .single()
  if (error) return { data: null, error: error.message }
  return { data: data as CmsBlock, error: null }
}

export async function publishBlock(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('publish_cms_block', { p_id: id })
  return { error: error?.message ?? null }
}

export async function scheduleBlock(
  id: string,
  at: Date,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('schedule_cms_block', {
    p_id: id,
    p_at: at.toISOString(),
  })
  return { error: error?.message ?? null }
}

export async function archiveBlock(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('archive_cms_block', { p_id: id })
  return { error: error?.message ?? null }
}

// ─── Featured listings ──────────────────────────────────────────────────────

export type FeaturedListingSlot = 'homepage_carousel' | 'module_spotlight'

export type FeaturedListing = {
  id: string
  slot: FeaturedListingSlot
  module: string | null
  listing_id: string
  display_order: number
  created_by: string | null
  created_at: string
}

export async function listFeaturedListings(
  slot: FeaturedListingSlot,
  module?: string,
): Promise<{ data: FeaturedListing[]; error: string | null }> {
  let q = supabase
    .from('cms_featured_listings')
    .select('*')
    .eq('slot', slot)
    .order('display_order', { ascending: true })
  if (module) q = q.eq('module', module)
  const { data, error } = await q
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as FeaturedListing[], error: null }
}

export async function addFeaturedListing(
  slot: FeaturedListingSlot,
  listingId: string,
  module: string | null,
  displayOrder: number,
  createdBy: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('cms_featured_listings').insert({
    slot,
    listing_id: listingId,
    module,
    display_order: displayOrder,
    created_by: createdBy,
  })
  return { error: error?.message ?? null }
}

export async function removeFeaturedListing(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('cms_featured_listings').delete().eq('id', id)
  return { error: error?.message ?? null }
}
