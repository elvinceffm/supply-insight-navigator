import { Helmet } from "react-helmet-async";
import { trustedPartners } from "@/data/trustedPartners";

const TrustedPartners = () => {
  const title = "Trusted Partners – Open Supply Risk Explorer";
  const description = "Curated list of vetted suppliers by category and country.";

  return (
    <main className="container py-10">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${window.location.origin}/trusted-partners`} />
      </Helmet>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Trusted Partners</h1>
        <p className="text-muted-foreground mt-2">Pre-vetted, safe suppliers. Maintained manually for this POC.</p>
      </header>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3">Supplier</th>
              <th className="p-3">Country</th>
              <th className="p-3">Category</th>
              <th className="p-3">Contact</th>
            </tr>
          </thead>
          <tbody>
            {trustedPartners.map((p) => (
              <tr key={`${p.name}-${p.country}`} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.country}</td>
                <td className="p-3">{p.productCategory}</td>
                <td className="p-3">
                  {p.contactUrl ? (
                    <a href={p.contactUrl} className="text-primary underline underline-offset-4">Contact</a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default TrustedPartners;
