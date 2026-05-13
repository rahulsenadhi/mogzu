import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  PERMISSION_SECTIONS,
  buildDefaultPermissionState,
} from '@/app/lib/adminTeamsMock';

function Toggle({
  checked,
  onChange,
  labelId,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelId: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        checked ? 'bg-emerald-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function AdminRolePermissionsPage() {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState('');
  const [formError, setFormError] = useState('');
  const [perms, setPerms] = useState<Record<string, boolean>>(() => buildDefaultPermissionState());

  const setPerm = (id: string, v: boolean) => {
    setPerms((p) => ({ ...p, [id]: v }));
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Role Information</h1>
        <button
          type="button"
          onClick={() => navigate('/admin/teams')}
          className="text-sm font-semibold text-[#2563EB] hover:underline"
        >
          Back to Teams
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 lg:p-6 space-y-6">
        <div>
          <label htmlFor="role-name" className="text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="role-name"
            value={roleName}
            onChange={(e) => {
              setRoleName(e.target.value);
              setFormError('');
            }}
            placeholder="Name"
            className="mt-2 w-full max-w-xl h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
          {formError && <p className="mt-2 text-xs text-red-700">{formError}</p>}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Permissions</h2>
          <div className="space-y-6">
            {PERMISSION_SECTIONS.map((section) => (
              <section key={section.title}>
                <div className="px-3 py-2 rounded-t-lg bg-indigo-50/80 border border-b-0 border-slate-200/80 text-sm font-semibold text-slate-800">
                  {section.title}
                </div>
                <div className="rounded-b-lg border border-slate-200/80 border-t-0 p-3 bg-white">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                    {section.items.map((item) => {
                      const lid = `perm-${item.id}`;
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col gap-3 min-h-[88px] justify-between"
                        >
                          <span id={lid} className="text-xs text-slate-600 leading-snug">
                            {item.label}
                          </span>
                          <Toggle
                            checked={perms[item.id] ?? false}
                            onChange={(v) => setPerm(item.id, v)}
                            labelId={lid}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/teams')}
          className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            if (!roleName.trim()) {
              setFormError('Role name is required.');
              return;
            }
            navigate('/admin/teams');
          }}
          className="px-6 py-2.5 rounded-full bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8]"
        >
          Save
        </button>
      </div>
    </div>
  );
}
