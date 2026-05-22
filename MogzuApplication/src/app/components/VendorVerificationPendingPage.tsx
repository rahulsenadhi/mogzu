import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertCircle, CheckCircle2, FileText, Loader2, Mail, ShieldCheck, Upload } from 'lucide-react';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { storageService } from '@/lib/storage';
import type { Vendor, VendorKycStatus, VendorStatus } from '@/lib/database.types';

const KYC_LABEL: Record<VendorKycStatus, string> = {
  not_started: 'Not uploaded',
  submitted: 'Submitted — awaiting review',
  review: 'In review',
  approved: 'Approved',
  rejected: 'Rejected — please re-upload',
};

export default function VendorVerificationPendingPage() {
  const navigate = useNavigate();
  const { vendorId } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [resubmitting, setResubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await db.vendors.getById(vendorId);
    if (err) setError(err.message);
    if (data) {
      const v = data as Vendor;
      setVendor(v);
      if (v.status === 'active') {
        navigate('/vendor/dashboard', { replace: true });
        return;
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const handleResubmit = async () => {
    if (!vendorId) return;
    setResubmitting(true);
    setError('');
    const { error: err } = await db.vendors.updateStatus(vendorId, 'pending');
    setResubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    await load();
  };

  const handleUpload = async (file: File) => {
    if (!vendorId) return;
    setUploading(true);
    setError('');
    const { url, error: upErr } = await storageService.documents.upload(`kyc/${vendorId}`, file);
    if (upErr) {
      setUploading(false);
      setError(upErr);
      return;
    }
    const { error: setErr } = await db.vendors.setKyc(vendorId, url);
    setUploading(false);
    if (setErr) {
      setError(setErr.message);
      return;
    }
    await load();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleUpload(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FE]">
        <Loader2 className="size-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  const status: VendorStatus | null = vendor?.status ?? null;
  const kycStatus: VendorKycStatus = (vendor?.kyc_status as VendorKycStatus) ?? 'not_started';
  const reasons: string[] = (vendor?.rejection_reasons ?? []) as string[];
  const isRejected = status === 'rejected';
  const canUpload = !isRejected && (kycStatus === 'not_started' || kycStatus === 'rejected');

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#0e1e3f]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <MogzuLogo className="mb-8 h-12 w-auto max-w-[220px]" />

          {isRejected ? (
            <>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4" />
                Application needs changes
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                We need a few corrections.
              </h1>
              <p className="mt-3 text-lg text-slate-600">
                Our team reviewed your application and flagged the following. Please address these and resubmit.
              </p>

              {reasons.length > 0 && (
                <ul className="mt-6 space-y-2 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                  {reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-rose-800">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}

              {error && (
                <p className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleResubmit}
                  disabled={resubmitting}
                  className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 font-semibold text-white transition hover:bg-[#1E4FCC] disabled:opacity-50"
                >
                  {resubmitting ? 'Resubmitting…' : 'Resubmit application'}
                </button>
                <Link
                  to="/vendor/support"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Contact support
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2563EB]">
                <CheckCircle2 className="h-4 w-4" />
                Application submitted
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Thanks for registering as a Mogzu partner.
              </h1>
              <p className="mt-3 text-lg text-slate-600">
                Verification has two steps: upload a KYC document below, then wait for our team to review.
              </p>

              <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">KYC document</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Upload a single PDF or image (business registration, GST certificate, or owner ID).
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
                      Status: {KYC_LABEL[kycStatus]}
                    </div>
                    {vendor?.kyc_doc_url && (
                      <a
                        href={vendor.kyc_doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View uploaded document
                      </a>
                    )}
                  </div>
                  {canUpload && (
                    <>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={onFileChange}
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1E4FCC] disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading…' : kycStatus === 'rejected' ? 'Re-upload' : 'Upload'}
                      </button>
                    </>
                  )}
                </div>
              </section>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <Mail className="mt-0.5 h-5 w-5 text-[#2563EB]" />
                  <p className="text-slate-700">You will receive an email once verification is done.</p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-[#2563EB]" />
                  <p className="text-slate-700">After approval, your vendor dashboard access will be activated.</p>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 font-semibold text-white transition hover:bg-[#1E4FCC]"
                >
                  Go to home
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Go to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
