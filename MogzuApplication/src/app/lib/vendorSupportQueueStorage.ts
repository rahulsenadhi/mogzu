/**
 * Vendor-raised support tickets surfaced on Admin → Issues (localStorage only).
 */
import type { IssueCategory } from '@/app/components/AdminIssuesPage';

export const VENDOR_SUPPORT_QUEUE_STORAGE_KEY = 'mogzu_vendor_support_queue';

const STORAGE_KEY = VENDOR_SUPPORT_QUEUE_STORAGE_KEY;

export type VendorSupportTicketStatus = 'pending' | 'resolved';

export type VendorSupportThreadMsg = {
  id: string;
  from: 'user' | 'admin';
  text: string;
  time: string;
};

export type VendorSupportTicket = {
  id: string;
  businessName: string;
  email: string;
  category: IssueCategory;
  subject: string;
  message: string;
  status: VendorSupportTicketStatus;
  createdAt: number;
  /** Thread including vendor initial message; admin replies appended here for vendor portal sync. */
  messages?: VendorSupportThreadMsg[];
};

function readRaw(): unknown {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

const CATEGORIES: IssueCategory[] = ['Gifting', 'Event', 'SpaceX'];

function formatThreadTime(ts: number) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

export function loadVendorSupportQueue(): VendorSupportTicket[] {
  const raw = readRaw();
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (row): row is VendorSupportTicket =>
        row &&
        typeof row === 'object' &&
        typeof (row as VendorSupportTicket).id === 'string' &&
        typeof (row as VendorSupportTicket).message === 'string'
    )
    .map((row) => {
      const category = CATEGORIES.includes(row.category as IssueCategory)
        ? (row.category as IssueCategory)
        : ('Gifting' as IssueCategory);
      const status = row.status === 'resolved' ? ('resolved' as const) : ('pending' as const);
      const msgs = Array.isArray(row.messages)
        ? row.messages.filter(
            (m): m is VendorSupportThreadMsg =>
              m &&
              typeof m === 'object' &&
              (m.from === 'user' || m.from === 'admin') &&
              typeof m.text === 'string',
          )
        : [];
      const body =
        row.subject?.trim().length > 0
          ? `${String(row.subject).trim()}\n\n${row.message}`
          : row.message;
      const threadTime = formatThreadTime(
        typeof row.createdAt === 'number' ? row.createdAt : Date.now(),
      );
      const messages: VendorSupportThreadMsg[] =
        msgs.length > 0
          ? msgs
          : [{ id: `${row.id}-m0`, from: 'user' as const, text: body, time: threadTime }];
      return {
        ...row,
        category,
        status,
        messages,
      };
    });
}

function writeQueue(rows: VendorSupportTicket[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore quota */
  }
}

export function enqueueVendorSupportTicket(input: {
  businessName: string;
  email: string;
  category: IssueCategory;
  subject: string;
  message: string;
}): VendorSupportTicket {
  const id = `vs-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const createdAt = Date.now();
  const threadTime = formatThreadTime(createdAt);
  const body =
    input.subject.trim().length > 0
      ? `${input.subject.trim()}\n\n${input.message.trim()}`
      : input.message.trim();
  const ticket: VendorSupportTicket = {
    id,
    businessName: input.businessName.trim() || 'Partner',
    email: input.email.trim() || '—',
    category: input.category,
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: 'pending',
    createdAt,
    messages: [{ id: `${id}-m0`, from: 'user', text: body, time: threadTime }],
  };
  const existing = loadVendorSupportQueue();
  writeQueue([ticket, ...existing]);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mogzu-vendor-support-queue-updated'));
  }
  return ticket;
}

export function markVendorSupportTicketResolved(ticketId: string): void {
  const rows = loadVendorSupportQueue();
  const next = rows.map((r) =>
    r.id === ticketId ? { ...r, status: 'resolved' as const } : r
  );
  writeQueue(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mogzu-vendor-support-queue-updated'));
  }
}

export function appendVendorSupportAdminReply(ticketId: string, text: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  const rows = loadVendorSupportQueue();
  const idx = rows.findIndex((r) => r.id === ticketId);
  if (idx < 0) return;
  const row = rows[idx];
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msg: VendorSupportThreadMsg = {
    id: `m-${Date.now()}`,
    from: 'admin',
    text: trimmed,
    time,
  };
  const messages = [...(row.messages && row.messages.length > 0 ? row.messages : []), msg];
  const next = [...rows];
  next[idx] = { ...row, messages };
  writeQueue(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mogzu-vendor-support-queue-updated'));
  }
}
