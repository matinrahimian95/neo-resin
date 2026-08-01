import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { formatPrice, getProduct, products, categories } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "محصول یافت نشد | نئو رزین" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} | نئو رزین` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.name} | نئو رزین` },
        { property: "og:description", content: p.description },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [active, setActive] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(1);
  const [qty, setQty] = useState(1);

  const gallery = product.gallery ?? [product.image];
  const sizes = product.sizes ?? [];
  const size = sizes[sizeIdx] ?? sizes[0];
  const unitPrice = Math.round(product.price * (size?.multiplier ?? 1));
  const category = categories.find((c) => c.slug === product.category);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <section className="section-y mx-auto max-w-7xl px-5 md:px-8">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">خانه</Link>
        <span>/</span>
        <Link to="/shop" search={{}} className="hover:text-gold">فروشگاه</Link>
        {category ? (
          <>
            <span>/</span>
            <Link to="/shop" search={{ category: category.slug }} className="hover:text-gold">
              {category.title}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-sm hairline">
            <img
              src={gallery[active]}
              alt={`${product.name} — تصویر ${active + 1}`}
              width={1200}
              height={1400}
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 veil opacity-50" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {gallery.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`نمایش تصویر ${i + 1}`}
                className={`overflow-hidden rounded-sm transition-opacity ${
                  i === active ? "ring-1 ring-gold" : "hairline opacity-70 hover:opacity-100"
                }`}
              >
                <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-7">
          <div className="space-y-3">
            <p className="text-[11px] tracking-[0.3em] text-gold">{category?.title}</p>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
            <p className="text-sm leading-8 text-muted-foreground">{product.description}</p>
          </div>

          <p className="text-2xl font-bold text-gold">{formatPrice(unitPrice * qty)}</p>

          {sizes.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-bold text-foreground">انتخاب سایز</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setSizeIdx(i)}
                    className={`rounded-sm px-4 py-2 text-xs font-bold transition-colors ${
                      i === sizeIdx
                        ? "bg-gold-gradient text-primary-foreground"
                        : "hairline text-muted-foreground hover:text-gold"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="text-xs font-bold text-foreground">تعداد</p>
            <div className="inline-flex items-center gap-4 rounded-sm hairline px-3 py-2">
              <button
                type="button"
                aria-label="کاهش تعداد"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-2 text-lg text-muted-foreground hover:text-gold"
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm font-bold text-foreground">{qty}</span>
              <button
                type="button"
                aria-label="افزایش تعداد"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                className="px-2 text-lg text-muted-foreground hover:text-gold"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                add(product.id, qty);
                toast.success("به سبد خرید اضافه شد", {
                  description: `${product.name}${size ? ` — سایز ${size.label}` : ""} × ${qty}`,
                });
              }}
              className="rounded-sm bg-gold-gradient px-6 py-3 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              افزودن به سبد خرید
            </button>
            <Link
              to="/cart"
              className="rounded-sm hairline px-6 py-3 text-xs font-bold text-muted-foreground transition-colors hover:text-gold"
            >
              مشاهده سبد
            </Link>
          </div>

          {product.details?.length ? (
            <ul className="space-y-2 border-t border-border/60 pt-6 text-xs leading-7 text-muted-foreground">
              {product.details.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="text-gold">◆</span>
                  {d}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <div className="mt-24">
          <SectionHeading eyebrow="More" title="آثار مشابه" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/product/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/product/$id"!</div>
}
