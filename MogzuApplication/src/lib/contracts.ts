// Phase 3 Feature 8 — contracts + invoice runs.

import { supabase } from './supabase'

export type Contract = {
  id: string
  corporate_id: string
  name: string
  term_starts_on: string
  term_ends_on: string | null
  payment_terms_days: number
  currency: string
  status: 'draft' | 'active' | 'paused' | 'expired' | 'terminated'
  signed_at: string | null
  signed_by: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ContractLineItem = {
  id: string
  contract_id: string
  kind: 'event_type' | 'gift_unit' | 'space_night' | 'space_day' | 'custom'
  description: string
  unit_rate: number
  notes: string | null
  display_order: number
  created_at: string
}

export type InvoiceRun = {
  id: string
  contract_id: string
  period_starts_on: string
  period_ends_on: string
  status: 'draft' | 'finalised' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  subtotal: number
  tax_amount: number
  total: number
  currency: string
  pdf_storage_path: string | null
  finalised_at: string | null
  sent_at: string | null
  email_sent_at: string | null
  paid_at: string | null
  payment_reference: string | null
  created_at: string
  updated_at: string
}

export async function listContracts(): Promise<{ data: Contract[]; error: string | null }> {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as Contract[], error: null }
}

export async function getContract(
  id: string,
): Promise<{ data: Contract | null; error: string | null }> {
  const { data, error } = await supabase.from('contracts').select('*').eq('id', id).single()
  if (error) return { data: null, error: error.message }
  return { data: data as Contract, error: null }
}

export async function createContract(
  payload: Omit<Contract, 'id' | 'created_at' | 'updated_at' | 'signed_at' | 'signed_by'>,
): Promise<{ data: Contract | null; error: string | null }> {
  const { data, error } = await supabase.from('contracts').insert(payload).select('*').single()
  if (error) return { data: null, error: error.message }
  return { data: data as Contract, error: null }
}

export async function updateContract(
  id: string,
  patch: Partial<Contract>,
): Promise<{ data: Contract | null; error: string | null }> {
  const { data, error } = await supabase
    .from('contracts')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) return { data: null, error: error.message }
  return { data: data as Contract, error: null }
}

export async function listLineItems(
  contractId: string,
): Promise<{ data: ContractLineItem[]; error: string | null }> {
  const { data, error } = await supabase
    .from('contract_line_items')
    .select('*')
    .eq('contract_id', contractId)
    .order('display_order')
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as ContractLineItem[], error: null }
}

export async function upsertLineItem(
  item: Omit<ContractLineItem, 'created_at'> & { id?: string },
): Promise<{ data: ContractLineItem | null; error: string | null }> {
  if (item.id) {
    const { data, error } = await supabase
      .from('contract_line_items')
      .update(item)
      .eq('id', item.id)
      .select('*')
      .single()
    if (error) return { data: null, error: error.message }
    return { data: data as ContractLineItem, error: null }
  }
  const { id: _ignored, ...insert } = item
  const { data, error } = await supabase
    .from('contract_line_items')
    .insert(insert)
    .select('*')
    .single()
  if (error) return { data: null, error: error.message }
  return { data: data as ContractLineItem, error: null }
}

export async function deleteLineItem(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('contract_line_items').delete().eq('id', id)
  return { error: error?.message ?? null }
}

export async function getInvoiceRun(
  id: string,
): Promise<{ data: InvoiceRun | null; error: string | null }> {
  const { data, error } = await supabase.from('invoice_runs').select('*').eq('id', id).single()
  if (error) return { data: null, error: error.message }
  return { data: data as InvoiceRun, error: null }
}

export async function listInvoiceRuns(
  contractId?: string,
): Promise<{ data: InvoiceRun[]; error: string | null }> {
  let q = supabase
    .from('invoice_runs')
    .select('*')
    .order('period_starts_on', { ascending: false })
  if (contractId) q = q.eq('contract_id', contractId)
  const { data, error } = await q
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as InvoiceRun[], error: null }
}

export async function createInvoiceRun(
  contractId: string,
  periodStartsOn: string,
  periodEndsOn: string,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('create_invoice_run', {
    p_contract_id: contractId,
    p_period_starts_on: periodStartsOn,
    p_period_ends_on: periodEndsOn,
  })
  if (error) return { id: null, error: error.message }
  return { id: data as string, error: null }
}

export async function getInvoicePdfSignedUrl(
  storagePath: string,
  expiresInSeconds = 3600,
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.storage
    .from('invoices')
    .createSignedUrl(storagePath, expiresInSeconds)
  if (error) return { url: null, error: error.message }
  return { url: data?.signedUrl ?? null, error: null }
}

export async function markInvoiceEmailed(
  invoiceId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('mark_invoice_emailed', {
    p_invoice_id: invoiceId,
  })
  return { error: error?.message ?? null }
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceRun['status'],
  extra?: { sent_at?: string; paid_at?: string; payment_reference?: string },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('invoice_runs')
    .update({ status, ...extra })
    .eq('id', id)
  return { error: error?.message ?? null }
}
