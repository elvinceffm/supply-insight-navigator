import { useEffect, useRef, type CSSProperties } from "react";

interface HeroGraphProps {
  className?: string;
  style?: CSSProperties;
  fadeOpacity?: number; // Add fade opacity prop
}

// Interactive supply chain graph overlay
// Modern, subtle network visualization that responds to mouse interaction
export default function HeroGraph({ className, style, fadeOpacity = 1 }: HeroGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  type Hover = { x: number; y: number; active: boolean } | null;
  const hoverState = useRef<Hover>(null);
  const nodesRef = useRef<Node[] | null>(null); // Store nodes in ref to persist across renders

  type Node = { x: number; y: number; vx: number; vy: number; size: number; originalX: number; originalY: number };

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

    // Enhanced network with better stability and modern aesthetics
    const NODE_COUNT = 150;
    const MAX_SPEED = 0.15; // Increased for more lively movement
    const LINK_DIST = 120;
    const MIN_NODE_DISTANCE = 50;
    const REVEAL_RADIUS = 250; // Much larger cursor influence
    const BASE_LINE_ALPHA = 0.65; // Brighter lines
    const BASE_NODE_ALPHA = 0.85; // Much brighter and more opaque nodes
    const TOP_MARGIN_PERCENT = 0.12; // Reserve top 12% for navigation

    // Initialize nodes only once or when dimensions change significantly
    if (!nodesRef.current || Math.abs(nodesRef.current.length - NODE_COUNT) > 0) {
      const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => {
        const x = Math.random() * width;
        const y = TOP_MARGIN_PERCENT * height + Math.random() * (height * (1 - TOP_MARGIN_PERCENT)); // Keep out of top area
        return {
          x,
          y,
          vx: (Math.random() - 0.5) * MAX_SPEED * 0.8, // More initial movement for liveliness
          vy: (Math.random() - 0.5) * MAX_SPEED * 0.8,
          size: 0.6 + Math.random() * 0.4, // Moderate node size increase
          originalX: x,
          originalY: y,
        };
      });
      nodesRef.current = nodes;
    }

    const nodes = nodesRef.current;

    let raf = 0;

    // Mouse tracking for interactivity
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      hoverState.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true
      };
    };

    const handleMouseLeave = () => {
      hoverState.current = { x: 0, y: 0, active: false };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const draw = (hs: { x: number; y: number; active: boolean } | null) => {
      ctx.clearRect(0, 0, width, height);

      // More subtle modern aesthetic
      const baseColor = '#9CA3AF'; // Slightly more muted gray
      const activeColor = '#D1D5DB'; // Softer highlight
      
      const influence = (d: number) => {
        const r = REVEAL_RADIUS;
        // Same steep falloff but larger radius for better cursor influence
        return Math.exp(-(d * d) / (2 * r * r * 0.3));
      };

      // Draw connections
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            let alpha = BASE_LINE_ALPHA * (1 - d / LINK_DIST);
            let color = baseColor;
            
            if (hs?.active) {
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              const md = Math.hypot((hs.x ?? 0) - mx, (hs.y ?? 0) - my);
              const inf = influence(md);
              alpha += 0.08 * inf; // Even more subtle highlight to prevent propagation
              if (inf > 0.7) { // Much higher threshold
                color = activeColor;
                ctx.lineWidth = 0.7;
              }
            }
            
            ctx.globalAlpha = Math.max(0, Math.min(0.6, alpha * fadeOpacity)); // Apply fade to lines
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.lineWidth = 0.6; // Reset
          }
        }
      }

      // Draw nodes - more subtle highlighting
      for (const n of nodes) {
        let alpha = BASE_NODE_ALPHA;
        let radius = 1.5 * n.size; // Slightly bigger nodes
        let color = baseColor;
        
        if (hs?.active) {
          const nd = Math.hypot((hs.x ?? 0) - n.x, (hs.y ?? 0) - n.y);
          const inf = influence(nd);
          alpha += 0.12 * inf; // Subtle node highlight
          radius += 0.6 * inf; // Less dramatic growth
          if (inf > 0.7) { // High threshold to prevent widespread highlighting
            color = activeColor;
          }
        }
        
        ctx.globalAlpha = Math.max(0, Math.min(0.95, alpha * fadeOpacity)); // Higher max opacity for nodes
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Very subtle glow - only for very close nodes
        if (hs?.active) {
          const nd = Math.hypot((hs.x ?? 0) - n.x, (hs.y ?? 0) - n.y);
          const inf = influence(nd);
          if (inf > 0.8) { // Extremely high threshold
            ctx.globalAlpha = Math.max(0, Math.min(0.12, inf * 0.15 * fadeOpacity)); // Apply fade to glow
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius + 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.globalAlpha = 1;
    };

    const step = () => {
      const hs = hoverState.current;
      const hoverActive = !!hs?.active;
      const hx = hs?.x ?? 0;
      const hy = hs?.y ?? 0;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        
        // Apply movement
        n.x += n.vx;
        n.y += n.vy;

        // Boundary restoration with top margin enforcement
        const margin = 5;
        const topMargin = TOP_MARGIN_PERCENT * height;
        
        if (n.x < margin) {
          n.x = margin;
          n.vx = Math.abs(n.vx) * 0.3;
        }
        if (n.x > width - margin) {
          n.x = width - margin;
          n.vx = -Math.abs(n.vx) * 0.3;
        }
        if (n.y < topMargin) { // Enforce top margin
          n.y = topMargin;
          n.vy = Math.abs(n.vy) * 0.3;
        }
        if (n.y > height - margin) {
          n.y = height - margin;
          n.vy = -Math.abs(n.vy) * 0.3;
        }

        // Prevent node clustering - repulsion force
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = n.x - other.x;
          const dy = n.y - other.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < MIN_NODE_DISTANCE && dist > 0) {
            const force = (MIN_NODE_DISTANCE - dist) / MIN_NODE_DISTANCE * 0.005;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            n.vx += fx;
            n.vy += fy;
            other.vx -= fx;
            other.vy -= fy;
          }
        }

        // Gentle restoration to original position (anchoring) - reduced for more movement
        const returnForce = 0.0015; // Reduced from 0.002 for more drift
        const dx = n.originalX - n.x;
        const dy = n.originalY - n.y;
        n.vx += dx * returnForce;
        n.vy += dy * returnForce;

        // Add constant subtle drift for liveliness when not interacting
        if (!hoverActive) {
          // Add gentle perlin-like movement
          const time = Date.now() * 0.001;
          const driftForceX = Math.sin(time * 0.5 + i * 0.1) * 0.0008;
          const driftForceY = Math.cos(time * 0.3 + i * 0.07) * 0.0008;
          n.vx += driftForceX;
          n.vy += driftForceY;
        }

        // Interactive behavior - more responsive
        if (hoverActive) {
          const dx = hx - n.x;
          const dy = hy - n.y; // Fixed: use normal Y direction
          const dist = Math.hypot(dx, dy) || 1;
          
          if (dist < REVEAL_RADIUS) {
            // More responsive attraction
            const force = Math.min(0.008, 20 / (dist * dist)); // Increased force
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
          }
        }

        // Less damping for more lively movement
        n.vx *= 0.995; // Slightly increased damping to prevent chaos with drift
        n.vy *= 0.995;

        // Speed limiting
        const speed = Math.hypot(n.vx, n.vy);
        if (speed > MAX_SPEED) {
          n.vx = (n.vx / speed) * MAX_SPEED;
          n.vy = (n.vy / speed) * MAX_SPEED;
        }
      }

      draw(hs || null);
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [fadeOpacity]); // Add fadeOpacity as dependency

  return (
    <div ref={containerRef} className={className} style={style} aria-hidden>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
