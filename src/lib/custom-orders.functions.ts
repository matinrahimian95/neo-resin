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
  