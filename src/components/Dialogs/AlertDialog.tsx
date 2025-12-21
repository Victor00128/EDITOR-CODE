import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AlertDialogProps {
    title: string;
    message: string;
    type?: 'error' | 'warning' | 'info';
    onClose: () => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
    title,
    message,
    type = 'error',
    onClose
}) => {
    const colors = {
        error: { bg: 'bg-red-600', icon: 'text-red-400', border: 'border-red-500' },
        warning: { bg: 'bg-yellow-600', icon: 'text-yellow-400', border: 'border-yellow-500' },
        info: { bg: 'bg-blue-600', icon: 'text-blue-400', border: 'border-blue-500' }
    };

    const color = colors[type];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0a0a0a] border border-[#333] max-w-md w-full rounded-sm shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className={`h-12 ${color.bg} border-b ${color.border} flex items-center justify-between px-4`}>
                    <div className="flex items-center gap-3">
                        <AlertCircle size={18} className={color.icon} />
                        <h2 className="text-white font-bold text-sm uppercase tracking-wider">
                            {title}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="h-14 bg-[#0a0a0a] border-t border-[#222] flex items-center justify-end px-4">
                    <button
                        onClick={onClose}
                        className="px-8 py-2 text-xs font-bold text-black bg-[#00ff00] hover:bg-white transition-all uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,0,0.3)]"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertDialog;
