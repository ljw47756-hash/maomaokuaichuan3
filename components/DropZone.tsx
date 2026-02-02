import React, { useCallback, useState } from 'react';
import { UploadCloud, FileUp } from 'lucide-react';
import { cn } from '../utils';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  }, [onFilesSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
        isDragging
          ? "border-cat-accent bg-cat-light/50 dark:bg-cat-dark/30 scale-[1.01]"
          : "border-gray-300 dark:border-gray-700 hover:border-cat-accent/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      )}
    >
      <input
        type="file"
        multiple
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center text-center p-6 space-y-4">
        <div className={cn(
            "p-4 rounded-full transition-all duration-300",
            isDragging ? "bg-cat-accent text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-cat-accent group-hover:scale-110"
        )}>
          {isDragging ? <FileUp size={32} /> : <UploadCloud size={32} />}
        </div>
        
        <div className="space-y-1">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
            {isDragging ? "Drop files now!" : "Click or drag files here"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Support for files up to 10GB
          </p>
        </div>
      </div>
    </div>
  );
};
