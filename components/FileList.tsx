import React from 'react';
import { File as FileIcon, Trash2, CheckCircle2, Loader2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransferFile } from '../types';
import { formatBytes } from '../utils';

interface FileListProps {
  files: TransferFile[];
  onDelete: (id: string) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onDelete }) => {
  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-3 mt-8">
        <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Active Transfers ({files.length})
            </h3>
        </div>
      <AnimatePresence mode="popLayout">
        {files.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
            className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 group"
          >
            {/* Progress Background */}
            <div 
                className="absolute bottom-0 left-0 h-1 bg-cat-accent/20 dark:bg-cat-accent/40 w-full"
            >
                <motion.div 
                    className="h-full bg-cat-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${file.progress}%` }}
                />
            </div>

            <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
              <FileIcon size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate pr-4">
                    {file.file.name}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {formatBytes(file.file.size)}
                </span>
              </div>
              <div className="flex items-center mt-1 gap-2">
                <span className={`text-xs font-medium ${
                    file.status === 'completed' ? 'text-green-500' : 
                    file.status === 'error' ? 'text-red-500' : 'text-blue-500'
                }`}>
                    {file.status === 'completed' ? 'Ready' : file.status === 'uploading' ? `${Math.round(file.progress)}%` : 'Waiting'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
                {file.status === 'completed' && (
                    <button 
                        onClick={() => {
                             const url = URL.createObjectURL(file.file);
                             const a = document.createElement('a');
                             a.href = url;
                             a.download = file.file.name;
                             a.click();
                             URL.revokeObjectURL(url);
                        }}
                        className="p-2 text-gray-400 hover:text-cat-accent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title="Download Individual"
                    >
                        <Download size={18} />
                    </button>
                )}
                
                {file.status === 'uploading' ? (
                    <Loader2 size={18} className="animate-spin text-cat-accent" />
                ) : file.status === 'completed' ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                ) : null}

                <button
                    onClick={() => onDelete(file.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    title="Delete File"
                >
                    <Trash2 size={18} />
                </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
