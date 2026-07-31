import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/site/SectionHeading";
import customImg from "@/assets/cat-custom.jpg";

export const Route = createFileRoute("/custom-orders")({
  head: () => ({
    meta: [
      { title: "سفارش اختصاصی | نئو رزین" },
      {
        name: "description",
        content: "ثبت سفارش اثر رزین اختصاصی با ابعاد، رنگ و طرح دلخواه شما در آتلیه نئو رزین.",
      },
      { property: "og:title", content: "سفارش اختصاصی | نئو رزین" },
      { property: "og:description", content: "اثری یکتا، ساخته‌شده بر اساس ایده شما." },
    ],
  }),
  component: CustomOrdersPage,
});

function CustomOrdersPage() {
  return (
    <section className="section-y mx-auto max-w-6xl px-5 md:px-8">
      <SectionHeading
        eyebrow="Custom"
        title="سفارش اختصاصی"
        description="از یک ایده ساده تا اثری که دقیقاً اندازه فضای شماست؛ فرم زیر را پر کنید تا طرح اولیه و برآورد قیمت ارسال شود."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <img
          src={customImg}
          alt="ریختن رزین طلایی در قالب"
          loading="lazy"
          width={900}
          height={1100}
          className="aspect-[4/5] w-full rounded-sm object-cover hairline"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLFormElement).reset();
            toast.success("درخواست سفارش اختصاصی ثبت شد");
          }}
          className="space-y-5 rounded-sm hairline p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="o-name">نام</Label>
              <Input id="o-name" required className="bg-background/60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="o-phone">شماره تماس</Label>
              <Input id="o-phone" type="tel" required className="bg-background/60" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="o-type">نوع اثر</Label>
              <Input
                id="o-type"
                placeholder="سینی، ساعت، تابلو…"
                required
                className="bg-background/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="o-size">ابعاد تقریبی</Label>
              <Input id="o-size" placeholder="۴۰ × ۶۰ سانتی‌متر" className="bg-background/60" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="o-idea">توضیح ایده و پالت رنگ</Label>
            <Textarea id="o-idea" rows={5} required className="bg-background/60" />
          </div>
          <button
            type="submit"
            className="rounded-sm bg-gold-gradient px-7 py-3.5 text-sm font-bold text-primary-foreground"
          >
            ارسال درخواست
          </button>
        </form>
      </div>
    </section>
  );
}