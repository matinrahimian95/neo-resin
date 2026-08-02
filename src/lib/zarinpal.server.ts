// اتصال واقعی به درگاه زرین‌پال.
// اعتبارنامه‌ها فقط از Environment Variables سمت سرور خوانده می‌شوند:
//   ZARINPAL_MERCHANT_ID  -> شناسه پذیرنده (Merchant ID) - محرمانه
//   ZARINPAL_SANDBOX      -> "true" برای محیط تست، در غیر این صورت محیط عملیاتی
// هرگز این مقادیر را در کد Frontend یا مخزن Git قرار ندهید.

type RequestResult = { authority: string; redirectUrl: string };

function config() {
  const merchantId = process.env["ZARINPAL_MERCHANT_ID"];
  if (!merchantId) {
    throw new Error("ZARINPAL_MERCHANT_ID تنظیم نشده است.");
  }
  const sandbox = process.env["ZARINPAL_SANDBOX"] === "true";
  const host = sandbox ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
  return { merchantId, host };
}

/** مبلغ سایت به تومان است؛ زرین‌پال ریال می‌گیرد. */
export const tomanToRial = (toman: number) => toman * 10;

export async function requestPayment(params: {
  amountToman: number;
  description: string;
  callbackUrl: string;
  mobile?: string | undefined;
  email?: string | undefined;
}): Promise<RequestResult> {
  const { merchantId, host } = config();
  const res = await fetch(`${host}/pg/v4/payment/request.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      merchant_id: merchantId,
      amount: tomanToRial(params.amountToman),
      currency: "IRR",
      description: params.description,
      callback_url: params.callbackUrl,
      metadata: {
        ...(params.mobile ? { mobile: params.mobile } : {}),
        ...(params.email ? { email: params.email } : {}),
      },
    }),
  });

  const payload = (await res.json()) as {
    data?: { code?: number; authority?: string; message?: string };
    errors?: { code?: number; message?: string } | unknown[];
  };

  const authority = payload.data?.authority;
  if (payload.data?.code !== 100 || !authority) {
    const message =
      (payload.data && payload.data.message) ||
      (!Array.isArray(payload.errors) && payload.errors?.message) ||
      "خطا در ایجاد تراکنش";
    console.error("[zarinpal] request failed", JSON.stringify(payload));
    throw new Error(`درگاه پرداخت پاسخ نداد: ${message}`);
  }

  return { authority, redirectUrl: `${host}/pg/StartPay/${authority}` };
}

export async function verifyPayment(params: {
  authority: string;
  amountToman: number;
}): Promise<{ ok: boolean; refId?: string; code?: number; message?: string }> {
  const { merchantId, host } = config();
  const res = await fetch(`${host}/pg/v4/payment/verify.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      merchant_id: merchantId,
      amount: tomanToRial(params.amountToman),
      authority: params.authority,
    }),
  });

  const payload = (await res.json()) as {
    data?: { code?: number; ref_id?: number | string; message?: string };
    errors?: { code?: number; message?: string } | unknown[];
  };

  const code = payload.data?.code;
  // 100 = تأیید موفق، 101 = قبلاً تأیید شده
  if (code === 100 || code === 101) {
    return { ok: true, refId: String(payload.data?.ref_id ?? ""), code: code };
  }
  const message =
    (payload.data && payload.data.message) ||
    (!Array.isArray(payload.errors) && payload.errors?.message) ||
    "تراکنش تأیید نشد";
  console.error("[zarinpal] verify failed", JSON.stringify(payload));
  return { ok: false, ...(typeof code === "number" ? { code } : {}), message: String(message) };
}
