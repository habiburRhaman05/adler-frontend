import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        {/* 404 Number */}
        <h1 className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-8xl font-black text-transparent">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-semibold text-white">
          Page not found
        </h2>

        <p className="mt-2 max-w-md text-sm text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 hover:border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>

          <Link
            to="/dashboard"
            className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:brightness-110"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
