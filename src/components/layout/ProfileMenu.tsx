import React, { useRef, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Sliders, 
  LogOut, 
  ShieldCheck, 
  Heart, 
  Columns, 
  Key, 
  Activity,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { UserAvatar } from '../common/UserAvatar';
import { signOut, ROLE_LABELS } from '../../services/auth';
import { isSupabaseConfigured } from '../../lib/supabase';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const {
    user,
    setIsAuthModalOpen,
    setIsComparisonModalOpen,
    showToast,
    favorites,
    selectedCity,
    dataSources
  } = useCityPulse();

  const connectedFeeds = dataSources.filter(d => d.status === 'connected').length;
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef} 
      className="absolute right-0 top-full mt-2.5 w-80 p-4 bg-white/98 border border-[#D2DEC9] rounded-3xl shadow-2xl backdrop-blur-2xl z-50 text-xs font-sans text-[#1A2318] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      
      {/* 1. OPERATOR AVATAR & HEADER IDENTITY */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F4F8F2] via-[#EBF3E8] to-[#E2EDE0] border border-[#C6DAC1] mb-3 relative overflow-hidden">
        
        {/* Background accent badge */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#5E7352]/10 pointer-events-none" />

        <div className="flex items-start space-x-3.5 relative z-10">
          
          {/* Vector Avatar */}
          <UserAvatar user={user} size="lg" showStatusDot={true} />

          <div className="flex-1 min-w-0">
            {/* Operator Title */}
            <h4 className="font-heading font-extrabold text-sm text-[#1A2318] truncate flex items-center gap-1.5">
              <span>{user?.email ? user.email.split('@')[0].toUpperCase().replace('.', ' ') : 'GUEST'}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4B6B40] shrink-0" />
            </h4>
            
            {/* Email Address */}
            <p className="text-micro text-[#4A5D44] truncate font-mono">
              {user?.email || 'Not signed in'}
            </p>

            {/* Clearance & Role Pills */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#4B6B40] text-white text-micro font-mono font-bold uppercase tracking-wider">
                {user ? ROLE_LABELS[user.role] : 'Guest'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white border border-[#BFCDB5] text-[#2D3B28] text-micro font-mono font-semibold">
                {user?.role === 'admin' ? 'FULL ACCESS' : user?.role === 'operator' ? 'L4 CLEARANCE' : user ? 'READ ONLY' : 'GUEST VIEW'}
              </span>
            </div>
          </div>

        </div>

        {/* Security Meta Strip */}
        <div className="mt-3 pt-2.5 border-t border-[#D2DEC9]/80 flex items-center justify-between text-micro font-mono text-[#4A5D44]">
          <span className="flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-[#4B6B40]" />
            <span>{selectedCity} Command</span>
          </span>
          <span className="font-bold text-[#2D4226]">{user ? `ID #${user.id.slice(0, 8).toUpperCase()}` : 'Not signed in'}</span>
        </div>
      </div>

      {/* 2. OPERATOR STATS STRIP */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-xl bg-[#F8FAF7] border border-[#E1EBE0] flex items-center space-x-2">
          <Heart className="w-4 h-4 text-[#C84B31] shrink-0" />
          <div className="min-w-0">
            <span className="text-micro text-[#5A6D53] block font-mono">Favorites</span>
            <span className="font-bold text-[#1A2318] text-xs">{favorites.length} Districts</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F8FAF7] border border-[#E1EBE0] flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#4B6B40] shrink-0" />
          <div className="min-w-0">
            <span className="text-micro text-[#5A6D53] block font-mono">Telemetry</span>
            <span className="font-bold text-[#1A2318] text-xs">{connectedFeeds}/{dataSources.length} Feeds</span>
          </div>
        </div>
      </div>

      {/* 3. MENU ACTION BUTTONS */}
      <div className="space-y-1">
        <button
          onClick={() => {
            onClose();
            setIsAuthModalOpen(true);
          }}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-[#EFF4EC] text-[#1A2318] transition text-left group"
        >
          <div className="p-1.5 rounded-lg bg-[#E4ECE0] group-hover:bg-[#4B6B40] group-hover:text-white transition">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold block text-xs">Profile & Credentials</span>
            <span className="text-micro text-[#5A6D53] font-mono block">Manage account details</span>
          </div>
        </button>

        <button
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-[#EFF4EC] text-[#1A2318] transition text-left group"
        >
          <div className="p-1.5 rounded-lg bg-[#E4ECE0] group-hover:bg-[#4B6B40] group-hover:text-white transition">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold block text-xs">Alert Thresholds & Config</span>
            <span className="text-micro text-[#5A6D53] font-mono block">Tune notification limits</span>
          </div>
        </button>

        <button
          onClick={() => {
            onClose();
            setIsComparisonModalOpen(true);
          }}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-[#EFF4EC] text-[#1A2318] transition text-left group"
        >
          <div className="p-1.5 rounded-lg bg-[#E4ECE0] group-hover:bg-[#4B6B40] group-hover:text-white transition">
            <Columns className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold block text-xs">District Comparison Matrix</span>
            <span className="text-micro text-[#5A6D53] font-mono block">Side-by-side signal analytics</span>
          </div>
        </button>

        <button
          onClick={() => {
            const backendConnected = isSupabaseConfigured();
            if (!user) {
              showToast('Not signed in — sign in to check clearance', 'warning');
            } else if (!backendConnected) {
              showToast('Backend not connected — running in local/demo mode', 'warning');
            } else {
              showToast(`Verified: ${ROLE_LABELS[user.role]} access, backend connected`, 'success');
            }
            onClose();
          }}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-[#EFF4EC] text-[#1A2318] transition text-left group"
        >
          <div className="p-1.5 rounded-lg bg-[#E4ECE0] group-hover:bg-[#4B6B40] group-hover:text-white transition">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold block text-xs">Connection & Clearance Status</span>
            <span className="text-micro text-[#5A6D53] font-mono block">Check session & backend connectivity</span>
          </div>
        </button>

        {/* Sign Out Button */}
        <div className="pt-2 mt-2 border-t border-[#E1EBE0]">
          <button
            onClick={async () => {
              await signOut();
              showToast('Signed out of CityPulse ops session', 'info');
              onClose();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-700 transition text-left font-semibold text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>

      </div>

    </div>
  );
};
