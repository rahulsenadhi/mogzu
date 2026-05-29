import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, MessageSquare, Zap, Clock, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { HeyGenieConfig } from '@/lib/database.types'

export default function HeyGeniePage() {
  const navigate = useNavigate()
  const { profile, corporateId } = useAuth()
  const [config, setConfig] = useState<HeyGenieConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!corporateId) {
      setLoading(false)
      return
    }
    void db.heyGenie.getConfig(corporateId).then(({ data }) => {
      setConfig((data as HeyGenieConfig | null) ?? null)
      setLoading(false)
    })
  }, [corporateId])

  const isEnabled = config?.enabled ?? false

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

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 mb-8">
            <Loader2 className="size-5 animate-spin" />
            Loading workspace settings…
          </div>
        ) : profile && corporateId ? (
          <div
            className={`mb-8 rounded-2xl border px-5 py-4 ${
              isEnabled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            <p className="text-sm font-semibold">
              {isEnabled
                ? 'Hey Genie is enabled for your organisation.'
                : 'Hey Genie is not enabled for your organisation yet.'}
            </p>
            {isEnabled ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="mt-3 rounded-lg bg-[#9B51E0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7a3db4]"
              >
                Open dashboard assistant
              </button>
            ) : (
              <p className="mt-2 text-xs opacity-90">
                Ask your Mogzu admin to enable Hey Genie under Admin → Settings → Hey Genie.
              </p>
            )}
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
            <Link to="/login" className="font-semibold text-[#9B51E0] hover:underline">
              Sign in
            </Link>{' '}
            to see whether Hey Genie is enabled for your corporate workspace.
          </div>
        )}

        <div className="prose prose-lg max-w-4xl text-gray-600 mb-16">
          <p className="text-xl leading-relaxed">
            Hey Genie is an always-on, intelligent concierge service designed for complex corporate requests. Whether it&apos;s securing a last-minute VIP dinner reservation or organizing a bespoke experience for your top performers, Genie makes it happen.
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
            <p className="text-gray-600">Our dedicated team and intelligent routing ensure you&apos;re never stuck.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
