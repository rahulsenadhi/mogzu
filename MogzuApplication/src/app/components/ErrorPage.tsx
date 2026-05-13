import { Link, useRouteError, useNavigate } from 'react-router';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';

export default function ErrorPage() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8]">
      <div className="text-center px-6">
        <Link to="/" className="inline-flex justify-center mb-6" aria-label="Mogzu home">
          <MogzuLogo className="h-10 w-auto max-w-[200px] justify-center" />
        </Link>
        <h1 className="text-6xl font-bold text-[#0e1e3f] mb-4">Oops!</h1>
        <p className="text-xl text-[#475569] mb-2">Sorry, an unexpected error has occurred.</p>
        <p className="text-sm text-[#878e9e] mb-8">
          {error?.statusText || error?.message || 'Unknown error'}
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
