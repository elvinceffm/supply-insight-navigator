import { useRef } from "react";
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

  return (
    <main className="min-h-screen relative bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>

      <section
        className="container pt-28 pb-20 md:pt-32 md:pb-28 text-center relative"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--mouse-x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--mouse-y", `${y}%`);
        }}
      >
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(500px_250px_at_var(--mouse-x,50%)_var(--mouse-y,20%),#000,transparent_60%)]" style={{ background: "var(--gradient-hero)" as any }} />

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Open Supply Risk Explorer
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Search any brand’s public supplier list from OSH, view risk scores with a traffic light system, explore on a world map, and export the data.
        </p>

        <form ref={formRef} onSubmit={onSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <Input name="brand" placeholder="Search a brand (e.g. Samsung)" className="h-12 text-base" />
          <Button type="submit" variant="hero" size="xl">Search</Button>
        </form>

        <div className="mt-6 text-sm text-muted-foreground">
          Or browse our <Link to="/trusted-partners" className="text-primary underline underline-offset-4">Trusted Partners</Link>
        </div>
      </section>
    </main>
  );
};

export default Index;
