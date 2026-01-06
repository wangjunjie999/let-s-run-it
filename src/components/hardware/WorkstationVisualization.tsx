import { Camera, Focus, Lightbulb, Monitor, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkstationVisualizationProps {
  className?: string;
}

export function WorkstationVisualization({ className }: WorkstationVisualizationProps) {
  return (
    <div className={cn('relative w-full h-full min-h-[400px] canvas-container flex items-center justify-center', className)}>
      {/* Main visualization container */}
      <div className="relative w-[500px] h-[350px]">
        
        {/* Camera + Lens (top center) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <div className="relative">
            {/* Camera body */}
            <div className="w-16 h-12 rounded-lg bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 shadow-lg flex items-center justify-center">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            {/* Camera indicator light */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
          </div>
          {/* Lens */}
          <div className="w-10 h-14 rounded-full bg-gradient-to-b from-slate-600 to-slate-700 border-2 border-slate-500 shadow-lg flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-400 flex items-center justify-center">
              <Focus className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
          {/* Camera mounting arm */}
          <div className="w-1 h-6 bg-slate-600 rounded-full" />
        </div>

        {/* Light source (left side) */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
          {/* Light housing */}
          <div className="w-14 h-24 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-600 shadow-lg flex flex-col items-center justify-center p-2">
            <Lightbulb className="h-8 w-8 text-warning" />
            <div className="mt-2 flex gap-1">
              <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-warning/50" />
            </div>
          </div>
          {/* Light beam effect */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 w-20 h-16 opacity-30">
            <svg viewBox="0 0 80 64" className="w-full h-full">
              <defs>
                <linearGradient id="lightBeam" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="hsl(45, 95%, 50%)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(45, 95%, 50%)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points="0,24 80,8 80,56 0,40" fill="url(#lightBeam)" />
            </svg>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium mt-1">光源</span>
        </div>

        {/* Test part (center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Base platform */}
          <div className="relative">
            <div className="w-40 h-24 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-500 shadow-xl flex items-center justify-center">
              {/* Test part representation */}
              <div className="w-28 h-16 rounded-md bg-gradient-to-br from-cyan-600 to-cyan-700 border border-cyan-500 shadow-inner flex items-center justify-center">
                <Box className="h-8 w-8 text-cyan-200" />
              </div>
            </div>
            {/* Platform legs */}
            <div className="absolute -bottom-4 left-4 w-3 h-4 bg-slate-700 rounded-b" />
            <div className="absolute -bottom-4 right-4 w-3 h-4 bg-slate-700 rounded-b" />
          </div>
          <span className="block text-center text-[10px] text-muted-foreground font-medium mt-6">待测零件</span>
        </div>

        {/* Industrial PC (right side) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
          {/* IPC case */}
          <div className="w-20 h-32 rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border border-slate-600 shadow-xl p-2">
            {/* Front panel */}
            <div className="w-full h-full rounded-lg bg-slate-800 border border-slate-600 flex flex-col items-center justify-between p-2">
              {/* Status LEDs */}
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="w-2 h-2 rounded-full bg-warning/50" />
              </div>
              {/* Display area */}
              <div className="w-12 h-8 rounded bg-slate-900 border border-slate-600 flex items-center justify-center">
                <Monitor className="h-4 w-4 text-primary" />
              </div>
              {/* Vent grills */}
              <div className="w-full space-y-0.5">
                <div className="h-0.5 bg-slate-600 rounded" />
                <div className="h-0.5 bg-slate-600 rounded" />
                <div className="h-0.5 bg-slate-600 rounded" />
              </div>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">工控机</span>
        </div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--primary))" opacity="0.5" />
            </marker>
          </defs>
          
          {/* Camera to part line */}
          <line
            x1="250" y1="100"
            x2="250" y2="140"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="4 2"
            opacity="0.5"
            markerEnd="url(#arrowhead)"
          />
          
          {/* Light to part line */}
          <line
            x1="85" y1="175"
            x2="145" y2="175"
            stroke="hsl(var(--warning))"
            strokeWidth="2"
            strokeDasharray="4 2"
            opacity="0.4"
          />
          
          {/* Part to IPC line */}
          <line
            x1="355" y1="175"
            x2="395" y2="175"
            stroke="hsl(var(--success))"
            strokeWidth="2"
            strokeDasharray="4 2"
            opacity="0.5"
            markerEnd="url(#arrowhead)"
          />
        </svg>

        {/* Labels */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground font-medium">
          相机+镜头
        </div>
      </div>
    </div>
  );
}
