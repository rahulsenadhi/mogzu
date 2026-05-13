import React from 'react';
import { useNavigate } from 'react-router';

export default function BillingInvoicesPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-['Montserrat']">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="text-[#2563eb] font-medium mb-6 hover:underline flex items-center gap-2">
          &larr; Back to Dashboard
        </button>
        <div className="bg-white rounded-2xl p-8 border border-[#ececec] shadow-sm">
          <h1 className="text-3xl font-bold text-[#0e1e3f] mb-6">Billing & Invoices</h1>
          <p className="text-slate-600 font-['Inter'] mb-8">View payment history, download past invoices, and manage payment methods.</p>
          <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 font-['Inter']">
            Invoice list and billing info will go here
          </div>
        </div>
      </div>
    </div>
  );
}
