import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { ToastMessage } from '../../types/citypulse';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let border = 'border-[#10B981]/50';
        let bg = 'bg-[#F8FAF7]/95';
        let icon = <CheckCircle2 className="w-4 h-4 text-[#10B981]" />;

        if (toast.type === 'warning') {
          border = 'border-[#F59E0B]/50';
          icon = <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />;
        } else if (toast.type === 'error') {
          border = 'border-[#EF4444]/50';
          icon = <XCircle className="w-4 h-4 text-[#EF4444]" />;
        } else if (toast.type === 'info') {
          border = 'border-[#8FAE86]/60';
          icon = <Info className="w-4 h-4 text-[#4B6B40]" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3 rounded-2xl ${bg} border ${border} backdrop-blur-xl shadow-lg text-xs text-[#1A2318] animate-fade-in`}
          >
            <div className="flex items-center space-x-2.5">
              {icon}
              <span className="font-semibold">{toast.title}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="ml-3 p-1 rounded-lg hover:bg-[#E4ECE0] text-[#5A6D53] hover:text-[#1A2318] transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
