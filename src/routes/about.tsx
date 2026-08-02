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
              نئو رزین از یک میز کوچک در گوشه‌ای از آتلیه شروع شد؛ با چند قالب دست‌ساز و اشتیاق به
              دیدن لحظه‌ای که طلا در سیاهی جاری می‌شود.
            </p>
            <p>
              امروز هر قطعه هنوز با همان روش ساخته می‌شود: بدون تولید انبوه، بدون تکرار. الگوی
              طلایی هیچ دو اثری شبیه هم نیست و این دقیقاً همان چیزی است که یک اثر دست‌ساز را از یک
              کالا جدا می‌کند.
            </p>
            <p>
              زبان طراحی ما ساده است: سیاه عمیق، طلای گرم و فرم‌هایی که در هر خانه‌ای، مدرن یا
              کلاسیک، سر جای خود می‌نشینند.
            </p>
            <Link
              to="/shop"
              className="inline-block rounded-sm bg-gold-gradient px-7 py-3.5 text-sm font-bold text-primary-foreground"
            >
              دیدن مجموعه
            </Link>
          </div>
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