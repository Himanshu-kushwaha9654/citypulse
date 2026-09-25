import React, { useState } from 'react';
import { X, User, Mail, Lock, LogOut, Star, Loader2 } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { signInWithEmail, signUpWithEmail, signOut, ROLE_LABELS } from '../../services/auth';
import { isSupabaseConfigured } from '../../lib/supabase';

import { UserAvatar } from '../common/UserAvatar';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, showToast, favorites } = useCityPulse();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (!isSupabaseConfigured()) {
      setFormError('Backend is not configured - sign-in is unavailable in this build.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const result = isSignup
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);

    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    // CityPulseContext's auth listener picks up the new session and
    // loads the profile/role automatically.
    if (isSignup && !result.session) {
      showToast('Check your email to confirm your account', 'info');
    }
    onClose();
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2318]/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-[#D2DEC9] rounded-2xl shadow-2xl overflow-hidden text-[#1A2318]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D2DEC9] bg-[#F4F8F2]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl icon-glow-healthy">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A2318] font-heading">
                {user ? 'CityPulse Operator Profile' : (isSignup ? 'Create Account' : 'CityPulse Operator Login')}
              </h3>
              <p className="text-xs text-[#5A6D53] font-mono">Verified Operator Access</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5A6D53] hover:text-[#1A2318] hover:bg-[#E4ECE0] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {user ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] flex items-center space-x-3.5">
                <UserAvatar user={user} size="lg" showStatusDot={true} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="badge-healthy font-mono text-micro font-bold px-2 py-0.5 rounded">{ROLE_LABELS[user.role]}</span>
                    <span className="text-micro font-mono text-[#4B6B40] font-bold">
                      {user.role === 'admin' ? 'FULL ACCESS' : user.role === 'operator' ? 'L4 CLEARANCE' : 'READ ONLY'}
                    </span>
                  </div>
                  <div className="text-base font-bold text-[#1A2318] truncate mt-1">{user.email}</div>
                  <div className="text-micro text-[#5A6D53] font-mono mt-0.5">Account ID: {user.id.slice(0, 8)}</div>
                </div>
              </div>

              {/* Saved Favorites Summary */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span>My Favorited Districts ({favorites.length})</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] text-xs font-mono text-[#4A5D44]">
                  {favorites.length > 0 ? favorites.join(', ') : 'No favorites added yet. Click ⭐ on any district panel.'}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs transition flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#5A6D53] font-mono">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6D53]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@citypulse.gov"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#D2DEC9] text-xs text-[#1A2318] placeholder-[#94A38C] focus:outline-none focus:border-[#5E7352]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#5A6D53] font-mono">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6D53]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#D2DEC9] text-xs text-[#1A2318] placeholder-[#94A38C] focus:outline-none focus:border-[#5E7352]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-[#5E7352] hover:bg-[#4D5F43] disabled:opacity-60 text-white font-bold text-xs transition shadow-sm flex items-center justify-center space-x-2"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-xs text-[#5A6D53] hover:text-[#1A2318] underline"
                >
                  {isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </button>
              </div>

              {formError && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </div>
              )}
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
