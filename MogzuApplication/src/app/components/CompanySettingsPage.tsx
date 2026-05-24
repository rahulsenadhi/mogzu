import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import {
  Building,
  Shield,
  Users,
  GitBranch,
  ArrowRight,
  CreditCard,
  LayoutGrid,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { listRules } from '@/lib/approvalWorkflow';

const PLAN_LABEL: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
};

export default function CompanySettingsPage() {
  const navigate = useNavigate();
  const { corporateAccount, corporateId } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [ruleCount, setRuleCount] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!corporateId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [team, rules, wallet] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })
          .eq('corporate_id', corporateId)
          .eq('status', 'active'),
        listRules(corporateId),
        supabase
          .from('wallets')
          .select('balance')
          .eq('corporate_id', corporateId)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      setTeamCount(team.count ?? 0);
      setRuleCount(rules.data.length);
      setWalletBalance(
        wallet.data ? Number((wallet.data as { balance: number }).balance) : 0,
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [corporateId]);

  const planTier = corporateAccount?.plan ?? 'starter';
  const planLabel = PLAN_LABEL[planTier] ?? planTier;

  const fmtCount = (n: number | null) => (loading || n === null ? '…' : n.toLocaleString('en-IN'));
  const fmtINR = (n: number | null) =>
    loading || n === null ? '…' : `₹${Math.round(n).toLocaleString('en-IN')}`;

  const sections = [
    {
      id: 'profile',
      title: 'Company Profile',
      description: 'Manage company details, GST info, and billing address.',
      icon: Building,
      stat: `Plan: ${planLabel}`,
      action: () => navigate('/my-profile'),
    },
    {
      id: 'roles',
      title: 'Roles & Permissions',
      description: 'Define booking limits and access levels for team members.',
      icon: Shield,
      stat: `${fmtCount(teamCount)} active member${teamCount === 1 ? '' : 's'}`,
      action: () => navigate('/user-management'),
    },
    {
      id: 'team',
      title: 'Team Members',
      description: 'Invite members, assign roles, and manage limits.',
      icon: Users,
      stat: `${fmtCount(teamCount)} active`,
      action: () => navigate('/user-management'),
    },
    {
      id: 'workflow',
      title: 'Approval Workflow',
      description: 'Configure routing rules for booking approvals.',
      icon: GitBranch,
      stat: `${fmtCount(ruleCount)} active rule${ruleCount === 1 ? '' : 's'}`,
      action: () => navigate('/settings/workflow'),
    },
    {
      id: 'billing',
      title: 'Payment Methods',
      description: 'Manage corporate cards and empanelled vendors.',
      icon: CreditCard,
      stat: `Wallet: ${fmtINR(walletBalance)}`,
      action: () => navigate('/wallet'),
    },
    {
      id: 'dashboard-layout',
      title: 'Dashboard layout',
      description:
        'Choose which sections appear on the home dashboard (including orders & deliveries hub).',
      icon: LayoutGrid,
      stat: null,
      action: () => navigate('/company-settings/dashboard'),
    },
  ];

  return (
    <div className="flex h-screen bg-[#FFFDF9] font-['Inter'] overflow-hidden">
      <SharedSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <MogzuCorporateScrollSurface>
          <div className="max-w-4xl mx-auto px-8 py-10">

            {/* Header card */}
            <div className="mb-8 rounded-2xl border border-white/60 bg-white/70 px-7 py-6 shadow-[0_10px_30px_rgba(67,121,238,0.10)] backdrop-blur-md">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {corporateAccount?.name ?? 'Company Settings'}
                  </h1>
                  <p className="mt-1.5 text-sm text-gray-500">
                    Manage your organisation's details, team members, and corporate policies.
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-blue-200/80 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-700">
                  {planLabel} plan
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={section.action}
                    className="group rounded-2xl border border-white/60 bg-white/70 p-6 text-left shadow-[0_8px_24px_rgba(67,121,238,0.08)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(67,121,238,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
                  >
                    <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{section.title}</h3>
                    {section.stat && (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {section.stat}
                      </p>
                    )}
                    <p className="mt-2 mb-4 text-sm leading-relaxed text-gray-500">{section.description}</p>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                      Manage settings
                      <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
