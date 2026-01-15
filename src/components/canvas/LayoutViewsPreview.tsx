import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { ImageOff, Camera, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutViewsPreviewProps {
  workstationId: string;
  className?: string;
  onOpenCanvas?: () => void;
}

type ViewType = 'front' | 'side' | 'top';

const VIEW_LABELS: Record<ViewType, string> = {
  front: '正视图',
  side: '侧视图',
  top: '俯视图',
};

export function LayoutViewsPreview({ workstationId, className, onOpenCanvas }: LayoutViewsPreviewProps) {
  const { getLayoutByWorkstation, workstations } = useData();
  
  const workstation = workstations.find(ws => ws.id === workstationId);
  const layout = getLayoutByWorkstation(workstationId) as any;
  
  const views: { type: ViewType; url: string | null; saved: boolean }[] = useMemo(() => [
    { 
      type: 'front', 
      url: layout?.front_view_image_url || null, 
      saved: layout?.front_view_saved || false 
    },
    { 
      type: 'side', 
      url: layout?.side_view_image_url || null, 
      saved: layout?.side_view_saved || false 
    },
    { 
      type: 'top', 
      url: layout?.top_view_image_url || null, 
      saved: layout?.top_view_saved || false 
    },
  ], [layout]);
  
  const allViewsSaved = views.every(v => v.saved && v.url);
  const someViewsSaved = views.some(v => v.saved && v.url);
  const noViewsSaved = views.every(v => !v.saved || !v.url);
  
  const wsCode = (workstation as any)?.code || '';
  const wsName = workstation?.name || '';
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">
          {wsCode && `${wsCode} `}{wsName} - 布局三视图 + 运动方式
        </h4>
        {onOpenCanvas && (
          <Button variant="ghost" size="sm" onClick={onOpenCanvas} className="gap-1 text-xs">
            打开画布
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Views Grid */}
      <div className="grid grid-cols-3 gap-3">
        {views.map(view => (
          <div key={view.type} className="space-y-1.5">
            <div className="text-xs text-center text-muted-foreground font-medium">
              {VIEW_LABELS[view.type]}
            </div>
            <div 
              className={cn(
                "aspect-video rounded-lg border-2 border-dashed overflow-hidden flex items-center justify-center",
                view.url 
                  ? "border-primary/30 bg-background" 
                  : "border-muted-foreground/20 bg-muted/30"
              )}
            >
              {view.url ? (
                <img 
                  src={view.url} 
                  alt={VIEW_LABELS[view.type]}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // If image fails to load, show placeholder
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex flex-col items-center gap-1 text-muted-foreground">
                          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                          </svg>
                          <span class="text-xs">加载失败</span>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground p-2">
                  <ImageOff className="h-5 w-5" />
                  <span className="text-xs">未保存</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Motion Description */}
      {(workstation as any)?.motion_description && (
        <div className="mt-3 p-2 rounded-lg bg-muted/50 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">【运动方式】</div>
          <div className="text-sm text-foreground">
            {(workstation as any).motion_description}
          </div>
        </div>
      )}
      
      {/* Status & Hint */}
      {noViewsSaved && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Camera className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            三视图未保存。请在右侧布局画布中点击「保存三视图」按钮来生成截图。
          </p>
        </div>
      )}
      
      {someViewsSaved && !allViewsSaved && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Camera className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-600 dark:text-blue-400">
            部分视图已保存。建议在布局画布中点击「保存三视图」保存所有视角。
          </p>
        </div>
      )}
    </div>
  );
}
