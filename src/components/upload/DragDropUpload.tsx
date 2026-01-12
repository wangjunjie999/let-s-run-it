/**
 * Drag & Drop Upload Component
 * Supports drag-and-drop file upload with visual feedback
 */
import { useState, useRef, useCallback, type ReactNode } from 'react';
import { Upload, FileImage, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface DragDropUploadProps {
  onUpload: (files: File[]) => Promise<void> | void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  showPreview?: boolean;
  compact?: boolean;
}

interface FilePreview {
  file: File;
  preview: string | null;
}

export function DragDropUpload({
  onUpload,
  accept = 'image/*',
  multiple = false,
  maxSize = 10,
  maxFiles = 5,
  disabled = false,
  className,
  children,
  showPreview = true,
  compact = false,
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `文件 "${file.name}" 超过最大大小 ${maxSize}MB`;
    }

    // Check file type if accept is specified
    if (accept && accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', '/'));
        }
        if (type.startsWith('.')) {
          return fileExt === type.toLowerCase();
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `文件类型 "${fileType}" 不被接受`;
      }
    }

    return null;
  }, [accept, maxSize]);

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles: FilePreview[] = [];
    const errors: string[] = [];

    const filesToProcess = Array.from(fileList).slice(0, multiple ? maxFiles : 1);

    for (const file of filesToProcess) {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      // Create preview for images
      let preview: string | null = null;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      newFiles.push({ file, preview });
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError(null);
    }

    if (newFiles.length > 0) {
      if (multiple) {
        setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
      } else {
        // Revoke old preview URLs
        files.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
        setFiles(newFiles);
      }

      // Trigger upload callback
      await onUpload(newFiles.map(f => f.file));
    }
  }, [files, maxFiles, multiple, onUpload, validateFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current++;
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current--;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current = 0;
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      await processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await processFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newFiles;
    });
  }, []);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // Cleanup previews on unmount
  // useEffect(() => {
  //   return () => {
  //     files.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
  //   };
  // }, []);

  if (compact) {
    return (
      <div className={cn('relative', className)}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openFileDialog}
          disabled={disabled}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          选择文件
        </Button>
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
          isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
          disabled && 'opacity-50 cursor-not-allowed',
          'group'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {children || (
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              'p-3 rounded-full transition-colors',
              isDragging ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'
            )}>
              <Upload className={cn(
                'h-6 w-6 transition-colors',
                isDragging ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
              )} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isDragging ? '释放以上传文件' : '拖拽文件到此处或点击选择'}
              </p>
              <p className="text-xs text-muted-foreground">
                支持 {accept.replace(/\*/g, '所有').replace(/,/g, ', ')} • 最大 {maxSize}MB
                {multiple && ` • 最多 ${maxFiles} 个文件`}
              </p>
            </div>
          </div>
        )}

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center pointer-events-none">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
              释放以上传
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* File previews */}
      {showPreview && files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((file, index) => (
            <div
              key={`${file.file.name}-${index}`}
              className="relative group rounded-lg border bg-muted/30 overflow-hidden"
            >
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-muted">
                  {file.file.type.includes('image') ? (
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <File className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs text-white truncate">{file.file.name}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
