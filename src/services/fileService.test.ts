import { afterEach, describe, expect, it, vi } from 'vitest';

import type { FileNode } from '../types/electron';
import { useStore } from '../store/useStore';
import { fileService } from './fileService';

const initialState = useStore.getState();

afterEach(() => {
  useStore.setState(initialState, true);
  vi.unstubAllGlobals();
});

describe('fileService.askAI', () => {
  it('forwards the current project structure to the Electron bridge', async () => {
    const files: FileNode[] = [
      {
        name: 'index.ts',
        path: '/project/index.ts',
        type: 'file',
      },
    ];
    const askAI = vi.fn().mockResolvedValue('ok');

    useStore.setState({ ...useStore.getState(), files });
    vi.stubGlobal('window', {
      electronAPI: {
        askAI,
      },
    });

    await fileService.askAI({
      message: 'resume este archivo',
      codeContext: 'const answer = 42;',
      chatHistory: [],
    });

    expect(askAI).toHaveBeenCalledWith({
      message: 'resume este archivo',
      codeContext: 'const answer = 42;',
      projectStructure: files,
      chatHistory: [],
    });
  });
});
