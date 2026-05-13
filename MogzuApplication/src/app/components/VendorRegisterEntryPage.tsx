import { Navigate } from 'react-router';
import { getVendorSignupRedirectPath } from '@/app/lib/vendorOnboardingStorage';

/** Instant redirect — no blank screen (previously returned null while useEffect ran). */
export default function VendorRegisterEntryPage() {
  return <Navigate to={getVendorSignupRedirectPath()} replace />;
}
