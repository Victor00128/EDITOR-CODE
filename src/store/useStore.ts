import { create } from 'zustand';
import { FileNode, ChatMessage } from '../types/electron';

interface AppState {
  // ... Estados anteriores
  currentView: 'dashboard' | 'editor';
  projectPath: string | null;
  projectName: string;
  isSettingsOpen: boolean;
  isPaletteOpen: boolean;

  files: FileNode[]; // Árbol completo
  flatFiles: FileNode[]; // Lista plana para el buscador
  activeFilePath: string | null;
  activeFileContent: string; // Contenido actual en memoria

  openFiles: string[];
  chatHistory: ChatMessage[];
  unsavedFilePaths: string[];

  // ... Acciones
  setView: (view: 'dashboard' | 'editor') => void;
  setProject: (path: string, name: string) => void;
  toggleSettings: (isOpen: boolean) => void;
  togglePalette: (isOpen: boolean) => void;

  setFiles: (files: FileNode[]) => void;
  setActiveFile: (path: string, content: string) => void; // Ahora recibe contenido

  openFile: (path: string) => void;
  closeFile: (path: string) => void;

  addFile: (file: FileNode) => void; // Simplificado
  updateFileContent: (content: string) => void;

  markUnsaved: (path: string) => void;
  markSaved: (path: string) => void;
  addChatMessage: (msg: ChatMessage) => void;

  // Para el modal de diff
  pendingDiff: any;
  setPendingDiff: (diff: any) => void;

  // Para el diálogo de confirmación
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null;
  showConfirm: (config: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
  }) => void;
  hideConfirm: () => void;

  // Para el diálogo de alerta
  alertDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'error' | 'warning' | 'info';
  } | null;
  showAlert: (config: {
    title: string;
    message: string;
    type?: 'error' | 'warning' | 'info';
  }) => void;
  hideAlert: () => void;

  // Preview errors for AI debugging
  previewErrors: string[];
  setPreviewErrors: (errors: string[]) => void;
  addPreviewError: (error: string) => void;
  clearPreviewErrors: () => void;
}

// Helper para aplanar el árbol (para el Command Palette)
const flatten = (nodes: FileNode[]): FileNode[] => {
  let flat: FileNode[] = [];
  nodes.forEach(node => {
    if (node.type === 'file') flat.push(node);
    if (node.children) flat = flat.concat(flatten(node.children));
  });
  return flat;
};

export const useStore = create<AppState>((set, get) => ({
  currentView: 'dashboard',
  projectPath: null,
  projectName: '',
  isSettingsOpen: false,
  isPaletteOpen: false,
  files: [],
  flatFiles: [],
  activeFilePath: null,
  activeFileContent: '',
  openFiles: [],
  chatHistory: [],
  unsavedFilePaths: [],
  pendingDiff: null,
  confirmDialog: null,
  alertDialog: null,
  previewErrors: [] as string[],

  setView: (view) => set({ currentView: view }),
  setProject: (path, name) => set({ projectPath: path, projectName: name, currentView: 'editor', files: [], openFiles: [], activeFilePath: null }),
  toggleSettings: (isOpen) => set({ isSettingsOpen: isOpen }),
  togglePalette: (isOpen) => set({ isPaletteOpen: isOpen }),

  setFiles: (files) => set({ files, flatFiles: flatten(files) }),

  setActiveFile: (path, content) => set({ activeFilePath: path, activeFileContent: content }),

  openFile: (path) => {
    const { openFiles } = get();
    if (!openFiles.includes(path)) set({ openFiles: [...openFiles, path] });
  },

  closeFile: (path) => {
    const { openFiles, activeFilePath } = get();
    const newOpenFiles = openFiles.filter(p => p !== path);
    const newActive = activeFilePath === path ? (newOpenFiles.length ? newOpenFiles[newOpenFiles.length - 1] : null) : activeFilePath;
    // Si cerramos todo, limpiamos contenido
    const content = newActive === activeFilePath ? get().activeFileContent : '';
    set({ openFiles: newOpenFiles, activeFilePath: newActive, activeFileContent: content });
  },

  // Al agregar, lo ideal es recargar el árbol, aquí simplificamos
  addFile: () => { },

  updateFileContent: (content) => set({ activeFileContent: content }),

  markUnsaved: (path) => set((state) => {
    if (state.unsavedFilePaths.includes(path)) return state;
    return { unsavedFilePaths: [...state.unsavedFilePaths, path] };
  }),
  markSaved: (path) => set((state) => ({ unsavedFilePaths: state.unsavedFilePaths.filter(p => p !== path) })),

  addChatMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  setPendingDiff: (diff) => set({ pendingDiff: diff }),

  showConfirm: (config) => set({ confirmDialog: { isOpen: true, ...config } }),
  hideConfirm: () => set({ confirmDialog: null }),

  showAlert: (config) => set({ alertDialog: { isOpen: true, ...config } }),
  hideAlert: () => set({ alertDialog: null }),

  // Preview error actions
  setPreviewErrors: (errors) => set({ previewErrors: errors }),
  addPreviewError: (error) => set((state) => ({ previewErrors: [...state.previewErrors, error] })),
  clearPreviewErrors: () => set({ previewErrors: [] }),
}));
