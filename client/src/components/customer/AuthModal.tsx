import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login({ email, password });
      } else {
        await register({ email, password, name, phone });
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoCustomerLogin = () => {
    setEmail('rahul.sharma@example.com');
    setPassword('Customer@123');
    setIsLoginMode(true);
  };

  const handleDemoAdminLogin = () => {
    setEmail('admin@dastaan.com');
    setPassword('Admin@12345');
    setIsLoginMode(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-md rounded-lg border border-cream-300 shadow-modal overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-cream-100 text-charcoal-400 hover:text-charcoal-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Title */}
        <div className="text-center mb-6">
          <span className="font-serif text-2xl font-bold tracking-wider text-charcoal-800 uppercase block">
            Dastaan
          </span>
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-charcoal-500">
            Patron Account Access
          </span>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-cream-300 mb-6 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(true);
              setError(null);
            }}
            className={`flex-1 pb-2.5 font-semibold transition-colors border-b-2 -mb-[1px] ${
              isLoginMode
                ? 'border-forest-700 text-forest-800'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(false);
              setError(null);
            }}
            className={`flex-1 pb-2.5 font-semibold transition-colors border-b-2 -mb-[1px] ${
              !isLoginMode
                ? 'border-forest-700 text-forest-800'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            Create Patron Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-brick-50 border border-brick-100 text-brick-900 rounded-md text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-brick-700" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <>
              <div>
                <label className="block text-xs font-medium text-charcoal-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-charcoal-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-charcoal-400" />
                  <input
                    type="tel"
                    placeholder="+91 98112 34567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input pl-9 text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-charcoal-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-charcoal-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-charcoal-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-9 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5 text-xs font-semibold mt-2"
          >
            {isSubmitting
              ? 'Authenticating...'
              : isLoginMode
              ? 'Sign In to Account'
              : 'Create Account & Continue'}
          </button>
        </form>

        {/* Demo Fast Login Shortcuts */}
        <div className="mt-6 pt-4 border-t border-cream-200">
          <p className="text-[11px] font-medium text-charcoal-500 mb-2 text-center">
            One-Click Demo Credentials:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCustomerLogin}
              className="px-2 py-1.5 bg-cream-100 hover:bg-cream-200 border border-cream-300 rounded text-[11px] font-medium text-charcoal-700 text-center transition-colors"
            >
              Customer Account
            </button>
            <button
              type="button"
              onClick={handleDemoAdminLogin}
              className="px-2 py-1.5 bg-forest-50 hover:bg-forest-100 border border-forest-100 rounded text-[11px] font-medium text-forest-800 text-center transition-colors"
            >
              Admin Staff Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
