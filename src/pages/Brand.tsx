import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { getBrandSuppliers } from "@/data/mockSuppliers";
import { computeRiskScore, colorClass, riskColor, type Supplier } from "@/lib/risk";
import { exportSuppliersCsv } from "@/lib/export";
import { RadialScore } from "@/components/ui/radial-score";
import SupplierMap from "@/components/map/SupplierMap";
const Brand = () => {
  const { slug = "brand" } = useParams();
  const navigate = useNavigate();
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const suppliers = useMemo(() => getBrandSuppliers(slug), [slug]);

  const filtered = useMemo(() => {
    return suppliers
      .filter((s) => (countryFilter === "all" ? true : s.country === countryFilter))
      .filter((s) => (query ? s.name.toLowerCase().includes(query.toLowerCase()) : true))
      .map((s) => ({ ...s, score: computeRiskScore(s) }))
      .sort((a, b) => b.score - a.score);
  }, [suppliers, countryFilter, query]);

  const countries = useMemo(
    () => Array.from(new Set(suppliers.map((s) => s.country))).sort(),
    [suppliers]
  );

  const title = `${slug.replace(/-/g, " ")} – Supplier Risk | Open Supply Risk Explorer`;
  const description = `Risk-scored suppliers for ${slug.replace(/-/g, " ")}. Download lists and view heat map.`;
  const aggregate = useMemo(() => aggregateScore(suppliers), [suppliers]);
  const bands = useMemo(() => summaryByBand(suppliers), [suppliers]);
  
  return (
    <main className="container py-10">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${window.location.origin}/brand/${slug}`} />
      </Helmet>

      <header className="mb-8">
        <nav className="text-sm text-muted-foreground mb-2">
          <Link to="/">Home</Link> / <span className="capitalize">{slug}</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold capitalize">
          {slug.replace(/-/g, " ")}
        </h1>
        <p className="text-muted-foreground mt-2">Based on OSH Public Lists (POC dataset)</p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Risk Heat Map Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <SupplierMap suppliers={suppliers} wrapperClassName="w-full h-64 rounded-lg overflow-hidden border border-border" />
            <Link to={`/brand/${slug}/map`} className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-full bg-background/80 backdrop-blur px-3 py-1.5 text-sm border hover-scale">
              Expand map
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Country colors reflect averaged supplier risk per country. Click to open the full interactive map.</p>
        </CardContent>
      </Card>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search suppliers"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select value={countryFilter} onValueChange={(v) => setCountryFilter(v)}>
                <SelectTrigger className="w-full md:w-56">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => exportSuppliersCsv(`${slug}-suppliers`, suppliers)}>
                Export CSV
              </Button>
              <Button variant="hero" onClick={() => navigate(`/brand/${slug}/map`)}>
                Open Heat Map
              </Button>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-left">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">OS ID</th>
                    <th className="p-3">Country</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3 text-muted-foreground">{s.os_id}</td>
                      <td className="p-3">{s.country}</td>
                      <td className="p-3 text-muted-foreground">{s.contributor}</td>
                      <td className="p-3">
                        <RadialScore
                          value={(s as any).score}
                          tooltipMetrics={[
                            { label: "Democracy index", value: s.indicators?.countryGovernance },
                            { label: "Regime hostility", value: s.indicators?.sectorCompliance },
                            { label: "Import dependency (strategic goods)", value: undefined },
                            { label: "Human rights/repressions", value: s.indicators?.laborRights },
                            { label: "ESG", value: s.indicators?.environmental },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Holistic Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Combined score based on governance, labor, environment, and sector compliance.
            </p>

            <div className="mb-4 rounded-md border bg-muted/30 p-4">
              <div className="flex items-center gap-4">
                <TrafficLight level={riskColor(aggregate)} />
                <div>
                  <p className="text-sm font-medium">Aggregated risk score</p>
                  <p className="text-sm text-muted-foreground">
                    Score {aggregate}/100. Distribution: Low {bands[0].value}%, Medium {bands[1].value}%, High {bands[2].value}%.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {bands.map((r) => (
                <Band key={r.label} label={r.label} value={r.value} color={r.color} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

function summaryByBand(suppliers: Supplier[]) {
  const scored = suppliers.map((s) => computeRiskScore(s));
  const total = scored.length || 1;
  const green = Math.round((scored.filter((n) => n >= 70).length / total) * 100);
  const yellow = Math.round((scored.filter((n) => n >= 40 && n < 70).length / total) * 100);
  const red = Math.round((scored.filter((n) => n < 40).length / total) * 100);
  return [
    { label: "Low risk", value: green, color: "bg-emerald-500" },
    { label: "Medium risk", value: yellow, color: "bg-amber-500" },
    { label: "High risk", value: red, color: "bg-rose-500" },
  ];
}

function aggregateScore(suppliers: Supplier[]): number {
  if (!suppliers.length) return 0;
  const scored = suppliers.map((s) => computeRiskScore(s));
  const avg = scored.reduce((a, b) => a + b, 0) / scored.length;
  return Math.round(avg);
}

function TrafficLight({ level }: { level: "green" | "yellow" | "red" }) {
  const base = "h-3 w-3 rounded-full ring-1 ring-border transition-all";
  return (
    <div className="flex items-center gap-1.5" aria-label={`Risk level: ${level}`} role="img">
      <span className={`${base} ${level === "red" ? "bg-rose-500 shadow-sm" : "bg-muted opacity-60"}`} />
      <span className={`${base} ${level === "yellow" ? "bg-amber-500 shadow-sm" : "bg-muted opacity-60"}`} />
      <span className={`${base} ${level === "green" ? "bg-emerald-500 shadow-sm" : "bg-muted opacity-60"}`} />
    </div>
  );
}

function Band({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default Brand;
