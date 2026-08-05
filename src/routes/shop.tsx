import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProductCard } from "@/components/site/ProductCard";
import { categories } from "@/lib/products";
import { productsQueryOptions } from "@/lib/catalog.functions";

const searchSchema = z.object({
  category: z.enum(["trays", "clocks", "jewelry", "accessories", "custom"]).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(productsQueryOptions());
  },
  head: () => ({
    meta: [
      { title: "فروشگاه | آثار رزین دست‌ساز نئو رزین" },
      {
        name: "description",
        content: "خرید سینی، ساعت، زیورآلات و اکسسوری رزین دست‌ساز با طراحی سیاه و طلایی.",
      },
      { property: "og:title", content: "فروشگاه | آثار رزین دست‌ساز نئو رزین" },
      { property: "og:description", content: "مجموعه کامل آثار رزین دست‌ساز نئو رزین." },
    ],
  }),
  component: ShopPage,
  errorComponent: () => (
    <div className="section-y mx-auto max-w-3xl px-5 text-center text-sm text-muted-foreground">
      خطا در بارگذاری محصولات. لطفاً صفحه را دوباره بارگذاری کنید.
    </div>
  ),
  notFoundComponent: () => (
    <div className="section-y mx-auto max-w-3xl px-5 text-center text-sm text-muted-foreground">
      محصولی یافت نشد.
    </div>
  ),
});

function ShopPage() {
  const { category } = Route.useSearch();
  const { data: products } = useSuspenseQuery(productsQueryOptions());
  const list = category ? products.filter((p) => p.category === category) : products;

  return (
    <section className="section-y mx-auto max-w-7xl px-5 md:px-8">
      <SectionHeading
        eyebrow="Shop"
        title="مجموعه آثار"
        description="هر قطعه دست‌ساز و یکتاست؛ الگوی طلایی هرگز تکرار نمی‌شود."
      />

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        <Link
          to="/shop"
          search={{}}
          className={`rounded-sm px-4 py-2 text-xs font-bold transition-colors ${
            !category
              ? "bg-gold-gradient text-primary-foreground"
              : "hairline text-muted-foreground hover:text-gold"
          }`}
        >
          همه
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            to="/shop"
            search={{ category: c.slug }}
            className={`rounded-sm px-4 py-2 text-xs font-bold transition-colors ${
              category === c.slug
                ? "bg-gold-gradient text-primary-foreground"
                : "hairline text-muted-foreground hover:text-gold"
            }`}
          >
            {c.title}
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}