import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { ChevronLeft, Plus, Trash2, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Rule {
  id: string;
  threshold: number;
  levels: ('L1' | 'L2' | 'L3')[];
  exception?: string;
}

export default function ApprovalWorkflowPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', threshold: 0, levels: ['L1'] },
    { id: '2', threshold: 50000, levels: ['L1', 'L2'] },
    { id: '3', threshold: 200000, levels: ['L1', 'L2', 'L3'], exception: 'Specific vendors always require L3' }
  ]);

  const addRule = () => {
    setRules([...rules, { id: Date.now().toString(), threshold: 100000, levels: ['L1'] }]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter']">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <MogzuCorporateScrollSurface>
          <div className="max-w-5xl mx-auto px-8 py-8">
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
                onClick={() => {
                  setSaveMessage('Workflow saved successfully.');
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save workflow
              </button>
            </div>

            {saveMessage && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {saveMessage}
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
                  className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Rule
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6">
                {rules.map((rule, index) => (
                  <div key={rule.id} className="flex flex-col gap-4 p-5 rounded-lg border border-gray-200 bg-white shadow-sm relative group">
                    <button 
                      onClick={() => removeRule(rule.id)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">Rule {index + 1}</span>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        If booking value exceeds
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <input 
                            type="number" 
                            value={rule.threshold}
                            readOnly
                            className="pl-7 pr-3 py-1.5 border border-gray-300 rounded-md w-32 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        require:
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-md border border-gray-100">
                      {['L1', 'L2', 'L3'].map((level, i) => {
                        const isIncluded = rule.levels.includes(level as 'L1'|'L2'|'L3');
                        return (
                          <div key={level} className="flex items-center gap-3">
                            <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-md border ${
                              isIncluded ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white opacity-50'
                            }`}>
                              <span className={`text-sm font-bold ${isIncluded ? 'text-blue-700' : 'text-gray-500'}`}>{level}</span>
                              <span className={`text-[10px] ${isIncluded ? 'text-blue-600' : 'text-gray-400'}`}>
                                {level === 'L1' ? 'Manager' : level === 'L2' ? 'Dept Head' : 'Finance'}
                              </span>
                            </div>
                            {i < 2 && (
                              <ArrowRight className={`w-4 h-4 ${isIncluded && rule.levels.includes(['L1', 'L2', 'L3'][i+1] as any) ? 'text-blue-400' : 'text-gray-300'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {rule.exception && (
                      <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200 flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Exception: {rule.exception}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}