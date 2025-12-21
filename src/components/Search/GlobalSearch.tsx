import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { fileService } from '../../services/fileService';
import { Search, X, FileCode2, ChevronDown, ChevronRight, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { SearchResult } from '../../types/electron';

interface GroupedResults {
    [filePath: string]: SearchResult[];
}

const GlobalSearch: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { projectPath, setActiveFile, openFile } = useStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [groupedResults, setGroupedResults] = useState<GroupedResults>({});
    const [isSearching, setIsSearching] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [useRegex, setUseRegex] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Debounced search
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim() || !projectPath) {
            setResults([]);
            setGroupedResults({});
            setTotalCount(0);
            return;
        }

        setIsSearching(true);

        try {
            const response = await window.electronAPI.searchProject(searchQuery, projectPath, {
                caseSensitive,
                regex: useRegex
            });

            if (response.success) {
                setResults(response.results);
                setTotalCount(response.totalCount || response.results.length);

                // Group results by file
                const grouped: GroupedResults = {};
                response.results.forEach(result => {
                    if (!grouped[result.file]) {
                        grouped[result.file] = [];
                    }
                    grouped[result.file].push(result);
                });
                setGroupedResults(grouped);

                // Auto-expand first few files
                const filePaths = Object.keys(grouped);
                setExpandedFiles(new Set(filePaths.slice(0, 5)));
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    }, [projectPath, caseSensitive, useRegex]);

    // Debounce input changes
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [query, performSearch]);

    const handleResultClick = async (result: SearchResult) => {
        try {
            const content = await fileService.readFile(result.file);
            openFile(result.file);
            setActiveFile(result.file, content);
            onClose();
            // TODO: Scroll to line in editor
        } catch (error) {
            console.error('Error opening file:', error);
        }
    };

    const toggleFileExpanded = (filePath: string) => {
        setExpandedFiles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(filePath)) {
                newSet.delete(filePath);
            } else {
                newSet.add(filePath);
            }
            return newSet;
        });
    };

    const getFileName = (filePath: string) => {
        return filePath.split('/').pop() || filePath;
    };

    const getRelativePath = (filePath: string) => {
        if (!projectPath) return filePath;
        return filePath.replace(projectPath + '/', '');
    };

    const highlightMatch = (text: string, searchQuery: string) => {
        if (!searchQuery.trim()) return text;

        try {
            const pattern = useRegex
                ? new RegExp(`(${searchQuery})`, caseSensitive ? 'g' : 'gi')
                : new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, caseSensitive ? 'g' : 'gi');

            const parts = text.split(pattern);
            return parts.map((part, i) =>
                pattern.test(part) ? (
                    <span key={i} className="bg-[#00ff00]/30 text-[#00ff00]">{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            );
        } catch {
            return text;
        }
    };

    const fileCount = Object.keys(groupedResults).length;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-[10vh]">
            <div className="w-[700px] max-h-[70vh] bg-[#0a0a0a] border border-[#333] rounded-none shadow-2xl flex flex-col">
                {/* Search Header */}
                <div className="p-3 border-b border-[#222]">
                    <div className="flex items-center gap-2 bg-black border border-[#333] px-3 py-2">
                        <Search size={16} className="text-[#666]" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search in project..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 text-sm font-mono"
                            autoComplete="off"
                            spellCheck="false"
                        />
                        {isSearching && (
                            <RefreshCw size={14} className="text-[#00ff00] animate-spin" />
                        )}
                        <button onClick={onClose} className="text-gray-500 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Search Options */}
                    <div className="flex items-center gap-4 mt-2 text-[10px]">
                        <button
                            onClick={() => setCaseSensitive(!caseSensitive)}
                            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${caseSensitive ? 'bg-[#00ff00]/20 text-[#00ff00]' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {caseSensitive ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                            Case Sensitive
                        </button>
                        <button
                            onClick={() => setUseRegex(!useRegex)}
                            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${useRegex ? 'bg-[#00ff00]/20 text-[#00ff00]' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {useRegex ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                            Regex
                        </button>
                    </div>
                </div>

                {/* Results Summary */}
                {query && (
                    <div className="px-3 py-2 border-b border-[#222] text-[10px] text-gray-500">
                        {isSearching ? (
                            'Searching...'
                        ) : (
                            <>
                                {totalCount} results in {fileCount} files
                                {totalCount > results.length && <span className="text-yellow-500 ml-2">(showing first {results.length})</span>}
                            </>
                        )}
                    </div>
                )}

                {/* Results List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {Object.entries(groupedResults).map(([filePath, fileResults]) => (
                        <div key={filePath} className="border-b border-[#1a1a1a]">
                            {/* File Header */}
                            <div
                                onClick={() => toggleFileExpanded(filePath)}
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#111] select-none"
                            >
                                {expandedFiles.has(filePath) ? (
                                    <ChevronDown size={12} className="text-gray-500" />
                                ) : (
                                    <ChevronRight size={12} className="text-gray-500" />
                                )}
                                <FileCode2 size={12} className="text-[#00ff00]" />
                                <span className="text-white text-xs font-medium">{getFileName(filePath)}</span>
                                <span className="text-gray-600 text-[10px] truncate flex-1">{getRelativePath(filePath)}</span>
                                <span className="text-gray-500 text-[10px]">{fileResults.length} matches</span>
                            </div>

                            {/* File Results */}
                            {expandedFiles.has(filePath) && (
                                <div className="bg-black/50">
                                    {fileResults.map((result, idx) => (
                                        <div
                                            key={`${result.file}-${result.line}-${idx}`}
                                            onClick={() => handleResultClick(result)}
                                            className="flex items-start gap-3 px-6 py-1.5 cursor-pointer hover:bg-[#00ff00]/10 border-l-2 border-transparent hover:border-[#00ff00] transition-colors"
                                        >
                                            <span className="text-[#666] text-[10px] font-mono w-8 text-right shrink-0">
                                                {result.line}
                                            </span>
                                            <span className="text-gray-300 text-xs font-mono truncate">
                                                {highlightMatch(result.preview, query)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Empty State */}
                    {query && !isSearching && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                            <Search size={32} className="mb-2 opacity-50" />
                            <span className="text-sm">No results found</span>
                        </div>
                    )}

                    {/* Initial State */}
                    {!query && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                            <Search size={32} className="mb-2 opacity-50" />
                            <span className="text-sm">Type to search across all files</span>
                            <span className="text-[10px] text-gray-700 mt-1">Press ESC to close</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-3 py-2 border-t border-[#222] flex justify-between text-[9px] text-gray-600">
                    <span><kbd className="bg-[#222] px-1.5 py-0.5 rounded">↵</kbd> to open</span>
                    <span><kbd className="bg-[#222] px-1.5 py-0.5 rounded">ESC</kbd> to close</span>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
