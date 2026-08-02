import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Copy, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { CARD_TRANSFER, type PaymentMethod } from "@/lib/payment-config";
import { startOnlinePayment, submitCardOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "تکمیل خرید | نئو رزین" },
      {
        name: "description",
        content: "ثبت اطلاعات ارسال و پرداخت آنلاین یا کارت‌به‌کارت سفارش آثار رزین دست‌ساز.",
      },
      { property: "og:title", content: "تکمیل خرید | نئو رزین" },
      { property: "og:description", content: "نهایی کردن سفارش در بوتیک نئو رزین." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutPage,
});

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("خواندن فایل ناموفق بود."));
    reader.readAsDataURL(file);
  });

function CheckoutPage() {
  const { items, total, lines, clear } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("online");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ orderNumber: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const startOnline = useServerFn(startOnlinePayment);
  const submitCard = useServerFn(submitCardOrder);

  if (done) {
    return (
      <section className="section-y mx-auto max-w-xl px-5 text-center md:px-8">
        <CheckCircle2 className="mx-auto size-10 text-gold" />
        <h1 className="mt-6 text-2xl font-extrabold">سفارش شما ثبت شد</h1>
        <p className="mt-4 text-sm leading-8 text-muted-foreground">
          شماره سفارش: <span className="font-bold text-gold">{done.orderNumber}</span>
          <br />
          وضعیت پرداخت: <span className="font-bold">در انتظار تأیید پرداخت</span>
          <br />
          پس از بررسی رسید، برای هماهنگی ارسال با شما تماس می‌گیریم.
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const form = new FormData(e.currentTarget);
    const customer = {
      customerName: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      city: String(form.get("city") ?? ""),
      postalCode: String(form.get("postal") ?? ""),
      address: String(form.get("address") ?? ""),
      note: String(form.get("note") ?? ""),
      lines: lines.map((l) => ({ id: l.id, qty: l.qty, ...(l.size ? { size: l.size } : {}) })),
    };

    setSubmitting(true);
    try {
      if (method === "card_transfer") {
        if (!receipt) {
          toast.error("لطفاً تصویر رسید پرداخت را بارگذاری کنید.");
          return;
        }
        if (receipt.size > 5 * 1024 * 1024) {
          toast.error("حجم تصویر رسید باید کمتر از ۵ مگابایت باشد.");
          return;
        }
        const base64 = await readFileAsDataUrl(receipt);
        const res = await submitCard({
          data: {
            ...customer,
            trackingNumber: String(form.get("tracking") ?? ""),
            receipt: { name: receipt.name, type: receipt.type, base64 },
          },
        });
        clear();
        setDone({ orderNumber: res.orderNumber });
        toast.success("سفارش ثبت شد و در انتظار تأیید پرداخت است.");
      } else {
        const res = await startOnline({ data: customer });
        toast.success("در حال انتقال به درگاه بانکی…");
        window.location.href = res.redirectUrl;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ثبت سفارش ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
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
          onSubmit={handleSubmit}
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
              <Textarea id="address" name="address" required rows={3} className="bg-background/60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">یادداشت سفارش (اختیاری)</Label>
              <Textarea id="note" name="note" rows={2} className="bg-background/60" />
            </div>

            <fieldset className="space-y-3 pt-2">
              <legend className="mb-2 text-sm font-bold">روش پرداخت</legend>
              {(
                [
                  {
                    v: "online",
                    l: "پرداخت آنلاین",
                    d: "پرداخت امن از طریق درگاه بانکی",
                  },
                  {
                    v: "card_transfer",
                    l: "کارت‌به‌کارت",
                    d: "واریز مبلغ سفارش به کارت و ارسال تصویر رسید پرداخت",
                  },
                ] as const
              ).map((o) => (
                <label
                  key={o.v}
                  className="flex cursor-pointer items-start gap-3 rounded-sm hairline p-3 text-sm"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={o.v}
                    checked={method === o.v}
                    onChange={() => setMethod(o.v)}
                    className="mt-1 accent-[var(--gold-2)]"
                  />
                  <span>
                    <span className="font-bold">{o.l}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{o.d}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            {method === "card_transfer" ? (
              <div className="space-y-4 rounded-sm hairline bg-card/50 p-5">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">شماره کارت</span>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard?.writeText(CARD_TRANSFER.cardNumberRaw);
                        toast.success("شماره کارت کپی شد");
                      }}
                      className="flex items-center gap-2 font-bold tracking-widest text-gold"
                    >
                      <Copy className="size-3.5" />
                      {CARD_TRANSFER.cardNumber}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">نام صاحب حساب</span>
                    <span className="font-bold">{CARD_TRANSFER.holder}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">مبلغ قابل واریز</span>
                    <span className="font-bold text-gold">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tracking">شماره پیگیری / شماره مرجع پرداخت</Label>
                  <Input
                    id="tracking"
                    name="tracking"
                    required={method === "card_transfer"}
                    className="bg-background/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt">تصویر رسید پرداخت</Label>
                  <input
                    ref={fileRef}
                    id="receipt"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-sm hairline bg-background/60 p-3 text-xs"
                  >
                    <Upload className="size-4 text-gold" />
                    {receipt ? receipt.name : "انتخاب تصویر رسید (حداکثر ۵ مگابایت)"}
                  </button>
                  <p className="text-[11px] text-muted-foreground">
                    ثبت سفارش کارت‌به‌کارت تنها پس از وارد کردن شماره پیگیری و بارگذاری رسید انجام
                    می‌شود.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="h-fit rounded-sm hairline bg-card/50 p-6">
            <h2 className="text-sm font-extrabold">خلاصه سفارش</h2>
            <ul className="mt-5 space-y-3 text-xs text-muted-foreground">
              {items.map(({ key, product, qty, size, unitPrice }) => (
                <li key={key} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {product.name}
                    {size ? ` (سایز ${size})` : ""} × {qty}
                  </span>
                  <span className="shrink-0">{formatPrice(unitPrice * qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex justify-between border-t border-border/60 pt-4 text-sm font-bold">
              <span>مبلغ نهایی</span>
              <span className="text-gold">{formatPrice(total)}</span>
            </div>
            <button
              type="submit"
              disabled={submitting || (method === "card_transfer" && !receipt)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-gold-gradient py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {method === "online" ? "پرداخت آنلاین و ثبت سفارش" : "ثبت سفارش کارت‌به‌کارت"}
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
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        className="bg-background/60"
      />
    </div>
  );
}
