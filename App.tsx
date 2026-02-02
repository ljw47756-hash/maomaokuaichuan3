import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, ArrowRight, Upload, Download as DownloadIcon } from 'lucide-react';
import { CatToggle } from './components/CatToggle';
import { DropZone } from './components/DropZone';
import { ShareDisplay } from './components/ShareDisplay';
import { ReceiveInterface } from './components/ReceiveInterface';
import { TransferFile, Theme, AppMode, StoredFileMetadata } from './types';
import { generateId, generateShareCode, fileToBase64 } from './utils';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK BACKEND HELPERS (LocalStorage) ---
const STORAGE_KEY = 'meowdrop_lan_db';
const MAX_FILE_SIZE_MB = 5; 

// Clean up expired files
const cleanupStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const db: StoredFileMetadata[] = JSON.parse(raw);
    const now = Date.now();
    const cleanDb = db.filter(f => f.expiresAt > now);
    if (db.length !== cleanDb.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanDb));
    }
  } catch (e) {
    console.error("Storage cleanup failed", e);
  }
};

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  const [mode, setMode] = useState<AppMode>('send');
  const [activeTransfer, setActiveTransfer] = useState<TransferFile | null>(null);

  // Theme Handling
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Run cleanup on mount
    cleanupStorage();
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- SEND LOGIC ---
  const handleFileSelect = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    // We only process the first file for the "Code Share" flow to keep it simple
    const file = files[0];

    // Size check for LocalStorage demo
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`Demo Limitation: Since we are simulating a server in the browser, please use files under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const transferId = generateId();
    const shareCode = generateShareCode();
    
    // UI State
    const newTransfer: TransferFile = {
      id: transferId,
      file,
      progress: 0,
      status: 'uploading',
      timestamp: Date.now(),
      shareCode
    };
    setActiveTransfer(newTransfer);

    // Simulate Network Upload
    let progress = 0;
    const interval = setInterval(async () => {
      progress += 5;
      setActiveTransfer(prev => prev ? { ...prev, progress: Math.min(progress, 99) } : null);

      if (progress >= 100) {
        clearInterval(interval);
        
        try {
          // Convert to Base64 to store in LocalStorage (Simulation)
          const base64Data = await fileToBase64(file);
          
          const metadata: StoredFileMetadata = {
            id: transferId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            shareCode: shareCode,
            uploadedAt: Date.now(),
            expiresAt: Date.now() + (6 * 60 * 60 * 1000), // 6 Hours
            data: base64Data
          };

          // Save to "Mock Database"
          const raw = localStorage.getItem(STORAGE_KEY);
          const db: StoredFileMetadata[] = raw ? JSON.parse(raw) : [];
          db.push(metadata);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(db));

          setActiveTransfer(prev => prev ? { ...prev, status: 'completed', progress: 100 } : null);
        } catch (error) {
          console.error("Upload failed", error);
          setActiveTransfer(prev => prev ? { ...prev, status: 'error' } : null);
          alert("Storage full! Please clear browser data or use smaller files.");
        }
      }
    }, 50);
  }, []);

  const resetSend = () => {
    setActiveTransfer(null);
  };

  // --- RECEIVE LOGIC ---
  const retrieveFile = (code: string): StoredFileMetadata | null => {
    cleanupStorage(); // Ensure we don't return old files
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    
    const db: StoredFileMetadata[] = JSON.parse(raw);
    const file = db.find(f => f.shareCode === code);
    
    return file || null;
  };

  const completeDownload = (code: string) => {
    // Delete after successful download (One-time use)
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        const db: StoredFileMetadata[] = JSON.parse(raw);
        const newDb = db.filter(f => f.shareCode !== code);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newDb));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8">
      
      {/* Header */}
      <header className="w-full max-w-xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-2.5 rounded-xl">
            <Wifi size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MeowDrop</h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Secure Transfer</p>
          </div>
        </div>
        <CatToggle theme={theme} toggleTheme={toggleTheme} />
      </header>

      {/* Mode Switcher */}
      <div className="w-full max-w-xl bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex mb-8">
        <button
            onClick={() => { setMode('send'); setActiveTransfer(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                ${mode === 'send' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
        >
            <Upload size={16} />
            Send File
        </button>
        <button
            onClick={() => { setMode('receive'); setActiveTransfer(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                ${mode === 'receive' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
        >
            <DownloadIcon size={16} />
            Receive File
        </button>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-xl flex-1 flex flex-col items-center">
        <AnimatePresence mode="wait">
            {mode === 'send' ? (
                <motion.div 
                    key="send"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-full"
                >
                    {!activeTransfer ? (
                         <div className="space-y-6">
                            <div className="text-center space-y-2 mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Upload & Share</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Upload a file to generate a one-time secure code.
                                </p>
                            </div>
                            <DropZone onFilesSelected={handleFileSelect} />
                         </div>
                    ) : activeTransfer.status === 'completed' ? (
                        <div className="flex justify-center">
                            <ShareDisplay file={activeTransfer} onDone={resetSend} />
                        </div>
                    ) : (
                        // Loading State
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-cat-accent animate-spin" />
                            <p className="text-gray-500 font-medium">Encrypting & Uploading...</p>
                        </div>
                    )}
                </motion.div>
            ) : (
                <motion.div 
                    key="receive"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full"
                >
                    <ReceiveInterface 
                        onRetrieve={retrieveFile}
                        onDownloadComplete={completeDownload}
                    />
                </motion.div>
            )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl mt-16 py-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} MeowDrop</p>
        <div className="flex items-center gap-2">
            <span>Encrypted P2P Simulation</span>
            <ArrowRight size={14} />
        </div>
      </footer>

    </div>
  );
}
