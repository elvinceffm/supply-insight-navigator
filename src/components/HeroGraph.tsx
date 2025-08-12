import { useEffect, useRef, type CSSProperties } from "react";

interface HeroGraphProps {
  className?: string;
  style?: CSSProperties;
}

// Subtle animated graph overlay rendered on a canvas.
// Uses currentColor for strokes/fills so it adapts to theme and can be tuned via Tailwind (e.g., text-primary/30)
export default function HeroGraph({ className, style }: HeroGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  type Hover = { x: number; y: number; active: boolean } | null;
  const hoverState = useRef<Hover>(null);

  // Hover is handled internally via global pointer tracking

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
    const LINK_DIST = 160; // px, slightly wider for surrounding feel

    type Node = { x: number; y: number; vx: number; vy: number };
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * MAX_SPEED,
      vy: (Math.random() - 0.5) * MAX_SPEED,
    }));

    let raf = 0;

    const draw = (hs: { x: number; y: number; active: boolean } | null) => {
      const color = getComputedStyle(canvas).color; // currentColor
      ctx.clearRect(0, 0, width, height);

      const BASE_LINE_ALPHA = 0.04;
      const BASE_NODE_ALPHA = 0.08;
      const REVEAL_RADIUS = 220;
      const influence = (d: number) => {
        const r = REVEAL_RADIUS;
        return Math.exp(-(d * d) / (2 * r * r)); // gaussian falloff
      };

      // Links
      ctx.lineWidth = 1;
      ctx.strokeStyle = color;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            let alpha = BASE_LINE_ALPHA * (1 - d / LINK_DIST);
            if (hs?.active) {
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              const md = Math.hypot((hs.x ?? 0) - mx, (hs.y ?? 0) - my);
              alpha += 0.28 * influence(md);
            }
            ctx.globalAlpha = Math.max(0, Math.min(0.36, alpha));
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      ctx.fillStyle = color;
      for (const n of nodes) {
        let a = BASE_NODE_ALPHA;
        let r = 1.6;
        if (hs?.active) {
          const nd = Math.hypot((hs.x ?? 0) - n.x, (hs.y ?? 0) - n.y);
          const inf = influence(nd);
          a += 0.42 * inf;
          r += 2.0 * inf;
        }
        ctx.globalAlpha = Math.max(0, Math.min(0.8, a));
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
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

        if (hoverActive) {
          const dx = hx - n.x;
          const dy = hy - n.y;
          const d = Math.hypot(dx, dy) || 1;
          // Mild attraction with a tiny perpendicular swirl
          const force = Math.min(0.016, 24 / (d * d));
          n.vx += (dx / d) * force + (-dy / d) * 0.002;
          n.vy += (dy / d) * force + (dx / d) * 0.002;

          // Cap speed
          const sp = Math.hypot(n.vx, n.vy);
          const max = MAX_SPEED * 1.9;
          if (sp > max) {
            n.vx = (n.vx / sp) * max;
            n.vy = (n.vy / sp) * max;
          }
        }
      }

      draw(hs || null);
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={className} style={style} aria-hidden>
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
    </div>
  );
}
