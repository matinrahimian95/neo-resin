import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getCustomOrderById,
  startCustomOrderPayment,
  submitCustomCardOrder,
} from "@/lib/custom-orders.functions";
import { CARD_TRANSFER, type PaymentMethod } from "@/lib/payment-config";

export const Route = createFileRoute("/custom-payment/$id")({
  component: CustomPaymentPage,
});

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("خواندن فایل ناموفق بود."));
    reader.readAsDataURL(file);
  });

function CustomPaymentPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const getOrder = useServerFn(getCustomOrderById);
  const startOnline = useServerFn(startCustomOrderPayment);
  const submitCard = useServerFn(submitCustomCardOrder);

  const { data, isLoading, error } = useQuery({
    queryKey: ["custom-order", id],
    queryFn: () => getOrder({ data: { id } }),
  });

  const [method, setMethod] = useState<PaymentMethod>("online");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <div className="section-y mx-auto max-w-xl px-5 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="section-y mx-auto max-w-xl px-5 text-center text-sm text-muted-foreground">
        سفارش پیدا نشد یا دسترسی ندارید.
      </div>
    );
  }

  const order = data.order;

  if (order.status !== "accepted") {
    return (
      <div className="section-y mx-auto max-w-xl px-5 text-center text-sm text-muted-foreground">
        این سفارش هنوز پذیرفته نشده است.
      </div>
    );
  }

  if (done) {
    return (
      <section className="section-y mx-auto max-w-xl px-5 text-center md:px-8">
        <CheckCircle2 className="mx-auto size-10 text-gold" />
        <h1 className="mt-6 text-2xl font-extrabold">اطلاعات ثبت شد</h1>
        <p className="mt-4 text-sm leading-8 text-muted-foreground">
          پس از بررسی رسید، برای هماهنگی ساخت و ارسال با شما تماس می‌گیریم.
        </p>
        <Link
          to="/account/orders"
          className="mt-8 inline-block rounded-sm bg-gold-gradient px-7 py-3.5 text-sm font-bold text-primary-foreground"
        >
          بازگشت به حساب کاربری
        </Link>
      </section>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const form = new FormData(e.currentTarget);
    const info = {
      id,
      city: String(form.get("city") ?? ""),
      postalCode: String(form.get("postal") ?? ""),
      address: String(form.get("address") ?? ""),
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
        await submitCard({
          data: {
            ...info,
            trackingNumber: String(form.get("tracking") ?? ""),
            receipt: { name: receipt.name, type: receipt.type, base64 },
          },
        });
        setDone(true);
        toast.success("اطلاعات ثبت شد و در انتظار تأیید پرداخت است.");
      } else {
        const res = await startOnline({ data: info });
        toast.success("در حال انتقال به درگاه بانکی…");
        window.location.href = res.redirectUrl;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ثبت اطلاعات ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section-y mx-auto max-w-2xl px-5 md:px-8">
      <h1 className="text-2xl font-extrabold mb-2">پرداخت سفارش اختصاصی</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {order.item_type} — مبلغ: {order.quoted_price?.toLocaleString("fa-IR")} تومان
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-sm hairline p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">شهر</Label>
            <Input id="city" name="city" required className="bg-background/60" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal">کد پستی</Label>
            <Input id="postal" name="postal" required className="bg-background/60" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">نشانی کامل</Label>
          <Textarea id="address" name="address" required rows={3} className="bg-background/60" />
        </div>

        <fieldset className="space-y-3 pt-2">
          <legend className="mb-2 text-sm font-bold">روش پرداخت</legend>
          {(
            [
              { v: "online", l: "پرداخت آنلاین" },
              { v: "card_transfer", l: "کارت‌به‌کارت" },
            ] as const
          ).map((o) => (
            <label
              key={o.v}
              className="flex cursor-pointer items-center gap-3 rounded-sm hairline p-3 text-sm"
            >
              <input
                type="radio"
                name="payment"
                value={o.v}
                checked={method === o.v}
                onChange={() => setMethod(o.v)}
                className="accent-[var(--gold-2)]"
              />
              <span className="font-bold">{o.l}</span>
            </label>
          ))}
        </fieldset>

        {method === "card_transfer" ? (
          <div className="space-y-4 rounded-sm hairline bg-card/50 p-5">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">شماره کارت</span>
                <span dir="ltr" className="font-bold tracking-widest text-gold">
                  {CARD_TRANSFER.cardNumber}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">نام صاحب حساب</span>
                <span className="font-bold">{CARD_TRANSFER.holder}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tracking">شماره پیگیری / شماره مرجع پرداخت</Label>
              <Input id="tracking" name="tracking" required className="bg-background/60" />
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
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-gold-gradient py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {method === "online" ? "پرداخت آنلاین" : "ثبت اطلاعات پرداخت"}
        </button>
      </form>
    </section>
  );
}