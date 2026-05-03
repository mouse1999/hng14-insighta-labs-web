import { useState } from 'react';
import { GitBranch, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    console.log('[LoginPage] Login initiated');
    console.log('[LoginPage] API_URL:', API_URL || '(empty - using relative URLs via Vercel proxy)');

    try {
      console.log('[LoginPage] Fetching authorize_url from:', `${API_URL}/auth/github`);

      const res = await fetch(`${API_URL}/auth/github`, {
        credentials: 'include',
        headers: { 'X-API-Version': '1' },
      });

      console.log('[LoginPage] Response status:', res.status);
      console.log('[LoginPage] Response ok:', res.ok);
      console.log('[LoginPage] Response headers:', Object.fromEntries(res.headers.entries()));

      const data = await res.json();
      console.log('[LoginPage] Response data:', data);

      if (!data.authorize_url) {
        console.error('[LoginPage] No authorize_url in response!', data);
        toast.error('Invalid response from server.');
        setLoading(false);
        return;
      }

      console.log('[LoginPage] Redirecting to GitHub:', data.authorize_url);
      window.location.href = data.authorize_url;

    } catch (err) {
      console.error('[LoginPage] Login failed:', err);
      toast.error('Failed to connect to GitHub. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-acid/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-acid/3 blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#b8ff57" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 animate-fade-up">
        {/* Brand */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-acid rounded-sm flex items-center justify-center">
              <span className="text-ink-950 font-display font-bold text-sm">P</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-mist">Insighta Labs+</span>
          </div>
          <h1 className="font-display font-bold text-4xl text-mist leading-tight mb-3">
            Welcome back
          </h1>
          <p className="text-mist-dim text-sm leading-relaxed">
            Sign in with your GitHub account to access<br />Insighta Labs+ portal.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-ink-900 border border-white/[0.07] rounded-2xl p-8">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-acid hover:bg-acid-dim disabled:opacity-60 disabled:cursor-not-allowed text-ink-950 font-display font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm tracking-wide"
          >
            {loading
              ? <Loader2 size={18} className="animate-spin" />
              : <GitBranch size={18} strokeWidth={2} />
            }
            {loading ? 'Redirecting to GitHub…' : 'Continue with GitHub'}
          </button>

          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <p className="text-xs text-mist-dim text-center leading-relaxed">
              By signing in, you agree to our terms of service.<br />
              We only access your GitHub profile information.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { value: '2k+', label: 'Profiles' },
            { value: '50+', label: 'Countries' },
            { value: '99%', label: 'Accuracy' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-bold text-acid text-xl">{stat.value}</div>
              <div className="text-mist-dim text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
