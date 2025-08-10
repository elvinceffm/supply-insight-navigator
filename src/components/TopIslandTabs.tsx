import { Link, useLocation } from "react-router-dom";

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

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <nav
        aria-label="Primary"
        className="relative flex items-center gap-1 rounded-full border bg-background/80 backdrop-blur px-1 py-1 shadow-sm"
      >
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-1/3 rounded-full bg-muted transition-transform"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {tabs.map((t, i) => (
          <Link
            key={t.href}
            to={t.href}
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
