import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { fileService } from '../../services/fileService';
import { FileNode } from '../../types/electron';
import { Folder, FolderOpen, FileCode2, ChevronRight, ChevronDown, FilePlus, Trash2 } from 'lucide-react';

//
const TreeItem = ({ node, level, onFileClick, activePath, unsavedPaths, onContextMenu }: any) => {
  // Folders collapsed by default for better performance
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = activePath === node.path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'folder') setIsOpen(!isOpen);
    else onFileClick(node);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 px-2 cursor-pointer text-xs hover:bg-[#1a1a1a] transition-colors ${isSelected ? 'bg-[#1a1a1a] text-white border-l-2 border-[#00ff00]' : 'text-gray-400 border-l-2 border-transparent'}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, node)}
      >
        <div className="flex items-center gap-1.5 w-full overflow-hidden">
          {node.type === 'folder' && (isOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />)}
          {node.type === 'folder' ? (isOpen ? <FolderOpen size={14} className="text-[#00ff00]" /> : <Folder size={14} className="text-[#00ff00]" />) : <FileCode2 size={14} />}
          <span className={`truncate ${unsavedPaths.includes(node.path) ? "text-yellow-500" : ""}`}>{node.name}</span>
        </div>
      </div>
      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map((child: FileNode) => (
            <TreeItem key={child.path} node={child} level={level + 1} onFileClick={onFileClick} activePath={activePath} unsavedPaths={unsavedPaths} onContextMenu={onContextMenu} />
          ))}
        </div>
      )}
    </div>
  );
};

const Explorer: React.FC = () => {
  const { files, flatFiles, setFiles, activeFilePath, setActiveFile, openFile, unsavedFilePaths, projectPath, showConfirm, hideConfirm, showAlert } = useStore();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: FileNode | null } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [targetPath, setTargetPath] = useState<string | null>(null);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleFileClick = async (node: FileNode) => {
    openFile(node.path);
    const content = await fileService.readFile(node.path); // Carga diferida
    setActiveFile(node.path, content);
  };

  const refreshTree = async () => {
    if (projectPath) {
      const newFiles = await fileService.getProjectFiles(projectPath);
      setFiles(newFiles);
    }
  };

  const handleCreateFile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!newName.trim()) {
      setIsCreating(false);
      return;
    }

    if (!targetPath) {
      setIsCreating(false);
      return;
    }

    const fileName = newName.trim();

    // Validaciones
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
    if (invalidChars.test(fileName)) {
      showAlert({
        title: 'Invalid File Name',
        message: `File name contains invalid characters.\n\nThe following characters are not allowed:\n< > : " / \\ | ? *`,
        type: 'error'
      });
      return; // Mantener input abierto para corregir
    }

    // Verificar si está vacío o solo espacios
    if (fileName.length === 0) {
      showAlert({
        title: 'Invalid File Name',
        message: 'File name cannot be empty.',
        type: 'error'
      });
      return;
    }

    // Verificar nombres reservados en Windows
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'LPT1', 'LPT2'];
    const nameWithoutExt = fileName.split('.')[0].toUpperCase();
    if (reservedNames.includes(nameWithoutExt)) {
      showAlert({
        title: 'Reserved File Name',
        message: `"${fileName}" is a reserved system name and cannot be used.`,
        type: 'error'
      });
      return;
    }

    // Verificar duplicados en la lista plana
    const targetFolder = files.find(f => f.path === targetPath);
    const isDuplicate = targetFolder?.children?.some(child => child.name === fileName);

    if (isDuplicate) {
      showAlert({
        title: 'File Already Exists',
        message: `A file named "${fileName}" already exists in this folder.\n\nPlease choose a different name.`,
        type: 'warning'
      });
      return;
    }

    // Intentar crear el archivo
    const result = await fileService.createFile(targetPath, fileName);

    if (!result || !result.success) {
      showAlert({
        title: 'File Creation Failed',
        message: `Failed to create "${fileName}".\n\nPlease check permissions and try again.`,
        type: 'error'
      });
      return;
    }

    // Éxito: refrescar y limpiar
    await refreshTree();
    setNewName('');
    setIsCreating(false);
  };

  const handleDelete = async () => {
    if (contextMenu?.node) {
      const isFolder = contextMenu.node.type === 'folder';
      const itemType = isFolder ? 'folder' : 'file';

      showConfirm({
        title: 'Delete Permanently',
        message: `Are you sure you want to delete this ${itemType}?\n\n"${contextMenu.node.name}"\n\nThis action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        danger: true,
        onConfirm: async () => {
          await fileService.deleteFile(contextMenu.node!.path);
          await refreshTree();
          hideConfirm();
        }
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-black border-r border-[#222] w-60 select-none font-mono relative"
      onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, node: { path: projectPath!, type: 'folder' } as any }); }}>

      <div className="p-3 text-[10px] font-bold tracking-widest text-[#666] uppercase border-b border-[#222] flex justify-between items-center">
        <span>EXPLORER</span>
        {flatFiles.length > 0 && (
          <span className={`text-[8px] ${flatFiles.length >= 2000 ? 'text-yellow-500' : 'text-[#444]'}`}>
            {flatFiles.length}{flatFiles.length >= 2000 ? '+' : ''} files
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto pt-2 custom-scrollbar">
        {files.map(node => (
          <TreeItem key={node.path} node={node} level={0} onFileClick={handleFileClick} activePath={activeFilePath} unsavedPaths={unsavedFilePaths}
            onContextMenu={(e: any, n: any) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, node: n }); }} />
        ))}
      </div>

      {isCreating && (
        <div className="absolute top-10 left-0 w-full bg-[#111] p-2 border-b border-[#00ff00] z-50">
          <form onSubmit={handleCreateFile}>
            <input
              autoFocus
              className="bg-black text-white text-xs w-full px-1 outline-none"
              placeholder="Filename..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onBlur={() => {
                if (newName.trim()) handleCreateFile();
                else setIsCreating(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsCreating(false);
              }}
            />
          </form>
        </div>
      )}

      {contextMenu && (
        <div className="fixed z-50 w-40 bg-[#050505] border border-[#333] shadow-xl py-1 rounded-sm" style={{ top: contextMenu.y, left: contextMenu.x }}>
          {contextMenu.node?.type === 'folder' && (
            <div className="px-3 py-2 text-[11px] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#00ff00] cursor-pointer flex gap-2"
              onClick={() => { setIsCreating(true); setTargetPath(contextMenu.node!.path); }}>
              <FilePlus size={12} /> New File
            </div>
          )}
          <div className="px-3 py-2 text-[11px] text-red-400 hover:bg-[#1a1a1a] hover:text-red-500 cursor-pointer flex gap-2" onClick={handleDelete}>
            <Trash2 size={12} /> Delete
          </div>
        </div>
      )}
    </div>
  );
};
export default Explorer;
