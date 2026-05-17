import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { CORP } from '@/app/lib/adminTheme'
import { db } from '@/lib/db'
import type { Partner, PartnerType } from '@/lib/database.types'

const PARTNER_TYPES: PartnerType[] = ['consultant', 'agency', 'reseller', 'freelancer']

const inputClass =
  'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export default function AdminPartnerFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [partner, setPartner] = useState<Partner | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [partnerType, setPartnerType] = useState<PartnerType>('consultant')
  const [expertise, setExpertise] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifsc, setIfsc] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id) {
        setError('Partner id is missing.')
        setLoading(false)
        return
      }
      const { data, error: e } = await db.partners.getById(id)
      if (cancelled) return
      if (e || !data) {
        setError(e?.message ?? 'Partner not found.')
        setLoading(false)
        return
      }
      const p = data as Partner
      setPartner(p)
      setFullName(p.full_name)
      setEmail(p.email)
      setPhone(p.phone ?? '')
      setBusinessName(p.business_name ?? '')
      setPartnerType(p.partner_type)
      setExpertise(p.expertise.join(', '))
      setAccountName(p.bank_account_name ?? '')
      setAccountNumber(p.bank_account_number ?? '')
      setIfsc(p.bank_ifsc ?? '')
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partner) return
    setError('')
    setSaving(true)
    const { error: updateError } = await db.partners.update(partner.id, {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      business_name: businessName.trim() || null,
      partner_type: partnerType,
      expertise: expertise.split(',').map((s) => s.trim()).filter(Boolean),
      bank_account_name: accountName.trim() || null,
      bank_account_number: accountNumber.trim() || null,
      bank_ifsc: ifsc.trim() || null,
    })
    setSaving(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    navigate('/admin/partners')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading partner...
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        {error || 'Partner not found.'}
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-4">
      <button
        type="button"
        onClick={() => navigate('/admin/partners')}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-3.5" /> Back to partners
      </button>
      <AdminPageTitleRow title={`Edit partner — ${partner.full_name}`} />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Business name">
            <input
              className={inputClass}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </Field>
          <Field label="Partner type">
            <select
              className={inputClass}
              value={partnerType}
              onChange={(e) => setPartnerType(e.target.value as PartnerType)}
            >
              {PARTNER_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Expertise">
            <input
              className={inputClass}
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="HR, employee engagement"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 border-t border-slate-100 pt-4">
          <Field label="Bank account name">
            <input
              className={inputClass}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </Field>
          <Field label="Bank account number">
            <input
              className={inputClass}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </Field>
          <Field label="IFSC">
            <input
              className={inputClass}
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
            />
          </Field>
        </div>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/partners')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
            style={{ backgroundColor: CORP.primary }}
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}
