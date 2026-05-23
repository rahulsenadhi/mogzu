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
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-['Montserrat']">
                  {corporateAccount?.name ?? 'Company Settings'}
                </h1>
                <p className="mt-2 text-gray-500">
                  Manage your organization&apos;s details, team members, and corporate policies.
                </p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
                {planLabel} plan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    onClick={section.action}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{section.title}</h3>
                    {section.stat && (
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {section.stat}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mb-4 h-10">{section.description}</p>
                    <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                      Manage settings
                      <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
