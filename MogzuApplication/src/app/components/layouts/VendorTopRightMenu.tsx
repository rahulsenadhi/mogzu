import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, LifeBuoy, UserCircle2 } from 'lucide-react';

export function VendorTopRightMenu({
  userName = 'James Brown',
  userRole = 'Vendor Admin',
}: {
  userName?: string;
  userRole?: string;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1 hover:bg-slate-50"
      >
        <UserCircle2 className="h-6 w-6 text-slate-500" />
        <span className="hidden text-xs font-medium text-slate-700 sm:inline">{userName}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#ececec] z-50 overflow-hidden">
          <div className="p-3 border-b border-[#ececec] bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-600">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#0e1e3f]">{userName}</span>
                <span className="text-[11px] text-slate-500 font-medium">{userRole}</span>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              className="bg-white border border-[#ececec] rounded-lg p-2.5 flex items-center justify-between cursor-pointer hover:border-[#2563eb] transition-colors"
              onClick={() => {
                setOpen(false);
                navigate('/vendor/settings');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setOpen(false);
                  navigate('/vendor/settings');
                }
              }}
            >
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Wallet Balance</span>
                <span className="text-sm font-black text-[#0e1e3f]">
                  1,250 pts <span className="text-xs text-slate-400 font-medium">($12.50)</span>
                </span>
              </div>
              <ChevronDown className="h-4 w-4 rotate-270 text-[#2563eb]" />
            </div>
          </div>

          <div className="p-2 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/vendor/settings');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-[#ebf1ff] hover:text-[#2563eb] transition-colors w-full text-left font-medium"
            >
              My Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/vendor/settings');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-[#ebf1ff] hover:text-[#2563eb] transition-colors w-full text-left font-medium"
            >
              Company Settings
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/vendor/settings');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-[#ebf1ff] hover:text-[#2563eb] transition-colors w-full text-left font-medium"
            >
              Billing & Invoices
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/vendor/support');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-[#ebf1ff] hover:text-[#2563eb] transition-colors w-full text-left font-medium"
            >
              <LifeBuoy className="h-4 w-4 shrink-0 text-slate-500" />
              Contact support
            </button>
          </div>

          <div className="p-2 border-t border-[#ececec]">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/login');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left font-medium"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

