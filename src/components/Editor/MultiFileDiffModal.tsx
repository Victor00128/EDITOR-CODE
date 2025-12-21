import React, { useRef, useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { X, Check, Ban, FileCode2, ChevronLeft, ChevronRight } from 'lucide-react';

export interface FileDiff {
    path: string;
    original: string;
    modified: string;
    language?: string;
}

interface MultiFileDiffModalProps {
    files: FileDiff[];
    onConfirm: () => void;
    onCancel: () => void;
}

const MultiFileDiffModal: React.FC<MultiFileDiffModalProps> = ({ files, onConfirm, onCancel }) => {
    const diffEditorRef = useRef<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentFile = files[currentIndex];
    const totalFiles = files.length;

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

    const getFileName = (path: string) => path.split('/').pop() || path;

    const getLanguageFromPath = (path: string): string => {
        const ext = path.split('.').pop()?.toLowerCase() || '';
        const langMap: { [key: string]: string } = {
            'ts': 'typescript',
            'tsx': 'typescript',
            'js': 'javascript',
            'jsx': 'javascript',
            'json': 'json',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'md': 'markdown',
            'py': 'python',
            'go': 'go',
            'rs': 'rust',
        };
        return langMap[ext] || 'plaintext';
    };

    const goToFile = (index: number) => {
        if (index >= 0 && index < totalFiles) {
            setCurrentIndex(index);
        }
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
                        {totalFiles > 1 && (
                            <div className="flex items-center gap-2 text-[10px] font-mono bg-black/50 px-2 py-1 rounded">
                                <span className="text-gray-400">File</span>
                                <span className="text-[#00ff00] font-bold">{currentIndex + 1}</span>
                                <span className="text-gray-600">of</span>
                                <span className="text-white">{totalFiles}</span>
                            </div>
                        )}
                        <div className="flex text-[10px] font-mono gap-4 opacity-60">
                            <span className="text-red-400">LEFT: ORIGINAL</span>
                            <span className="text-green-400">RIGHT: AI PROPOSAL</span>
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-gray-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* FILE TABS (if multiple files) */}
                {totalFiles > 1 && (
                    <div className="h-10 bg-[#0a0a0a] border-b border-[#222] flex items-center px-2 gap-1 overflow-x-auto custom-scrollbar shrink-0">
                        {files.map((file, index) => (
                            <button
                                key={file.path}
                                onClick={() => goToFile(index)}
                                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-sm whitespace-nowrap transition-colors ${index === currentIndex
                                        ? 'bg-[#00ff00]/10 text-[#00ff00] border border-[#00ff00]/30'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <FileCode2 size={12} />
                                {getFileName(file.path)}
                            </button>
                        ))}
                    </div>
                )}

                {/* CURRENT FILE PATH */}
                <div className="h-8 bg-black border-b border-[#222] flex items-center px-4 text-[10px] font-mono text-gray-500 shrink-0">
                    <FileCode2 size={12} className="mr-2 text-[#00ff00]" />
                    {currentFile.path}
                </div>

                {/* DIFF EDITOR AREA */}
                <div className="flex-1 relative bg-black">
                    <DiffEditor
                        key={currentFile.path} // Force re-mount on file change
                        height="100%"
                        original={currentFile.original}
                        modified={currentFile.modified}
                        language={currentFile.language || getLanguageFromPath(currentFile.path)}
                        theme="zenith-diff"
                        onMount={handleEditorDidMount}
                        options={{
                            renderSideBySide: true,
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', monospace",
                            scrollBeyondLastLine: false,
                            minimap: { enabled: false },
                            readOnly: true,
                            originalEditable: false,
                        }}
                    />
                </div>

                {/* FOOTER ACTIONS */}
                <div className="h-14 bg-[#0a0a0a] border-t border-[#222] flex items-center justify-between px-6 shrink-0">
                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                        {totalFiles > 1 && (
                            <>
                                <button
                                    onClick={() => goToFile(currentIndex - 1)}
                                    disabled={currentIndex === 0}
                                    className={`p-2 rounded transition-colors ${currentIndex === 0
                                            ? 'text-gray-700 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => goToFile(currentIndex + 1)}
                                    disabled={currentIndex === totalFiles - 1}
                                    className={`p-2 rounded transition-colors ${currentIndex === totalFiles - 1
                                            ? 'text-gray-700 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <ChevronRight size={18} />
                                </button>
                                <span className="text-[10px] text-gray-600 ml-2">
                                    Use arrows to navigate between files
                                </span>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 text-xs font-bold text-red-500 border border-red-900/30 hover:bg-red-900/20 hover:border-red-500 transition-all flex items-center gap-2 uppercase tracking-wider"
                        >
                            <Ban size={14} /> Reject All
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-8 py-2 text-xs font-bold text-black bg-[#00ff00] hover:bg-white transition-all flex items-center gap-2 uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,0,0.3)]"
                        >
                            <Check size={16} /> Apply {totalFiles > 1 ? `All ${totalFiles} Files` : 'Changes'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MultiFileDiffModal;
