import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { verifyOnlinePayment } from "@/lib/orders.functions";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";

type Search = { Authority?: string | undefined; Status?: string | undefined };

export const Route = createFileRoute("/payment/callback")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): Search => ({
    Authority: typeof search["Authority"] === "string" ? search["Authority"] : undefined,
    Status: typeof search["Status"] === "string" ? search["Status"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "نتیجه پرداخت | نئو رزین" },
      { name: "description", content: "بررسی و تأیید نتیجه پرداخت آنلاین سفارش در نئو رزین." },
      { property: "og:title", content: "نتیجه پرداخت | نئو رزین" },
      { property: "og:description", content: "وضعیت نهایی تراکنش سفارش شما." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentCallbackPage,
});

function PaymentCallbackPage() {
  const { Authority, Status } = Route.useSearch();
  const { clear } = useCart();
  const verify = useServerFn(verifyOnlinePayment);

  const { data, isPending, error } = useQuery({
    queryKey: ["verify-payment", Authority, Status],
    enabled: Boolean(Authority),
    retry: false,
    queryFn: () => verify({ data: { authority: Authority!, status: Status ?? "NOK" } }),
  });

  useEffect(() => {
    if (data?.ok) clear();
  }, [data?.ok, clear]);

  return (
    <section className="section-y mx-auto max-w-xl px-5 text-center md:px-8">
      {!Authority ? (
        <Result icon="fail" title="اطلاعات تراکنش نامعتبر است" />
      ) : isPending ? (
        <>
          <Loader2 className="mx-auto size-8 animate-spin text-gold" />
          <p className="mt-6 text-sm text-muted-foreground">در حال بررسی تراکنش با درگاه بانکی…</p>
        </>
      ) : error ? (
        <Result icon="fail" title="بررسی تراکنش ممکن نشد" desc={(error as Error).message} />
      ) : data?.ok ? (
        <Result
          icon="ok"
          title="پرداخت موفق"
          desc={`سفارش ${data.orderNumber} به مبلغ ${formatPrice(data.amount)} با موفقیت پرداخت شد.`}
          extra={data.refId ? `شماره پیگیری تراکنش: ${data.refId}` : undefined}
        />
      ) : (
        <Result
          icon="fail"
          title="پرداخت ناموفق"
          desc={`تراکنش سفارش ${data?.orderNumber ?? ""} تأیید نشد. مبلغی از حساب شما کسر نشده یا طی ۷۲ ساعت بازمی‌گردد.`}
        />
      )}

      <Link
        to="/shop"
        className="mt-8 inline-block rounded-sm bg-gold-gradient px-7 py-3.5 text-sm font-bold text-primary-foreground"
      >
        بازگشت به فروشگاه
      </Link>
    </section>
  );
}

function Result({
  icon,
  title,
  desc,
  extra,
}: {
  icon: "ok" | "fail";
  title: string;
  desc?: string;
  extra?: string | undefined;
}) {
  return (
    <>
      {icon === "ok" ? (
        <CheckCircle2 className="mx-auto size-10 text-gold" />
      ) : (
        <XCircle className="mx-auto size-10 text-destructive" />
      )}
      <h1 className="mt-6 text-2xl font-extrabold">{title}</h1>
      {desc ? <p className="mt-4 text-sm leading-8 text-muted-foreground">{desc}</p> : null}
      {extra ? <p className="mt-2 text-sm font-bold text-gold">{extra}</p> : null}
    </>
  );
}
