import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useStore } from '../../store/useStore';
import '@xterm/xterm/css/xterm.css';

const RealTerminal: React.FC = () => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const { projectPath } = useStore();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    // Usar ref para isConnected para evitar problemas de closure
    const isConnectedRef = useRef(false);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Crear instancia de xterm
        const term = new Terminal({
            cursorBlink: true,
            cursorStyle: 'bar',
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            theme: {
                background: '#000000',
                foreground: '#cccccc',
                cursor: '#00ff00',
                cursorAccent: '#000000',
                selectionBackground: '#00ff0044',
                black: '#000000',
                red: '#ff5555',
                green: '#00ff00',
                yellow: '#f1fa8c',
                blue: '#6272a4',
                magenta: '#ff79c6',
                cyan: '#8be9fd',
                white: '#cccccc',
                brightBlack: '#666666',
                brightRed: '#ff6e6e',
                brightGreen: '#69ff94',
                brightYellow: '#ffffa5',
                brightBlue: '#d6acff',
                brightMagenta: '#ff92df',
                brightCyan: '#a4ffff',
                brightWhite: '#ffffff',
            },
            allowTransparency: true,
            scrollback: 5000,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);

        // Fit después de un pequeño delay para asegurar que el DOM está listo
        setTimeout(() => {
            fitAddon.fit();
        }, 100);

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Conectar al terminal del backend
        const initTerminal = async () => {
            try {
                const result = await window.electronAPI.spawnTerminal(projectPath || undefined);

                if (result.success) {
                    isConnectedRef.current = true;
                    setIsConnected(true);
                    setConnectionError(null);
                    term.writeln(`\x1b[32m✓ Terminal conectado: ${result.shell}\x1b[0m`);
                    term.writeln(`\x1b[90mDirectorio: ${result.cwd}\x1b[0m`);
                    term.writeln('');
                } else {
                    setConnectionError(result.error || 'Error desconocido');
                    term.writeln(`\x1b[31m✗ Error al conectar: ${result.error}\x1b[0m`);
                }
            } catch (err: any) {
                setConnectionError(err.message);
                term.writeln(`\x1b[31m✗ Error: ${err.message}\x1b[0m`);
            }
        };

        initTerminal();

        // Recibir datos del terminal
        window.electronAPI.onTerminalData((data) => {
            term.write(data);
        });

        // Manejar cierre del proceso
        window.electronAPI.onTerminalExit((code) => {
            term.writeln('');
            term.writeln(`\x1b[33m Proceso terminado (código: ${code})\x1b[0m`);
            isConnectedRef.current = false;
            setIsConnected(false);
        });

        // Enviar input del usuario al backend - USAR REF para evitar closure stale
        term.onData((data) => {
            if (isConnectedRef.current) {
                window.electronAPI.writeTerminal(data);
            }
        });

        // Manejar resize
        const handleResize = () => {
            if (fitAddonRef.current && xtermRef.current) {
                fitAddonRef.current.fit();
                const { cols, rows } = xtermRef.current;
                window.electronAPI.resizeTerminal(cols, rows);
            }
        };

        window.addEventListener('resize', handleResize);

        // Observer para detectar cambios de tamaño del contenedor
        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });
        resizeObserver.observe(terminalRef.current);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
            window.electronAPI.removeTerminalListeners();
            window.electronAPI.killTerminal();
            term.dispose();
        };
    }, [projectPath]);

    // Re-fit cuando cambia el estado de conexión
    useEffect(() => {
        if (fitAddonRef.current) {
            setTimeout(() => {
                fitAddonRef.current?.fit();
            }, 50);
        }
    }, [isConnected]);

    const handleRestart = async () => {
        if (xtermRef.current) {
            xtermRef.current.clear();
            xtermRef.current.writeln('\x1b[33m⟳ Reiniciando terminal...\x1b[0m');

            await window.electronAPI.killTerminal();

            const result = await window.electronAPI.spawnTerminal(projectPath || undefined);
            if (result.success) {
                isConnectedRef.current = true;
                setIsConnected(true);
                setConnectionError(null);
                xtermRef.current.writeln(`\x1b[32m✓ Terminal reconectado\x1b[0m`);
                xtermRef.current.writeln('');
            } else {
                isConnectedRef.current = false;
                setConnectionError(result.error || 'Error');
            }
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-black">
            {/* Header */}
            <div className="h-8 bg-[#0a0a0a] border-b border-[#222] flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00ff00] shadow-[0_0_4px_#00ff00]' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-bold tracking-wider text-[#666] uppercase">
                        {isConnected ? 'TERMINAL' : connectionError ? 'ERROR' : 'CONNECTING...'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRestart}
                        className="text-[9px] text-[#666] hover:text-white px-2 py-0.5 hover:bg-white/5 rounded transition-colors"
                    >
                        ⟳ RESTART
                    </button>
                </div>
            </div>

            {/* Terminal Container */}
            <div
                ref={terminalRef}
                className="flex-1 p-2 overflow-hidden"
                style={{
                    height: 'calc(100% - 32px)',
                    minHeight: '200px'
                }}
            />
        </div>
    );
};

export default RealTerminal;
