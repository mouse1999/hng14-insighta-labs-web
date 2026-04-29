// pages/LoginPage.tsx
import { GitBranch } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/github`;
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-acid/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-acid/3 blur-3xl" />
        {/* Grid lines */}
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
        {/* Logo / brand */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-acid rounded-sm flex items-center justify-center">
              <span className="text-ink-950 font-display font-bold text-sm">P</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-mist">ProfileDB</span>
          </div>
          <h1 className="font-display font-bold text-4xl text-mist leading-tight mb-3">
            Welcome back
          </h1>
          <p className="text-mist-dim text-sm leading-relaxed">
            Sign in with your GitHub account to access<br />the profile intelligence portal.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-ink-900 border border-white/[0.07] rounded-2xl p-8">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-acid hover:bg-acid-dim text-ink-950 font-display font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm tracking-wide"
          >
            <GitBranch size={18} strokeWidth={2} />
            Continue with GitHub
          </button>

          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <p className="text-xs text-mist-dim text-center leading-relaxed">
              By signing in, you agree to our terms of service.<br />
              We only access your GitHub profile information.
            </p>
          </div>
        </div>

        {/* Stats teaser */}
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
