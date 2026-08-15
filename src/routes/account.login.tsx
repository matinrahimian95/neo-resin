import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { signUpCustomer, loginCustomer } from "@/lib/customers.functions";

export const Route = createFileRoute("/account/login")({
  component: AccountLogin,
});

function AccountLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const phone = String(form.get("phone") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (phone.length < 10 || password.length < 6) {
      toast.error("شماره تلفن یا رمز عبور نامعتبر است (رمز حداقل ۶ کاراکتر).");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpCustomer({ data: { phone, password } });
        toast.success("ثبت‌نام با موفقیت انجام شد");
      } else {
        await loginCustomer({ data: { phone, password } });
        toast.success("خوش آمدید");
      }
      navigate({ to: "/account/orders" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-10">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {mode === "login" ? "ورود به حساب" : "ثبت‌نام"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="phone"
          type="tel"
          placeholder="شماره تلفن"
          className="w-full border p-3 rounded"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="رمز عبور"
          className="w-full border p-3 rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded w-full"
        >
          {loading ? "لطفاً صبر کنید..." : mode === "login" ? "ورود" : "ثبت‌نام"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="text-sm text-gold hover:underline block mx-auto mt-4"
      >
        {mode === "login" ? "حساب ندارید؟ ثبت‌نام کنید" : "قبلاً ثبت‌نام کرده‌اید؟ وارد شوید"}
      </button>
    </div>
  );
}