import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { trustedPartners } from "@/data/trustedPartners";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const TrustedPartners = () => {
  const title = "Trusted Partners – Open Supply Risk Explorer";
  const description = "Explore our partners by sector with rich previews and brand highlights.";

  const sectors = useMemo(() => {
    const set = new Set<string>(["All"]);
    trustedPartners.forEach((p) => set.add(p.productCategory));
    return Array.from(set);
  }, []);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");

  const filtered = useMemo(() => {
    return trustedPartners.filter((p) => {
      const sectorOk = active === "All" || p.productCategory === active;
      const q = query.trim().toLowerCase();
      const qOk = !q || p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q);
      return sectorOk && qOk;
    });
  }, [active, query]);

  return (
    <main className="container py-10">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${window.location.origin}/trusted-partners`} />
      </Helmet>

      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">Trusted Partners</h1>
        <p className="text-muted-foreground mt-2">Discover our vetted brands by sector. Click any card to view details.</p>
      </header>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <Tabs value={active} onValueChange={(v) => setActive(v)}>
          <TabsList>
            {sectors.map((s) => (
              <TabsTrigger key={s} value={s} className="capitalize">{s}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search partners by name or country"
          className="w-full md:w-80"
        />
      </div>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => (
          <Link key={`${p.name}-${p.country}`} to={`/trusted-partners/${slugify(p.name)}`} className="group">
            <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
              <div className="aspect-[3/2] bg-muted/40 relative">
                <img src="/placeholder.svg" alt={`${p.name} logo`} className="absolute inset-0 h-full w-full object-cover opacity-90" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{p.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground flex items-center justify-between">
                  <span>{p.country}</span>
                  <span className="capitalize">{p.productCategory}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
};

export default TrustedPartners;
