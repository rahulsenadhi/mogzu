import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminPageTitleRow } from '@/app/components/admin/AdminPageChrome';
import { SEED_TEAM_ROWS, TEAMS_TOTAL_COPY } from '@/app/lib/adminTeamsMock';

type StaffItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
};

export default function AdminTeamsPage() {
  const [tab, setTab] = useState<'staff' | 'role'>('staff');
  const [staffs, setStaffs] = useState<StaffItem[]>(
    SEED_TEAM_ROWS.filter((r) => r.kind === 'staff').map((r, idx) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      phone: ['662-817-4374', '+1 (586) 899-1627', '+1 (814) 387-2818', '+1 (541) 851-2369', '678-417-4134'][idx] ?? '662-817-4374',
      password: '',
    }))
  );
  const [roles, setRoles] = useState<string[]>([
    'Customer Service Representatives',
    'Product manager',
    'PPC Manager',
    'Category Manager',
    'Order clerks',
    'Ganador',
  ]);
  const [staffFormOpen, setStaffFormOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState('');

  const totalStaffs = useMemo(() => staffs.length, [staffs]);

  const resetStaffForm = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
    setStaffPassword('');
    setStaffRole('');
  };

  const openAddStaff = () => {
    resetStaffForm();
    setStaffFormOpen(true);
  };

  const openEditStaff = (staff: StaffItem) => {
    setEditingStaffId(staff.id);
    setStaffName(staff.name);
    setStaffEmail(staff.email);
    setStaffPhone(staff.phone);
    setStaffPassword(staff.password);
    setStaffRole(staff.role);
    setStaffFormOpen(true);
  };

  const saveStaff = () => {
    const payload: StaffItem = {
      id: editingStaffId ?? `st-${Date.now()}`,
      name: staffName.trim() || 'New Staff',
      email: staffEmail.trim() || 'staff@example.com',
      phone: staffPhone.trim() || '662-817-4374',
      password: staffPassword,
      role: staffRole.trim() || 'Product manager',
    };
    setStaffs((prev) =>
      editingStaffId ? prev.map((row) => (row.id === editingStaffId ? payload : row)) : [...prev, payload]
    );
    setStaffFormOpen(false);
    resetStaffForm();
  };

  const removeStaff = (id: string) => {
    setStaffs((prev) => prev.filter((s) => s.id !== id));
  };

  const saveRole = () => {
    const value = newRoleName.trim();
    if (!value) return;
    setRoles((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setNewRoleName('');
    setRoleFormOpen(false);
  };

  const removeRole = (role: string) => {
    setRoles((prev) => prev.filter((r) => r !== role));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminPageTitleRow title="Teams" totalLabel={TEAMS_TOTAL_COPY} />
      </div>

      <div className="flex border-b border-slate-200 gap-8">
        {([
          { id: 'staff', label: 'All staffs' },
          { id: 'role', label: 'All Role' },
        ] as const).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`pb-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === item.id
                ? 'text-[#2563EB] border-[#2563EB]'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {staffFormOpen && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">Staff Information</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-xs text-slate-600">
              Name
              <input value={staffName} onChange={(e) => setStaffName(e.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" placeholder="George M. Winters" />
            </label>
            <label className="text-xs text-slate-600">
              Email
              <input value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" placeholder="staff@example.com" />
            </label>
            <label className="text-xs text-slate-600">
              Phone
              <input value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" placeholder="662-817-4374" />
            </label>
            <label className="text-xs text-slate-600">
              Password
              <input type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" placeholder="Password" />
            </label>
            <label className="text-xs text-slate-600 md:col-span-2">
              Role
              <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm bg-white">
                <option value="">Product manager</option>
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/60">
            <button type="button" onClick={() => { setStaffFormOpen(false); resetStaffForm(); }} className="h-9 rounded border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
            <button type="button" onClick={saveStaff} className="h-9 rounded bg-[#2563EB] px-4 text-sm font-medium text-white hover:bg-[#1D4ED8]">
              Save
            </button>
          </div>
        </div>
      )}

      {roleFormOpen && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
            <label className="text-xs text-slate-600">
              Role name
              <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" placeholder="Enter role name" />
            </label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setRoleFormOpen(false); setNewRoleName(''); }} className="h-9 rounded border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-100">
                Cancel
              </button>
              <button type="button" onClick={saveRole} className="h-9 rounded bg-[#2563EB] px-4 text-sm font-medium text-white hover:bg-[#1D4ED8]">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 lg:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-700">{tab === 'staff' ? `All staffs (${totalStaffs})` : `Roles (${roles.length})`}</h3>
          <button
            type="button"
            onClick={() => (tab === 'staff' ? openAddStaff() : setRoleFormOpen(true))}
            className="inline-flex items-center gap-2 rounded-full bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7C3AED]"
          >
            <Plus className="size-4" />
            {tab === 'staff' ? 'Add New Staffs' : 'Add New Role'}
          </button>
        </div>

        <div className="overflow-x-auto">
          {tab === 'staff' ? (
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="py-3 pl-4 pr-2">#</th>
                  <th className="py-3 pr-3">Name</th>
                  <th className="py-3 pr-3">Email</th>
                  <th className="py-3 pr-3">Phone</th>
                  <th className="py-3 pr-3">Role</th>
                  <th className="py-3 pr-4 text-right">Options</th>
                </tr>
              </thead>
              <tbody>
                {staffs.map((row, idx) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="py-3 pl-4 pr-2 text-slate-500">{idx + 1}</td>
                    <td className="py-3 pr-3 text-slate-700">{row.name}</td>
                    <td className="py-3 pr-3 text-slate-600">{row.email}</td>
                    <td className="py-3 pr-3 text-slate-600">{row.phone}</td>
                    <td className="py-3 pr-3 text-slate-600">{row.role}</td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEditStaff(row)} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 hover:bg-cyan-100" aria-label="Edit staff">
                          <Pencil className="size-3.5" />
                        </button>
                        <button type="button" onClick={() => removeStaff(row.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100" aria-label="Delete staff">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="py-3 pl-4 pr-2">#</th>
                  <th className="py-3 pr-3">Name</th>
                  <th className="py-3 pr-4 text-right">Options</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role, idx) => (
                  <tr key={role} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="py-3 pl-4 pr-2 text-slate-500">{idx + 1}</td>
                    <td className="py-3 pr-3 text-slate-700">{role}</td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { setNewRoleName(role); setRoleFormOpen(true); }} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 hover:bg-cyan-100" aria-label="Edit role">
                          <Pencil className="size-3.5" />
                        </button>
                        <button type="button" onClick={() => removeRole(role)} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100" aria-label="Delete role">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
