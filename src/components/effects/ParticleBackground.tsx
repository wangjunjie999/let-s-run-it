import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
}

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  interactive?: boolean;
  className?: string;
}

export function ParticleBackground({ 
  particleCount = 300, 
  interactive = true,
  className = ''
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const trailRef = useRef<TrailPoint[]>([]);
  const animationRef = useRef<number>();

  const createParticles = useCallback((width: number, height: number, count: number): Particle[] => {
    const particles: Particle[] = [];
    const cols = Math.ceil(Math.sqrt(count * (width / height)));
    const rows = Math.ceil(count / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * cellWidth + cellWidth / 2 + (Math.random() - 0.5) * cellWidth * 0.8;
      const y = row * cellHeight + cellHeight / 2 + (Math.random() - 0.5) * cellHeight * 0.8;
      
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
    return particles;
  }, []);

  const drawTrail = useCallback((ctx: CanvasRenderingContext2D) => {
    const trail = trailRef.current;
    if (trail.length < 2) return;

    const isDark = document.documentElement.classList.contains('dark');
    
    for (let i = 1; i < trail.length; i++) {
      const point = trail[i];
      const prevPoint = trail[i - 1];
      const alpha = Math.max(0, 1 - point.age / 30) * 0.8;
      
      if (alpha <= 0) continue;

      const gradient = ctx.createLinearGradient(prevPoint.x, prevPoint.y, point.x, point.y);
      const baseColor = isDark ? '100, 180, 255' : '60, 140, 220';
      gradient.addColorStop(0, `rgba(${baseColor}, ${alpha * 0.3})`);
      gradient.addColorStop(1, `rgba(${baseColor}, ${alpha})`);

      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3 * alpha + 1;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow effect
      ctx.shadowColor = isDark ? 'rgba(100, 180, 255, 0.8)' : 'rgba(60, 140, 220, 0.6)';
      ctx.shadowBlur = 10 * alpha;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw glow at current mouse position
    if (mouseRef.current.active && trail.length > 0) {
      const lastPoint = trail[trail.length - 1];
      const glowGradient = ctx.createRadialGradient(
        lastPoint.x, lastPoint.y, 0,
        lastPoint.x, lastPoint.y, 40
      );
      const glowColor = isDark ? '100, 180, 255' : '60, 140, 220';
      glowGradient.addColorStop(0, `rgba(${glowColor}, 0.4)`);
      glowGradient.addColorStop(0.5, `rgba(${glowColor}, 0.1)`);
      glowGradient.addColorStop(1, `rgba(${glowColor}, 0)`);
      
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 40, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();
    }
  }, []);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    const isDark = document.documentElement.classList.contains('dark');
    const baseColor = isDark ? '100, 180, 255' : '60, 140, 220';
    
    // Calculate distance from mouse for glow intensity
    const dx = particle.x - mouseRef.current.x;
    const dy = particle.y - mouseRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 150;
    const glowIntensity = mouseRef.current.active ? Math.max(0, 1 - distance / maxDistance) : 0;
    
    const finalOpacity = particle.opacity + glowIntensity * 0.5;
    
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${baseColor}, ${finalOpacity})`;
    ctx.fill();
    
    // Add glow when near mouse
    if (glowIntensity > 0) {
      ctx.shadowColor = isDark ? 'rgba(100, 180, 255, 0.9)' : 'rgba(60, 140, 220, 0.7)';
      ctx.shadowBlur = 8 * glowIntensity;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, []);

  const updateParticle = useCallback((particle: Particle) => {
    if (!interactive || !mouseRef.current.active) {
      // Return to base position when mouse is not active
      const dx = particle.baseX - particle.x;
      const dy = particle.baseY - particle.y;
      particle.x += dx * 0.05;
      particle.y += dy * 0.05;
      return;
    }

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const dx = particle.x - mx;
    const dy = particle.y - my;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 120;

    if (distance < maxDistance) {
      // Push particles away from mouse
      const force = (1 - distance / maxDistance) * 30;
      const angle = Math.atan2(dy, dx);
      const targetX = particle.baseX + Math.cos(angle) * force;
      const targetY = particle.baseY + Math.sin(angle) * force;
      
      particle.x += (targetX - particle.x) * 0.2;
      particle.y += (targetY - particle.y) * 0.2;
    } else {
      // Return to base position
      const returnDx = particle.baseX - particle.x;
      const returnDy = particle.baseY - particle.y;
      particle.x += returnDx * 0.05;
      particle.y += returnDy * 0.05;
    }
  }, [interactive]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current.forEach(particle => {
      updateParticle(particle);
      drawParticle(ctx, particle);
    });

    // Update trail ages and remove old points
    trailRef.current = trailRef.current
      .map(point => ({ ...point, age: point.age + 1 }))
      .filter(point => point.age < 30);

    // Draw trail
    drawTrail(ctx);

    // Draw connections between nearby particles when mouse is near
    if (mouseRef.current.active) {
      const isDark = document.documentElement.classList.contains('dark');
      const connectionColor = isDark ? '100, 180, 255' : '60, 140, 220';
      
      particlesRef.current.forEach((p1, i) => {
        const d1 = Math.sqrt(
          Math.pow(p1.x - mouseRef.current.x, 2) + 
          Math.pow(p1.y - mouseRef.current.y, 2)
        );
        
        if (d1 < 150) {
          particlesRef.current.slice(i + 1).forEach(p2 => {
            const d2 = Math.sqrt(
              Math.pow(p2.x - mouseRef.current.x, 2) + 
              Math.pow(p2.y - mouseRef.current.y, 2)
            );
            
            if (d2 < 150) {
              const particleDistance = Math.sqrt(
                Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
              );
              
              if (particleDistance < 80) {
                const alpha = (1 - particleDistance / 80) * 0.3;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(${connectionColor}, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            }
          });
        }
      });
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticle, drawParticle, drawTrail]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      // Reinitialize particles on resize
      particlesRef.current = createParticles(canvas.width, canvas.height, particleCount);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [particleCount, createParticles]);

  useEffect(() => {
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseRef.current = { x, y, active: true };
    
    // Add point to trail
    trailRef.current.push({ x, y, age: 0 });
    
    // Limit trail length
    if (trailRef.current.length > 50) {
      trailRef.current.shift();
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000, active: false };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ zIndex: 0 }}
    />
  );
}
