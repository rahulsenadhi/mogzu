// Phase 2 Feature 8 — admin CMS: manage hero banners, feature cards,
// blog posts, announcements, and footer link groups for the public site.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldAlert, Plus, Save, Archive, Send, Clock, X } from 'lucide-react'
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome'
import { useAuth } from '@/lib/auth'
import {
  CMS_BLOCK_KINDS,
  archiveBlock,
  listAllBlocks,
  publishBlock,
  scheduleBlock,
  upsertBlock,
  type CmsBlock,
  type CmsBlockKind,
  type CmsBlockStatus,
} from '@/lib/cms'

type EditorState = {
  id?: string
  slug: string
  kind: CmsBlockKind
  title: string
  body: string
  image_url: string
  cta_label: string
  cta_href: string
  display_order: number
  payload_text: string
}

const emptyEditor: EditorState = {
  slug: '',
  kind: 'hero',
  title: '',
  body: '',
  image_url: '',
  cta_label: '',
  cta_href: '',
  display_order: 0,
  payload_text: '{}',
}

function statusBadge(s: CmsBlockStatus): string {
  switch (s) {
    case 'published':
      return 'bg-emerald-100 text-emerald-700'
    case 'scheduled':
      return 'bg-amber-100 text-amber-700'
    case 'archived':
      return 'bg-slate-200 text-slate-600'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

export default function AdminCmsPage() {
  const { role, user } = useAuth()
  const isStaff = role === 'mogzu_admin' || role === 'support'
  const isAdmin = role === 'mogzu_admin'

  const [rows, setRows] = useState<CmsBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [filterKind, setFilterKind] = useState<CmsBlockKind | 'all'>('all')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const [editor, setEditor] = useState<EditorState | null>(null)
  const [scheduleAt, setScheduleAt] = useState<string>('')
  const [schedulingId, setSchedulingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await listAllBlocks()
    if (err) setError(err)
    setRows(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isStaff) load()
  }, [isStaff, load])

  const visible = useMemo(() => {
    if (filterKind === 'all') return rows
    return rows.filter((r) => r.kind === filterKind)
  }, [rows, filterKind])

  const openEditor = (block?: CmsBlock) => {
    if (!block) {
      setEditor({ ...emptyEditor })
      return
    }
    setEditor({
      id: block.id,
      slug: block.slug,
      kind: block.kind,
      title: block.title ?? '',
      body: block.body ?? '',
      image_url: block.image_url ?? '',
      cta_label: block.cta_label ?? '',
      cta_href: block.cta_href ?? '',
      display_order: block.display_order,
      payload_text: JSON.stringify(block.payload ?? {}, null, 2),
    })
  }

  const saveEditor = async () => {
    if (!editor || !user?.id) return
    setError('')

    let parsedPayload: Record<string, unknown> = {}
    try {
      parsedPayload = editor.payload_text.trim() ? JSON.parse(editor.payload_text) : {}
    } catch {
      setError('Payload must be valid JSON')
      return
    }

    if (!editor.slug.trim()) {
      setError('Slug is required')
      return
    }

    setBusy('save')
    const { error: err } = await upsertBlock(
      {
        id: editor.id,
        slug: editor.slug.trim(),
        kind: editor.kind,
        title: editor.title || null,
        body: editor.body || null,
        image_url: editor.image_url || null,
        cta_label: editor.cta_label || null,
        cta_href: editor.cta_href || null,
        display_order: editor.display_order,
        payload: parsedPayload,
      },
      user.id,
    )
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    setNotice(editor.id ? 'Block updated.' : 'Block created (status: draft).')
    setEditor(null)
    load()
  }

  const onPublish = async (id: string) => {
    if (!isAdmin) return
    setBusy(id)
    const { error: err } = await publishBlock(id)
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    setNotice('Published.')
    load()
  }

  const onArchive = async (id: string) => {
    if (!isAdmin) return
    if (!window.confirm('Archive this block? It will stop appearing on the public site.')) return
    setBusy(id)
    const { error: err } = await archiveBlock(id)
    setBusy(null)
    if (err) {
      setError(err)
      return
    }
    setNotice('Archived.')
    load()
  }

  const onSchedule = async (id: string) => {
    if (!isAdmin || !scheduleAt) return
    const at = new Date(scheduleAt)
    if (Number.isNaN(at.getTime()) || at.getTime() <= Date.now()) {
      setError('Pick a future date/time')
      return
    }
    setBusy(id)
    const { error: err } = await scheduleBlock(id, at)
    setBusy(null)
    setSchedulingId(null)
    setScheduleAt('')
    if (err) {
      setError(err)
      return
    }
    setNotice('Scheduled.')
    load()
  }

  if (!isStaff) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="mx-auto mb-2 size-8 text-amber-500" />
        <p className="text-sm text-amber-800">Support / admin role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <AdminPageTitleRow title="Website CMS" totalLabel={`${rows.length} blocks`} />
          {isAdmin && (
            <button
              type="button"
              onClick={() => openEditor()}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              <Plus className="size-4" />
              New block
            </button>
          )}
        </div>

        {notice && (
          <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {notice}
          </p>
        )}
        {error && (
          <p className="mb-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterKind('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filterKind === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            All
          </button>
          {CMS_BLOCK_KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setFilterKind(k.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${filterKind === k.value ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : visible.length === 0 ? (
            <p className="p-12 text-center text-sm text-slate-500">No blocks in this kind.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visible.map((b) => (
                <li key={b.id} className="p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    {b.image_url && (
                      <img
                        src={b.image_url}
                        alt=""
                        className="h-16 w-24 flex-shrink-0 rounded-md border border-slate-200 bg-slate-50 object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{b.title || b.slug}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge(b.status)}`}>
                          {b.status}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {b.kind}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        slug: <span className="font-mono">{b.slug}</span> · order {b.display_order}
                        {b.scheduled_publish_at && (
                          <> · scheduled {new Date(b.scheduled_publish_at).toLocaleString('en-IN')}</>
                        )}
                        {b.published_at && (
                          <> · published {new Date(b.published_at).toLocaleString('en-IN')}</>
                        )}
                      </p>
                      {b.body && (
                        <p className="mt-2 line-clamp-3 text-sm text-slate-700">{b.body}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditor(b)}
                        className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      {isAdmin && b.status !== 'published' && (
                        <button
                          type="button"
                          disabled={busy === b.id}
                          onClick={() => onPublish(b.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {busy === b.id ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
                          Publish
                        </button>
                      )}
                      {isAdmin && b.status !== 'archived' && (
                        <button
                          type="button"
                          disabled={busy === b.id}
                          onClick={() => setSchedulingId(schedulingId === b.id ? null : b.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-300 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                        >
                          <Clock className="size-3" />
                          Schedule
                        </button>
                      )}
                      {isAdmin && b.status !== 'archived' && (
                        <button
                          type="button"
                          disabled={busy === b.id}
                          onClick={() => onArchive(b.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <Archive className="size-3" />
                          Archive
                        </button>
                      )}
                    </div>
                  </div>

                  {schedulingId === b.id && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <input
                        type="datetime-local"
                        value={scheduleAt}
                        onChange={(e) => setScheduleAt(e.target.value)}
                        className="rounded-md border border-amber-300 bg-white px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => onSchedule(b.id)}
                        disabled={!scheduleAt || busy === b.id}
                        className="rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                      >
                        Confirm schedule
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSchedulingId(null)
                          setScheduleAt('')
                        }}
                        className="text-xs text-amber-700 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editor.id ? 'Edit block' : 'New block'}
              </h2>
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Slug</span>
                  <input
                    type="text"
                    value={editor.slug}
                    onChange={(e) => setEditor({ ...editor, slug: e.target.value })}
                    placeholder="homepage-hero-spring-2026"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Kind</span>
                  <select
                    value={editor.kind}
                    onChange={(e) => setEditor({ ...editor, kind: e.target.value as CmsBlockKind })}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  >
                    {CMS_BLOCK_KINDS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Title</span>
                <input
                  type="text"
                  value={editor.title}
                  onChange={(e) => setEditor({ ...editor, title: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Body</span>
                <textarea
                  rows={4}
                  value={editor.body}
                  onChange={(e) => setEditor({ ...editor, body: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Image URL</span>
                <input
                  type="url"
                  value={editor.image_url}
                  onChange={(e) => setEditor({ ...editor, image_url: e.target.value })}
                  placeholder="https://…"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">CTA label</span>
                  <input
                    type="text"
                    value={editor.cta_label}
                    onChange={(e) => setEditor({ ...editor, cta_label: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">CTA link</span>
                  <input
                    type="text"
                    value={editor.cta_href}
                    onChange={(e) => setEditor({ ...editor, cta_href: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Display order</span>
                <input
                  type="number"
                  value={editor.display_order}
                  onChange={(e) => setEditor({ ...editor, display_order: Number(e.target.value) || 0 })}
                  className="w-32 rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Payload (kind-specific JSON)
                </span>
                <textarea
                  rows={5}
                  value={editor.payload_text}
                  onChange={(e) => setEditor({ ...editor, payload_text: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-xs"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditor}
                disabled={busy === 'save'}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
              >
                {busy === 'save' ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
