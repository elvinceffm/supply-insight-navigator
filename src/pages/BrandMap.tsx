import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SupplierMap from "@/components/map/SupplierMap";
import { getBrandSuppliers } from "@/data/mockSuppliers";

const BrandMap = () => {
  const { slug = "brand" } = useParams();
  const suppliers = useMemo(() => getBrandSuppliers(slug), [slug]);

  const title = `${slug.replace(/-/g, " ")} – Heat Map | Open Supply Risk Explorer`;
  const description = `Interactive supplier heat map for ${slug.replace(/-/g, " ")}.`;

  return (
    <main className="container py-10">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${window.location.origin}/brand/${slug}/map`} />
      </Helmet>

      <header className="mb-6">
        <nav className="text-sm text-muted-foreground mb-2">
          <Link to="/">Home</Link> / <Link to={`/brand/${slug}`} className="capitalize">{slug}</Link> / Map
        </nav>
        <h1 className="text-3xl font-bold">Supplier Heat Map</h1>
        <p className="text-muted-foreground mt-2">Countries are colored by aggregated risk; pins are color-coded by supplier risk.</p>
      </header>

      <SupplierMap suppliers={suppliers} />
    </main>
  );
};

export default BrandMap;
