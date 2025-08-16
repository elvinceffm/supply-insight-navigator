import { Button } from "@/components/ui/button";
import { Instagram, HeartHandshake, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const getInitialDark = () => {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
};

export default function TopRightActions() {
  const [dark, setDark] = useState<boolean>(getInitialDark());

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-1 rounded-full border bg-background/80 backdrop-blur px-1 py-1 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Instagram (placeholder)"
          className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
          asChild
        >
          <a href="#" tabIndex={0} onClick={(e) => e.preventDefault()}>
            <Instagram className="size-5" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Donate (placeholder)"
          className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
          asChild
        >
          <a href="#" tabIndex={0} onClick={(e) => e.preventDefault()}>
            <HeartHandshake className="size-5" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
          onClick={() => setDark((v) => !v)}
        >
          {dark ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </Button>
      </div>
    </div>
  );
}

// TODO: Implement alternative access to buttons for smaller devices (burger menu), as TopRightActions tend to clog up top space
