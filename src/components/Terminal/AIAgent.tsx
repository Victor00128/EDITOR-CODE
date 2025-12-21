import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { fileService } from '../../services/fileService'; // Usamos fileService en vez de axios
import { Send, Terminal, Copy, ArrowLeftToLine, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';

// Función auxiliar para limpiar el código de nodos React y obtener texto plano
const extractTextFromNode = (node: any): string => {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractTextFromNode).join('');
  if (typeof node === 'object' && node !== null && 'props' in node) {
    return extractTextFromNode(node.props.children);
  }
  return '';
};

const AIAgent: React.FC = () => {
  const { chatHistory, addChatMessage, files, activeFilePath, activeFileContent, updateFileContent, setPendingDiff, projectPath, setFiles } = useStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;

    addChatMessage({
      id: Date.now().toString(),
      role: 'user',
      text: userMsg,
      timestamp: new Date()
    });

    setInput('');
    setIsLoading(true);

    try {
      const { previewErrors } = useStore.getState();
      let enhancedMessage = userMsg;
      if (previewErrors.length > 0) {
        enhancedMessage += `\n\n[Errores]:\n${previewErrors.join('\n')}`;
      }

      const responseText = await fileService.askAI({
        message: enhancedMessage,
        codeContext: activeFileContent || '',
        chatHistory
      });

      // Detectar si la respuesta contiene acciones JSON
      const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);

      if (jsonMatch) {
        try {
          const action = JSON.parse(jsonMatch[1]);

          if (action.action && action.files) {
            // Mostrar mensaje de explicación
            addChatMessage({
              id: (Date.now() + 1).toString(),
              role: 'ai',
              text: `**Action Detected:** ${action.explanation || 'File operation'}\n\n${action.action === 'modify_file' ? 'Review changes below...' : 'Executing...'}`,
              timestamp: new Date()
            });

            // Para modificaciones, mostrar diff modal para revisión
            if (action.action === 'modify_file' || action.action === 'create_multiple') {
              // Preparar diffs para cada archivo
              const fileDiffs = await Promise.all(
                action.files.map(async (file: any) => {
                  const fullPath = file.path.startsWith('/') ? file.path : `${projectPath}/${file.path}`;
                  let original = '';
                  try {
                    original = await fileService.readFile(fullPath);
                  } catch (e) {
                    // Archivo nuevo, original vacío
                  }
                  return {
                    path: fullPath,
                    original,
                    modified: file.content || '',
                  };
                })
              );

              // Mostrar modal de diff multi-archivo
              setPendingDiff({
                files: fileDiffs,
                action: action.action,
                explanation: action.explanation
              });

              addChatMessage({
                id: (Date.now() + 2).toString(),
                role: 'ai',
                text: ` Review the proposed changes for ${fileDiffs.length} file(s) in the diff modal.`,
                timestamp: new Date()
              });

              return; // No mostrar el JSON raw
            }

            // Para crear o eliminar, ejecutar directamente
            for (const file of action.files) {
              const fullPath = file.path.startsWith('/') ? file.path : `${projectPath}/${file.path}`;
              const pathParts = fullPath.split('/');
              const fileName = pathParts.pop();
              const basePath = pathParts.join('/');

              if (action.action === 'delete') {
                await fileService.deleteFile(fullPath);
              } else {
                await fileService.createFile(basePath!, fileName!, file.content);
              }
            }

            // Confirmar éxito con el mensaje apropiado según la acción
            const actionVerb = action.action === 'delete' ? 'deleted' : 'created';
            addChatMessage({
              id: (Date.now() + 2).toString(),
              role: 'ai',
              text: ` Successfully ${actionVerb} ${action.files.length} file(s).`,
              timestamp: new Date()
            });

            // Refrescar árbol de archivos
            if (projectPath) {
              const newFiles = await fileService.getProjectFiles(projectPath);
              setFiles(newFiles);
            }

            return; // No mostrar el JSON raw
          }
        } catch (e) {
          // Si falla el parsing, mostrar respuesta normal
          console.warn('Failed to parse JSON action:', e);
        }
      }

      // Respuesta normal (markdown)
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: responseText,
        timestamp: new Date()
      });
    } catch (error) {
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: "CRITICAL_ERROR: Neural Link Disconnected (Check API Key or Internet).",
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = (code: string) => {
    if (activeFilePath) {
      // Preparar el diff para revisión en el modal
      setPendingDiff({
        original: activeFileContent || '',
        modified: code,
        targetPath: activeFilePath
      });
    } else {
      alert("ERROR: No active file selected.");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black font-mono text-xs overflow-hidden">

      {/* AREA DE MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[#333] gap-2 select-none">
            <Terminal size={32} />
            <div className="text-[10px] tracking-[0.2em]">SYSTEM_IDLE</div>
          </div>
        )}

        {chatHistory.map((msg) => (
          <div key={msg.id} className="group w-full animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* HEADER */}
            <div className="flex items-center gap-2 mb-1 opacity-80">
              <span className={`font-bold uppercase tracking-wider text-[10px] ${msg.role === 'user' ? 'text-[#00ff00]' : 'text-[#a855f7]'}`}>
                {msg.role === 'user' ? '➜ USER@ROOT' : ' ZENITH_CORE'}
              </span>
              <span className="text-[9px] text-[#444]">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* CUERPO */}
            <div className={`
                pl-3 border-l-2 
                ${msg.role === 'user' ? 'border-[#00ff00]/50 text-white' : 'border-[#a855f7]/50 text-gray-300'}
            `}>
              <div className="markdown-content leading-relaxed text-xs">
                {msg.role === 'user' ? (
                  <span className="whitespace-pre-wrap font-medium">{msg.text}</span>
                ) : (
                  <ReactMarkdown
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        // Limpiamos el código para los botones de acción
                        const cleanCode = extractTextFromNode(children).replace(/\n$/, '');
                        const blockId = Math.random().toString(36).substr(2, 9);

                        return !inline && match ? (
                          <div className="rounded-none border border-[#333] my-3 bg-[#0d0d0d] w-full overflow-hidden">
                            <div className="bg-[#1a1a1a] px-2 py-1 text-[9px] text-gray-500 border-b border-[#333] flex justify-between items-center select-none">
                              <span className="uppercase tracking-widest font-bold">{match[1]}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApply(cleanCode)}
                                  className="flex items-center gap-1 hover:text-[#00ff00] transition-colors"
                                  title="Apply to Editor"
                                >
                                  <ArrowLeftToLine size={10} /> APPLY
                                </button>
                                <button
                                  onClick={() => handleCopy(cleanCode, blockId)}
                                  className="flex items-center gap-1 hover:text-white transition-colors"
                                  title="Copy Code"
                                >
                                  {copiedId === blockId ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                  {copiedId === blockId ? 'COPIED' : 'COPY'}
                                </button>
                              </div>
                            </div>
                            <code className={`${className} block p-3 overflow-x-auto`} {...props}>
                              {children}
                            </code>
                          </div>
                        ) : (
                          <code className="bg-[#222] text-[#00ff00] px-1 py-0.5 rounded-none text-[10px]" {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>

          </div>
        ))}

        {isLoading && (
          <div className="pl-3 border-l-2 border-[#a855f7]/50 mt-4">
            <div className="text-[#00ff00] text-[10px] animate-pulse">
              █ GENERATING_RESPONSE...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 bg-black border-t border-[#222] shrink-0">
        <div className="flex items-center gap-2 bg-[#050505] border border-[#333] px-3 py-2 focus-within:border-[#00ff00] transition-colors">
          <span className="text-[#00ff00] font-bold">➜</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Input command..."
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-[#cccccc] placeholder-gray-700 text-xs font-mono"
            autoComplete="off"
            spellCheck="false"
          />
          <Send
            size={14}
            className={`cursor-pointer transition-colors ${input.trim() ? 'text-[#00ff00]' : 'text-gray-700'}`}
            onClick={() => handleSend()}
          />
        </div>
      </div>
    </div>
  );
};

export default AIAgent;