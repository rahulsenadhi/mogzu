import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  ShieldAlert,
  Upload,
  XCircle,
} from 'lucide-react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Employee } from '@/lib/database.types'

type RowDraft = Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'imported_at'>

type ParsedRow = {
  raw: Record<string, string>
  draft: RowDraft | null
  errors: string[]
  rowIndex: number
}

const REQUIRED_COLUMNS = ['email', 'full_name']
const SAMPLE_CSV = `email,full_name,department,role_hint,dob,join_date,phone
priya@acme.com,Priya Singh,Engineering,L1,1995-06-21,2022-08-01,+919876543210
amit@acme.com,Amit Kumar,Sales,L2,1990-03-15,2020-04-12,
`

function downloadSample() {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mogzu-employees-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// Minimal CSV parser: handles quoted fields, escaped quotes, commas in fields,
// newlines inside quoted fields. Returns rows as arrays of strings.
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') {
        inQuotes = false
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.length > 0) rows.push(row)
      row = []
    } else {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ''))
}

function isValidDate(s: string): boolean {
  if (!s) return true
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime())
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function buildDraft(
  raw: Record<string, string>,
  corporateId: string,
  rowIndex: number,
): ParsedRow {
  const errors: string[] = []
  const email = (raw.email ?? '').trim().toLowerCase()
  const fullName = (raw.full_name ?? '').trim()

  if (!email) errors.push('email is required')
  else if (!isValidEmail(email)) errors.push('email is invalid')
  if (!fullName) errors.push('full_name is required')

  const dob = (raw.dob ?? '').trim() || null
  const joinDate = (raw.join_date ?? '').trim() || null

  if (dob && !isValidDate(dob)) errors.push('dob must be YYYY-MM-DD')
  if (joinDate && !isValidDate(joinDate)) errors.push('join_date must be YYYY-MM-DD')

  const draft: RowDraft | null = errors.length
    ? null
    : {
        corporate_id: corporateId,
        email,
        full_name: fullName,
        department: (raw.department ?? '').trim() || null,
        role_hint: (raw.role_hint ?? '').trim() || null,
        dob,
        join_date: joinDate,
        phone: (raw.phone ?? '').trim() || null,
        is_active: true,
      }

  return { raw, draft, errors, rowIndex }
}

export default function EmployeeImportPage() {
  const navigate = useNavigate()
  const { corporateId, role } = useAuth()
  const canImport = role === 'l3_admin' || role === 'mogzu_admin'

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [parsed, setParsed] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ inserted: number; failed: number } | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!corporateId) return
      setParseError('')
      setResult(null)
      setFileName(file.name)
      const text = await file.text()
      const rows = parseCsv(text)
      if (rows.length < 2) {
        setParseError('CSV must have a header row and at least one data row.')
        setParsed([])
        return
      }
      const header = rows[0].map((h) => h.trim().toLowerCase())
      const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c))
      if (missing.length > 0) {
        setParseError(`Missing required columns: ${missing.join(', ')}.`)
        setParsed([])
        return
      }
      const dataRows = rows.slice(1).map((r, i) => {
        const obj: Record<string, string> = {}
        header.forEach((col, j) => {
          obj[col] = r[j] ?? ''
        })
        return buildDraft(obj, corporateId, i + 2) // +2: 1-based + header
      })
      setParsed(dataRows)
    },
    [corporateId],
  )

  const counts = useMemo(() => {
    return {
      total: parsed.length,
      valid: parsed.filter((r) => !!r.draft).length,
      errors: parsed.filter((r) => r.errors.length > 0).length,
    }
  }, [parsed])

  const handleImport = async () => {
    const valid = parsed.filter((r) => r.draft).map((r) => r.draft!) as RowDraft[]
    if (valid.length === 0) return
    setImporting(true)
    setResult(null)
    const { data, error } = await db.employees.upsertBatch(valid)
    setImporting(false)
    if (error) {
      setResult({ inserted: 0, failed: valid.length })
      setParseError(error.message)
      return
    }
    setResult({ inserted: data?.length ?? valid.length, failed: 0 })
    setParsed([])
    setFileName('')
  }

  if (!canImport) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 size-8 text-amber-600" />
          <p className="text-sm text-amber-800">L3 Admin access required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface className="py-8">
          <div className="mx-auto max-w-4xl px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#0e1e3f]">Import employees</h1>
              <p className="mt-1 text-sm text-slate-500">
                Upload a CSV of your team. Used to seed celebration triggers (birthday, work
                anniversary) and the gifting recipient directory. Existing rows are updated
                when the email matches.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <label
                    htmlFor="csv-input"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Upload className="size-4" />
                    Choose CSV
                  </label>
                  <input
                    id="csv-input"
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleFile(f)
                    }}
                  />
                  {fileName && (
                    <span className="ml-3 text-xs text-slate-500">{fileName}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={downloadSample}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Download className="size-4" />
                  Download template
                </button>
              </div>

              <p className="mb-3 text-xs text-slate-500">
                Required columns: <code className="rounded bg-slate-100 px-1">email</code>,{' '}
                <code className="rounded bg-slate-100 px-1">full_name</code>. Optional:{' '}
                <code className="rounded bg-slate-100 px-1">department</code>,{' '}
                <code className="rounded bg-slate-100 px-1">role_hint</code>,{' '}
                <code className="rounded bg-slate-100 px-1">dob</code> (YYYY-MM-DD),{' '}
                <code className="rounded bg-slate-100 px-1">join_date</code> (YYYY-MM-DD),{' '}
                <code className="rounded bg-slate-100 px-1">phone</code>.
              </p>

              {parseError && (
                <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {parseError}
                </p>
              )}

              {result && (
                <p
                  className={`mb-3 rounded-lg border px-3 py-2 text-sm ${
                    result.failed === 0
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-800'
                  }`}
                >
                  {result.failed === 0 ? (
                    <>
                      <CheckCircle2 className="mr-1 inline size-4" />
                      Imported {result.inserted} employee
                      {result.inserted !== 1 ? 's' : ''}. Existing rows were updated by email.
                    </>
                  ) : (
                    <>
                      Imported {result.inserted}, failed {result.failed}.
                    </>
                  )}
                </p>
              )}

              {parsed.length > 0 && (
                <>
                  <div className="mb-3 grid grid-cols-3 gap-3 text-center">
                    <Stat label="Total rows" value={counts.total} />
                    <Stat label="Valid" value={counts.valid} className="text-emerald-700" />
                    <Stat label="Errors" value={counts.errors} className="text-rose-700" />
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-3 py-2">Row</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Department</th>
                          <th className="px-3 py-2">DOB</th>
                          <th className="px-3 py-2">Join</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsed.slice(0, 200).map((p) => (
                          <tr
                            key={p.rowIndex}
                            className={p.errors.length > 0 ? 'bg-rose-50/40' : ''}
                          >
                            <td className="px-3 py-2 text-slate-500">{p.rowIndex}</td>
                            <td className="px-3 py-2 font-medium">
                              {p.raw.email || '—'}
                            </td>
                            <td className="px-3 py-2">{p.raw.full_name || '—'}</td>
                            <td className="px-3 py-2 text-slate-600">
                              {p.raw.department || '—'}
                            </td>
                            <td className="px-3 py-2 text-slate-600">{p.raw.dob || '—'}</td>
                            <td className="px-3 py-2 text-slate-600">
                              {p.raw.join_date || '—'}
                            </td>
                            <td className="px-3 py-2">
                              {p.errors.length === 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                  <CheckCircle2 className="size-3" />
                                  Valid
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700"
                                  title={p.errors.join('; ')}
                                >
                                  <XCircle className="size-3" />
                                  {p.errors.length} error
                                  {p.errors.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsed.length > 200 && (
                      <p className="border-t border-slate-100 p-2 text-center text-xs text-slate-500">
                        Showing first 200 of {parsed.length}. All valid rows will import.
                      </p>
                    )}
                  </div>

                  {counts.errors > 0 && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <span>
                        {counts.errors} row{counts.errors !== 1 ? 's' : ''} have validation
                        errors and will be skipped. Hover the error badge to see details.
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setParsed([])
                        setFileName('')
                      }}
                      className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={importing || counts.valid === 0}
                      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {importing && <Loader2 className="size-4 animate-spin" />}
                      Import {counts.valid} employee{counts.valid !== 1 ? 's' : ''}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  className = '',
}: {
  label: string
  value: number
  className?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${className || 'text-slate-900'}`}>{value}</p>
    </div>
  )
}
