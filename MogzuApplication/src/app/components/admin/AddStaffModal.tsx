import { useEffect, useState } from 'react';
import { X, Camera } from 'lucide-react';
import type { StaffRow, TeamMemberKind } from '@/app/lib/adminTeamsMock';

const DEFAULT_TAGS = ['Order creation', 'See cart page', 'Get order emails'];

type Props = {
  open: boolean;
  kind: TeamMemberKind;
  onClose: () => void;
  onSave: (row: Omit<StaffRow, 'id'>) => void;
};

export default function AddStaffModal({ open, kind, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState('');
  const [permLevel, setPermLevel] = useState('');
  const [tags, setTags] = useState<string[]>([...DEFAULT_TAGS]);
  const [password, setPassword] = useState('');
  const [extraRows, setExtraRows] = useState(0);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setEmail('');
    setContact('');
    setRole('');
    setPermLevel('');
    setTags([...DEFAULT_TAGS]);
    setPassword('');
    setExtraRows(0);
    setFormError('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const handleSave = () => {
    const n = name.trim();
    const em = email.trim();
    const contactNum = contact.trim();
    const permission = permLevel.trim();
    if (!n || !em || !contactNum || !permission) {
      setFormError('Please fill all required fields before saving.');
      return;
    }
    setFormError('');
    onSave({
      kind,
      name: n,
      email: em,
      role: role.trim() || 'Sales',
      permissions: permLevel.trim() || 'Limited',
      createdOn: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-staff-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 id="add-staff-title" className="text-lg font-semibold text-slate-900">
            Add New Staff
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop"
                alt=""
                className="size-24 rounded-full object-cover border-2 border-slate-100"
              />
              <button
                type="button"
                className="absolute bottom-0 right-0 size-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md hover:bg-[#1D4ED8]"
                aria-label="Change photo"
                title="Photo upload coming soon"
                disabled
              >
                <Camera className="size-4" />
              </button>
            </div>
          </div>
          {formError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</p>
          ) : null}

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Staff name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shekar Nair"
              className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Email ID</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">
              Contact number<span className="text-red-500">*</span>
            </span>
            <div className="mt-1 flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB]/20">
              <span className="flex items-center gap-1 px-3 bg-slate-50 text-sm text-slate-700 border-r border-slate-200 shrink-0">
                🇮🇳 +91
              </span>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Enter user contact"
                className="flex-1 min-w-0 h-11 px-3 text-sm focus:outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Roles</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            >
              <option value="">Select role</option>
              <option value="Manager">Manager</option>
              <option value="Assistant">Assistant</option>
              <option value="Sales">Sales</option>
              <option value="Stock manager">Stock manager</option>
            </select>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">
                Permission level<span className="text-red-500">*</span>
              </span>
              <select
                value={permLevel}
                onChange={(e) => setPermLevel(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                <option value="">Select permission level</option>
                <option value="Limited">Limited</option>
                <option value="Full">Full</option>
              </select>
            </label>
            <div className="block">
              <span className="text-xs font-medium text-slate-600">
                Access to categories<span className="text-red-500">*</span>
              </span>
              <div className="mt-1 min-h-[2.75rem] px-2 py-2 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 items-center">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#2563EB] text-[#2563EB] text-xs font-medium bg-blue-50/50"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-red-600"
                      aria-label={`Remove ${t}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 text-xs ml-auto"
                  aria-label="Clear all"
                  onClick={() => setTags([])}
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {Array.from({ length: extraRows }).map((_, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-dashed border-slate-200">
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-600">Additional permission set</span>
                <input
                  placeholder="Optional label"
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
                />
              </label>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setExtraRows((n) => n + 1)}
            className="text-sm font-semibold text-[#2563EB] hover:underline"
          >
            + Add more
          </button>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full border border-slate-800 text-slate-800 text-sm font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || !email.trim() || !contact.trim() || !permLevel.trim()}
            className="px-6 py-2.5 rounded-full bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
