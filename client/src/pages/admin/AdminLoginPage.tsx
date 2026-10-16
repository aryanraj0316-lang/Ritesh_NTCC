import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const { login, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@dastaan.com');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already admin, redirect to /admin
  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const origin = (location.state as any)?.from?.pathname || '/admin';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      if (user.role !== 'ADMIN') {
        setError('Access denied. This portal is strictly restricted to Restaurant Staff and Administrators.');
        return;
      }
      const origin = (location.state as any)?.from?.pathname || '/admin';
      navigate(origin, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify administrative credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-cream-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Dining Storefront</span>
        </Link>

        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-forest-800 text-cream-100 border border-forest-600 mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-wider text-cream-100 uppercase">
            Dastaan
          </h2>
          <p className="text-xs uppercase tracking-widest text-forest-400 mt-1 font-semibold">
            Administrative & Operations Command
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-charcoal-800 py-8 px-6 shadow-modal border border-charcoal-700 sm:rounded-lg sm:px-10 text-xs">
          {error && (
            <div className="mb-4 p-3 bg-brick-900 border border-brick-700 text-brick-100 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-brick-300 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-cream-300 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-charcoal-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 py-2 text-xs bg-charcoal-900 border border-charcoal-700 rounded-md text-cream-100 focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-cream-300 mb-1">
                Staff Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-charcoal-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 py-2 text-xs bg-charcoal-900 border border-charcoal-700 rounded-md text-cream-100 focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-forest-700 hover:bg-forest-600 text-white rounded-md font-semibold text-xs transition-colors mt-2"
            >
              {isSubmitting ? 'Verifying Authorization...' : 'Authenticate to Command'}
            </button>
          </form>

          {/* Seed demo notice */}
          <div className="mt-6 pt-4 border-t border-charcoal-700 text-center text-[11px] text-charcoal-400 space-y-1">
            <p>Seeded Default Administrator:</p>
            <p className="font-mono text-cream-300">
              admin@dastaan.com / Admin@12345
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
