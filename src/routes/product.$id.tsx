import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BadgeCheck, Hand, PackageCheck, Star, Truck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice, categories, stockLabel } from "@/lib/products";
import type { Product, Review } from "@/lib/products";
import {
  productDetailQueryOptions,
  productsQueryOptions,
  submitReview,
} from "@/lib/catalog.functions";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";

const SITE = "https://neo-resin.lovable.app";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params, context }) => {
    const detail = await context.queryClient.ensureQueryData(productDetailQueryOptions(params.id));
    if (!detail) throw notFound();
    void context.queryClient.ensureQueryData(productsQueryOptions());
    return detail;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "محصول یافت نشد | نئو رزین" }, { name: "robots", content: "noindex" }],
      };
    }
    const p = loaderData.product;
    const url = `${SITE}/product/${p.id}`;
    const image = p.image.startsWith("http") ? p.image : `${SITE}${p.image}`;
    const title = `${p.name} | نئو رزین`;
    const reviews = loaderData.reviews;
    const avg = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;
    return {
      meta: [
        { title },
        { name: "description", content: p.description },
        { property: "og:title", content: title },
        { property: "og:description", content: p.description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: p.description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: p.longDescription,
            image: [image],
            url,
            material: p.material ?? undefined,
            weight: p.weightGrams ? { "@type": "QuantitativeValue", value: p.weightGrams, unitCode: "GRM" } : undefined,
            brand: { "@type": "Brand", name: "Neo_resin" },
            ...(avg
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: Number(avg.toFixed(1)),
                    reviewCount: reviews.length,
                  },
                }
              : {}),
            offers: {
              "@type": "Offer",
              price: p.price,
              priceCurrency: "IRR",
              availability:
                p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url,
            },
          }),
        },
      ],
    };
  },
  component: ProductPage,
  errorComponent: () => (
    <div className="section-y mx-auto max-w-3xl px-5 text-center text-sm text-muted-foreground">
      خطا در بارگذاری محصول. لطفاً دوباره تلاش کنید.
    </div>
  ),
  notFoundComponent: () => (
    <div className="section-y mx-auto max-w-3xl px-5 text-center">
      <p className="text-sm text-muted-foreground">این محصول پیدا نشد.</p>
      <Link
        to="/shop"
        search={{}}
        className="mt-6 inline-block rounded-sm bg-gold-gradient px-7 py-3.5 text-sm font-bold text-primary-foreground"
      >
        بازگشت به فروشگاه
      </Link>
    </div>
  ),
});

const trustItems = [
  { icon: BadgeCheck, title: "ضمانت کیفیت ساخت", text: "بررسی نهایی هر قطعه پیش از ارسال" },
  { icon: Hand, title: "ساخت دست‌ساز", text: "ریخته‌گری و پرداخت کاملاً دستی" },
  { icon: PackageCheck, title: "بسته‌بندی امن", text: "فوم و جعبه چندلایه ضدضربه" },
  { icon: Truck, title: "ارسال به سراسر کشور", text: "پست پیشتاز و تیپاکس" },
];

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`امتیاز ${value} از ۵`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-4 ${i <= Math.round(value) ? "fill-gold text-gold" : "text-muted-foreground/40"}`}
        />
      ))}
    </span>
  );
}

function ProductPage() {
  const { id } = Route.useParams();
  const { data: detail } = useSuspenseQuery(productDetailQueryOptions(id));
  const { data: allProducts } = useSuspenseQuery(productsQueryOptions());
  const { add } = useCart();
  const [active, setActive] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(1);
  const [qty, setQty] = useState(1);

  const product = detail!.product as Product;
  const reviews = detail!.reviews as Review[];

  const gallery = product.gallery.length ? product.gallery : [product.image];
  const sizes = product.sizes;
  const size = sizes[sizeIdx] ?? sizes[0];
  const unitPrice = Math.round(product.price * (size?.multiplier ?? 1));
  const category = categories.find((c) => c.slug === product.category);
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const inStock = product.stock > 0;
  const maxQty = Math.min(20, Math.max(1, product.stock));
  const dimension = size ? product.dimensions[size.label] : undefined;
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const specs: { label: string; value: string }[] = [
    ...(dimension ? [{ label: "ابعاد", value: `${dimension} سانتی‌متر` }] : []),
    ...(product.weightGrams ? [{ label: "وزن", value: `${product.weightGrams} گرم` }] : []),
    ...(product.material ? [{ label: "جنس", value: product.material }] : []),
    ...(product.prepDays ? [{ label: "زمان آماده‌سازی", value: `${product.prepDays} روز کاری` }] : []),
    { label: "دسته‌بندی", value: category?.title ?? "—" },
  ];

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
            {!inStock ? (
              <span className="absolute right-4 top-4 rounded-sm bg-background/85 px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                ناموجود
              </span>
            ) : null}
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
            <div className="flex flex-wrap items-center gap-4">
              <span
                className={`text-xs font-bold ${inStock ? "text-gold" : "text-muted-foreground"}`}
              >
                {stockLabel(product.stock)}
              </span>
              {reviews.length ? (
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Stars value={avg} />
                  {avg.toFixed(1)} از ۵ ({reviews.length} نظر)
                </span>
              ) : null}
            </div>
            <p className="text-sm leading-8 text-muted-foreground">{product.longDescription}</p>
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
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="px-2 text-lg text-muted-foreground hover:text-gold"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!inStock}
              onClick={() => {
                add(product.id, qty, size?.label);
                toast.success("به سبد خرید اضافه شد", {
                  description: `${product.name}${size ? ` — سایز ${size.label}` : ""} × ${qty}`,
                });
              }}
              className="rounded-sm bg-gold-gradient px-6 py-3 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {inStock ? "افزودن به سبد خرید" : "ناموجود"}
            </button>
            <Link
              to="/cart"
              className="rounded-sm hairline px-6 py-3 text-xs font-bold text-muted-foreground transition-colors hover:text-gold"
            >
              مشاهده سبد
            </Link>
          </div>

          {specs.length ? (
            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-sm hairline bg-border/40 sm:grid-cols-2">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-3 bg-card/60 px-4 py-3">
                  <dt className="text-xs text-muted-foreground">{s.label}</dt>
                  <dd className="text-xs font-bold text-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {product.features.length ? (
            <ul className="space-y-2 border-t border-border/60 pt-6 text-xs leading-7 text-muted-foreground">
              {product.features.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="text-gold">◆</span>
                  {d}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* Trust */}
      <div className="mt-20 grid gap-px overflow-hidden rounded-sm hairline bg-border/40 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((t) => (
          <div key={t.title} className="bg-card/60 p-6">
            <t.icon className="size-5 text-gold" />
            <p className="mt-3 text-sm font-bold text-foreground">{t.title}</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">{t.text}</p>
          </div>
        ))}
      </div>

      <ReviewsSection slug={product.id} reviews={reviews} avg={avg} />

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

function ReviewsSection({
  slug,
  reviews,
  avg,
}: {
  slug: string;
  reviews: Review[];
  avg: number;
}) {
  const queryClient = useQueryClient();
  const send = useServerFn(submitReview);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);

  const mutation = useMutation({
    mutationFn: (input: { slug: string; authorName: string; rating: number; body: string }) =>
      send({ data: input }),
    onSuccess: () => {
      setAuthorName("");
      setBody("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["product", slug] });
      toast.success("نظر شما ثبت شد", {
        description: "پس از تأیید در همین صفحه نمایش داده می‌شود.",
      });
    },
    onError: (e: Error) => toast.error(e.message || "ثبت نظر ناموفق بود."),
  });

  return (
    <div className="mt-24">
      <SectionHeading eyebrow="Reviews" title="نظرات مشتریان" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="rounded-sm hairline p-8 text-center text-xs text-muted-foreground">
              هنوز نظری برای این محصول ثبت نشده است. اولین نفر باشید.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-sm hairline p-4">
                <span className="text-2xl font-bold text-gold">{avg.toFixed(1)}</span>
                <Stars value={avg} />
                <span className="text-xs text-muted-foreground">از {reviews.length} نظر</span>
              </div>
              {reviews.map((r) => (
                <article key={r.id} className="rounded-sm hairline p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <p className="truncate text-sm font-bold text-foreground">{r.authorName}</p>
                    <Stars value={r.rating} className="shrink-0" />
                  </div>
                  <p className="mt-3 text-xs leading-7 text-muted-foreground">{r.body}</p>
                  <p className="mt-3 text-[11px] text-muted-foreground/70">
                    {new Intl.DateTimeFormat("fa-IR").format(new Date(r.createdAt))}
                  </p>
                </article>
              ))}
            </>
          )}
        </div>

        <form
          className="h-fit space-y-4 rounded-sm hairline p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (authorName.trim().length < 2) {
              toast.error("نام باید حداقل ۲ حرف باشد.");
              return;
            }
            if (body.trim().length < 5) {
              toast.error("متن نظر خیلی کوتاه است.");
              return;
            }
            mutation.mutate({ slug, authorName: authorName.trim(), rating, body: body.trim() });
          }}
        >
          <p className="text-sm font-bold text-foreground">ثبت نظر</p>
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={60}
            placeholder="نام شما"
            className="w-full rounded-sm hairline bg-transparent px-4 py-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-gold"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">امتیاز:</span>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`امتیاز ${i}`}
                onClick={() => setRating(i)}
                className="p-0.5"
              >
                <Star
                  className={`size-5 ${i <= rating ? "fill-gold text-gold" : "text-muted-foreground/40"}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="تجربه خود را از این اثر بنویسید…"
            className="w-full rounded-sm hairline bg-transparent px-4 py-3 text-xs leading-7 text-foreground outline-none focus:ring-1 focus:ring-gold"
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-sm bg-gold-gradient px-6 py-3 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? "در حال ارسال…" : "ارسال نظر"}
          </button>
          <p className="text-[11px] leading-6 text-muted-foreground">
            نظر شما پس از تأیید در این صفحه نمایش داده می‌شود.
          </p>
        </form>
      </div>
    </div>
  );
}
