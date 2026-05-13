import { Fragment, useEffect, useMemo, useState } from 'react';
import { Search, Plus, ChevronDown, ChevronUp, MoreVertical, Download } from 'lucide-react';
import {
  AdminPageTitleRow,
  AdminProductLineTabs,
  type AdminProductLine,
} from '@/app/components/admin/AdminPageChrome';

type ClientChild = {
  id: string;
  name: string;
  role: string;
  email: string;
  company: string;
  permissions: string;
};

type ClientRow = {
  id: string;
  name: string;
  role: string;
  email: string;
  company: string;
  permissions: string;
  vertical: AdminProductLine;
  children?: ClientChild[];
};

type ClientUser = ClientRow | ClientChild;
type WizardTab = 'general' | 'address' | 'permissions' | 'invoice' | 'payment';

type ClientWizardState = {
  userName: string;
  email: string;
  contactNumber: string;
  companyName: string;
  clientType: string;
  role: string;
  panNo: string;
  birthday: string;
  joiningDate: string;
  remarks: string;
  // address
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  billingSameAsCompany: boolean;
  // permissions
  permissionLevel: string;
  canApproveOrders: boolean;
  canManageUsers: boolean;
  canViewInvoices: boolean;
  canManagePayments: boolean;
  canDownloadReports: boolean;
  monthlySpendLimit: string;
  bookingApprovalLimit: string;
  // invoice
  gstNumber: string;
  invoiceCycle: string;
  invoiceEmail: string;
  invoiceNotes: string;
  poRequired: boolean;
  invoiceCurrency: string;
  taxTreatment: string;
  // payment
  bankName: string;
  accountNo: string;
  branchName: string;
  ifscCode: string;
  paymentTerms: string;
  paymentMode: string;
  duePayment: string;
  upiId: string;
  autoDebitEnabled: boolean;
  creditPeriodDays: string;
};

type ClientMetaMap = Record<string, Omit<ClientWizardState, 'userName' | 'email' | 'companyName' | 'role'>>;

const INITIAL_CLIENTS: ClientRow[] = [
  {
    id: '1',
    name: 'Kapil Dev',
    role: 'Manager',
    email: 'kapildev@mail.com',
    company: 'Smart works',
    permissions: 'Full client permission',
    vertical: 'gifting',
    children: [
      {
        id: '1a',
        name: 'Raj Sharma',
        role: 'Sales',
        email: 'rajsharma@mail.com',
        company: 'Smart works',
        permissions: 'Limited permissions',
      },
      {
        id: '1b',
        name: 'Joe Mendes',
        role: 'Sales',
        email: 'joem@mail.com',
        company: 'Smart works',
        permissions: 'Limited permissions',
      },
      {
        id: '1c',
        name: 'Joe Mendes',
        role: 'Sales',
        email: 'joem2@mail.com',
        company: 'Smart works',
        permissions: 'Limited permissions',
      },
      {
        id: '1d',
        name: 'Joe Mendes',
        role: 'Sales',
        email: 'joem3@mail.com',
        company: 'Smart works',
        permissions: 'Limited permissions',
      },
    ],
  },
  {
    id: '2',
    name: 'Anita Rao',
    role: 'Assistant',
    email: 'anita@mail.com',
    company: 'Bright Co',
    permissions: 'Limited permissions',
    vertical: 'events',
  },
  {
    id: '3',
    name: 'Vikram Singh',
    role: 'Stock manager',
    email: 'vikram@mail.com',
    company: 'Northwind',
    permissions: 'Full client permission',
    vertical: 'spacex',
  },
  {
    id: '4',
    name: 'Meera Iyer',
    role: 'Sales',
    email: 'meera@mail.com',
    company: 'Smart works',
    permissions: 'Limited permissions',
    vertical: 'gifting',
  },
  {
    id: '5',
    name: 'Rohit Kapoor',
    role: 'Manager',
    email: 'rohit@mail.com',
    company: 'Acme Ltd',
    permissions: 'Full client permission',
    vertical: 'events',
  },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function createEmptyWizardState(): ClientWizardState {
  return {
    userName: '',
    email: '',
    contactNumber: '',
    companyName: '',
    clientType: '',
    role: '',
    panNo: 'N/A',
    birthday: '',
    joiningDate: '',
    remarks: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    billingSameAsCompany: true,
    permissionLevel: 'Limited permissions',
    canApproveOrders: true,
    canManageUsers: false,
    canViewInvoices: true,
    canManagePayments: false,
    canDownloadReports: false,
    monthlySpendLimit: '',
    bookingApprovalLimit: '',
    gstNumber: '',
    invoiceCycle: 'Monthly',
    invoiceEmail: '',
    invoiceNotes: '',
    poRequired: false,
    invoiceCurrency: 'INR',
    taxTreatment: 'Exclusive of tax',
    bankName: '',
    accountNo: '',
    branchName: '',
    ifscCode: '',
    paymentTerms: '',
    paymentMode: 'Bank transfer',
    duePayment: '',
    upiId: '',
    autoDebitEnabled: false,
    creditPeriodDays: '',
  };
}

export default function AdminClientManagementPage() {
  const [clients, setClients] = useState<ClientRow[]>(INITIAL_CLIENTS);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['1']));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    const walk = (rows: ClientRow[]) => {
      rows.forEach((r) => {
        m[r.id] = true;
        r.children?.forEach((c) => {
          m[c.id] = true;
        });
      });
    };
    walk(INITIAL_CLIENTS);
    return m;
  });
  const [query, setQuery] = useState('');
  const [productLine, setProductLine] = useState<AdminProductLine>('gifting');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [addClientMenuOpen, setAddClientMenuOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<ClientUser | null>(null);
  const [detailsTab, setDetailsTab] = useState<WizardTab>('general');
  const [detailsData, setDetailsData] = useState<ClientWizardState>(createEmptyWizardState());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit' | 'view'>('add');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [wizardTab, setWizardTab] = useState<WizardTab>('general');
  const [visitedTabs, setVisitedTabs] = useState<Set<WizardTab>>(new Set(['general']));
  const [wizardError, setWizardError] = useState('');
  const [uiNotice, setUiNotice] = useState('');
  const [wizardData, setWizardData] = useState<ClientWizardState>(createEmptyWizardState());
  const [clientMetaById, setClientMetaById] = useState<ClientMetaMap>({});
  const pageSize = 2;

  useEffect(() => {
    if (!openMenuId && !addClientMenuOpen) return;
    const close = () => setOpenMenuId(null);
    const closeAll = () => {
      close();
      setAddClientMenuOpen(false);
    };
    document.addEventListener('click', closeAll);
    return () => document.removeEventListener('click', closeAll);
  }, [openMenuId, addClientMenuOpen]);

  const filtered = useMemo(() => {
    let list = clients.filter((c) => c.vertical === productLine);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q)
      );
    }
    return list;
  }, [clients, productLine, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage]
  );

  useEffect(() => {
    setPage(1);
  }, [productLine, query]);

  const totalUsers = useMemo(() => {
    let n = 0;
    clients.forEach((c) => {
      n += 1;
      n += c.children?.length ?? 0;
    });
    return n;
  }, [clients]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allOnPageSelected = paginated.length > 0 && paginated.every((c) => selected.has(c.id));
    if (allOnPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        paginated.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        paginated.forEach((c) => next.add(c.id));
        return next;
      });
    }
  };

  const toggleVisibility = (id: string) => {
    setVisible((v) => ({ ...v, [id]: !v[id] }));
  };

  const getUserById = (id: string): ClientUser | null => {
    for (const client of clients) {
      if (client.id === id) return client;
      const child = client.children?.find((c) => c.id === id);
      if (child) return child;
    }
    return null;
  };

  const buildWizardStateFromUser = (user: ClientUser): ClientWizardState => {
    const blank = createEmptyWizardState();
    const stored = clientMetaById[user.id];
    return {
      ...blank,
      userName: user.name,
      role: user.role,
      email: user.email,
      companyName: user.company,
      permissionLevel: user.permissions,
      ...(stored ?? {}),
    };
  };

  const openDetails = (user: ClientUser) => {
    setDetailsTarget(user);
    setDetailsData(buildWizardStateFromUser(user));
    setDetailsTab('general');
  };

  const openEditor = (user?: ClientUser, mode?: 'add' | 'edit' | 'view') => {
    const blank = createEmptyWizardState();
    const resolvedMode = mode ?? (user ? 'edit' : 'add');
    setEditorMode(resolvedMode);
    if (user) {
      setEditingUserId(user.id);
      const stored = clientMetaById[user.id];
      setWizardData({
        ...blank,
        userName: user.name,
        role: user.role,
        email: user.email,
        companyName: user.company,
        permissionLevel: user.permissions,
        ...(stored ?? {}),
      });
    } else {
      setEditingUserId(null);
      setWizardData(blank);
    }
    setWizardTab('general');
    setVisitedTabs(new Set(['general']));
    setWizardError('');
    setEditorOpen(true);
  };

  const tabs: Array<{ id: WizardTab; label: string }> = [
    { id: 'general', label: 'General details' },
    { id: 'address', label: 'Address details' },
    { id: 'permissions', label: 'Permissions' },
    { id: 'invoice', label: 'Invoice' },
    { id: 'payment', label: 'Payment' },
  ];

  const validateTab = (tab: WizardTab) => {
    if (tab === 'general') {
      if (!wizardData.userName.trim()) return 'User name is required.';
      if (!wizardData.email.trim()) return 'Email is required.';
      if (!wizardData.contactNumber.trim()) return 'Contact number is required.';
      if (!wizardData.companyName.trim()) return 'Company name is required.';
      if (!wizardData.role.trim()) return 'Role is required.';
    }
    if (tab === 'address') {
      if (!wizardData.addressLine1.trim()) return 'Address line 1 is required.';
      if (!wizardData.city.trim() || !wizardData.state.trim()) return 'City and state are required.';
    }
    if (tab === 'invoice') {
      if (!wizardData.invoiceEmail.trim()) return 'Invoice email is required.';
    }
    if (tab === 'payment') {
      if (!wizardData.bankName.trim() || !wizardData.accountNo.trim() || !wizardData.ifscCode.trim()) {
        return 'Bank name, account number and IFSC code are required.';
      }
    }
    return '';
  };

  const goToTab = (tab: WizardTab) => {
    setVisitedTabs((prev) => new Set(prev).add(tab));
    setWizardTab(tab);
  };

  const goNextTab = () => {
    const err = validateTab(wizardTab);
    if (err) {
      setWizardError(err);
      return;
    }
    setWizardError('');
    const idx = tabs.findIndex((t) => t.id === wizardTab);
    const next = tabs[idx + 1];
    if (next) goToTab(next.id);
  };

  const saveEditor = () => {
    const err = validateTab('general') || validateTab('address') || validateTab('invoice') || validateTab('payment');
    if (err) {
      setWizardError(err);
      return;
    }
    setWizardError('');

    const name = wizardData.userName.trim();
    const role = wizardData.role.trim();
    const email = wizardData.email.trim();
    const company = wizardData.companyName.trim();
    const permissions = wizardData.permissionLevel.trim() || 'Limited permissions';

    if (!editingUserId) {
      const nextId = `c-${Date.now()}`;
      const newClient: ClientRow = {
        id: nextId,
        name,
        role,
        email,
        company,
        permissions,
        vertical: productLine,
      };
      setClients((prev) => [newClient, ...prev]);
      setVisible((prev) => ({ ...prev, [nextId]: true }));
      setClientMetaById((prev) => ({
        ...prev,
        [nextId]: {
          contactNumber: wizardData.contactNumber,
          clientType: wizardData.clientType,
          panNo: wizardData.panNo,
          birthday: wizardData.birthday,
          joiningDate: wizardData.joiningDate,
          remarks: wizardData.remarks,
          addressLine1: wizardData.addressLine1,
          addressLine2: wizardData.addressLine2,
          city: wizardData.city,
          state: wizardData.state,
          postalCode: wizardData.postalCode,
          country: wizardData.country,
          permissionLevel: wizardData.permissionLevel,
          canApproveOrders: wizardData.canApproveOrders,
          canManageUsers: wizardData.canManageUsers,
          canViewInvoices: wizardData.canViewInvoices,
          gstNumber: wizardData.gstNumber,
          invoiceCycle: wizardData.invoiceCycle,
          invoiceEmail: wizardData.invoiceEmail,
          invoiceNotes: wizardData.invoiceNotes,
          bankName: wizardData.bankName,
          accountNo: wizardData.accountNo,
          branchName: wizardData.branchName,
          ifscCode: wizardData.ifscCode,
          paymentTerms: wizardData.paymentTerms,
          paymentMode: wizardData.paymentMode,
          duePayment: wizardData.duePayment,
        },
      }));
      setEditorOpen(false);
      return;
    }

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === editingUserId) {
          return { ...c, name, role, email, company, permissions };
        }
        if (!c.children?.length) return c;
        return {
          ...c,
          children: c.children.map((child) =>
            child.id === editingUserId ? { ...child, name, role, email, company, permissions } : child
          ),
        };
      })
    );
    setClientMetaById((prev) => ({
      ...prev,
      [editingUserId]: {
        contactNumber: wizardData.contactNumber,
        clientType: wizardData.clientType,
        panNo: wizardData.panNo,
        birthday: wizardData.birthday,
        joiningDate: wizardData.joiningDate,
        remarks: wizardData.remarks,
        addressLine1: wizardData.addressLine1,
        addressLine2: wizardData.addressLine2,
        city: wizardData.city,
        state: wizardData.state,
        postalCode: wizardData.postalCode,
        country: wizardData.country,
        permissionLevel: wizardData.permissionLevel,
        canApproveOrders: wizardData.canApproveOrders,
        canManageUsers: wizardData.canManageUsers,
        canViewInvoices: wizardData.canViewInvoices,
        gstNumber: wizardData.gstNumber,
        invoiceCycle: wizardData.invoiceCycle,
        invoiceEmail: wizardData.invoiceEmail,
        invoiceNotes: wizardData.invoiceNotes,
        bankName: wizardData.bankName,
        accountNo: wizardData.accountNo,
        branchName: wizardData.branchName,
        ifscCode: wizardData.ifscCode,
        paymentTerms: wizardData.paymentTerms,
        paymentMode: wizardData.paymentMode,
        duePayment: wizardData.duePayment,
      },
    }));
    setEditorOpen(false);
  };

  const deleteUser = (id: string) => {
    setClients((prev) =>
      prev
        .filter((c) => c.id !== id)
        .map((c) => ({
          ...c,
          children: c.children?.filter((child) => child.id !== id),
        }))
    );
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setVisible((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setClientMetaById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setOpenMenuId(null);
  };

  const addBulkUsers = () => {
    const batchAt = Date.now();
    const batch: ClientRow[] = [
      {
        id: `b-${batchAt}-1`,
        name: 'Nisha Mehra',
        role: 'Procurement',
        email: 'nisha.mehra@corporate.example',
        company: 'Bulk Corp',
        permissions: 'Limited permissions',
        vertical: productLine,
      },
      {
        id: `b-${batchAt}-2`,
        name: 'Arjun Paul',
        role: 'Finance',
        email: 'arjun.paul@corporate.example',
        company: 'Bulk Corp',
        permissions: 'Full client permission',
        vertical: productLine,
      },
    ];
    setClients((prev) => [...batch, ...prev]);
    setVisible((prev) => ({
      ...prev,
      [batch[0].id]: true,
      [batch[1].id]: true,
    }));
    setAddClientMenuOpen(false);
  };

  const allOnPageSelected =
    paginated.length > 0 && paginated.every((c) => selected.has(c.id));

  return (
    <div className="space-y-4">
      <AdminPageTitleRow
        title="Client Management"
        totalLabel={
          <>
            <span className="font-semibold text-slate-700">{totalUsers}</span> total users
          </>
        }
      />
      <AdminProductLineTabs value={productLine} onChange={setProductLine} />

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 lg:p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users…"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setUiNotice('Bulk export will be available in a future release.')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#2563EB] text-[#2563EB] text-sm font-semibold hover:bg-blue-50"
              >
                <Download className="size-4" />
                Bulk Export
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddClientMenuOpen((v) => !v);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold shadow-sm hover:bg-[#1D4ED8]"
              >
                <Plus className="size-4" />
                Add client
              </button>
              {addClientMenuOpen && (
                <div
                  className="absolute z-20 mt-2 right-6 top-[6.2rem] w-[280px] rounded-2xl border border-[#e6e6e6] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={addBulkUsers}
                    className="w-full px-6 py-4 text-left text-base font-medium leading-6 text-slate-600 hover:bg-slate-50"
                  >
                    Bulk upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddClientMenuOpen(false);
                      openEditor();
                    }}
                    className="w-full border-t border-[#e6e6e6] px-6 py-4 text-left text-base font-medium leading-6 text-slate-600 hover:bg-slate-50"
                  >
                    Add a single user
                  </button>
                </div>
              )}
            </div>
          </div>
          {uiNotice && (
            <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {uiNotice}
            </p>
          )}
        </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50/80 border-b border-slate-100">
              <th className="w-10 py-3 pl-4 pr-2">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                  aria-label="Select all"
                />
              </th>
              <th className="py-3 pr-4">User name</th>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3 pr-4">Email ID</th>
              <th className="py-3 pr-4">Company</th>
              <th className="py-3 pr-4">Permissions</th>
              <th className="py-3 pr-4">Visibility</th>
              <th className="w-12 py-3 pr-4" />
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {paginated.map((row, rowIdx) => {
              const stripe = ((safePage - 1) * pageSize + rowIdx) % 2 === 1;
              return (
              <Fragment key={row.id}>
                <tr
                  className={`border-b border-slate-100 hover:bg-slate-50/60 ${
                    stripe ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  <td className="py-3 pl-4 pr-2 align-middle">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                      aria-label={`Select ${row.name}`}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {row.children?.length ? (
                        <button
                          type="button"
                          onClick={() => toggleExpand(row.id)}
                          className="p-0.5 rounded text-slate-500 hover:bg-slate-200/80"
                          aria-expanded={expanded.has(row.id)}
                          aria-label={expanded.has(row.id) ? 'Collapse row' : 'Expand row'}
                        >
                          {expanded.has(row.id) ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </button>
                      ) : (
                        <span className="w-5" />
                      )}
                      <span className="size-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 text-[11px] font-bold flex items-center justify-center text-slate-600 shrink-0">
                        {initials(row.name)}
                      </span>
                      <span className="font-semibold text-slate-900">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{row.role}</td>
                  <td className="py-3 pr-4 text-slate-600 font-mono text-xs">{row.email}</td>
                  <td className="py-3 pr-4 text-slate-600">{row.company}</td>
                  <td className="py-3 pr-4 text-slate-600 text-xs">{row.permissions}</td>
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={visible[row.id]}
                      onClick={() => toggleVisibility(row.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        visible[row.id] ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                          visible[row.id] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 pr-4 relative text-right">
                    <button
                      type="button"
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Actions"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId((id) => (id === row.id ? null : row.id));
                      }}
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {openMenuId === row.id && (
                      <div
                        className="absolute right-2 top-10 z-20 w-[260px] rounded-2xl border border-[#e6e6e6] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] text-left"
                        onClick={(e) => e.stopPropagation()}
                        role="menu"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            openEditor(row, 'view');
                          }}
                          className="w-full px-6 py-4 text-left text-base font-medium leading-6 text-slate-600 hover:bg-slate-50"
                        >
                          View corporate detail
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            openEditor(row);
                          }}
                          className="w-full border-t border-[#e6e6e6] px-6 py-4 text-left text-base font-medium leading-6 text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            setQuery(row.name);
                          }}
                          className="w-full border-t border-[#e6e6e6] px-6 py-4 text-left text-base font-medium leading-6 text-slate-600 hover:bg-slate-50"
                        >
                          Login as this client
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUser(row.id)}
                          className="w-full border-t border-[#e6e6e6] px-6 py-4 text-left text-base font-medium leading-6 text-slate-600 hover:bg-slate-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                {row.children && expanded.has(row.id) &&
                  row.children.map((child) => (
                    <tr
                      key={child.id}
                      className={`border-b border-slate-100 ${stripe ? 'bg-slate-50/30' : 'bg-slate-50/50'}`}
                    >
                      <td className="py-2.5 pl-4 pr-2 align-middle">
                        <input
                          type="checkbox"
                          checked={selected.has(child.id)}
                          onChange={() => toggleSelect(child.id)}
                          className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                          aria-label={`Select ${child.name}`}
                        />
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2 pl-6 ml-4 border-l-2 border-[#2563EB]">
                          <span className="size-8 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-600 shrink-0">
                            {initials(child.name)}
                          </span>
                          <span className="font-medium text-slate-800">{child.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">{child.role}</td>
                      <td className="py-2.5 pr-4 text-slate-600 font-mono text-xs">{child.email}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{child.company}</td>
                      <td className="py-2.5 pr-4 text-slate-600 text-xs">{child.permissions}</td>
                      <td className="py-2.5 pr-4">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={visible[child.id]}
                          onClick={() => toggleVisibility(child.id)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            visible[child.id] ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                              visible[child.id] ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-2.5 pr-4 text-right relative">
                        <button
                          type="button"
                          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
                          aria-label="Actions"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId((id) => (id === child.id ? null : child.id));
                          }}
                        >
                          <MoreVertical className="size-4" />
                        </button>
                        {openMenuId === child.id && (
                          <div
                            className="absolute right-2 top-10 z-20 w-[260px] rounded-2xl border border-[#e6e6e6] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] text-left"
                            onClick={(e) => e.stopPropagation()}
                            role="menu"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                openEditor(child, 'view');
                              }}
                              className="w-full px-6 py-4 text-left text-base font-medium leading-6 text-slate-600 hover:bg-slate-50"
                            >
                              View corporate detail
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                openEditor(child);
                              }}
                              className="w-full border-t border-[#e6e6e6] px-6 py-4 text-left text-base font-medium leading-6 text-slate-600 hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setQuery(child.name);
                              }}
                              className="w-full border-t border-[#e6e6e6] px-6 py-4 text-left text-base font-medium leading-6 text-slate-600 hover:bg-slate-50"
                            >
                              Login as this client
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteUser(child.id)}
                              className="w-full border-t border-[#e6e6e6] px-6 py-4 text-left text-base font-medium leading-6 text-slate-600 hover:bg-slate-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </Fragment>
            );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="font-medium text-[#2563EB] disabled:text-slate-300 disabled:cursor-not-allowed hover:underline"
          >
            ← Previous
          </button>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="font-medium text-[#2563EB] disabled:text-slate-300 disabled:cursor-not-allowed hover:underline"
          >
            Next →
          </button>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-colors ${
                safePage === n
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>

    {detailsTarget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="text-2xl font-semibold text-slate-700">Client details</h3>
            <button type="button" className="text-2xl text-slate-500" onClick={() => setDetailsTarget(null)}>
              ×
            </button>
          </div>
          <div className="px-6 pt-4">
            <div className="flex items-center gap-6 border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDetailsTab(tab.id)}
                  className={`pb-2 text-base leading-none border-b-2 ${
                    detailsTab === tab.id ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[66vh] overflow-auto px-6 py-5">
            {detailsTab === 'general' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="row-span-1">
                    <div className="relative mt-2 h-20 w-20 overflow-hidden rounded-full bg-slate-200">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-white text-xs">
                        📷
                      </span>
                    </div>
                  </div>
                  <div><label className="mb-1 block text-sm text-slate-600">User Name*</label><input value={detailsData.userName} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Email ID*</label><input value={detailsData.email} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Contact number*</label>
                    <div className="flex h-11 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-1 border-r border-slate-200 px-3 text-sm text-slate-600">+91</div>
                      <input value={detailsData.contactNumber} readOnly className="h-full w-full bg-slate-50 px-3 text-sm outline-none" />
                    </div>
                  </div>
                  <div><label className="mb-1 block text-sm text-slate-600">Company Name</label><input value={detailsData.companyName} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Birthday</label><input value={detailsData.birthday} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Type</label><input value={detailsData.clientType} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Date of Joining</label><input value={detailsData.joiningDate} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Role</label><input value={detailsData.role} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Remarks</label><input value={detailsData.remarks} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">PAN No.</label><input value={detailsData.panNo} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                </div>

                <div className="border-t border-slate-200 pt-5" />

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="mb-1 block text-sm text-slate-600">Bank Name</label><input value={detailsData.bankName} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Account No.</label><input value={detailsData.accountNo} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Branch Name</label><input value={detailsData.branchName} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Bank IFSC Code</label><input value={detailsData.ifscCode} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Payment Terms</label><input value={detailsData.paymentTerms} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Payment Mode</label><input value={detailsData.paymentMode} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Due Payment</label><input value={detailsData.duePayment} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-red-500" /></div>
                </div>
              </div>
            )}
            {detailsTab === 'address' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="mb-1 block text-sm text-slate-600">Address line 1</label><input value={detailsData.addressLine1} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div className="col-span-2"><label className="mb-1 block text-sm text-slate-600">Address line 2</label><input value={detailsData.addressLine2} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div className="col-span-2"><label className="mb-1 block text-sm text-slate-600">Landmark</label><input value={detailsData.landmark} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">City</label><input value={detailsData.city} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">State</label><input value={detailsData.state} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Postal code</label><input value={detailsData.postalCode} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Country</label><input value={detailsData.country} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div className="col-span-2"><label className="mb-1 block text-sm text-slate-600">Billing same as company</label><input value={detailsData.billingSameAsCompany ? 'Yes' : 'No'} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
              </div>
            )}
            {detailsTab === 'permissions' && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm text-slate-600">Permission level</label><input value={detailsData.permissionLevel} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Can approve orders</label><input value={detailsData.canApproveOrders ? 'Yes' : 'No'} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Can manage users</label><input value={detailsData.canManageUsers ? 'Yes' : 'No'} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Can view invoices</label><input value={detailsData.canViewInvoices ? 'Yes' : 'No'} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Can manage payments</label><input value={detailsData.canManagePayments ? 'Yes' : 'No'} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Can download reports</label><input value={detailsData.canDownloadReports ? 'Yes' : 'No'} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Monthly spend limit</label><input value={detailsData.monthlySpendLimit} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Booking approval limit</label><input value={detailsData.bookingApprovalLimit} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
              </div>
            )}
            {detailsTab === 'invoice' && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm text-slate-600">GST Number</label><input value={detailsData.gstNumber} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Invoice cycle</label><input value={detailsData.invoiceCycle} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div className="col-span-2"><label className="mb-1 block text-sm text-slate-600">Invoice email</label><input value={detailsData.invoiceEmail} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Currency</label><input value={detailsData.invoiceCurrency} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Tax treatment</label><input value={detailsData.taxTreatment} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div className="col-span-2"><label className="mb-1 block text-sm text-slate-600">PO required</label><input value={detailsData.poRequired ? 'Yes' : 'No'} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div className="col-span-2"><label className="mb-1 block text-sm text-slate-600">Invoice notes</label><textarea value={detailsData.invoiceNotes} readOnly className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" /></div>
              </div>
            )}
            {detailsTab === 'payment' && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm text-slate-600">Bank Name</label><input value={detailsData.bankName} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Account No.</label><input value={detailsData.accountNo} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Branch Name</label><input value={detailsData.branchName} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Bank IFSC Code</label><input value={detailsData.ifscCode} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Payment Terms</label><input value={detailsData.paymentTerms} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Payment Mode</label><input value={detailsData.paymentMode} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">UPI ID</label><input value={detailsData.upiId} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Credit period (days)</label><input value={detailsData.creditPeriodDays} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Due Payment</label><input value={detailsData.duePayment} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-red-500" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Auto debit enabled</label><input value={detailsData.autoDebitEnabled ? 'Yes' : 'No'} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" /></div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button type="button" onClick={() => setDetailsTarget(null)} className="min-w-[120px] rounded-full border border-[#2563EB] px-6 py-2 text-[#2563EB]">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const idx = tabs.findIndex((t) => t.id === detailsTab);
                const next = tabs[idx + 1];
                if (next) setDetailsTab(next.id);
                else setDetailsTarget(null);
              }}
              className="min-w-[120px] rounded-full bg-[#2563EB] px-6 py-2 text-white shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )}

    {editorOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="text-2xl font-semibold text-slate-700">
              {editorMode === 'add' ? 'Adding a Client' : editorMode === 'edit' ? 'Editing a Client' : 'Adding a Client'}
            </h3>
            <button type="button" className="text-2xl text-slate-500" onClick={() => setEditorOpen(false)}>
              ×
            </button>
          </div>
          <div className="px-6 pt-4">
            <div className="flex items-center gap-6 border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (!visitedTabs.has(tab.id) && tab.id !== 'general') return;
                    setWizardTab(tab.id);
                  }}
                  className={`pb-2 text-base leading-none border-b-2 ${
                    wizardTab === tab.id
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : visitedTabs.has(tab.id) || tab.id === 'general'
                        ? 'border-transparent text-slate-400'
                        : 'border-transparent text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[66vh] overflow-auto px-6 py-5">
            {wizardError && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{wizardError}</div>}

            {wizardTab === 'general' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="row-span-1">
                    <div className="relative mt-2 h-20 w-20 overflow-hidden rounded-full bg-slate-200">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-white text-xs"
                        aria-label="Upload photo"
                      >
                        📷
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">User Name*</label>
                    <input value={wizardData.userName} onChange={(e) => setWizardData((p) => ({ ...p, userName: e.target.value }))} placeholder="Kapil Dev" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Email ID*</label>
                    <input value={wizardData.email} onChange={(e) => setWizardData((p) => ({ ...p, email: e.target.value }))} placeholder="Enter user email id" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Contact number*</label>
                    <div className="flex h-11 overflow-hidden rounded-lg border border-slate-200">
                      <div className="flex items-center gap-1 border-r border-slate-200 px-3 text-sm text-slate-600">+91</div>
                      <input value={wizardData.contactNumber} onChange={(e) => setWizardData((p) => ({ ...p, contactNumber: e.target.value }))} placeholder="Enter user contact" className="h-full w-full px-3 text-sm outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Company Name</label>
                    <input value={wizardData.companyName} onChange={(e) => setWizardData((p) => ({ ...p, companyName: e.target.value }))} placeholder="Enter role" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Birthday</label>
                    <input type="date" value={wizardData.birthday} onChange={(e) => setWizardData((p) => ({ ...p, birthday: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Type</label>
                    <input value={wizardData.clientType} onChange={(e) => setWizardData((p) => ({ ...p, clientType: e.target.value }))} placeholder="Enter role" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Date of Joining</label>
                    <input type="date" value={wizardData.joiningDate} onChange={(e) => setWizardData((p) => ({ ...p, joiningDate: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Role</label>
                    <input value={wizardData.role} onChange={(e) => setWizardData((p) => ({ ...p, role: e.target.value }))} placeholder="Enter role" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Remarks</label>
                    <input value={wizardData.remarks} onChange={(e) => setWizardData((p) => ({ ...p, remarks: e.target.value }))} placeholder="Select date" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">PAN No.</label>
                    <input value={wizardData.panNo} onChange={(e) => setWizardData((p) => ({ ...p, panNo: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-5" />

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="mb-1 block text-sm text-slate-600">Bank Name</label><input value={wizardData.bankName} onChange={(e) => setWizardData((p) => ({ ...p, bankName: e.target.value }))} placeholder="Enter role" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Account No.</label><input value={wizardData.accountNo} onChange={(e) => setWizardData((p) => ({ ...p, accountNo: e.target.value }))} placeholder="Select date" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Branch Name</label><input value={wizardData.branchName} onChange={(e) => setWizardData((p) => ({ ...p, branchName: e.target.value }))} placeholder="Enter role" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Bank IFSC Code</label><input value={wizardData.ifscCode} onChange={(e) => setWizardData((p) => ({ ...p, ifscCode: e.target.value }))} placeholder="Select date" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Payment Terms</label><input value={wizardData.paymentTerms} onChange={(e) => setWizardData((p) => ({ ...p, paymentTerms: e.target.value }))} placeholder="Enter role" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Payment Mode</label><input value={wizardData.paymentMode} onChange={(e) => setWizardData((p) => ({ ...p, paymentMode: e.target.value }))} placeholder="Select date" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                  <div><label className="mb-1 block text-sm text-slate-600">Due Payment</label><input value={wizardData.duePayment} onChange={(e) => setWizardData((p) => ({ ...p, duePayment: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-red-500" /></div>
                </div>
              </div>
            )}

            {wizardTab === 'address' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-sm text-slate-600">Address Line 1*</label>
                  <input value={wizardData.addressLine1} onChange={(e) => setWizardData((p) => ({ ...p, addressLine1: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm text-slate-600">Address Line 2</label>
                  <input value={wizardData.addressLine2} onChange={(e) => setWizardData((p) => ({ ...p, addressLine2: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm text-slate-600">Landmark</label>
                  <input value={wizardData.landmark} onChange={(e) => setWizardData((p) => ({ ...p, landmark: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                </div>
                <div><label className="mb-1 block text-sm text-slate-600">City*</label><input value={wizardData.city} onChange={(e) => setWizardData((p) => ({ ...p, city: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">State*</label><input value={wizardData.state} onChange={(e) => setWizardData((p) => ({ ...p, state: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Postal code</label><input value={wizardData.postalCode} onChange={(e) => setWizardData((p) => ({ ...p, postalCode: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Country</label><input value={wizardData.country} onChange={(e) => setWizardData((p) => ({ ...p, country: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={wizardData.billingSameAsCompany}
                      onChange={(e) => setWizardData((p) => ({ ...p, billingSameAsCompany: e.target.checked }))}
                    />
                    Billing address same as company address
                  </label>
                </div>
              </div>
            )}

            {wizardTab === 'permissions' && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Permission level</label>
                  <select value={wizardData.permissionLevel} onChange={(e) => setWizardData((p) => ({ ...p, permissionLevel: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm">
                    <option>Limited permissions</option>
                    <option>Full client permission</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={wizardData.canApproveOrders} onChange={(e) => setWizardData((p) => ({ ...p, canApproveOrders: e.target.checked }))} />Can approve orders</label>
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={wizardData.canManageUsers} onChange={(e) => setWizardData((p) => ({ ...p, canManageUsers: e.target.checked }))} />Can manage users</label>
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={wizardData.canViewInvoices} onChange={(e) => setWizardData((p) => ({ ...p, canViewInvoices: e.target.checked }))} />Can view invoices</label>
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={wizardData.canManagePayments} onChange={(e) => setWizardData((p) => ({ ...p, canManagePayments: e.target.checked }))} />Can manage payments</label>
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={wizardData.canDownloadReports} onChange={(e) => setWizardData((p) => ({ ...p, canDownloadReports: e.target.checked }))} />Can download reports</label>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Monthly spend limit</label>
                    <input value={wizardData.monthlySpendLimit} onChange={(e) => setWizardData((p) => ({ ...p, monthlySpendLimit: e.target.value }))} placeholder="e.g. 500000" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Booking approval limit</label>
                    <input value={wizardData.bookingApprovalLimit} onChange={(e) => setWizardData((p) => ({ ...p, bookingApprovalLimit: e.target.value }))} placeholder="e.g. 100000" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {wizardTab === 'invoice' && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm text-slate-600">GST Number</label><input value={wizardData.gstNumber} onChange={(e) => setWizardData((p) => ({ ...p, gstNumber: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Invoice cycle</label><input value={wizardData.invoiceCycle} onChange={(e) => setWizardData((p) => ({ ...p, invoiceCycle: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div className="col-span-2"><label className="mb-1 block text-sm text-slate-600">Invoice email*</label><input value={wizardData.invoiceEmail} onChange={(e) => setWizardData((p) => ({ ...p, invoiceEmail: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Currency</label>
                  <input value={wizardData.invoiceCurrency} onChange={(e) => setWizardData((p) => ({ ...p, invoiceCurrency: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Tax treatment</label>
                  <input value={wizardData.taxTreatment} onChange={(e) => setWizardData((p) => ({ ...p, taxTreatment: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={wizardData.poRequired} onChange={(e) => setWizardData((p) => ({ ...p, poRequired: e.target.checked }))} />
                    Purchase Order (PO) required for invoice generation
                  </label>
                </div>
                <div className="col-span-2"><label className="mb-1 block text-sm text-slate-600">Invoice notes</label><textarea value={wizardData.invoiceNotes} onChange={(e) => setWizardData((p) => ({ ...p, invoiceNotes: e.target.value }))} className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
              </div>
            )}

            {wizardTab === 'payment' && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm text-slate-600">Bank Name</label><input value={wizardData.bankName} onChange={(e) => setWizardData((p) => ({ ...p, bankName: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Account No.</label><input value={wizardData.accountNo} onChange={(e) => setWizardData((p) => ({ ...p, accountNo: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Branch Name</label><input value={wizardData.branchName} onChange={(e) => setWizardData((p) => ({ ...p, branchName: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Bank IFSC Code</label><input value={wizardData.ifscCode} onChange={(e) => setWizardData((p) => ({ ...p, ifscCode: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Payment Terms</label><input value={wizardData.paymentTerms} onChange={(e) => setWizardData((p) => ({ ...p, paymentTerms: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Payment Mode</label><input value={wizardData.paymentMode} onChange={(e) => setWizardData((p) => ({ ...p, paymentMode: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">UPI ID</label><input value={wizardData.upiId} onChange={(e) => setWizardData((p) => ({ ...p, upiId: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Credit period (days)</label><input value={wizardData.creditPeriodDays} onChange={(e) => setWizardData((p) => ({ ...p, creditPeriodDays: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Due Payment</label><input value={wizardData.duePayment} onChange={(e) => setWizardData((p) => ({ ...p, duePayment: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-red-500" /></div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={wizardData.autoDebitEnabled} onChange={(e) => setWizardData((p) => ({ ...p, autoDebitEnabled: e.target.checked }))} />
                    Enable auto-debit for recurring invoices
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button type="button" onClick={() => setEditorOpen(false)} className="min-w-[120px] rounded-full border border-[#2563EB] px-6 py-2 text-[#2563EB]">
              Cancel
            </button>
            {wizardTab === 'payment' ? (
              <button type="button" onClick={saveEditor} className="min-w-[120px] rounded-full bg-[#2563EB] px-6 py-2 text-white shadow-sm">
                Save
              </button>
            ) : (
              <button type="button" onClick={goNextTab} className="min-w-[120px] rounded-full bg-[#2563EB] px-6 py-2 text-white shadow-sm">
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
