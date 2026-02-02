import React, { useState } from 'react';
import { Download, Search, AlertCircle, FileCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoredFileMetadata } from '../types';
import { formatBytes } from '../utils';

interface ReceiveInterfaceProps {
  onRetrieve: (code: string) => StoredFileMetadata | null;
  onDownloadComplete: (code: string) => void;
}

export const ReceiveInterface: React.FC<ReceiveInterfaceProps> = ({ onRetrieve, onDownloadComplete }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [foundFile, setFoundFile] = useState<StoredFileMetadata | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFoundFile(null);

    if (code.length < 6) {
      setError("Please enter a valid 7-character code (e.g., 123-ABC)");
      return;
    }

    const result = onRetrieve(code.toUpperCase());
    if (result) {
      setFoundFile(result);
    } else {
      setError("File not found, expired, or already downloaded.");
    }
  };

  const handleDownload = () => {
    if (!foundFile) return;
    
    setIsDownloading(true);
    
    // Simulate download delay
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = foundFile.data;
        link.download = foundFile.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsDownloading(false);
        onDownloadComplete(foundFile.shareCode);
        setFoundFile(null);
        setCode('');
        alert("File downloaded and removed from server.");
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Receive File</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter the unique code provided by the sender.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter Code (e.g. 123-ABC)"
          className="w-full px-6 py-4 text-center text-2xl tracking-widest font-mono rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-cat-accent focus:ring-4 focus:ring-cat-accent/20 outline-none transition-all uppercase placeholder:text-gray-300 dark:placeholder:text-gray-600"
          maxLength={7}
        />
        <button
          type="submit"
          className="absolute right-3 top-3 p-2 bg-cat-accent hover:bg-cat-dark text-white rounded-xl transition-colors"
          disabled={!code}
        >
          <Search size={20} />
        </button>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {foundFile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-cat-accent/30 space-y-4"
          >
            <div className="flex items-start gap-4">
                <div className="p-3 bg-cat-light dark:bg-cat-dark rounded-xl text-cat-accent">
                    <FileCheck size={32} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 break-all">
                        {foundFile.fileName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatBytes(foundFile.fileSize)}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-orange-500">
                        <Clock size={12} />
                        <span>Auto-deletes after download</span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {isDownloading ? 'Downloading...' : 'Download File'}
                {!isDownloading && <Download size={18} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
