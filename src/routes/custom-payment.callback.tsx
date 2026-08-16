import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { verifyCustomOrderPayment } from "@/lib/custom-orders.functions";
import { formatPrice } from "@/lib/products";

type Search = { Authority?: string | undefined; Status?: string | undefined };

export const Route = createFileRoute("/custom-payment/callback")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): Search => ({
    Authority: typeof search["Authority"] === "string" ? search["Authority"] : undefined,
    Status: typeof search["Status"] === "string" ? search["Status"] : undefined,
  }),
  component: CustomPaymentCallbackPage,
});

function CustomPaymentCallbackPage() {
  const { Authority, Status } = Route.useSearch();
  const verify = useServerFn(verifyCustomOrderPayment);

  const { data, isPending, error } = useQuery({
    queryKey: ["verify-custom-payment", Authority, Status],
    enabled: Boolean(Authority),
    retry: false,
    queryFn: () => verify({ data: { authority: Authority!, status: Status ?? "NOK" } }),
  });

  useEffect(() => {}, [data?.ok]);

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
          desc={`مبلغ ${formatPrice(data.amount ?? 0)} با موفقیت پرداخت شد. سفارش شما وارد مرحله ساخت شد.`}
          extra={data.refId ? `شماره پیگیری تراکنش: ${data.refId}` : undefined}
        />
      ) : (
        <Result
          icon="fail"
          title="پرداخت ناموفق"
          desc="تراکنش تأیید نشد. مبلغی از حساب شما کسر نشده یا طی ۷۲ ساعت بازمی‌گردد."
        />
      )}

      <Link
        to="/account/orders"
        className="mt-8 inline-block rounded-sm bg-gold-gradient px-7 py-3.5 text-sm font-bold text-primary-foreground"
      >
        بازگشت به حساب کاربری
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