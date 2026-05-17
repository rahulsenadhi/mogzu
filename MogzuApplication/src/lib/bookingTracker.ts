// Phase 2 Feature 2 — Live status tracker pipeline definitions.

import type { ModuleId } from './database.types'

export type TrackerStage = {
  key: string
  label: string
  proofRequired: 'auto' | 'optional' | 'mandatory'
  helper?: string
}

export const STAGE_PIPELINES: Record<ModuleId, TrackerStage[]> = {
  events: [
    { key: 'booking_confirmed', label: 'Booking confirmed', proofRequired: 'auto' },
    { key: 'vendor_assigned', label: 'Vendor / artist assigned', proofRequired: 'auto' },
    { key: 'en_route', label: 'En route', proofRequired: 'optional', helper: 'Optional GPS check-in' },
    { key: 'arrived_at_venue', label: 'Arrived at venue', proofRequired: 'mandatory', helper: 'OTP + photo + GPS' },
    { key: 'work_started', label: 'Work started', proofRequired: 'mandatory', helper: 'OTP + photo + timestamp' },
    { key: 'work_completed', label: 'Work completed', proofRequired: 'mandatory', helper: 'OTP + photo + end timestamp' },
    { key: 'booking_closed', label: 'Booking closed', proofRequired: 'auto', helper: 'Corporate confirms + rating' },
  ],
  gifting: [
    { key: 'order_placed', label: 'Order placed', proofRequired: 'auto' },
    { key: 'in_production', label: 'In production / packaging', proofRequired: 'optional', helper: 'Optional photo' },
    { key: 'dispatched', label: 'Dispatched', proofRequired: 'mandatory', helper: 'Tracking ID required' },
    { key: 'out_for_delivery', label: 'Out for delivery', proofRequired: 'optional' },
    { key: 'delivered', label: 'Delivered', proofRequired: 'mandatory', helper: 'OTP + photo by recipient' },
    { key: 'confirmed', label: 'Confirmed', proofRequired: 'auto' },
  ],
  spacex_coworking: [
    { key: 'booking_confirmed', label: 'Booking confirmed', proofRequired: 'auto' },
    { key: 'check_in', label: 'Check-in', proofRequired: 'mandatory', helper: 'OTP + photo + GPS' },
    { key: 'in_use', label: 'Space in use', proofRequired: 'auto' },
    { key: 'check_out', label: 'Check-out', proofRequired: 'mandatory', helper: 'OTP + photo + timestamp' },
    { key: 'booking_closed', label: 'Booking closed', proofRequired: 'auto' },
  ],
  spacex_stay: [
    { key: 'booking_confirmed', label: 'Booking confirmed', proofRequired: 'auto' },
    { key: 'check_in', label: 'Check-in', proofRequired: 'mandatory', helper: 'OTP + photo + GPS' },
    { key: 'in_use', label: 'Stay in progress', proofRequired: 'auto' },
    { key: 'check_out', label: 'Check-out', proofRequired: 'mandatory', helper: 'OTP + photo + timestamp' },
    { key: 'booking_closed', label: 'Booking closed', proofRequired: 'auto' },
  ],
}

export function getStagePipeline(module: ModuleId): TrackerStage[] {
  return STAGE_PIPELINES[module] ?? []
}

export function findStage(module: ModuleId, key: string): TrackerStage | undefined {
  return getStagePipeline(module).find((s) => s.key === key)
}

export function generateOtpCode(): string {
  // 6-digit numeric; collisions are scoped per (booking_id, stage) by the
  // UNIQUE index in the migration.
  const buf = crypto.getRandomValues(new Uint32Array(1))
  return String(100000 + (buf[0] % 900000))
}

export function buildProofPhotoPath(bookingId: string, stage: string): string {
  const id = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `booking-proof/${bookingId}/${stage}/${id}.jpg`
}

// Compute the next mandatory / optional stage given the already-submitted
// stages. Returns null when the pipeline is complete.
export function nextStage(
  module: ModuleId,
  submittedKeys: string[],
): TrackerStage | null {
  const submitted = new Set(submittedKeys)
  for (const stage of getStagePipeline(module)) {
    if (!submitted.has(stage.key)) return stage
  }
  return null
}
