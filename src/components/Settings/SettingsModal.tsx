import React, { useState, useEffect } from 'react';
import { X, Save, Key, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/useStore';

const SettingsModal = () => {
  const { toggleSettings } = useStore();
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Cargar la clave guardada al abrir
    const loadSettings = async () => {
      const settings = await window.electronAPI.getSettings();
      if (settings.apiKey) {
        setApiKey(settings.apiKey);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await window.electronAPI.saveSettings({ apiKey });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      toggleSettings(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-[#333] w-full max-w-md shadow-2xl rounded-sm overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222] bg-[#111]">
          <h2 className="text-white font-bold tracking-widest flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#00ff00]" /> SETTINGS
          </h2>
          <button onClick={() => toggleSettings(false)} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <Key size={14} /> Gemini API Key
            </label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your AIza... key here"
              className="w-full bg-black border border-[#333] p-3 text-sm text-white focus:border-[#00ff00] outline-none transition-colors font-mono"
            />
            <p className="text-[10px] text-gray-600">
              Your key is stored locally on your device. Never shared.
            </p>
          </div>

          <button 
            type="submit"
            className={`w-full py-3 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2
              ${isSaved ? 'bg-[#00ff00] text-black' : 'bg-[#222] text-white hover:bg-[#333] border border-[#333]'}
            `}
          >
            {isSaved ? 'SAVED SUCCESSFULLY' : <><Save size={16} /> SAVE SETTINGS</>}
          </button>

        </form>
      </div>
    </div>
  );
};

export default SettingsModal;