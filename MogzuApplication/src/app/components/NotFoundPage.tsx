import { Link, useNavigate } from 'react-router';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8]">
      <div className="text-center px-6">
        <Link to="/" className="inline-flex justify-center mb-6" aria-label="Mogzu home">
          <MogzuLogo className="h-10 w-auto max-w-[200px] justify-center" />
        </Link>
        <h1 className="text-8xl font-bold text-[#4379ee] mb-4">404</h1>
        <p className="text-2xl font-semibold text-[#0e1e3f] mb-2">Page Not Found</p>
        <p className="text-base text-[#878e9e] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-[#4379ee] text-white rounded-full font-medium hover:bg-[#3568dd] transition-colors"
        >
          Go back to home
        </button>
      </div>
    </div>
  );
}
