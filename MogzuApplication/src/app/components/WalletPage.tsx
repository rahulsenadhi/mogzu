import React, { useState } from 'react';
import { useNavigate } from 'react-router';

export default function WalletPage() {
  const navigate = useNavigate();
  const [uiNotice, setUiNotice] = useState<string | null>(null);
  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-['Montserrat']">
      <div className="max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-[#2563eb] font-medium mb-6 hover:underline flex items-center gap-2"
        >
          &larr; Back to Dashboard
        </button>
        <div className="bg-white rounded-2xl p-8 border border-[#ececec] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0e1e3f] mb-2">My Wallet</h1>
              <p className="text-slate-600 font-['Inter']">Manage your points, balances, and transaction history.</p>
            </div>
            <div className="bg-[#ebf1ff] p-4 rounded-xl text-right border border-[#2563eb]/20">
              <span className="block text-sm text-[#2563eb] font-bold uppercase tracking-wider mb-1">Available Balance</span>
              <span className="text-3xl font-black text-[#0e1e3f]">1,250 pts</span>
              <span className="block text-sm text-slate-500 font-medium">≈ $12.50 USD</span>
            </div>
          </div>

          {uiNotice ? (
            <p className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 font-['Inter']">
              {uiNotice}
            </p>
          ) : null}
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setUiNotice('Add funds and point purchases will be available once billing integration is enabled.')}
              className="py-4 bg-[#2563eb] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Add Funds / Buy Points
            </button>
            <button
              type="button"
              onClick={() => setUiNotice('Point redemption will be available once rewards catalog checkout is enabled.')}
              className="py-4 bg-white border border-[#ececec] text-[#0e1e3f] rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
              Redeem Points
            </button>
          </div>

          <h3 className="text-xl font-bold text-[#0e1e3f] mb-4">Recent Transactions</h3>
          <div className="border border-[#ececec] rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="divide-y divide-[#ececec]">
              {[
                { date: 'Oct 24, 2023', desc: 'Point Purchase', type: 'Credit', amount: '+500 pts', color: 'text-green-600' },
                { date: 'Oct 15, 2023', desc: 'Gift Box Order #8271', type: 'Debit', amount: '-150 pts', color: 'text-red-600' },
                { date: 'Oct 01, 2023', desc: 'Welcome Bonus', type: 'Credit', amount: '+900 pts', color: 'text-green-600' }
              ].map((tx, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors font-['Inter']">
                  <div>
                    <span className="block font-bold text-[#0e1e3f] mb-0.5">{tx.desc}</span>
                    <span className="text-sm text-slate-500">{tx.date} • {tx.type}</span>
                  </div>
                  <span className={`font-bold ${tx.color}`}>{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
