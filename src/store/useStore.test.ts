import { afterEach, describe, expect, it } from 'vitest';

import type { FileNode } from '../types/electron';
import { useStore } from './useStore';

const initialState = useStore.getState();

afterEach(() => {
  useStore.setState(initialState, true);
});

describe('useStore', () => {
  it('starts on the dashboard with no open files', () => {
    const state = useStore.getState();

    expect(state.currentView).toBe('dashboard');
    expect(state.openFiles).toEqual([]);
    expect(state.activeFilePath).toBeNull();
  });

  it('flattens project files for the command palette', () => {
    const files: FileNode[] = [
      {
        name: 'src',
        path: '/project/src',
        type: 'folder',
        children: [
          {
            name: 'App.tsx',
            path: '/project/src/App.tsx',
            type: 'file',
          },
          {
            name: 'main.tsx',
            path: '/project/src/main.tsx',
            type: 'file',
          },
        ],
      },
    ];

    useStore.getState().setFiles(files);

    expect(useStore.getState().flatFiles.map((file) => file.path)).toEqual([
      '/project/src/App.tsx',
      '/project/src/main.tsx',
    ]);
  });
});
