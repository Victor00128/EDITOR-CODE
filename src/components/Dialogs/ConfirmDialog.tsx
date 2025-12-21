import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    danger = false
}) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0a0a0a] border border-[#333] max-w-md w-full rounded-sm shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="h-12 bg-[#111] border-b border-[#222] flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        {danger && <AlertTriangle size={18} className="text-yellow-500" />}
                        <h2 className="text-white font-bold text-sm uppercase tracking-wider">
                            {title}
                        </h2>
                    </div>
                    <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
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
                <div className="h-14 bg-[#0a0a0a] border-t border-[#222] flex items-center justify-end px-4 gap-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 text-xs font-bold text-gray-400 border border-[#333] hover:bg-[#1a1a1a] hover:text-white transition-all uppercase tracking-wider"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-8 py-2 text-xs font-bold uppercase tracking-wider transition-all ${danger
                                ? 'text-white bg-red-600 hover:bg-red-700 shadow-[0_0_10px_rgba(220,38,38,0.3)]'
                                : 'text-black bg-[#00ff00] hover:bg-white shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
