import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { ChevronLeft, Plus, Trash2, ArrowRight, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { listRules, saveRules } from '@/lib/approvalWorkflow';
import type { WorkflowLevel } from '@/lib/approvalWorkflow';

interface Rule {
  id: string;
  threshold: number;
  levels: WorkflowLevel[];
  exception?: string;
}

const DEFAULT_RULES: Rule[] = [
  { id: 'd-1', threshold: 0, levels: ['L1'] },
  { id: 'd-2', threshold: 50000, levels: ['L1', 'L2'] },
  { id: 'd-3', threshold: 200000, levels: ['L1', 'L2', 'L3'], exception: 'Specific vendors always require L3' },
];

export default function ApprovalWorkflowPage() {
  const navigate = useNavigate();
  const { corporateId, role } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);

  const canEdit = role === 'l3_admin' || role === 'mogzu_admin';

  useEffect(() => {
    if (!corporateId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    listRules(corporateId).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        setSaveError(error);
        setIsLoading(false);
        return;
      }
      if (data.length === 0) {
        setRules(DEFAULT_RULES);
      } else {
        setRules(
          data.map((r) => ({
            id: r.id,
            threshold: r.threshold,
            levels: r.required_levels as WorkflowLevel[],
            exception: r.exception_note ?? undefined,
          })),
        );
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [corporateId]);

  const addRule = () => {
    setRules([...rules, { id: `new-${Date.now()}`, threshold: 100000, levels: ['L1'] }]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const updateThreshold = (id: string, value: number) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, threshold: value } : r)));
  };

  const toggleLevel = (id: string, level: WorkflowLevel) => {
    setRules(
      rules.map((r) => {
        if (r.id !== id) return r;
        const has = r.levels.includes(level);
        const next = has ? r.levels.filter((l) => l !== level) : [...r.levels, level];
        // Preserve chain order
        const order: WorkflowLevel[] = ['L1', 'L2', 'L3'];
        return { ...r, levels: order.filter((l) => next.includes(l)) };
      }),
    );
  };

  const updateException = (id: string, value: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, exception: value || undefined } : r)));
  };

  const handleSave = async () => {
    setSaveMessage('');
    setSaveError('');
    if (!corporateId) {
      setSaveError('Corporate context not loaded.');
      return;
    }
    if (!canEdit) {
      setSaveError('Only L3 admins can edit approval workflow rules.');
      return;
    }
    for (const r of rules) {
      if (r.levels.length === 0) {
        setSaveError('Every rule must require at least one approval level.');
        return;
      }
      if (r.threshold < 0 || Number.isNaN(r.threshold)) {
        setSaveError('Thresholds must be a non-negative number.');
        return;
      }
    }
    setIsSubmitting(true);
    const drafts = rules.map((r, i) => ({
      threshold: r.threshold,
      required_levels: r.levels,
      exception_note: r.exception ?? null,
      display_order: i,
    }));
    const { error } = await saveRules(corporateId, drafts);
    setIsSubmitting(false);
    if (error) {
      setSaveError(error);
      return;
    }
    setSaveMessage('Workflow saved.');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter']">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <MogzuCorporateScrollSurface>
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <button
                  onClick={() => navigate('/company-settings')}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-2 text-sm font-medium transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Settings
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Approval Workflow Config</h1>
                <p className="text-gray-500 mt-1">Configure spending limits and approval chains for your organization.</p>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting || isLoading || !canEdit}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Save workflow
              </button>
            </div>

            {!canEdit && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Read-only view — only L3 admins can edit approval rules.
              </div>
            )}

            {saveMessage && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {saveMessage}
              </div>
            )}
            {saveError && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {saveError}
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <ShieldAlert className="w-5 h-5 text-blue-600" />
                  Routing Rules
                </div>
                <button
                  onClick={addRule}
                  disabled={!canEdit}
                  className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Rule
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="p-6 flex flex-col gap-6">
                  {rules.map((rule, index) => (
                    <div key={rule.id} className="flex flex-col gap-4 p-5 rounded-lg border border-gray-200 bg-white shadow-sm relative group">
                      <button
                        onClick={() => removeRule(rule.id)}
                        disabled={!canEdit}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">Rule {index + 1}</span>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          If booking value exceeds
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <input
                              type="number"
                              value={rule.threshold}
                              disabled={!canEdit}
                              onChange={(e) => updateThreshold(rule.id, Number(e.target.value))}
                              className="pl-7 pr-3 py-1.5 border border-gray-300 rounded-md w-32 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                          </div>
                          require:
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-md border border-gray-100 flex-wrap">
                        {(['L1', 'L2', 'L3'] as WorkflowLevel[]).map((level, i) => {
                          const isIncluded = rule.levels.includes(level);
                          return (
                            <div key={level} className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => canEdit && toggleLevel(rule.id, level)}
                                disabled={!canEdit}
                                aria-pressed={isIncluded}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-md border transition disabled:cursor-not-allowed ${
                                  isIncluded ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white opacity-50 hover:opacity-80'
                                }`}
                              >
                                <span className={`text-sm font-bold ${isIncluded ? 'text-blue-700' : 'text-gray-500'}`}>{level}</span>
                                <span className={`text-[10px] ${isIncluded ? 'text-blue-600' : 'text-gray-400'}`}>
                                  {level === 'L1' ? 'Manager' : level === 'L2' ? 'Dept Head' : 'Finance'}
                                </span>
                              </button>
                              {i < 2 && (
                                <ArrowRight
                                  className={`w-4 h-4 ${
                                    isIncluded && rule.levels.includes((['L1', 'L2', 'L3'] as WorkflowLevel[])[i + 1])
                                      ? 'text-blue-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 mt-2" />
                        <input
                          type="text"
                          value={rule.exception ?? ''}
                          disabled={!canEdit}
                          onChange={(e) => updateException(rule.id, e.target.value)}
                          placeholder="Exception note (optional) — e.g. Specific vendors always require L3"
                          className="flex-1 text-xs text-amber-800 bg-amber-50 px-3 py-2 rounded border border-amber-200 focus:ring-2 focus:ring-amber-300 outline-none placeholder:text-amber-500/70 disabled:bg-white disabled:opacity-60"
                        />
                      </div>
                    </div>
                  ))}
                  {rules.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No rules configured. Click <strong>Add Rule</strong> to start.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
