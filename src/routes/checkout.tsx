import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "تکمیل خرید | نئو رزین" },
      { name: "description", content: "ثبت اطلاعات ارسال و نهایی کردن سفارش آثار رزین دست‌ساز." },
      { property: "og:title", content: "تکمیل خرید | نئو رزین" },
      { property: "og:description", content: "نهایی کردن سفارش در بوتیک نئو رزین." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <section className="section-y mx-auto max-w-xl px-5 text-center md:px-8">
        <CheckCircle2 className="mx-auto size-10 text-gold" />
        <h1 className="mt-6 text-2xl font-extrabold">سفارش شما ثبت شد</h1>
        <p className="mt-4 text-sm leading-8 text-muted-foreground">
          همکاران ما برای تایید نهایی و هماهنگی ارسال با شما تماس می‌گیرند.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-block rounded-sm bg-gold-gradient px-7 py-3.5 text-sm font-bold text-primary-foreground"
        >
          بازگشت به فروشگاه
        </Link>
      </section>
    );
  }

  return (
    <section className="section-y mx-auto max-w-5xl px-5 md:px-8">
      <SectionHeading eyebrow="Checkout" title="تکمیل خرید" />

      {items.length === 0 ? (
        <div className="mt-12 rounded-sm hairline p-12 text-center text-sm text-muted-foreground">
          سبد خرید خالی است.{" "}
          <Link to="/shop" className="font-bold text-gold">
            انتخاب اثر
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            clear();
            setDone(true);
            toast.success("سفارش با موفقیت ثبت شد");
          }}
          className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]"
        >
          <div className="space-y-5 rounded-sm hairline p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="name" label="نام و نام خانوادگی" required />
              <Field id="phone" label="شماره تماس" type="tel" required />
            </div>
            <Field id="email" label="ایمیل" type="email" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="city" label="شهر" required />
              <Field id="postal" label="کد پستی" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">نشانی کامل</Label>
              <Textarea id="address" required rows={3} className="bg-background/60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">یادداشت سفارش (اختیاری)</Label>
              <Textarea id="note" rows={2} className="bg-background/60" />
            </div>
            <fieldset className="space-y-3 pt-2">
              <legend className="mb-2 text-sm font-bold">روش پرداخت</legend>
              {[
                { v: "online", l: "پرداخت آنلاین" },
                { v: "cod", l: "پرداخت در محل" },
              ].map((o, i) => (
                <label
                  key={o.v}
                  className="flex cursor-pointer items-center gap-3 rounded-sm hairline p-3 text-sm"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={o.v}
                    defaultChecked={i === 0}
                    className="accent-[var(--gold-2)]"
                  />
                  {o.l}
                </label>
              ))}
            </fieldset>
          </div>

          <aside className="h-fit rounded-sm hairline bg-card/50 p-6">
            <h2 className="text-sm font-extrabold">خلاصه سفارش</h2>
            <ul className="mt-5 space-y-3 text-xs text-muted-foreground">
              {items.map(({ product, qty }) => (
                <li key={product.id} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {product.name} × {qty}
                  </span>
                  <span className="shrink-0">{formatPrice(product.price * qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex justify-between border-t border-border/60 pt-4 text-sm font-bold">
              <span>مبلغ نهایی</span>
              <span className="text-gold">{formatPrice(total)}</span>
            </div>
            <button
              type="submit"
              className="mt-6 w-full rounded-sm bg-gold-gradient py-3.5 text-sm font-bold text-primary-foreground"
            >
              ثبت نهایی سفارش
            </button>
          </aside>
        </form>
      )}
    </section>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} required={required} className="bg-background/60" />
    </div>
  );
}