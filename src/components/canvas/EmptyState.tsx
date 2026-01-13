import { Button } from '@/components/ui/button';
import { Plus, FolderOpen, Sparkles, Zap, Layers } from 'lucide-react';
import { useState } from 'react';
import { NewProjectDialog } from '@/components/dialogs/NewProjectDialog';

export function EmptyState() {
  const [showNewProject, setShowNewProject] = useState(false);

  return (
    <>
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Enhanced background decoration with particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/20"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 3) * 15}%`,
                animation: `float-particle ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
        
        <div className="text-center max-w-lg relative z-10">
          {/* Enhanced animated icon container */}
          <div className="relative mx-auto mb-8 w-32 h-32">
            {/* Outer ring with neon glow */}
            <div 
              className="absolute inset-0 rounded-3xl border-2 border-dashed border-primary/30" 
              style={{ animation: 'spin 20s linear infinite' }} 
            />
            
            {/* Inner glow - enhanced */}
            <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 blur-xl animate-pulse" />
            
            {/* Icon container with neon effect */}
            <div className="absolute inset-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30 animate-neon-pulse">
              <FolderOpen className="h-12 w-12 text-primary-foreground animate-float" />
            </div>
            
            {/* Tech corners */}
            <div className="tech-corner tech-corner-tl" style={{ borderColor: 'hsl(var(--primary) / 0.5)' }} />
            <div className="tech-corner tech-corner-tr" style={{ borderColor: 'hsl(var(--primary) / 0.5)' }} />
            <div className="tech-corner tech-corner-bl" style={{ borderColor: 'hsl(var(--primary) / 0.5)' }} />
            <div className="tech-corner tech-corner-br" style={{ borderColor: 'hsl(var(--primary) / 0.5)' }} />
            
            {/* Floating decorations - enhanced */}
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/30 animate-float" style={{ animationDelay: '0.5s' }}>
              <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-7 h-7 rounded-lg bg-warning flex items-center justify-center shadow-lg shadow-warning/30 animate-float" style={{ animationDelay: '1s' }}>
              <Zap className="h-3.5 w-3.5 text-warning-foreground" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
            欢迎使用视觉方案配置系统
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            在左侧创建或选择一个项目，开始配置工位机械布局和功能模块视觉方案
          </p>
          
          {/* Feature highlights - Enhanced with hover effects */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[
              { icon: Layers, label: '多工位配置' },
              { icon: Zap, label: '智能模块' },
              { icon: Sparkles, label: 'PPT生成' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm hover:border-primary/30 hover:bg-primary/5 hover:shadow-glow transition-all duration-300 cursor-default"
              >
                <feature.icon className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
          
          <Button 
            size="lg" 
            onClick={() => setShowNewProject(true)}
            className="gap-2 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            新建项目
          </Button>
        </div>
      </div>
      <NewProjectDialog open={showNewProject} onOpenChange={setShowNewProject} />
    </>
  );
}
