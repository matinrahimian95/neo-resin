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