import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import artistImg from "@/assets/artist.jpg";
import textureImg from "@/assets/texture.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "درباره هنرمند | نئو رزین" },
      {
        name: "description",
        content:
          "داستان نئو رزین؛ مسیری که از گوشه‌ای از یک اتاق شروع شد و امروز حاصل ۵ سال تجربه و ساخت چندصد قطعه رزینی دست‌ساز است.",
      },
      { property: "og:title", content: "درباره هنرمند | نئو رزین" },
      {
        property: "og:description",
        content: "داستان نئو رزین و روش ساخت آثار دست‌ساز با تمرکز بر تمیزی، ظرافت و دقت.",
      },
    ],
  }),
  component: AboutPage,
});

const steps = [
  { t: "طراحی", d: "هر اثر با یک طرح دستی و انتخاب پالت رنگ آغاز می‌شود." },
  { t: "ریخته‌گری", d: "رزین در چند لایه با رنگدانه و ورق طلا ریخته می‌شود." },
  { t: "پخت", d: "هر لایه تا ۷۲ ساعت در محیط کنترل‌شده تثبیت می‌شود." },
  { t: "پرداخت", d: "سنباده‌کاری تا سطح آینه‌ای و پولیش نهایی با دست." },
];

const stats = [
  { n: "+۵", l: "سال تجربه" },
  { n: "چندصد قطعه", l: "ساخته‌شده با دست" },
  { n: "از ۱۴۰۲", l: "شروع فعالیت" },
  { n: "سفارش اختصاصی", l: "ساخت متناسب با سلیقه شما" },
];

function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border/50">
        <img
          src={textureImg}
          alt="بافت رزین مشکی و طلایی"
          width={1000}
          height={1000}
          className="absolute inset-0 -z-10 size-full object-cover opacity-35"
        />
        <div className="absolute inset-0 -z-10 veil" />
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <SectionHeading align="start" eyebrow="The Artist" title="آتلیه‌ای به وسعت یک وسواس" />
        </div>
      </section>

      <section className="section-y mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <img
            src={artistImg}
            alt="هنرمند نئو رزین"
            loading="lazy"
            width={900}
            height={1100}
            className="aspect-[4/5] w-full rounded-sm object-cover hairline"
          />
          <div className="space-y-6 text-sm leading-9 text-muted-foreground md:text-base">
            <p>
              نئو رزین از گوشه‌ای از یک اتاق شروع شد؛ جایی ساده، با چند ابزار، چند قالب و علاقه‌ای
              که کم‌کم تبدیل شد به چیزی بیشتر از یک سرگرمی.
            </p>
            <p>
              از همان روزهای اول، هر قطعه را با دقت و وسواس ساختم و قدم‌به‌قدم مسیرم را ادامه دادم.
              در طول ۵ سال فعالیت، ساخت چندصد قطعه رزینی تجربه‌ای شد که هر کدام بخشی از مسیر نئو
              رزین را شکل دادند؛ از اولین کارها تا محصولاتی که امروز با افتخار ارائه می‌کنم.
            </p>
            <p>
              برای من، رزین فقط ترکیب چند ماده و رنگ نیست؛ هر قطعه باید با تمیزی، ظرافت و دقت
              ساخته شود و در نهایت چیزی باشد که حس یک اثر دست‌ساز واقعی را منتقل کند.
            </p>
            <p>
              در نئو رزین خبری از تولید انبوه نیست. هر قطعه با دست ساخته می‌شود و به همین دلیل،
              جزئیات و ترکیب هر اثر می‌تواند با دیگری متفاوت باشد. همین تفاوت‌هاست که به هر محصول
              شخصیت خودش را می‌دهد.
            </p>
            <p>
              امروز نئو رزین دیگر فقط همان گوشه کوچک اتاق نیست؛ حاصل ۵ سال تجربه، آزمون، یادگیری و
              ساختن است. مسیری که آرام‌آرام بزرگ‌تر شد و حالا قرار است ادامه‌اش را با شما طی کنم.
            </p>
            <p>نئو رزین؛ ساخته‌شده با دست، با دقت و با عشق به جزئیات.</p>
            <Link
              to="/shop"
              className="inline-block rounded-sm bg-gold-gradient px-7 py-3.5 text-sm font-bold text-primary-foreground"
            >
              دیدن مجموعه
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="rounded-sm hairline p-5 text-center">
              <p className="text-lg font-black text-gold">{s.n}</p>
              <p className="mt-2 text-[11px] leading-6 text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.t} className="rounded-sm hairline p-6">
              <span className="text-xs font-bold text-gold">۰{i + 1}</span>
              <h3 className="mt-3 text-base font-extrabold">{s.t}</h3>
              <p className="mt-2 text-xs leading-7 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}