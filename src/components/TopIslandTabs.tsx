import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const tabs = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Trusted Partners", href: "/trusted-partners" },
];

export default function TopIslandTabs() {
  const { pathname } = useLocation();
  const activeIndex = pathname.startsWith("/trusted-partners")
    ? 2
    : pathname.startsWith("/blog")
    ? 1
    : 0;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const el = tabRefs.current[activeIndex];
      if (!container || !el) return;
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      setIndicator({
        left: eRect.left - cRect.left,
        width: eRect.width,
      });
    };

    const raf = requestAnimationFrame(update);

    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    tabRefs.current.forEach((el) => el && ro.observe(el));
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [activeIndex]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <nav
        aria-label="Primary"
        ref={containerRef}
        className="relative flex items-center gap-1 rounded-full border bg-background/80 backdrop-blur px-1 py-1 shadow-sm"
      >
        <span
          aria-hidden
          className="absolute inset-y-1 rounded-full bg-muted transition-all duration-300"
          style={{ left: indicator.left, width: indicator.width }}
        />
        {tabs.map((t, i) => (
          <Link
            key={t.href}
            to={t.href}
            ref={(el) => (tabRefs.current[i] = el)}
            className={`relative z-10 px-4 py-2 text-sm rounded-full transition-colors ${
              activeIndex === i ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
