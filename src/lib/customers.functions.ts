import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const authSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(6),
});

async function signSession(customerId: string, secret: string): Promise<string> {
  const payload = { sub: customerId, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 };
  const data = btoa(JSON.stringify(payload));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${data}.${sigB64}`;
}

function setSessionCookie(token: string) {
  setResponseHeader(
    "Set-Cookie",
    `customer_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`,
  );
}

export const signUpCustomer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => authSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("phone", data.phone)
      .maybeSingle();
    if (existing) throw new Error("این شماره قبلاً ثبت‌نام کرده است.");

    const password_hash = await bcrypt.hash(data.password, 10);
    const { data: customer, error } = await supabaseAdmin
      .from("customers")
      .insert({ phone: data.phone, password_hash })
      .select("id")
      .single();
    if (error || !customer) throw new Error("ثبت‌نام ناموفق بود.");

    const token = await signSession(customer.id, process.env["SESSION_SECRET"]!);
    setSessionCookie(token);
    return { ok: true };
  });

export const loginCustomer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => authSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id, password_hash")
      .eq("phone", data.phone)
      .maybeSingle();
    if (!customer) throw new Error("شماره یا رمز عبور اشتباه است.");

    const valid = await bcrypt.compare(data.password, customer.password_hash);
    if (!valid) throw new Error("شماره یا رمز عبور اشتباه است.");

    const token = await signSession(customer.id, process.env["SESSION_SECRET"]!);
    setSessionCookie(token);
    return { ok: true };
  });

export const logoutCustomer = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeader("Set-Cookie", "customer_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
  return { ok: true };
});
