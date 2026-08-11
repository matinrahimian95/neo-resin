import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MERCHANT_ID = Deno.env.get("ZARINPAL_MERCHANT_ID")!;
const ZARINPAL_VERIFY_API = "https://sandbox.zarinpal.com/pg/v4/payment/verify.json";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { authority, orderId, amount } = await req.json();

    if (!authority || !orderId || !amount) {
      return new Response(JSON.stringify({ error: "authority و orderId و amount لازمه" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const zarinpalRes = await fetch(ZARINPAL_VERIFY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: amount,
        authority: authority,
      }),
    });

    const data = await zarinpalRes.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (data.data?.code === 100 || data.data?.code === 101) {
      await supabase
        .from("orders")
        .update({ status: "paid", ref_id: String(data.data.ref_id) })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({ success: true, ref_id: data.data.ref_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("orders")
      .update({ status: "failed" })
      .eq("id", orderId);

    return new Response(JSON.stringify({ success: false, error: data.errors }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});