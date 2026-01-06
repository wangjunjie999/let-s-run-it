import { FileText, MousePointer2 } from 'lucide-react';

export function EmptyFormState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-xs">
        <div className="relative mx-auto mb-6">
          {/* Animated rings */}
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="relative w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm border border-primary/10">
            <FileText className="h-9 w-9 text-primary/70" />
          </div>
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-2">
          选择配置项
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          从左侧项目树中选择一个项目、工位或模块，查看和编辑配置信息
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-xs text-muted-foreground">
          <MousePointer2 className="h-3 w-3" />
          <span>点击左侧节点开始</span>
        </div>
      </div>
    </div>
  );
}
