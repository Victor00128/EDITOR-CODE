export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  id?: string;
  language?: string;
  content?: string;
  children?: FileNode[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface TerminalSpawnResult {
  success: boolean;
  shell?: string;
  cwd?: string;
  error?: string;
}

export interface SearchResult {
  file: string;
  line: number;
  column: number;
  content: string;
  preview: string;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  totalCount?: number;
  truncated?: boolean;
  error?: string;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  regex?: boolean;
}

export interface IElectronAPI {
  openDirectory: () => Promise<string | null>;
  readDir: (path: string) => Promise<FileNode[]>;
  readFile: (path: string) => Promise<string>;
  createFile: (basePath: string, name: string, content: string) => Promise<any>;
  saveFile: (filePath: string, content: string) => Promise<boolean>;
  renameFile: (oldPath: string, newName: string) => Promise<any>;
  deleteFile: (filePath: string) => Promise<boolean>;
  askAI: (data: any) => Promise<string>;
  getSettings: () => Promise<any>;
  saveSettings: (s: any) => Promise<boolean>;

  // File watcher
  onFileChange: (callback: (data: { event: string, path: string }) => void) => void;

  // Terminal API
  spawnTerminal: (cwd?: string) => Promise<TerminalSpawnResult>;
  writeTerminal: (data: string) => Promise<boolean>;
  resizeTerminal: (cols: number, rows: number) => Promise<boolean>;
  killTerminal: () => Promise<boolean>;
  onTerminalData: (callback: (data: string) => void) => void;
  onTerminalExit: (callback: (code: number) => void) => void;
  removeTerminalListeners: () => void;

  // Search API
  searchProject: (query: string, projectPath: string, options?: SearchOptions) => Promise<SearchResponse>;

  // Git API
  gitStatus: (projectPath: string) => Promise<GitStatusResponse>;
  gitStage: (projectPath: string, files: string[]) => Promise<{ success: boolean; error?: string }>;
  gitUnstage: (projectPath: string, files: string[]) => Promise<{ success: boolean; error?: string }>;
  gitCommit: (projectPath: string, message: string) => Promise<GitCommitResponse>;
  gitDiff: (projectPath: string, file: string) => Promise<{ success: boolean; diff?: string; error?: string }>;
  gitLog: (projectPath: string, maxCount?: number) => Promise<GitLogResponse>;

  // AI Autocomplete API
  aiComplete: (prefix: string, suffix: string, language: string, filepath: string) => Promise<{
    success: boolean;
    suggestions: string[];
    error?: string;
  }>;
}

export interface GitStatusResponse {
  success: boolean;
  isRepo: boolean;
  branch?: string;
  branches?: string[];
  staged?: string[];
  modified?: string[];
  not_added?: string[];
  deleted?: string[];
  conflicted?: string[];
  created?: string[];
  renamed?: string[];
  isClean?: boolean;
  ahead?: number;
  behind?: number;
  error?: string;
}

export interface GitCommitResponse {
  success: boolean;
  commit?: string;
  summary?: {
    changes: number;
    insertions: number;
    deletions: number;
  };
  error?: string;
}

export interface GitLogResponse {
  success: boolean;
  commits?: Array<{
    hash: string;
    hashShort: string;
    message: string;
    author: string;
    date: string;
  }>;
  error?: string;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}