// Phase 2 Feature 4 — Gifting Auto Branding Placement Preview.
//
// Service layer for: uploading a logo, recording placement selections per
// booking, and the admin approval flow. The storage bucket is reused from
// `storageService.logos`; this module only handles the metadata + RPC calls.

import { supabase } from './supabase'
import { storageService } from './storage'

export type PlacementType =
  | 'front_print'
  | 'back_print'
  | 'embossing'
  | 'label'
  | 'sleeve_band'

export type BrandingMethod =
  | 'screen_print'
  | 'digital_print'
  | 'embroidery'
  | 'dtf'
  | 'emboss'
  | 'laser_etch'

export type ApprovalStatus = 'pending' | 'approved' | 'revision_requested'

export const PLACEMENT_OPTIONS: { value: PlacementType; label: string; description: string }[] = [
  { value: 'front_print', label: 'Front Print', description: 'Front-of-garment print panel' },
  { value: 'back_print', label: 'Back Print', description: 'Back-of-garment print panel' },
  { value: 'embossing', label: 'Embossing', description: 'Raised emboss on leather / hard goods' },
  { value: 'label', label: 'Label / Tag', description: 'Inner label or hang-tag' },
  { value: 'sleeve_band', label: 'Sleeve / Band', description: 'Sleeve panel or wrap band' },
]

export type BrandingUpload = {
  id: string
  corporate_id: string
  uploaded_by: string | null
  storage_path: string
  public_url: string
  original_filename: string
  mime_type: string
  file_size_bytes: number | null
  created_at: string
}

export type BrandingSelection = {
  id: string
  booking_id: string
  upload_id: string
  placement_type: PlacementType
  branding_method: BrandingMethod | null
  position_notes: string | null
  approval_status: ApprovalStatus
  revision_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

const ALLOWED_MIME = new Set(['image/png', 'image/svg+xml', 'image/jpeg'])
const MAX_LOGO_BYTES = 5 * 1024 * 1024 // 5 MB

// Map demo position strings (center-chest, sleeve, back, etc.) onto
// the canonical PlacementType the DB CHECK constraint accepts. Lives
// here so it can be unit-tested without importing the BookingFlow.
export function toPlacementType(value: string | undefined | null): PlacementType {
  switch (value) {
    case 'front_print':
    case 'back_print':
    case 'embossing':
    case 'label':
    case 'sleeve_band':
      return value
    case 'back':
      return 'back_print'
    case 'sleeve':
    case 'strap':
    case 'band':
      return 'sleeve_band'
    case 'label_tag':
    case 'cover':
    case 'tag':
      return 'label'
    case 'emboss':
    case 'interior':
      return 'embossing'
    default:
      return 'front_print'
  }
}

export async function uploadBrandingLogo(
  corporateId: string,
  uploadedBy: string,
  file: File,
): Promise<{ data: BrandingUpload | null; error: string | null }> {
  if (!ALLOWED_MIME.has(file.type)) {
    return { data: null, error: 'Logo must be PNG, SVG, or JPEG' }
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { data: null, error: 'Logo must be 5 MB or smaller' }
  }

  // Per-upload path so revisions don't overwrite older logos still in use
  // by previously-approved selections.
  const ext = (file.name.split('.').pop() ?? 'png').toLowerCase()
  const id = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const path = `${corporateId}/branding/${id}.${ext}`

  const uploadRes = await supabase.storage
    .from('logo-uploads')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadRes.error) return { data: null, error: uploadRes.error.message }

  const publicUrl = storageService.logos.getUrl(uploadRes.data.path)

  const { data, error } = await supabase
    .from('gifting_branding_uploads')
    .insert({
      corporate_id: corporateId,
      uploaded_by: uploadedBy,
      storage_path: uploadRes.data.path,
      public_url: publicUrl,
      original_filename: file.name,
      mime_type: file.type,
      file_size_bytes: file.size,
    })
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as BrandingUpload, error: null }
}

export async function submitBrandingSelection(
  bookingId: string,
  uploadId: string,
  placementType: PlacementType,
  brandingMethod: BrandingMethod | null,
  positionNotes: string | null,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('submit_gifting_branding', {
    p_booking_id: bookingId,
    p_upload_id: uploadId,
    p_placement_type: placementType,
    p_branding_method: brandingMethod,
    p_position_notes: positionNotes,
  })
  if (error) return { id: null, error: error.message }
  return { id: data as string, error: null }
}

export async function listBrandingForBooking(
  bookingId: string,
): Promise<{ data: BrandingSelection[]; error: string | null }> {
  const { data, error } = await supabase
    .from('gifting_branding_selections')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true })

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as BrandingSelection[], error: null }
}

// Admin — list pending selections with the upload + booking joined in for
// the approval queue.
export type AdminPendingRow = BrandingSelection & {
  upload: BrandingUpload
  booking_corporate_id: string
  booking_listing_id: string
}

export async function listPendingBrandingForAdmin(): Promise<{
  data: AdminPendingRow[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('gifting_branding_selections')
    .select(
      `*,
       upload:gifting_branding_uploads!upload_id (*),
       booking:bookings!booking_id ( corporate_id, listing_id )`,
    )
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: true })

  if (error) return { data: [], error: error.message }

  const rows = (data ?? []).map((row: any) => ({
    ...row,
    upload: row.upload,
    booking_corporate_id: row.booking?.corporate_id ?? '',
    booking_listing_id: row.booking?.listing_id ?? '',
  })) as AdminPendingRow[]

  return { data: rows, error: null }
}

export async function reviewBrandingSelection(
  selectionId: string,
  status: 'approved' | 'revision_requested',
  revisionNotes: string | null,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('review_gifting_branding', {
    p_selection_id: selectionId,
    p_status: status,
    p_revision_notes: revisionNotes,
  })
  return { error: error?.message ?? null }
}
