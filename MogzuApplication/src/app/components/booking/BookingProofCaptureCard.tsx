// Plan Batch 6 slice 2 — execution-stage proof capture for vendor /
// field-agent / admin. Single-shot: photo + GPS + OTP -> insert row in
// booking_status_events and immediately mark otp_verified_at so the
// trigger locks the row. The OTP field is optional in the DB; vendors
// who don't run a verification step can leave it blank.

import { useState } from 'react'
import { Camera, Loader2, MapPin } from 'lucide-react'
import { storageService } from '@/lib/storage'
import { db } from '@/lib/db'
import {
  generateOtpCode,
  nextStage,
  type TrackerStage,
} from '@/lib/bookingTracker'
import type { ModuleId } from '@/lib/database.types'

type Props = {
  bookingId: string
  module: ModuleId
  submittedKeys: string[]
  submittedBy: string
  onSubmitted: () => void
}

export function BookingProofCaptureCard({
  bookingId,
  module,
  submittedKeys,
  submittedBy,
  onSubmitted,
}: Props) {
  const stage: TrackerStage | null = nextStage(module, submittedKeys)
  const [file, setFile] = useState<File | null>(null)
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsError, setGpsError] = useState('')
  const [otp, setOtp] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!stage) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Pipeline complete — no more proof stages to submit.
      </div>
    )
  }

  if (stage.proofRequired === 'auto') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        Next stage <span className="font-medium text-slate-900">{stage.label}</span> is automatic — no manual proof required.
      </div>
    )
  }

  const captureGps = () => {
    setGpsError('')
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation not available in this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setGpsError(err.message || 'Failed to read location.'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }

  const submit = async () => {
    setError('')
    if (stage.proofRequired === 'mandatory' && !file) {
      setError('A photo is required for this stage.')
      return
    }
    setBusy(true)

    let photoPath: string | null = null
    if (file) {
      const up = await storageService.bookingProof.upload(bookingId, stage.key, file)
      if (up.error) {
        setBusy(false)
        setError(up.error)
        return
      }
      photoPath = up.path
    }

    const otpCode = otp.trim() || generateOtpCode()
    const { data: created, error: createErr } = await db.bookingTracker.createOtp(
      bookingId,
      stage.key,
      otpCode,
      '',
    )
    if (createErr || !created) {
      setBusy(false)
      setError(createErr?.message ?? 'Failed to record stage.')
      return
    }

    const { error: submitErr } = await db.bookingTracker.submitProof(created.id, {
      photo_path: photoPath,
      gps_lat: gps?.lat ?? null,
      gps_lng: gps?.lng ?? null,
      submitted_by: submittedBy,
      notes: notes.trim() || null,
    })

    setBusy(false)
    if (submitErr) {
      setError(submitErr.message)
      return
    }
    setFile(null)
    setGps(null)
    setOtp('')
    setNotes('')
    onSubmitted()
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Submit proof — {stage.label}</p>
          <p className="text-[11px] text-slate-600">
            {stage.proofRequired === 'mandatory' ? 'Photo required.' : 'Photo optional.'} OTP + GPS optional.
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <label className="block text-xs font-medium text-slate-700">
          Photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-xs"
          />
          {file && <span className="text-[11px] text-slate-500">Selected: {file.name}</span>}
        </label>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={captureGps}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <MapPin className="size-3.5" />
            {gps ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : 'Capture GPS'}
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="OTP (optional)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          />
        </div>

        {gpsError && <p className="text-[11px] text-amber-700">{gpsError}</p>}

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Notes (optional)"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
        />

        {error && (
          <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
          {busy ? 'Submitting…' : `Submit ${stage.label}`}
        </button>
      </div>
    </div>
  )
}
