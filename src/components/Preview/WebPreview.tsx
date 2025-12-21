import React, { useEffect, useRef, useState } from 'react';
import { FileNode } from '../../types/electron';
import { useStore } from '../../store/useStore';

interface WebPreviewProps {
  files: FileNode[];
  refreshTrigger: number;
}

const WebPreview: React.FC<WebPreviewProps> = ({ files, refreshTrigger }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updatePreview = async () => {
      if (!iframeRef.current) return;

      setErrors([]);
      setIsLoading(true);

      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (!doc) return;

      // 1. Encontrar index.html
      const htmlFile = files.find(f => f.name === 'index.html' || f.name.endsWith('.html'));

      if (!htmlFile) {
        doc.open();
        doc.write('<div style="color:#666;font-family:monospace;padding:20px;text-align:center"><p style="font-size:48px;margin:0"></p><p> No index.html found</p><p style="font-size:12px;opacity:0.6">Create an index.html file to preview</p></div>');
        doc.close();
        setIsLoading(false);
        return;
      }

      try {
        // 2. Cargar contenido de archivos desde disco
        const cssFiles = files.filter(f => f.name.endsWith('.css'));
        const jsFiles = files.filter(f => f.name.endsWith('.js'));

        // Leer contenido real de los archivos
        const htmlContent = await window.electronAPI.readFile(htmlFile.path);

        const cssContents = await Promise.all(
          cssFiles.map(async (f) => {
            try {
              const content = await window.electronAPI.readFile(f.path);
              return { name: f.name, content };
            } catch (e) {
              return { name: f.name, content: '' };
            }
          })
        );

        const jsContents = await Promise.all(
          jsFiles.map(async (f) => {
            try {
              const content = await window.electronAPI.readFile(f.path);
              return { name: f.name, content };
            } catch (e) {
              return { name: f.name, content: '' };
            }
          })
        );

        let finalHtml = htmlContent || '';

        // Inyectar CSS en el <head>
        const styles = cssContents.map(f => `<style>/* ${f.name} */\n${f.content}</style>`).join('\n');
        if (finalHtml.includes('</head>')) {
          finalHtml = finalHtml.replace('</head>', `${styles}\n</head>`);
        } else {
          finalHtml = `<head>${styles}</head>${finalHtml}`;
        }

        // Inyectar JS con captura de errores mejorada
        const scripts = jsContents.map(f => `
          <script>
            try {
              /* ${f.name} */
              ${f.content}
            } catch(err) {
              console.error("Error in ${f.name}:", err);
              document.body.innerHTML += '<div style="color:red;background:#ffebee;padding:10px;border:1px solid red;margin:10px"> JS Error in ${f.name}: ' + err.message + '</div>';
              window.parent.postMessage({ 
                type: 'preview-error', 
                file: '${f.name}', 
                message: err.message 
              }, '*');
            }
          </script>
        `).join('\n');

        if (finalHtml.includes('</body>')) {
          finalHtml = finalHtml.replace('</body>', `${scripts}\n</body>`);
        } else {
          finalHtml = `${finalHtml}${scripts}`;
        }

        // 3. Escribir en el iframe
        doc.open();
        doc.write(finalHtml);
        doc.close();
      } catch (error) {
        console.error('Preview error:', error);
        doc.open();
        doc.write(`<div style="color:red;font-family:monospace;padding:20px"> Error loading preview: ${error}</div>`);
        doc.close();
      } finally {
        setIsLoading(false);
      }
    };

    // Pequeño delay para asegurar que React montó el iframe
    const timeout = setTimeout(updatePreview, 100);
    return () => clearTimeout(timeout);

  }, [files, refreshTrigger]);

  // Get store functions
  const { setPreviewErrors, clearPreviewErrors } = useStore();

  // Listener for error messages from iframe and sync to store
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'preview-error') {
        const errorMsg = `${event.data.file}: ${event.data.message}`;
        setErrors(prev => {
          const newErrors = [...prev, errorMsg];
          setPreviewErrors(newErrors); // Sync to global store for AI
          return newErrors;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      clearPreviewErrors(); // Clear on unmount
    };
  }, [setPreviewErrors, clearPreviewErrors]);

  return (
    <div className="w-full h-full bg-[#f0f0f0] flex flex-col border-l border-[#222]">
      {/* Barra de Navegación Falsa */}
      <div className="h-8 bg-[#e0e0e0] border-b border-[#ccc] flex items-center px-3 gap-2 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
        </div>
        <div className="flex-1 ml-2 bg-white h-5 rounded-sm border border-[#ccc] flex items-center px-2 text-[10px] text-gray-500 font-sans shadow-sm">
          {isLoading ? 'Loading...' : 'localhost:3000/preview'}
        </div>
      </div>

      {/* Error Notification Banner */}
      {errors.length > 0 && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs font-mono flex items-start justify-between gap-2 animate-in slide-in-from-top-2 duration-200">
          <div className="flex-1">
            <div className="font-bold mb-1"> {errors.length} JavaScript Error{errors.length > 1 ? 's' : ''} Detected</div>
            <div className="space-y-0.5 opacity-90">
              {errors.map((err, i) => (
                <div key={i} className="text-[10px]">{err}</div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setErrors([])}
            className="text-white hover:text-red-200 transition-colors shrink-0 text-lg leading-none"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="text-gray-500 text-sm">Loading preview...</div>
        </div>
      )}

      {/* IFRAME: allow-scripts es vital para que corra JS */}
      <iframe
        ref={iframeRef}
        title="preview"
        className="flex-1 w-full border-none bg-white"
        sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
      />
    </div>
  );
};

export default WebPreview;