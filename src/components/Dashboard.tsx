import React from 'react';
import { useStore } from '../store/useStore';
import { fileService } from '../services/fileService';
import { FolderOpen, Cpu } from 'lucide-react';

const Dashboard = () => {
  const { setProject, setFiles } = useStore();

  const handleOpenFolder = async () => {
    const path = await fileService.openProjectFolder();
    if (path) {
      const folderName = path.split(/[/\\]/).pop() || 'Project';
      const files = await fileService.getProjectFiles(path);
      setProject(path, folderName);
      setFiles(files);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#050505] text-[#cccccc] font-mono flex flex-col items-center justify-center p-10 select-none">
      <div className="flex flex-col items-center gap-6">
        <Cpu size={64} className="text-[#00ff00]" />
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-[0.2em] text-white">ZENITH IDE</h1>
          <p className="text-sm text-[#00ff00] mt-2 animate-pulse">DESKTOP SYSTEM ONLINE</p>
        </div>
        <div className="mt-8">
          <button 
            onClick={handleOpenFolder}
            className="flex items-center gap-3 bg-[#111] border border-[#333] hover:border-[#00ff00] hover:text-white px-8 py-4 text-sm font-bold transition-all group"
          >
            <FolderOpen size={20} className="text-gray-500 group-hover:text-[#00ff00]" />
            OPEN LOCAL FOLDER
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;