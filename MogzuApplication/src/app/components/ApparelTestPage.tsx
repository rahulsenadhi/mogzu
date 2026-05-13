import { useNavigate } from 'react-router';

export default function ApparelTestPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-12 shadow-2xl text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-purple-600 mb-4">
          🎉 IT WORKS! 🎉
        </h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Apparel Page is Loading!
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          The routing is working correctly. You are now on the Apparel page.
        </p>
        <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6">
          <p className="text-2xl font-bold text-green-700">
            ✅ Route: /apparel
          </p>
          <p className="text-lg text-green-600 mt-2">
            Component: ApparelTestPage.tsx
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors w-full"
          >
            ← Back to Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate('/activitysuite')}
            className="px-8 py-4 bg-purple-600 text-white rounded-lg text-xl font-semibold hover:bg-purple-700 transition-colors w-full"
          >
            Go to Activity Suite
          </button>
        </div>
      </div>
    </div>
  );
}
