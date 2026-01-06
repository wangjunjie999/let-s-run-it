import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Move, Maximize2 } from 'lucide-react';

export interface ROIRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DraggableROIProps {
  roi: ROIRect;
  onChange: (roi: ROIRect) => void;
  label: string;
  color: string;
  disabled?: boolean;
  minSize?: number;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export function DraggableROI({ 
  roi, 
  onChange, 
  label, 
  color, 
  disabled = false,
  minSize = 5 
}: DraggableROIProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialROI, setInitialROI] = useState<ROIRect>(roi);

  const getPercentageFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const parent = containerRef.current.parentElement;
    if (!parent) return { x: 0, y: 0 };
    
    const rect = parent.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    
    const pos = getPercentageFromEvent(e);
    setDragStart(pos);
    setInitialROI(roi);
    setIsDragging(true);
  }, [disabled, getPercentageFromEvent, roi]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    
    const pos = getPercentageFromEvent(e);
    setDragStart(pos);
    setInitialROI(roi);
    setResizeHandle(handle);
    setIsResizing(true);
  }, [disabled, getPercentageFromEvent, roi]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const pos = getPercentageFromEvent(e);
    const deltaX = pos.x - dragStart.x;
    const deltaY = pos.y - dragStart.y;
    
    if (isDragging) {
      // Move the entire ROI
      let newX = initialROI.x + deltaX;
      let newY = initialROI.y + deltaY;
      
      // Constrain to bounds
      newX = Math.max(0, Math.min(100 - initialROI.width, newX));
      newY = Math.max(0, Math.min(100 - initialROI.height, newY));
      
      onChange({
        ...initialROI,
        x: newX,
        y: newY,
      });
    } else if (isResizing && resizeHandle) {
      let newROI = { ...initialROI };
      
      switch (resizeHandle) {
        case 'nw':
          newROI.x = Math.min(initialROI.x + deltaX, initialROI.x + initialROI.width - minSize);
          newROI.y = Math.min(initialROI.y + deltaY, initialROI.y + initialROI.height - minSize);
          newROI.width = initialROI.width - (newROI.x - initialROI.x);
          newROI.height = initialROI.height - (newROI.y - initialROI.y);
          break;
        case 'n':
          newROI.y = Math.min(initialROI.y + deltaY, initialROI.y + initialROI.height - minSize);
          newROI.height = initialROI.height - (newROI.y - initialROI.y);
          break;
        case 'ne':
          newROI.y = Math.min(initialROI.y + deltaY, initialROI.y + initialROI.height - minSize);
          newROI.width = Math.max(minSize, initialROI.width + deltaX);
          newROI.height = initialROI.height - (newROI.y - initialROI.y);
          break;
        case 'e':
          newROI.width = Math.max(minSize, initialROI.width + deltaX);
          break;
        case 'se':
          newROI.width = Math.max(minSize, initialROI.width + deltaX);
          newROI.height = Math.max(minSize, initialROI.height + deltaY);
          break;
        case 's':
          newROI.height = Math.max(minSize, initialROI.height + deltaY);
          break;
        case 'sw':
          newROI.x = Math.min(initialROI.x + deltaX, initialROI.x + initialROI.width - minSize);
          newROI.width = initialROI.width - (newROI.x - initialROI.x);
          newROI.height = Math.max(minSize, initialROI.height + deltaY);
          break;
        case 'w':
          newROI.x = Math.min(initialROI.x + deltaX, initialROI.x + initialROI.width - minSize);
          newROI.width = initialROI.width - (newROI.x - initialROI.x);
          break;
      }
      
      // Constrain to bounds
      newROI.x = Math.max(0, newROI.x);
      newROI.y = Math.max(0, newROI.y);
      newROI.width = Math.min(100 - newROI.x, newROI.width);
      newROI.height = Math.min(100 - newROI.y, newROI.height);
      
      onChange(newROI);
    }
  }, [isDragging, isResizing, resizeHandle, dragStart, initialROI, onChange, getPercentageFromEvent, minSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleStyle = "absolute w-3 h-3 bg-background border-2 rounded-sm transition-colors hover:bg-primary";
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute border-2 transition-all select-none",
        disabled ? "cursor-default" : "cursor-move",
        (isDragging || isResizing) && "z-50"
      )}
      style={{
        left: `${roi.x}%`,
        top: `${roi.y}%`,
        width: `${roi.width}%`,
        height: `${roi.height}%`,
        borderColor: color,
        backgroundColor: `${color}20`,
        borderStyle: disabled ? 'dashed' : 'solid',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Label */}
      <div 
        className="absolute -top-6 left-0 text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1"
        style={{ backgroundColor: color, color: 'white' }}
      >
        {!disabled && <Move className="h-3 w-3" />}
        {label}
        <span className="opacity-70 ml-1">
          ({Math.round(roi.width)}% × {Math.round(roi.height)}%)
        </span>
      </div>

      {/* Resize handles - only show when not disabled */}
      {!disabled && (
        <>
          {/* Corners */}
          <div
            className={cn(handleStyle, "cursor-nw-resize -top-1.5 -left-1.5")}
            style={{ borderColor: color }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div
            className={cn(handleStyle, "cursor-ne-resize -top-1.5 -right-1.5")}
            style={{ borderColor: color }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div
            className={cn(handleStyle, "cursor-se-resize -bottom-1.5 -right-1.5")}
            style={{ borderColor: color }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          <div
            className={cn(handleStyle, "cursor-sw-resize -bottom-1.5 -left-1.5")}
            style={{ borderColor: color }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          
          {/* Edges */}
          <div
            className={cn(handleStyle, "cursor-n-resize -top-1.5 left-1/2 -translate-x-1/2")}
            style={{ borderColor: color }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
          />
          <div
            className={cn(handleStyle, "cursor-e-resize -right-1.5 top-1/2 -translate-y-1/2")}
            style={{ borderColor: color }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
          <div
            className={cn(handleStyle, "cursor-s-resize -bottom-1.5 left-1/2 -translate-x-1/2")}
            style={{ borderColor: color }}
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          <div
            className={cn(handleStyle, "cursor-w-resize -left-1.5 top-1/2 -translate-y-1/2")}
            style={{ borderColor: color }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          />
        </>
      )}

      {/* Center indicator */}
      {!disabled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
          <Maximize2 className="h-6 w-6" style={{ color }} />
        </div>
      )}
    </div>
  );
}
