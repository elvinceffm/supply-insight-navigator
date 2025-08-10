import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import SupplierMap from "@/components/map/SupplierMap";

const TrustedPartnerDetail = () => {
  const { slug = "partner" } = useParams();
  const name = slug.replace(/-/g, " ");

  const title = `${name} – Trusted Partner | Open Supply Risk Explorer`;
  const description = `Overview and supply network of trusted partner ${name}.`;

  return (
    <main className="container py-10">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${window.location.origin}/trusted-partners/${slug}`} />
      </Helmet>

      <nav className="text-sm text-muted-foreground mb-2">
        <Link to="/">Home</Link> / <Link to="/trusted-partners">Trusted Partners</Link> / <span className="capitalize">{name}</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold capitalize">{name}</h1>
        <p className="text-muted-foreground mt-2">Showcasing a resilient, European supply chain. Placeholder content for case study and tiers.</p>
      </header>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-lg overflow-hidden border">
          <div className="aspect-video w-full bg-black/70 relative">
            <video className="absolute inset-0 w-full h-full object-cover opacity-80" src="/videos/flag-placeholder.mp4" controls />
          </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold">Case Study (Placeholder)</h2>
            <p className="text-sm text-muted-foreground mt-1">We will add a rich narrative on how the partner built a resilient supply chain, with photos or video embeds.</p>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Supply Network (T1–T3)</h2>
          <p className="text-sm text-muted-foreground mb-3">Placeholder tiers and connected map. Real data to be integrated later.</p>
          <SupplierMap suppliers={[]} wrapperClassName="w-full h-64 rounded-md overflow-hidden border" showMarkers={false} />
        </div>
      </section>
    </main>
  );
};

export default TrustedPartnerDetail;
