import { FileNode } from '../types/electron';
import { useStore } from '../store/useStore'; // Importar store para leer estructura

export const fileService = {
  openProjectFolder: async () => await window.electronAPI.openDirectory(),
  getProjectFiles: async (path: string) => await window.electronAPI.readDir(path),
  readFile: async (path: string) => await window.electronAPI.readFile(path),

  createFile: async (basePath: string, name: string, content?: string) => await window.electronAPI.createFile(basePath, name, content || ''),
  saveFile: async (path: string, content: string) => await window.electronAPI.saveFile(path, content),
  renameFile: async (oldPath: string, newName: string) => await window.electronAPI.renameFile(oldPath, newName),
  deleteFile: async (path: string) => await window.electronAPI.deleteFile(path),

  // IA MEJORADA CON MEMORIA
  askAI: async ({ message, codeContext, chatHistory }: { message: string; codeContext: string; chatHistory: any[] }) => {
    // Obtenemos la estructura actual del store
    const projectStructure = useStore.getState().files;
    return await window.electronAPI.askAI({
      message,
      codeContext,
      projectStructure, // <--- Enviamos el mapa del proyecto
      chatHistory // <--- Enviamos el historial de la conversación
    });
  }
};