import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      const p = Math.min(1, Math.max(0, y / h));
      setFade(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <main className="relative bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>

      {/* Sticky video hero that fades as you scroll */}
      <section className="sticky top-0 h-[100vh] -z-10">
        <div className="absolute inset-0">
          <video
            className="h-full w-full object-cover"
            src="/videos/flag-placeholder.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          {/* Darkening overlay for readability */}
          <div className="absolute inset-0 bg-background/50" />
          {/* Fade-to-background layer driven by scroll */}
          <div className="absolute inset-0 bg-background" style={{ opacity: fade }} />
        </div>
      </section>

      {/* Foreground content over the hero */}
      <section className="relative">
        {/* Top search bar */}
        <div className="container pt-24">
          <form ref={formRef} onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <Input name="brand" placeholder="Search a brand (e.g. Samsung)" className="h-12 text-base" />
            <Button type="submit" variant="hero" size="xl">Search</Button>
          </form>
        </div>

        {/* Headline and subtext centered */}
        <div className="container text-center pt-16 pb-20">
          <h1 className="font-brand text-4xl md:text-6xl font-bold tracking-tight">
            Open Supply Risk Explorer
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Search any brand’s public supplier list from OSH, view risk scores, explore a world heat map, and export the data.
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            Or browse our <Link to="/trusted-partners" className="text-primary underline underline-offset-4">Trusted Partners</Link>
          </div>
        </div>

        {/* Explanatory sections */}
        <div className="container pb-24 space-y-12">
          <section className="grid md:grid-cols-3 gap-6">
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
                <Button variant="outline">Open white paper</Button>
              </a>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
};

export default Index;
