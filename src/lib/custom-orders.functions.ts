import { createServerFn } from "@tanstack/react-start";
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