import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/site/SectionHeading";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس با ما | نئو رزین" },
      {
        name: "description",
        content: "راه‌های ارتباط با آتلیه نئو رزین برای مشاوره خرید و سفارش‌های اختصاصی.",
      },
      { property: "og:title", content: "تماس با ما | نئو رزین" },
      { property: "og:description", content: "با آتلیه نئو رزین در ارتباط باشید." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <section className="section-y mx-auto max-w-5xl px-5 md:px-8">
      <SectionHeading
        eyebrow="Contact"
        title="تماس با آتلیه"
        description="برای مشاوره خرید، همکاری یا سفارش اختصاصی پیام بگذارید؛ در کمتر از یک روز کاری پاسخ می‌دهیم."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLFormElement).reset();
            toast.success("پیام شما ارسال شد");
          }}
          className="space-y-5 rounded-sm hairline p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-name">نام</Label>
              <Input id="c-name" required className="bg-background/60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-phone">شماره تماس</Label>
              <Input id="c-phone" type="tel" required className="bg-background/60" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-msg">پیام شما</Label>
            <Textarea id="c-msg" rows={5} required className="bg-background/60" />
          </div>
          <button
            type="submit"
            className="rounded-sm bg-gold-gradient px-7 py-3.5 text-sm font-bold text-primary-foreground"
          >
            ارسال پیام
          </button>
        </form>

        <aside className="h-fit space-y-4 rounded-sm hairline bg-card/50 p-6 text-sm">
          <p className="flex items-center gap-3">
            <Phone className="size-4 shrink-0 text-gold" />
            <a href="tel:+989370956690" dir="ltr" className="transition-colors hover:text-gold">
              0937 095 6690
            </a>
          </p>
          <p className="flex items-center gap-3">
            <Phone className="size-4 shrink-0 text-gold" />
            <a
              href="https://wa.me/989370956690"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-gold"
            >
              واتساپ: <span dir="ltr">0937 095 6690</span>
            </a>
          </p>
          <p className="flex items-center gap-3">
            <Mail className="size-4 shrink-0 text-gold" />
            <a
              href="mailto:matinrahimian95@gmail.com"
              dir="ltr"
              className="transition-colors hover:text-gold"
            >
              matinrahimian95@gmail.com
            </a>
          </p>
          <p className="flex items-center gap-3">
            <Instagram className="size-4 shrink-0 text-gold" />
            <a
              href="https://instagram.com/neo_resin_"
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="transition-colors hover:text-gold"
            >
              @neo_resin_
            </a>
          </p>
          <p className="flex items-start gap-3 leading-7 text-muted-foreground">
            <MapPin className="mt-1 size-4 shrink-0 text-gold" />
            تهران، آتلیه نئو رزین — بازدید فقط با هماهنگی قبلی
          </p>
        </aside>
      </div>
    </section>
  );
}