const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  readDir: (path) => ipcRenderer.invoke('fs:readDir', path),
  readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
  createFile: (basePath, name, content) => ipcRenderer.invoke('fs:createFile', { basePath, name, content }),
  saveFile: (filePath, content) => ipcRenderer.invoke('fs:saveFile', { filePath, content }),
  renameFile: (oldPath, newName) => ipcRenderer.invoke('fs:renameFile', { oldPath, newName }),
  deleteFile: (filePath) => ipcRenderer.invoke('fs:deleteFile', filePath),
  askAI: (data) => ipcRenderer.invoke('ai:chat', data),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),

  // Escuchar cambios desde el Main Process
  onFileChange: (callback) => ipcRenderer.on('file:changed', (event, data) => callback(data)),

  //
  spawnTerminal: (cwd) => ipcRenderer.invoke('terminal:spawn', cwd),
  writeTerminal: (data) => ipcRenderer.invoke('terminal:write', data),
  resizeTerminal: (cols, rows) => ipcRenderer.invoke('terminal:resize', { cols, rows }),
  killTerminal: () => ipcRenderer.invoke('terminal:kill'),
  onTerminalData: (callback) => ipcRenderer.on('terminal:data', (event, data) => callback(data)),
  onTerminalExit: (callback) => ipcRenderer.on('terminal:exit', (event, code) => callback(code)),
  removeTerminalListeners: () => {
    ipcRenderer.removeAllListeners('terminal:data');
    ipcRenderer.removeAllListeners('terminal:exit');
  },

  //
  searchProject: (query, projectPath, options) => ipcRenderer.invoke('search:global', { query, projectPath, options }),

  //
  gitStatus: (projectPath) => ipcRenderer.invoke('git:status', projectPath),
  gitStage: (projectPath, files) => ipcRenderer.invoke('git:stage', { projectPath, files }),
  gitUnstage: (projectPath, files) => ipcRenderer.invoke('git:unstage', { projectPath, files }),
  gitCommit: (projectPath, message) => ipcRenderer.invoke('git:commit', { projectPath, message }),
  gitDiff: (projectPath, file) => ipcRenderer.invoke('git:diff', { projectPath, file }),
  gitLog: (projectPath, maxCount) => ipcRenderer.invoke('git:log', { projectPath, maxCount }),

  //
  aiComplete: (prefix, suffix, language, filepath) => ipcRenderer.invoke('ai:complete', { prefix, suffix, language, filepath })
});