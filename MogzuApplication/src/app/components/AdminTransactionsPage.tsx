import { ArrowLeft, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

const rows = [
  { id: 1, requestId: 'ENZO4199', category: '21 July 2024', item: 'Printed Round ...', price: '₹ 600', status: 'PROCESSING' as const },
  { id: 2, requestId: 'ENZO4199', category: '21 July 2024', item: '600.00', price: '₹ 1500', status: 'PENDING' as const },
  { id: 3, requestId: 'ENZO4199', category: '21 July 2024', item: '1200.00', price: '₹ 1500', status: 'PROCESSING' as const },
  { id: 4, requestId: 'ENZO4199', category: '21 July 2024', item: '600.00', price: '₹ 1500', status: 'PROCESSING' as const },
  { id: 5, requestId: 'ENZO4199', category: '21 July 2024', item: '600.00', price: '₹ 1500', status: 'PROCESSING' as const },
  { id: 6, requestId: 'ENZO4199', category: '21 July 2024', item: '600.00', price: '₹ 1500', status: 'PROCESSING' as const },
  { id: 7, requestId: 'ENZO4199', category: '21 July 2024', item: '600.00', price: '₹ 1500', status: 'PROCESSING' as const },
];

function statusClass(status: 'PROCESSING' | 'PENDING') {
  return status === 'PENDING'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-blue-100 text-blue-700';
}

export default function AdminTransactionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'General details' | 'Permissions' | 'Sales' | 'Orders'>('Orders');
  const [activePage, setActivePage] = useState(1);
  const [uiNotice, setUiNotice] = useState('');

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate('/admin/vendors/order-analytics')}
            className="rounded p-1 text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUiNotice('Edit controls will be available in a future release.')}
              className="inline-flex items-center gap-1 rounded-full bg-[#2563EB] px-4 py-1.5 text-sm text-white hover:bg-[#1D4ED8]"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setUiNotice('More actions will be available in a future release.')}
              className="text-slate-400"
            >
              ⋮
            </button>
          </div>
        </div>

        <div className="px-4 pt-3">
          <div className="flex items-center gap-6 border-b border-slate-200 text-sm">
            {(['General details', 'Permissions', 'Sales', 'Orders'] as const).map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setActiveTab(label);
                  setUiNotice(`${label} tab details will be available in a future release.`);
                }}
                className={`-mb-px border-b-2 pb-2 ${
                  label === activeTab ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {uiNotice && (
            <p className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {uiNotice}
            </p>
          )}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">Sr No.</th>
                  <th className="px-3 py-3">Request ID</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Ordered item</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 text-sm text-slate-600">
                    <td className="px-4 py-3">{row.id}</td>
                    <td className="px-3 py-3">{row.requestId}</td>
                    <td className="px-3 py-3">{row.category}</td>
                    <td className="px-3 py-3">{row.item}</td>
                    <td className="px-3 py-3">{row.price}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold ${statusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      <button
                        type="button"
                        onClick={() => setUiNotice(`Order actions for ${row.requestId} will be available in a future release.`)}
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActivePage(1)}
                className={`h-7 min-w-7 rounded px-2 ${activePage === 1 ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-100'}`}
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setActivePage(2)}
                className={`h-7 min-w-7 rounded px-2 ${activePage === 2 ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-100'}`}
              >
                2
              </button>
              <button
                type="button"
                onClick={() => setActivePage(3)}
                className={`h-7 min-w-7 rounded px-2 ${activePage === 3 ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-100'}`}
              >
                3
              </button>
              <span className="px-1">..</span>
              <button type="button" onClick={() => setActivePage(8)} className={`h-7 min-w-7 rounded px-2 ${activePage === 8 ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-100'}`}>8</button>
              <button type="button" onClick={() => setActivePage(9)} className={`h-7 min-w-7 rounded px-2 ${activePage === 9 ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-100'}`}>9</button>
              <button type="button" onClick={() => setActivePage(10)} className={`h-7 min-w-7 rounded px-2 ${activePage === 10 ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-100'}`}>10</button>
            </div>
            <button
              type="button"
              onClick={() => setActivePage((p) => Math.min(10, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
