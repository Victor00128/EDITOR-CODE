import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { fileService } from '../../services/fileService';

const CodeEditor: React.FC = () => {
  const { activeFilePath, activeFileContent, updateFileContent, markUnsaved, markSaved } = useStore();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const providerRef = useRef<any>(null);

  // Guardado con Ctrl + S
  useEffect(() => {
    const handleSave = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeFilePath && editorRef.current) {
          const content = editorRef.current.getValue();
          try {
            await fileService.saveFile(activeFilePath, content);
            markSaved(activeFilePath);
          } catch (error) { console.error(error); }
        }
      }
    };
    window.addEventListener('keydown', handleSave);
    return () => window.removeEventListener('keydown', handleSave);
  }, [activeFilePath, markSaved]);

  // Cleanup provider on unmount
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.dispose();
      }
    };
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define theme
    monaco.editor.defineTheme('zenith-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#000000',
        'editor.lineHighlightBackground': '#0a0a0a',
        'editor.selectionBackground': '#00ff0033',
      }
    });
    monaco.editor.setTheme('zenith-dark');

    // Register InlineCompletionsProvider for AI autocomplete
    let debounceTimer: NodeJS.Timeout | null = null;

    providerRef.current = monaco.languages.registerInlineCompletionsProvider('*', {
      provideInlineCompletions: async (model: any, position: any, context: any, token: any) => {
        // Don't trigger on explicit invocation or if cancelled
        if (token.isCancellationRequested) return { items: [] };

        // Debounce: wait 500ms after user stops typing
        if (debounceTimer) clearTimeout(debounceTimer);

        return new Promise((resolve) => {
          debounceTimer = setTimeout(async () => {
            try {
              const fullText = model.getValue();
              const offset = model.getOffsetAt(position);

              // Get context: 500 chars before and 200 after cursor
              const prefixStart = Math.max(0, offset - 500);
              const suffixEnd = Math.min(fullText.length, offset + 200);
              const prefix = fullText.substring(prefixStart, offset);
              const suffix = fullText.substring(offset, suffixEnd);

              // Get language
              const language = model.getLanguageId() || 'plaintext';
              const filepath = model.uri.path || '';

              // Don't fetch if prefix is too short or ends with space
              if (prefix.trim().length < 5 || prefix.endsWith(' ') || prefix.endsWith('\n')) {
                resolve({ items: [] });
                return;
              }

              // Fetch AI suggestions
              const result = await window.electronAPI.aiComplete(prefix, suffix, language, filepath);

              if (result.success && result.suggestions.length > 0) {
                const items = result.suggestions.map(suggestion => ({
                  insertText: suggestion,
                  range: new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                  )
                }));
                resolve({ items });
              } else {
                resolve({ items: [] });
              }
            } catch (error) {
              console.error('AI autocomplete error:', error);
              resolve({ items: [] });
            }
          }, 600); // 600ms debounce
        });
      },
      freeInlineCompletions: () => { }
    });
  };

  const handleOnChange = (value: string | undefined) => {
    if (activeFilePath && value !== undefined) {
      updateFileContent(value);
      markUnsaved(activeFilePath);
    }
  };

  if (!activeFilePath) return null;

  return (
    <div className="h-full w-full overflow-hidden bg-black">
      <Editor
        height="100%"
        path={activeFilePath}
        value={activeFileContent}
        theme="zenith-dark"
        onChange={handleOnChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true, scale: 0.75 },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 24,
          automaticLayout: true,
          padding: { top: 16 },
          smoothScrolling: true,
          inlineSuggest: {
            enabled: true,
            mode: 'subwordSmart'
          },
          quickSuggestions: { other: true, comments: false, strings: false },
        }}
      />
    </div>
  );
};
export default CodeEditor;