import { Link } from 'react-router';
import { ArrowLeft, MessageSquare, Zap, Clock } from 'lucide-react';

export default function HeyGeniePage() {
  return (
    <div className="min-h-screen bg-white font-['Inter',_sans-serif] selection:bg-[#9B51E0]/30 selection:text-[#0e1e3f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-[#9B51E0] font-bold mb-12 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-[24px] bg-[#9B51E0] flex items-center justify-center shadow-[0_8px_0_#7a3db4]">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-[#0e1e3f] tracking-tighter mb-2">Hey Genie</h1>
            <p className="text-2xl text-gray-500 font-medium">Your Corporate Concierge</p>
          </div>
        </div>

        <div className="prose prose-lg max-w-4xl text-gray-600 mb-16">
          <p className="text-xl leading-relaxed">
            Hey Genie is an always-on, intelligent concierge service designed for complex corporate requests. Whether it's securing a last-minute VIP dinner reservation or organizing a bespoke experience for your top performers, Genie makes it happen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 border-2 border-gray-100 rounded-3xl shadow-[0_8px_0_#f3f4f6]">
            <h3 className="text-2xl font-black text-[#0e1e3f] mb-4 flex items-center gap-3">
              <Zap className="w-8 h-8 text-[#9B51E0]" /> Fast Turnarounds
            </h3>
            <p className="text-gray-600">Get solutions to custom event and catering needs in record time.</p>
          </div>
          <div className="p-8 border-2 border-gray-100 rounded-3xl shadow-[0_8px_0_#f3f4f6]">
            <h3 className="text-2xl font-black text-[#0e1e3f] mb-4 flex items-center gap-3">
              <Clock className="w-8 h-8 text-[#9B51E0]" /> 24/7 Support
            </h3>
            <p className="text-gray-600">Our dedicated team and intelligent routing ensure you're never stuck.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
