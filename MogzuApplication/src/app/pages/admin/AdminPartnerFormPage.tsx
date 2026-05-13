import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { CORP } from '@/app/lib/adminTheme';
import type { MogzuListingModule, PartnerUser } from '@/app/lib/mogzuDomain';
import { loadPartnerUsers, savePartnerUsers } from '@/app/lib/mogzuDomain';

const MODULE_OPTS: MogzuListingModule[] = ['dspace', 'gifting', 'events'];

export default function AdminPartnerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [expertiseText, setExpertiseText] = useState('');
  const [modules, setModules] = useState<MogzuListingModule[]>(['gifting']);
  const [profitPct, setProfitPct] = useState('10');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [status, setStatus] = useState<PartnerUser['status']>('pending');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit || !id) {
      setLoaded(true);
      return;
    }
    const list = loadPartnerUsers();
    const row = list.find((r) => r.id === id);
    if (!row) {
      setError('Partner not found.');
      setLoaded(true);
      return;
    }
    setName(row.name);
    setEmail(row.email);
    setPhone(row.phone);
    setBusinessName(row.business_name);
    setExpertiseText(row.expertise.join(', '));
    setModules(row.modules.length ? row.modules : ['gifting']);
    setProfitPct(String(row.profit_share_percentage));
    setAccountName(row.bank_details.account_name);
    setAccountNumber(row.bank_details.account_number);
    setIfsc(row.bank_details.ifsc);
    setStatus(row.status);
    setLoaded(true);
  }, [id, isEdit]);

  const toggleModule = (m: MogzuListingModule) => {
    setModules((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }
    const pct = Number(profitPct);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      setError('Profit share must be 0–100.');
      return;
    }
    const expertise = expertiseText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const now = new Date().toISOString();
    const list = loadPartnerUsers();

    if (isEdit && id) {
      const next = list.map((row) =>
        row.id === id
          ? {
              ...row,
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              business_name: businessName.trim(),
              expertise,
              modules: modules.length ? modules : ['gifting'],
              profit_share_percentage: pct,
              bank_details: {
                account_name: accountName.trim(),
                account_number: accountNumber.trim(),
                ifsc: ifsc.trim(),
              },
              status,
            }
          : row
      );
      savePartnerUsers(next);
    } else {
      const newRow: PartnerUser = {
        id: `pu-${Date.now()}`,
        role: 'partner',
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        business_name: businessName.trim(),
        expertise,
        modules: modules.length ? modules : ['gifting'],
        profit_share_percentage: pct,
        bank_details: {
          account_name: accountName.trim(),
          account_number: accountNumber.trim(),
          ifsc: ifsc.trim(),
        },
        status,
        joined_at: now,
      };
      savePartnerUsers([...list, newRow]);
    }
    navigate('/admin/partners');
  };

  if (!loaded) return <p className="text-sm text-slate-500">Loading…</p>;
  if (isEdit && error && !name) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-600">{error}</p>
        <button type="button" onClick={() => navigate('/admin/partners')} className="text-sm text-blue-600 hover:underline">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate('/admin/partners')}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>
      <AdminPageTitleRow title={isEdit ? 'Edit partner' : 'Add partner'} totalLabel="" />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4 max-w-2xl"
      >
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-xs font-medium text-slate-600 block">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Business name
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
        </div>
        <label className="text-xs font-medium text-slate-600 block">
          Expertise (comma-separated)
          <input value={expertiseText} onChange={(e) => setExpertiseText(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
        </label>
        <div>
          <p className="text-xs font-medium text-slate-600 mb-2">Modules</p>
          <div className="flex flex-wrap gap-2">
            {MODULE_OPTS.map((m) => (
              <label key={m} className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={modules.includes(m)} onChange={() => toggleModule(m)} />
                {m}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-xs font-medium text-slate-600 block">
            Default profit share %
            <input type="number" min={0} max={100} value={profitPct} onChange={(e) => setProfitPct(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value as PartnerUser['status'])} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
              <option value="pending">pending</option>
              <option value="active">active</option>
              <option value="suspended">suspended</option>
            </select>
          </label>
        </div>
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <p className="text-sm font-semibold text-slate-800">Bank details</p>
          <label className="text-xs font-medium text-slate-600 block">
            Account name
            <input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            Account number
            <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600 block">
            IFSC
            <input value={ifsc} onChange={(e) => setIfsc(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: CORP.primary }}>
            Save
          </button>
          <button type="button" onClick={() => navigate('/admin/partners')} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
