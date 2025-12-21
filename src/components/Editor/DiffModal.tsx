import React, { useRef } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { X, Check, Ban } from 'lucide-react';

interface DiffModalProps {
  originalContent: string;
  modifiedContent: string;
  language: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DiffModal: React.FC<DiffModalProps> = ({ originalContent, modifiedContent, language, onConfirm, onCancel }) => {
  const diffEditorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    diffEditorRef.current = editor;
    // Tema Zenith Dark para el Diff
    monaco.editor.defineTheme('zenith-diff', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#050505',
        'editor.lineHighlightBackground': '#1a1a1a',
        'diffEditor.insertedTextBackground': '#00ff0015',
        'diffEditor.removedTextBackground': '#ff000015',
      }
    });
    monaco.editor.setTheme('zenith-diff');
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-10 animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-[#333] w-full h-full max-w-6xl flex flex-col shadow-2xl rounded-sm overflow-hidden">
        
        {/* HEADER */}
        <div className="h-12 bg-[#111] border-b border-[#222] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold tracking-widest text-sm uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              REVIEW CHANGES
            </h2>
            <div className="flex text-[10px] font-mono gap-4 opacity-60">
               <span className="text-red-400">LEFT: ORIGINAL</span>
               <span className="text-green-400">RIGHT: AI PROPOSAL</span>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* DIFF EDITOR AREA */}
        <div className="flex-1 relative bg-black">
           <DiffEditor
             height="100%"
             original={originalContent}
             modified={modifiedContent}
             language={language}
             theme="zenith-diff"
             onMount={handleEditorDidMount}
             options={{
               renderSideBySide: true,
               fontSize: 13,
               fontFamily: "'JetBrains Mono', monospace",
               scrollBeyondLastLine: false,
               minimap: { enabled: false },
               readOnly: true, // No editar aquí, solo revisar
               originalEditable: false,
             }}
           />
        </div>

        {/* FOOTER ACTIONS */}
        <div className="h-14 bg-[#0a0a0a] border-t border-[#222] flex items-center justify-end px-6 gap-4 shrink-0">
           <button 
             onClick={onCancel}
             className="px-6 py-2 text-xs font-bold text-red-500 border border-red-900/30 hover:bg-red-900/20 hover:border-red-500 transition-all flex items-center gap-2 uppercase tracking-wider"
           >
             <Ban size={14} /> Reject
           </button>
           <button 
             onClick={onConfirm}
             className="px-8 py-2 text-xs font-bold text-black bg-[#00ff00] hover:bg-white transition-all flex items-center gap-2 uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,0,0.3)]"
           >
             <Check size={16} /> Confirm Changes
           </button>
        </div>

      </div>
    </div>
  );
};

export default DiffModal;