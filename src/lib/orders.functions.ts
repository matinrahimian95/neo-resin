import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { cardOrderSchema, customerSchema, verifySchema } from "./orders.schema";
import { decodeBase64, orderRow, priceLines } from "./orders.server";

/** کارت‌به‌کارت: سفارش فقط با شماره پیگیری و تصویر رسید ثبت می‌شود. */
export const submitCardOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => cardOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { items, amount } = priceLines(data.lines);
    const { bytes, contentType } = decodeBase64(data.receipt.base64);

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        ...orderRow(data, items, amount),
        payment_method: "card_transfer",
        payment_status: "awaiting_verification",
        card_tracking_number: data.trackingNumber,
      })
      .select("id, order_number, amount")
      .single();
    if (error || !order) throw new Error(error?.message ?? "ثبت سفارش ناموفق بود.");

    const ext = contentType === "application/pdf" ? "pdf" : (contentType.split("/")[1] ?? "jpg");
    const path = `${order.id}/receipt.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("receipts")
      .upload(path, bytes, { contentType, upsert: true });
    if (uploadError) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error("آپلود تصویر رسید ناموفق بود.");
    }
    await supabaseAdmin.from("orders").update({ receipt_path: path }).eq("id", order.id);

    return {
      orderNumber: order.order_number,
      amount: order.amount,
      paymentStatus: "awaiting_verification" as const,
    };
  });

/** پرداخت آنلاین: ابتدا سفارش «در انتظار پرداخت» ساخته و سپس به درگاه هدایت می‌شود. */
export const startOnlinePayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => customerSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requestPayment } = await import("./zarinpal.server");
    const { items, amount } = priceLines(data.lines);

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        ...orderRow(data, items, amount),
        payment_method: "online",
        payment_status: "awaiting_payment",
      })
      .select("id, order_number, amount")
      .single();
    if (error || !order) throw new Error(error?.message ?? "ثبت سفارش ناموفق بود.");

    const origin = new URL(getRequest().url).origin;
    const { authority, redirectUrl } = await requestPayment({
      amountToman: order.amount,
      description: `سفارش ${order.order_number} - نئو رزین`,
      callbackUrl: `${origin}/payment/callback`,
      mobile: data.phone,
      email: data.email || undefined,
    });

    await supabaseAdmin.from("orders").update({ gateway_authority: authority }).eq("id", order.id);
    return { orderNumber: order.order_number, redirectUrl };
  });

/** بازگشت از درگاه: تأیید واقعی تراکنش و ثبت وضعیت نهایی. */
export const verifyOnlinePayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifySchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyPayment } = await import("./zarinpal.server");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, amount, payment_status, gateway_ref_id")
      .eq("gateway_authority", data.authority)
      .maybeSingle();
    if (!order) throw new Error("سفارش مرتبط با این تراکنش پیدا نشد.");

    if (order.payment_status === "paid") {
      return {
        ok: true,
        orderNumber: order.order_number,
        amount: order.amount,
        refId: order.gateway_ref_id,
        paymentStatus: "paid" as const,
      };
    }

    if (data.status !== "OK") {
      await supabaseAdmin.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
      return {
        ok: false,
        orderNumber: order.order_number,
        amount: order.amount,
        refId: null,
        paymentStatus: "failed" as const,
      };
    }

    const result = await verifyPayment({ authority: data.authority, amountToman: order.amount });
    await supabaseAdmin
      .from("orders")
      .update({
        payment_status: result.ok ? "paid" : "failed",
        gateway_ref_id: result.refId ?? null,
      })
      .eq("id", order.id);

    return {
      ok: result.ok,
      orderNumber: order.order_number,
      amount: order.amount,
      refId: result.refId ?? null,
      paymentStatus: (result.ok ? "paid" : "failed") as "paid" | "failed",
    };
  });
