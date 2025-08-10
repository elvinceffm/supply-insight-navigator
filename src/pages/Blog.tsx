import { Helmet } from "react-helmet-async";

const Blog = () => {
  const title = "Blog – Open Supply Risk Explorer";
  const description = "Insights on resilient, ethical, and transparent supply chains.";

  return (
    <main className="container py-20">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${window.location.origin}/blog`} />
      </Helmet>

      <header className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold">Blog</h1>
        <p className="text-muted-foreground mt-2">Coming soon: articles, case studies, and research updates.</p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map((i) => (
          <article key={i} className="rounded-lg border p-4 bg-muted/30 animate-fade-in">
            <div className="aspect-[16/9] w-full bg-muted rounded-md mb-3" />
            <h2 className="font-semibold">Placeholder post #{i}</h2>
            <p className="text-sm text-muted-foreground mt-1">Short teaser about supply chain risk and transparency.</p>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Blog;
