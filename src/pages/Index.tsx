import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HeroGraph from "@/components/HeroGraph";
import { ScanLine } from "lucide-react";
const Index = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(formRef.current || undefined);
    const brand = String(data.get("brand") || "").trim();
    if (!brand) return;
    const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    navigate(`/brand/${slug}`);
  };

  const title = "Open Supply Risk Explorer – Brand Supplier Risks";
  const description = "Search a brand to view supplier risk scores, heat maps, and exportable lists.";

  const [fade, setFade] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const h = window.innerHeight || 1;
      // Ultra-aggressive exponential curve: starts immediately, reaches near-max very quickly
      const p = Math.min(1, Math.max(0, y / (h * 0.4))); // Trigger at 40% of viewport scroll
      const exponentialFade = Math.pow(p, 0.25); // Extremely aggressive curve
      setFade(exponentialFade);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hover handled internally by HeroGraph

  return (
    <main className="relative bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>

      {/* Hero section with video background and overlayed content */}
      <section className="relative h-[130vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/videos/ukraine_poster.jpg"
          >
            <source src="/videos/vilna_ukraina_2_st.mp4" type="video/mp4" />
            {/* Optional: add a WebM fallback if available */}
            {/* <source src="/videos/vilna_ukraina_2_st.webm" type="video/webm" /> */}
          </video>
          {/* Ultra-aggressive immediate fade gradient */}
          <div
            className="absolute left-0 right-0 bottom-0 h-[45vh]"
            style={{
              opacity: fade, // Direct fade value, no additional manipulation
              background: `linear-gradient(to bottom,
                hsl(var(--background) / 0) 0%,
                hsl(var(--background) / 0.08) 5%,
                hsl(var(--background) / 0.15) 10%,
                hsl(var(--background) / 0.25) 15%,
                hsl(var(--background) / 0.35) 20%,
                hsl(var(--background) / 0.45) 25%,
                hsl(var(--background) / 0.55) 30%,
                hsl(var(--background) / 0.65) 35%,
                hsl(var(--background) / 0.72) 40%,
                hsl(var(--background) / 0.78) 45%,
                hsl(var(--background) / 0.83) 50%,
                hsl(var(--background) / 0.87) 55%,
                hsl(var(--background) / 0.90) 60%,
                hsl(var(--background) / 0.93) 65%,
                hsl(var(--background) / 0.95) 70%,
                hsl(var(--background) / 0.97) 75%,
                hsl(var(--background) / 0.98) 80%,
                hsl(var(--background) / 0.99) 85%,
                hsl(var(--background) / 0.995) 90%,
                hsl(var(--background) / 0.998) 95%,
                hsl(var(--background) / 1) 100%)`,
            }}
          />
        </div>
        
        {/* Graph background that covers only the initial hero view */}
        <HeroGraph
          className="absolute top-0 left-0 right-0 z-5"
          style={{ 
            height: '100vh', // Only cover initial viewport, not the full 130vh
            opacity: 0.6
          }}
          fadeOpacity={1 - fade} // Fade out as user scrolls (inverse of hero fade)
        />
        
        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-4">
          <div className="relative mx-auto max-w-2xl w-full">
            <h1 className="font-brand text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
              Open Supply Risk Explorer
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 mx-auto drop-shadow">
              Search any brand's public supplier list from OSH, view risk scores, explore a world heat map, and export the data.
            </p>
            <form ref={formRef} onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl w-full mt-8 mx-auto">
              <div className="relative w-full">
                <Input name="brand" placeholder="Search a brand (e.g. Samsung)" className="h-12 text-base pr-12" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Scan barcode (coming soon)"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary hover:bg-primary/1"
                >
                  <ScanLine className="size-5" />
                </Button>
              </div>
              <Button type="submit" variant="hero" size="xl">Search</Button>
            </form>
            <div className="mt-6 text-sm text-white/80">
              Or browse our <Link to="/trusted-partners" className="text-primary underline underline-offset-4">Trusted Partners</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explanatory sections below the hero */}
      <section className="container pb-40 space-y-16 pt-20">
        <div className="grid md:grid-cols-3 gap-6">
          <article className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold">What is this?</h2>
            <p className="mt-2 text-muted-foreground">An open explorer to assess supply risk using public OSH supplier lists and aggregated indicators.</p>
          </article>
          <article className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold">How it works</h2>
            <p className="mt-2 text-muted-foreground">We compute a composite score per supplier and color countries by average risk. Export lists in one click.</p>
          </article>
          <article className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold">White paper</h2>
            <p className="mt-2 text-muted-foreground">Read the methodology and roadmap in our white paper.</p>
            <a href="https://example.com/whitepaper" target="_blank" rel="noreferrer" className="inline-block mt-3">
              {/* TODO: might change to blue as well later */}
              <Button variant="outline">Open white paper</Button>
            </a>
          </article>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <article className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
              <li>Brand search with instant navigation</li>
              <li>Supplier risk scoring and heat maps</li>
              <li>Export supplier lists</li>
              <li>Trusted partners showcase</li>
            </ul>
          </article>
          <article className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold">Data sources</h3>
            <p className="mt-2 text-muted-foreground">We derive insights from public OSH supplier lists and augment with open risk indicators. More sources will be documented in the white paper.</p>
          </article>
        </div>
        <article className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">About this project</h3>
          <p className="mt-2 text-muted-foreground">This section intentionally contains more content to emphasize the smooth scrolling transition from the hero. Replace these paragraphs with your own copy describing goals, methodology, and use cases.</p>
          <p className="mt-2 text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent at mi pulvinar, dictum arcu vitae, fringilla lacus. In hac habitasse platea dictumst. Integer posuere neque id justo pretium, at venenatis risus pretium. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.</p>
          <p className="mt-2 text-muted-foreground">Suspendisse potenti. Mauris luctus, libero sit amet tincidunt venenatis, lorem arcu gravida lorem, non mattis diam orci at dui. Aliquam erat volutpat. Donec at erat vitae neque pulvinar luctus vel a lacus.</p>
        </article>
  </section>
    </main>
  );
};

export default Index;
