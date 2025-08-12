import { useEffect, useRef } from "react";

interface HeroGraphProps {
  hover?: { x: number; y: number; active: boolean } | null;
  className?: string;
}

// Subtle animated graph overlay rendered on a canvas.
// Uses currentColor for strokes/fills so it adapts to theme and can be tuned via Tailwind (e.g., text-primary/30)
export default function HeroGraph({ hover, className }: HeroGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hoverState = useRef<HeroGraphProps["hover"]>(null);

  // Keep latest hover without re-initializing the canvas loop
  useEffect(() => {
    hoverState.current = hover ?? null;
  }, [hover]);

  useEffect(() => {
    const container = containerRef.current!;
    const canvas = canvasRef.current!;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      canvas.width = Math.max(1, Math.floor(width * DPR));
      canvas.height = Math.max(1, Math.floor(height * DPR));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // Nodes and simple physics
    const NODE_COUNT = 26; // modest, subtle
    const MAX_SPEED = 0.25;
    const LINK_DIST = 140; // px

    type Node = { x: number; y: number; vx: number; vy: number };
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * MAX_SPEED,
      vy: (Math.random() - 0.5) * MAX_SPEED,
    }));

    let raf = 0;

    const draw = () => {
      const color = getComputedStyle(canvas).color; // currentColor
      ctx.clearRect(0, 0, width, height);

      // Links
      ctx.lineWidth = 1;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.22; // subtle lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            const alpha = 1 - d / LINK_DIST;
            ctx.globalAlpha = 0.12 + alpha * 0.18; // 0.12-0.3
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = color;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    const step = () => {
      const hs = hoverState.current;
      const hoverActive = !!hs?.active;
      const hx = hs?.x ?? 0;
      const hy = hs?.y ?? 0;

      for (const n of nodes) {
        // Gentle wander
        n.x += n.vx;
        n.y += n.vy;

        // Soft bounds
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Hover influence: mild attraction and slight speed-up
        if (hoverActive) {
          const dx = hx - n.x;
          const dy = hy - n.y;
          const d = Math.hypot(dx, dy) || 1;
          const force = Math.min(0.012, 20 / (d * d)); // very subtle
          n.vx += (dx / d) * force;
          n.vy += (dy / d) * force;

          // Cap speed
          const sp = Math.hypot(n.vx, n.vy);
          const max = MAX_SPEED * 1.8;
          if (sp > max) {
            n.vx = (n.vx / sp) * max;
            n.vy = (n.vy / sp) * max;
          }
        }
      }

      draw();
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={className} aria-hidden>
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
    </div>
  );
}
