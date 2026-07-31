import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Instagram, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, featuredProducts } from "@/lib/products";
import { faqs } from "@/lib/faqs";
import heroImg from "@/assets/hero.jpg";
import artistImg from "@/assets/artist.jpg";
import textureImg from "@/assets/texture.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "نئو رزین | هنر رزین دست‌ساز" },
      {
        name: "description",
        content:
          "بوتیک آنلاین نئو رزین؛ سینی، ساعت، زیورآلات و اکسسوری رزین دست‌ساز با طراحی لوکس سیاه و طلایی و امکان سفارش اختصاصی.",
      },
      { property: "og:title", content: "نئو رزین | هنر رزین دست‌ساز" },
      {
        property: "og:description",
        content: "بوتیک آنلاین نئو رزین؛ سینی، ساعت، زیورآلات و اکسسوری رزین دست‌ساز با طراحی لوکس سیاه و طلایی و امکان سفارش اختصاصی.",
      },
    ],
  }),
  component: Index,
});

const instagramTiles = [heroImg, textureImg, artistImg, ...categories.map((c) => c.image)].slice(
  0,
  6,
);

function Index() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="سینی رزین دست‌ساز مشکی با رگه‌های طلا"
          width={1600}
          height={1104}
          className="absolute inset-0 -z-10 size-full object-cover opacity-55"
        />
        <div className="absolute inset-0 -z-10 veil" />
        <div className="mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-end px-5 pt-28 pb-16 md:px-8 md:pb-24">
          <p className="mb-5 text-[11px] tracking-[0.4em] text-gold uppercase">
            Handcrafted Resin Art
          </p>
          <h1 className="max-w-3xl text-4xl leading-[1.25] font-black tracking-tight md:text-6xl md:leading-[1.2]">
            هنر رزین دست‌ساز، <span className="text-gold-gradient">در سیاه و طلا</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-8 text-muted-foreground md:text-base">
            هر قطعه در آتلیه نئو رزین با دست ریخته‌گری، پرداخت و امضا می‌شود. آثاری بی‌تکرار برای
            خانه‌ها و هدیه‌هایی که به یاد می‌مانند.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="rounded-sm bg-gold-gradient px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
            >
              مشاهده مجموعه
            </Link>
            <Link
              to="/custom-orders"
              className="rounded-sm hairline px-7 py-3.5 text-sm font-bold text-foreground transition-colors hover:text-gold"
            >
              سفارش اختصاصی
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-y mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Collections"
          title="مجموعه‌ها"
          description="پنج دنیای متفاوت از رزین دست‌ساز، همه با یک زبان طراحی: شب و طلا."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              to="/shop"
              search={{ category: cat.slug }}
              className={`group relative isolate flex min-h-64 flex-col justify-end overflow-hidden rounded-sm hairline p-6 ${
                i === 0 ? "lg:col-span-2 lg:min-h-80" : ""
              }`}
            >
              <img
                src={cat.image}
                alt={cat.title}
                loading="lazy"
                width={900}
                height={1100}
                className="absolute inset-0 -z-10 size-full object-cover opacity-60 transition-all duration-[1200ms] group-hover:scale-105 group-hover:opacity-80"
              />
              <div className="absolute inset-0 -z-10 veil" />
              <h3 className="text-xl font-extrabold">{cat.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{cat.caption}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-gold">
                مشاهده <ChevronLeft className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="section-y border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Featured"
            title="آثار منتخب"
            description="قطعاتی که بیشترین توجه را در آتلیه گرفته‌اند."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-sm hairline px-7 py-3.5 text-sm font-bold transition-colors hover:text-gold"
            >
              همه محصولات <ChevronLeft className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About the artist */}
      <section className="section-y mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-sm hairline">
            <img
              src={artistImg}
              alt="هنرمند نئو رزین در آتلیه"
              loading="lazy"
              width={900}
              height={1100}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div>
            <SectionHeading
              align="start"
              eyebrow="The Artist"
              title="درباره هنرمند"
              description="نئو رزین حاصل ده سال کار با رزین، رنگدانه و ورق طلاست. هر اثر از یک طرح دستی آغاز می‌شود، در چند لایه ریخته می‌شود و پس از هفته‌ها پخت و پرداخت، به یک سطح آینه‌ای می‌رسد."
            />
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { n: "۱۰+", l: "سال تجربه" },
                { n: "۸۰۰+", l: "اثر دست‌ساز" },
                { n: "۱۰۰٪", l: "سفارشی‌سازی" },
              ].map((s) => (
                <div key={s.l} className="rounded-sm hairline p-4">
                  <p className="text-xl font-black text-gold">{s.n}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-gold"
            >
              داستان کامل آتلیه <ChevronLeft className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="section-y border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading eyebrow="Gallery" title="اینستاگرام نئو رزین" />
          <p className="mt-4 text-center text-sm text-muted-foreground" dir="ltr">
            @neo_resin
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {instagramTiles.map((src, i) => (
              <a
                key={i}
                href="https://instagram.com/neo_resin"
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden rounded-sm hairline"
              >
                <img
                  src={src}
                  alt={`نمونه کار رزین شماره ${i + 1}`}
                  loading="lazy"
                  width={900}
                  height={900}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <span className="absolute inset-0 grid place-items-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100">
                  <Instagram className="size-5 text-gold" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-y mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading eyebrow="FAQ" title="سوالات متداول" />
        <Accordion type="single" collapsible className="mt-10">
          {faqs.slice(0, 5).map((f, i) => (
            <AccordionItem key={i} value={`q${i}`} className="border-border/60">
              <AccordionTrigger className="text-right text-sm font-bold hover:text-gold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-8 text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-16 text-center md:px-8">
          <Sparkles className="size-6 text-gold" />
          <h2 className="text-2xl font-extrabold md:text-3xl">اثری بسازیم که فقط مال شماست</h2>
          <p className="max-w-xl text-sm leading-8 text-muted-foreground">
            ابعاد، رنگ و ایده‌تان را بفرستید؛ طرح اولیه و برآورد قیمت را برایتان می‌فرستیم.
          </p>
          <Link
            to="/custom-orders"
            className="rounded-sm bg-gold-gradient px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-glow"
          >
            ثبت سفارش اختصاصی
          </Link>
        </div>
      </section>
    </>
  );
}
