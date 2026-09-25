import React from 'react';
import { ShieldCheck, User } from 'lucide-react';
import { AuthUser } from '../../types/citypulse';

interface UserAvatarProps {
  user: AuthUser | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatusDot?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  showStatusDot = true,
  className = '' 
}) => {
  // Determine user initials
  const initials = React.useMemo(() => {
    if (!user) return 'OP';
    if (user.role === 'operator' || user.email.includes('dispatcher')) return 'CD';
    if (user.role === 'admin') return 'AD';
    if (user.email) {
      const parts = user.email.split('@')[0].split('.');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'OP';
  }, [user]);

  // Size dimensions
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs border',
    md: 'w-8.5 h-8.5 text-xs border-1.5',
    lg: 'w-11 h-11 text-sm border-2',
    xl: 'w-16 h-16 text-xl border-2'
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-7 h-7'
  }[size];

  const dotSizes = {
    sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
    md: 'w-2.5 h-2.5 bottom-0 right-0',
    lg: 'w-3 h-3 bottom-0 right-0',
    xl: 'w-4 h-4 bottom-0.5 right-0.5'
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      
      {/* Premium Stylized Vector Avatar Badge */}
      <div 
        className={`${sizeClasses} rounded-2xl bg-gradient-to-br from-[#4B6B40] via-[#3B5432] to-[#24351F] text-white font-mono font-bold flex items-center justify-center border-[#A8CAA4]/40 shadow-xs select-none transition-transform duration-150 hover:scale-105`}
        style={{
          boxShadow: '0 2px 8px rgba(75, 107, 64, 0.25)'
        }}
      >
        {/* Subtle geometric inner pattern */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_70%)] pointer-events-none" />

        {/* Content: Vector Silhouette or Bold Monogram Initials */}
        <div className="relative z-10 flex items-center justify-center">
          {initials ? (
            <span className="tracking-wider font-extrabold text-white drop-shadow-xs">
              {initials}
            </span>
          ) : (
            <User className={`${iconSizes} text-white/90`} />
          )}
        </div>

        {/* Tactical Shield Badge Indicator */}
        <div className="absolute -top-1 -left-1 p-0.5 rounded-full bg-[#3B5432] border border-[#A8CAA4]/50 shadow-xs">
          <ShieldCheck className="w-2.5 h-2.5 text-emerald-300" />
        </div>
      </div>

      {/* Online Status Dot */}
      {showStatusDot && (
        <span className={`absolute ${dotSizes} rounded-full bg-emerald-500 border-2 border-white shadow-xs`}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        </span>
      )}

    </div>
  );
};
