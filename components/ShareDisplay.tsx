import React from 'react';
import { Copy, Check, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { TransferFile } from '../types';

interface ShareDisplayProps {
  file: TransferFile;
  onDone: () => void;
}

export const ShareDisplay: React.FC<ShareDisplayProps> = ({ file, onDone }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (file.shareCode) {
      navigator.clipboard.writeText(file.shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-cat-accent p-6 text-center space-y-6 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cat-light via-cat-accent to-cat-dark" />
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
            Share this code
        </h3>
        <div 
            onClick={handleCopy}
            className="group relative cursor-pointer bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-6 hover:border-cat-accent dark:hover:border-cat-accent transition-colors"
        >
            <span className="text-4xl font-mono font-bold text-gray-800 dark:text-white tracking-wider">
                {file.shareCode}
            </span>
            <div className="absolute top-2 right-2 text-gray-400 group-hover:text-cat-accent">
                {copied ? <Check size={16} /> : <Copy size={16} />}
            </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 pt-2">
            Click code to copy
        </p>
      </div>

      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-left">
        <div className="flex items-start gap-3">
            <Clock className="text-orange-500 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Expires in 6 hours
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-300">
                    For security, this file will be automatically deleted after the first download or when the timer expires.
                </p>
            </div>
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
      >
        Upload Another
      </button>
    </motion.div>
  );
};
