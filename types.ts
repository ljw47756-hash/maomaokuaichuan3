export interface TransferFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  timestamp: number;
  shareCode?: string;
  expiresAt?: number;
}

export interface StoredFileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  shareCode: string;
  uploadedAt: number;
  expiresAt: number;
  data: string; // Base64 string for demo purposes
}

export type Theme = 'light' | 'dark';
export type AppMode = 'send' | 'receive';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
