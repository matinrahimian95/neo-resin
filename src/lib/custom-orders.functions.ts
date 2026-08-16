import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const customOrderSchema = z.object({
  customerName: z.string().min(1),
  phone: z.string().min(10),
  itemType: z.string().min(1),
  size: z.string().optional(),
  ideaDescription: z.string().min(1),
});

export const submitCustomOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => customOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("custom_orders").insert({
      customer_name: data.customerName,
      phone: data.phone,
      item_type: data.itemType,
      size: data.size || null,
      idea_description: data.ideaDescription,
    });
    if (error) throw new Error("ثبت درخواست ناموفق بود.");

    return { ok: true };
  });

export const getCustomOrders = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("custom_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error("خطا در دریافت سفارش‌ها.");
  return { orders: data ?? [] };
});

const updateSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  quotedPrice: z.number().optional(),
  adminNote: z.string().optional(),
});

export const updateCustomOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = {};
    if (data.status) patch.status = data.status;
    if (data.quotedPrice !== undefined) patch.quoted_price = data.quotedPrice;
    if (data.adminNote !== undefined) patch.admin_note = data.adminNote;

    const { error } = await supabaseAdmin.from("custom_orders").update(patch).eq("id", data.id);
    if (error) throw new Error("بروزرسانی ناموفق بود.");
    return { ok: true };
  });

export const getMyCustomOrders = createServerFn({ method: "GET" }).handler(async () => {
  const { getCurrentCustomerId } = await import("./customers.server");
  const customerId = await getCurrentCustomerId();
  if (!customerId) throw new Error("لطفاً ابتدا وارد شوید.");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("phone")
    .eq("id", customerId)
    .maybeSingle();
  if (!customer) throw new Error("حساب کاربری پیدا نشد.");

  const { data: customOrders, error } = await supabaseAdmin
    .from("custom_orders")
    .select("id, item_type, size, idea_description, status, quoted_price, created_at")
    .eq("phone", customer.phone)
    .order("created_at", { ascending: false });
  if (error) throw new Error("خطا در دریافت سفارش‌های اختصاصی.");

  return { customOrders: customOrders ?? [] };
});

const respondSchema = z.object({
  id: z.string(),
  response: z.enum(["accepted", "rejected"]),
  note: z.string().optional(),
});

export const respondToQuote = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => respondSchema.parse(data))
  .handler(async ({ data }) => {
    const { getCurrentCustomerId } = await import("./customers.server");
    const customerId = await getCurrentCustomerId();
    if (!customerId) throw new Error("لطفاً ابتدا وارد شوید.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("phone")
      .eq("id", customerId)
      .maybeSingle();
    if (!customer) throw new Error("حساب کاربری پیدا نشد.");

    const patch: Record<string, unknown> = { status: data.response };
    if (data.note) patch.customer_note = data.note;

    const { error } = await supabaseAdmin
      .from("custom_orders")
      .update(patch)
      .eq("id", data.id)
      .eq("phone", customer.phone);
    if (error) throw new Error("ثبت پاسخ ناموفق بود.");

    return { ok: true };
  });

/** گرفتن جزئیات یک سفارش اختصاصی برای صفحه پرداخت (فقط مالک آن) */
const getByIdSchema = z.object({ id: z.string() });

export const getCustomOrderById = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => getByIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { getCurrentCustomerId } = await import("./customers.server");
    const customerId = await getCurrentCustomerId();
    if (!customerId) throw new Error("لطفاً ابتدا وارد شوید.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("phone")
      .eq("id", customerId)
      .maybeSingle();
    if (!customer) throw new Error("حساب کاربری پیدا نشد.");

    const { data: order, error } = await supabaseAdmin
      .from("custom_orders")
      .select("*")
      .eq("id", data.id)
      .eq("phone", customer.phone)
      .maybeSingle();
    if (error || !order) throw new Error("سفارش پیدا نشد.");

    return { order };
  });

/** شروع پرداخت آنلاین برای سفارش اختصاصی */
const customerInfoSchema = z.object({
  id: z.string(),
  city: z.string().trim().min(2),
  postalCode: z.string().trim().min(4),
  address: z.string().trim().min(5),
});

export const startCustomOrderPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => customerInfoSchema.parse(data))
  .handler(async ({ data }) => {
    const { getCurrentCustomerId } = await import("./customers.server");
    const customerId = await getCurrentCustomerId();
    if (!customerId) throw new Error("لطفاً ابتدا وارد شوید.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requestPayment } = await import("./zarinpal.server");

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("phone")
      .eq("id", customerId)
      .maybeSingle();
    if (!customer) throw new Error("حساب کاربری پیدا نشد.");

    const { data: order } = await supabaseAdmin
      .from("custom_orders")
      .select("id, quoted_price, status, phone")
      .eq("id", data.id)
      .eq("phone", customer.phone)
      .maybeSingle();
    if (!order) throw new Error("سفارش پیدا نشد.");
    if (order.status !== "accepted") throw new Error("این سفارش هنوز پذیرفته نشده است.");
    if (!order.quoted_price) throw new Error("قیمتی برای این سفارش ثبت نشده است.");

    await supabaseAdmin
      .from("custom_orders")
      .update({
        city: data.city,
        postal_code: data.postalCode,
        address: data.address,
        payment_method: "online",
        payment_status: "awaiting_payment",
      })
      .eq("id", data.id);

    const origin = new URL(getRequest().url).origin;
    const { authority, redirectUrl } = await requestPayment({
      amountToman: order.quoted_price,
      description: `سفارش اختصاصی نئو رزین`,
      callbackUrl: `${origin}/custom-payment/callback`,
      mobile: order.phone,
    });

    await supabaseAdmin
      .from("custom_orders")
      .update({ gateway_authority: authority })
      .eq("id", data.id);

    return { redirectUrl };
  });

/** ثبت پرداخت کارت‌به‌کارت برای سفارش اختصاصی */
const cardPaymentSchema = z.object({
  id: z.string(),
  city: z.string().trim().min(2),
  postalCode: z.string().trim().min(4),
  address: z.string().trim().min(5),
  trackingNumber: z.string().trim().min(4),
  receipt: z.object({
    name: z.string().max(200),
    type: z.string().max(100),
    base64: z.string().min(100).max(8_000_000),
  }),
});

export const submitCustomCardOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => cardPaymentSchema.parse(data))
  .handler(async ({ data }) => {
    const { getCurrentCustomerId } = await import("./customers.server");
    const customerId = await getCurrentCustomerId();
    if (!customerId) throw new Error("لطفاً ابتدا وارد شوید.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { decodeBase64 } = await import("./orders.server");

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("phone")
      .eq("id", customerId)
      .maybeSingle();
    if (!customer) throw new Error("حساب کاربری پیدا نشد.");

    const { data: order } = await supabaseAdmin
      .from("custom_orders")
      .select("id, status")
      .eq("id", data.id)
      .eq("phone", customer.phone)
      .maybeSingle();
    if (!order) throw new Error("سفارش پیدا نشد.");
    if (order.status !== "accepted") throw new Error("این سفارش هنوز پذیرفته نشده است.");

    const { bytes, contentType } = decodeBase64(data.receipt.base64);
    const ext = contentType === "application/pdf" ? "pdf" : (contentType.split("/")[1] ?? "jpg");
    const path = `custom-${data.id}/receipt.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("receipts")
      .upload(path, bytes, { contentType, upsert: true });
    if (uploadError) throw new Error("آپلود تصویر رسید ناموفق بود.");

    const { error } = await supabaseAdmin
      .from("custom_orders")
      .update({
        city: data.city,
        postal_code: data.postalCode,
        address: data.address,
        payment_method: "card_transfer",
        payment_status: "awaiting_verification",
        card_tracking_number: data.trackingNumber,
        receipt_path: path,
      })
      .eq("id", data.id);
    if (error) throw new Error("ثبت اطلاعات ناموفق بود.");

    return { ok: true };
  });

/** تایید پرداخت آنلاین سفارش اختصاصی بعد از بازگشت از درگاه */
const verifyCustomSchema = z.object({
  authority: z.string().trim().min(5),
  status: z.string().trim().max(20),
});

export const verifyCustomOrderPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifyCustomSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyPayment } = await import("./zarinpal.server");

    const { data: order } = await supabaseAdmin
      .from("custom_orders")
      .select("id, quoted_price, payment_status, gateway_ref_id")
      .eq("gateway_authority", data.authority)
      .maybeSingle();
    if (!order) throw new Error("سفارش مرتبط با این تراکنش پیدا نشد.");

    if (order.payment_status === "paid") {
      return { ok: true, amount: order.quoted_price, refId: order.gateway_ref_id };
    }

    if (data.status !== "OK") {
      await supabaseAdmin
        .from("custom_orders")
        .update({ payment_status: "failed" })
        .eq("id", order.id);
      return { ok: false, amount: order.quoted_price, refId: null };
    }

    const result = await verifyPayment({
      authority: data.authority,
      amountToman: order.quoted_price ?? 0,
    });

    await supabaseAdmin
      .from("custom_orders")
      .update({
        payment_status: result.ok ? "paid" : "failed",
        gateway_ref_id: result.refId ?? null,
        production_status: result.ok ? "in_production" : null,
      })
      .eq("id", order.id);

    return { ok: result.ok, amount: order.quoted_price, refId: result.refId ?? null };
  });