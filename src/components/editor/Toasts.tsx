import { useUIStore } from '@/store/uiStore';
import Check from 'lucide-react/dist/esm/icons/check.js';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle.js';
import Info from 'lucide-react/dist/esm/icons/info.js';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle.js';
import X from 'lucide-react/dist/esm/icons/x.js';

export function Toasts() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  const icons = {
    success: <Check size={16} className="text-emerald-400" />,
    error: <AlertCircle size={16} className="text-red-400" />,
    warning: <AlertTriangle size={16} className="text-amber-400" />,
    info: <Info size={16} className="text-blue-400" />,
  };

  const bg = {
    success: 'border-emerald-500/20',
    error: 'border-red-500/20',
    warning: 'border-amber-500/20',
    info: 'border-blue-500/20',
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2.5 px-4 py-2.5 bg-[#2a2a2e] border ${bg[toast.type]} rounded-xl shadow-xl backdrop-blur-sm text-sm text-white animate-in fade-in slide-in-from-bottom-2 duration-200`}
        >
          {icons[toast.type]}
          {toast.message}
          <button onClick={() => removeToast(toast.id)} className="ml-2 text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
