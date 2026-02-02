export interface TransferFile {
  id: string;
  file: File;
  progress: number; // 0 to 100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  timestamp: number;
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
