import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Archive, Github, Wifi, ArrowRight } from 'lucide-react';
import { CatToggle } from './components/CatToggle';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';
import { TransferFile, Theme } from './types';
import { generateId, formatBytes } from './utils';
import { motion } from 'framer-motion';

const MAX_SIZE_BYTES = 10 * 1024 * 1024 * 1024; // 10GB

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  const [files, setFiles] = useState<TransferFile[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  // Theme Handling
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // File Upload Handling
  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newTransfers: TransferFile[] = selectedFiles.map(file => ({
      id: generateId(),
      file,
      progress: 0,
      status: 'pending',
      timestamp: Date.now(),
    }));

    setFiles(prev => [...prev, ...newTransfers]);

    // Simulate "LAN Transfer" speed
    newTransfers.forEach(transfer => {
      // Small delay to start
      setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === transfer.id ? { ...f, status: 'uploading' } : f));
        
        const startTime = Date.now();
        const duration = Math.min(Math.max(transfer.file.size / 1000000, 500), 2000); // Simulate network speed
        
        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / duration) * 100, 100);
          
          setFiles(prev => prev.map(f => {
            if (f.id === transfer.id) {
              return { ...f, progress };
            }
            return f;
          }));

          if (progress >= 100) {
            clearInterval(interval);
            setFiles(prev => prev.map(f => f.id === transfer.id ? { ...f, status: 'completed' } : f));
          }
        }, 50);
      }, 300);
    });
  }, []);

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDownloadZip = async () => {
    if (files.length === 0) return;
    
    setIsZipping(true);
    const zip = new JSZip();
    
    // Add completed files to zip
    files.forEach(f => {
        if (f.status === 'completed') {
            zip.file(f.file.name, f.file);
        }
    });

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `MeowDrop_Transfer_${new Date().toISOString().slice(0, 10)}.zip`);
    } catch (error) {
        console.error("Error zipping files", error);
        alert("Could not zip files. They might be too large for browser memory.");
    } finally {
        setIsZipping(false);
    }
  };

  const totalSize = files.reduce((acc, curr) => acc + curr.file.size, 0);
  const completedFilesCount = files.filter(f => f.status === 'completed').length;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8">
      
      {/* Header */}
      <header className="w-full max-w-3xl flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-2.5 rounded-xl">
            <Wifi size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MeowDrop</h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Local Area Network</p>
          </div>
        </div>
        <CatToggle theme={theme} toggleTheme={toggleTheme} />
      </header>

      {/* Main Content */}
      <main className="w-full max-w-3xl flex-1 flex flex-col">
        
        {/* Upload Area */}
        <section className="mb-8">
            <DropZone onFilesSelected={handleFilesSelected} />
        </section>

        {/* Stats & Actions */}
        {files.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Size</span>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">{formatBytes(totalSize)}</span>
                </div>

                <div className="flex items-center gap-3">
                     <button 
                        onClick={() => setFiles([])}
                        className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleDownloadZip}
                        disabled={isZipping || completedFilesCount === 0}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all shadow-md hover:shadow-lg
                            ${isZipping || completedFilesCount === 0 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-gray-900 dark:bg-cat-accent hover:opacity-90 active:scale-95'
                            }`}
                    >
                        {isZipping ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Archive size={18} />
                                <span>Download ZIP</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        )}

        {/* File List */}
        <FileList files={files} onDelete={handleDelete} />

      </main>

      {/* Footer */}
      <footer className="w-full max-w-3xl mt-16 py-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} MeowDrop. LAN Transfer Protocol.</p>
        <div className="flex items-center gap-2">
            <span>Ready for 10GB</span>
            <ArrowRight size={14} />
        </div>
      </footer>

    </div>
  );
}
