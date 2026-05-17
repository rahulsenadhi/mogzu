// Storage service — never call supabase.storage.* directly in components.

import { supabase } from './supabase'

// Bucket names — must match buckets created in Supabase dashboard
export const BUCKETS = {
  VENDOR_IMAGES: 'vendor-images',
  GIFT_IMAGES: 'gift-images',
  SPACE_IMAGES: 'space-images',
  LOGO_UPLOADS: 'logo-uploads',
  DOCUMENTS: 'documents',
} as const

type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS]

function getPublicUrl(bucket: BucketName, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

async function upload(
  bucket: BucketName,
  path: string,
  file: File,
  options?: { upsert?: boolean },
): Promise<{ url: string; path: string; error: string | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: options?.upsert ?? false,
      contentType: file.type,
    })

  if (error) return { url: '', path: '', error: error.message }
  const url = getPublicUrl(bucket, data.path)
  return { url, path: data.path, error: null }
}

async function remove(bucket: BucketName, paths: string[]): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(bucket).remove(paths)
  return { error: error?.message ?? null }
}

// ─── Domain-specific helpers ──────────────────────────────────────────────────

export const storageService = {
  listingImages: {
    upload: (vendorId: string, listingId: string, file: File) => {
      const ext = file.name.split('.').pop()
      const path = `${vendorId}/${listingId}/${Date.now()}.${ext}`
      return upload(BUCKETS.VENDOR_IMAGES, path, file)
    },
    getUrl: (path: string) => getPublicUrl(BUCKETS.VENDOR_IMAGES, path),
    delete: (paths: string[]) => remove(BUCKETS.VENDOR_IMAGES, paths),
  },

  giftImages: {
    upload: (vendorId: string, productId: string, file: File) => {
      const ext = file.name.split('.').pop()
      const path = `${vendorId}/${productId}/${Date.now()}.${ext}`
      return upload(BUCKETS.GIFT_IMAGES, path, file)
    },
    getUrl: (path: string) => getPublicUrl(BUCKETS.GIFT_IMAGES, path),
    delete: (paths: string[]) => remove(BUCKETS.GIFT_IMAGES, paths),
  },

  spaceImages: {
    upload: (vendorId: string, spaceId: string, file: File) => {
      const ext = file.name.split('.').pop()
      const path = `${vendorId}/${spaceId}/${Date.now()}.${ext}`
      return upload(BUCKETS.SPACE_IMAGES, path, file)
    },
    getUrl: (path: string) => getPublicUrl(BUCKETS.SPACE_IMAGES, path),
    delete: (paths: string[]) => remove(BUCKETS.SPACE_IMAGES, paths),
  },

  logos: {
    upload: (entityId: string, file: File) => {
      const ext = file.name.split('.').pop()
      const path = `${entityId}/logo.${ext}`
      return upload(BUCKETS.LOGO_UPLOADS, path, file, { upsert: true })
    },
    getUrl: (path: string) => getPublicUrl(BUCKETS.LOGO_UPLOADS, path),
  },

  documents: {
    upload: (contextId: string, file: File) => {
      const ext = file.name.split('.').pop()
      const path = `${contextId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}.${ext}`
      return upload(BUCKETS.DOCUMENTS, path, file)
    },
    getUrl: (path: string) => getPublicUrl(BUCKETS.DOCUMENTS, path),
    delete: (paths: string[]) => remove(BUCKETS.DOCUMENTS, paths),
  },

  // Phase 2 Feature 2 — booking proof photos. Reuses the space-images
  // bucket; path namespace booking-proof/<booking>/<stage>/<id>.<ext>
  // keeps proof content separate from listing imagery.
  bookingProof: {
    upload: (bookingId: string, stage: string, file: File) => {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const id = Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      const path = `booking-proof/${bookingId}/${stage}/${id}.${ext}`
      return upload(BUCKETS.SPACE_IMAGES, path, file)
    },
    getUrl: (path: string) => getPublicUrl(BUCKETS.SPACE_IMAGES, path),
  },
}
