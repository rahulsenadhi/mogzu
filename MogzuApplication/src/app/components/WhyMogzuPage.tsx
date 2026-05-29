import { Link } from 'react-router';
import { ArrowLeft, Target, Shield, Heart } from 'lucide-react';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { useMarketingCms } from '@/app/lib/useMarketingCms';

export default function WhyMogzuPage() {
  const { block: cms, fromCms } = useMarketingCms('why-mogzu');

  return (
    <div className="min-h-screen bg-white font-['Inter',_sans-serif] selection:bg-[#FFD100]/30 selection:text-[#0e1e3f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-[#FFD100] font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="mb-10">
          <Link to="/" className="inline-flex" aria-label="Mogzu home">
            <MogzuLogo className="h-10 sm:h-12 w-auto max-w-[220px] sm:max-w-[280px]" />
          </Link>
        </div>
        
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-[24px] bg-[#FFD100] flex items-center justify-center shadow-[0_8px_0_#d6b000]">
            <Target className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-[#0e1e3f] tracking-tighter mb-2">Why Mogzu</h1>
            <p className="text-2xl text-gray-500 font-medium">
              {fromCms && cms?.title ? cms.title : 'The Operating System for Execution'}
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-4xl text-gray-600 mb-16">
          <p className="text-xl leading-relaxed">
            {fromCms && cms?.body
              ? cms.body
              : 'Mogzu was built to solve a single, massive problem: the coordination chaos of corporate events. We believe that HR and operations teams should spend their time focusing on strategy and culture, not chasing down 15 different vendors for GST invoices.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 border-2 border-gray-100 rounded-3xl shadow-[0_8px_0_#f3f4f6]">
            <h3 className="text-2xl font-black text-[#0e1e3f] mb-4 flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#FFD100]" /> One Vendor of Record
            </h3>
            <p className="text-gray-600">Complete compliance. One invoice. Total transparency across all modules.</p>
          </div>
          <div className="p-8 border-2 border-gray-100 rounded-3xl shadow-[0_8px_0_#f3f4f6]">
            <h3 className="text-2xl font-black text-[#0e1e3f] mb-4 flex items-center gap-3">
              <Heart className="w-8 h-8 text-[#FFD100]" /> Built for Humans
            </h3>
            <p className="text-gray-600">A beautiful, frictionless user experience that your employees will actually love using.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
