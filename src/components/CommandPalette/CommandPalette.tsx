import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Search, FileCode2, FileType, FileJson } from 'lucide-react';

const FileIcon = ({ name }: { name: string }) => {
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return <FileCode2 size={14} className="text-[#00ff00]" />;
  if (name.endsWith('.css')) return <FileType size={14} className="text-blue-400" />;
  if (name.endsWith('.json')) return <FileJson size={14} className="text-yellow-400" />;
  return <FileType size={14} className="text-gray-400" />;
};

const CommandPalette = () => {
  const { files, togglePalette, openFile } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar archivos
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    // Enfocar el input al abrir
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Manejo de Teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredFiles.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredFiles.length) % filteredFiles.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFiles.length > 0) {
        openFile(filteredFiles[selectedIndex].path);
        togglePalette(false);
      }
    } else if (e.key === 'Escape') {
      togglePalette(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh]" onClick={() => togglePalette(false)}>
      <div 
        className="bg-[#0a0a0a] border border-[#333] w-[500px] max-w-full rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
        onClick={e => e.stopPropagation()}
      >
        
        {/* INPUT */}
        <div className="flex items-center gap-3 p-4 border-b border-[#222]">
          <Search size={18} className="text-[#00ff00]" />
          <input 
            ref={inputRef}
            type="text"
            placeholder="Search files by name..."
            className="bg-transparent text-white w-full outline-none text-sm font-mono placeholder-gray-600"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <div className="text-[10px] text-gray-500 bg-[#111] px-2 py-1 rounded border border-[#222]">ESC</div>
        </div>

        {/* LISTA DE RESULTADOS */}
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file, index) => (
              <div 
                key={file.path}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-mono cursor-pointer border-l-2 transition-colors
                  ${index === selectedIndex 
                    ? 'bg-[#00ff00]/10 border-[#00ff00] text-white' 
                    : 'bg-transparent border-transparent text-gray-400 hover:bg-[#111]'
                  }
                `}
                onClick={() => {
                  openFile(file.path);
                  togglePalette(false);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <FileIcon name={file.name} />
                <div className="flex flex-col">
                  <span className="font-bold">{file.name}</span>
                  <span className="text-[9px] opacity-50">{file.path}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-600 text-xs font-mono">
              NO_MATCHING_FILES_FOUND
            </div>
          )}
        </div>
        
        {/* FOOTER INFO */}
        <div className="bg-[#050505] p-1 border-t border-[#222] flex justify-between px-3 text-[9px] text-gray-600">
           <span>{filteredFiles.length} files found</span>
           <span className="flex gap-2">
              <span><strong className="text-gray-400">↑↓</strong> navigate</span>
              <span><strong className="text-gray-400">↵</strong> open</span>
           </span>
        </div>

      </div>
    </div>
  );
};

export default CommandPalette;