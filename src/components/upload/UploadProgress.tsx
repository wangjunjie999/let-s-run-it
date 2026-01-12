/**
 * Upload Progress Component
 * Displays upload progress with animations
 */
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, Upload, FileImage } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface UploadItem {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: UploadStatus;
  error?: string;
  preview?: string;
}

interface UploadProgressProps {
  items: UploadItem[];
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  compact?: boolean;
}

export function UploadProgress({ items, onRemove, onRetry, compact = false }: UploadProgressProps) {
  if (items.length === 0) return null;

  if (compact) {
    const uploading = items.filter(i => i.status === 'uploading');
    const completed = items.filter(i => i.status === 'success').length;
    const total = items.length;

    if (uploading.length === 0 && completed === total) return null;

    const avgProgress = uploading.length > 0
      ? uploading.reduce((sum, i) => sum + i.progress, 0) / uploading.length
      : 100;

    return (
      <div className="flex items-center gap-2 text-sm">
        {uploading.length > 0 && (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-muted-foreground">
              上传中 {completed}/{total}
            </span>
            <Progress value={avgProgress} className="w-20 h-1.5" />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {items.map(item => (
          <UploadProgressItem
            key={item.id}
            item={item}
            onRemove={onRemove}
            onRetry={onRetry}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface UploadProgressItemProps {
  item: UploadItem;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
}

function UploadProgressItem({ item, onRemove, onRetry }: UploadProgressItemProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (item.status === 'success') {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        onRemove?.(item.id);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [item.status, item.id, onRemove]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusIcon = {
    pending: <Upload className="h-4 w-4 text-muted-foreground" />,
    uploading: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    error: <XCircle className="h-4 w-4 text-destructive" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card',
        item.status === 'success' && 'border-green-500/30 bg-green-500/5',
        item.status === 'error' && 'border-destructive/30 bg-destructive/5'
      )}
    >
      {/* Preview or Icon */}
      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
        {item.preview ? (
          <img src={item.preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <FileImage className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{item.fileName}</p>
          {statusIcon[item.status]}
        </div>
        
        {item.status === 'uploading' && (
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={item.progress} className="flex-1 h-1.5" />
            <span className="text-xs text-muted-foreground w-10 text-right">
              {Math.round(item.progress)}%
            </span>
          </div>
        )}

        {item.status === 'success' && (
          <p className="text-xs text-green-600 mt-0.5">上传成功</p>
        )}

        {item.status === 'error' && (
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-destructive truncate">{item.error || '上传失败'}</p>
            {onRetry && (
              <button
                onClick={() => onRetry(item.id)}
                className="text-xs text-primary hover:underline"
              >
                重试
              </button>
            )}
          </div>
        )}

        {(item.status === 'pending' || item.status === 'uploading') && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatSize(item.fileSize)}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Hook for managing upload progress
export function useUploadProgress() {
  const [items, setItems] = useState<UploadItem[]>([]);

  const addItem = (file: File, preview?: string): string => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setItems(prev => [...prev, {
      id,
      fileName: file.name,
      fileSize: file.size,
      progress: 0,
      status: 'pending',
      preview,
    }]);
    return id;
  };

  const updateProgress = (id: string, progress: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, progress, status: 'uploading' } : item
    ));
  };

  const setSuccess = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, progress: 100, status: 'success' } : item
    ));
  };

  const setError = (id: string, error: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'error', error } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setItems(prev => prev.filter(item => 
      item.status !== 'success' && item.status !== 'error'
    ));
  };

  const clearAll = () => {
    setItems([]);
  };

  return {
    items,
    addItem,
    updateProgress,
    setSuccess,
    setError,
    removeItem,
    clearCompleted,
    clearAll,
  };
}
