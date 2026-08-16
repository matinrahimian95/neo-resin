import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getMyOrders, logoutCustomer } from "@/lib/customers.functions";
import { getMyCustomOrders, respondToQuote } from "@/lib/custom-orders.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/account/orders")({
  component: AccountOrders,
});

const STAGE_LABELS: Record<string, string> = {
  awaiting_payment: "در انتظار پرداخت",
  awaiting_verification: "در انتظار تایید واریز",
  failed: "پرداخت ناموفق",
  shipped: "ارسال شد",
  delivered: "به دست مشتری رسید",
  preparing: "در حال آماده‌سازی",
};

function getStageLabel(paymentStatus: string, shippingStatus: string) {
  if (paymentStatus === "awaiting_payment") return STAGE_LABELS.awaiting_payment;
  if (paymentStatus === "awaiting_verification") return STAGE_LABELS.awaiting_verification;
  if (paymentStatus === "failed") return STAGE_LABELS.failed;
  if (shippingStatus === "shipped") return STAGE_LABELS.shipped;
  if (shippingStatus === "delivered") return STAGE_LABELS.delivered;
  return STAGE_LABELS.preparing;
}

const CUSTOM_STATUS_LABELS: Record<string, string> = {
  new: "در حال بررسی",
  quoted: "قیمت اعلام شد",
  accepted: "پذیرفته شد",
  rejected: "رد شد",
};

const CUSTOM_PAYMENT_LABELS: Record<string, string> = {
  awaiting_payment: "در انتظار پرداخت",
  awaiting_verification: "در انتظار تأیید پرداخت",
  paid: "پرداخت موفق",
  failed: "پرداخت ناموفق / رسید رد شد",
};

const CUSTOM_PRODUCTION_LABELS: Record<string, string> = {
  in_production: "در حال ساخت",
  shipped: "ارسال شد",
  delivered: "تحویل داده شد",
};

function getCustomOrderStageLabel(co: CustomOrder) {
  if (co.status !== "accepted") return CUSTOM_STATUS_LABELS[co.status] ?? co.status;
  if (co.production_status) return CUSTOM_PRODUCTION_LABELS[co.production_status] ?? co.production_status;
  if (co.payment_status) return CUSTOM_PAYMENT_LABELS[co.payment_status] ?? co.payment_status;
  return CUSTOM_STATUS_LABELS.accepted;
}

type Order = {
  id: string;
  order_number: string;
  amount: number;
  items: unknown;
  payment_status: string;
  shipping_status: string;
  created_at: string;
};

type CustomOrder = {
  id: string;
  item_type: string;
  size: string | null;
  idea_description: string;
  status: string;
  quoted_price: number | null;
  created_at: string;
  payment_status?: string;
  production_status?: string | null;
};

function AccountOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([getMyOrders(), getMyCustomOrders()])
      .then(([ordersRes, customRes]) => {
        setOrders(ordersRes.orders as Order[]);
        setCustomOrders(customRes.customOrders as CustomOrder[]);
      })
      .catch(() => {
        navigate({ to: "/account/login" });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleLogout() {
    await logoutCustomer();
    navigate({ to: "/account/login" });
  }

  async function respond(id: string, response: "accepted" | "rejected") {
    try {
      await respondToQuote({ data: { id, response, note: noteInputs[id] } });
      setCustomOrders((prev) =>
        prev.map((co) => (co.id === id ? { ...co, status: response } : co)),
      );
      if (response === "accepted") {
        toast.success("درخواست شما تایید شد");
        navigate({ to: "/custom-payment/$id", params: { id } });
      } else {
        toast.success("پاسخ شما ثبت شد");
      }
    } catch {
      toast.error("خطا در ثبت پاسخ");
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-10 text-center text-muted-foreground">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">حساب کاربری من</h1>
        <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-destructive">
          خروج
        </button>
      </div>

      <h2 className="text-lg font-bold mb-4">سفارش‌های من</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground mb-8">هنوز سفارشی ثبت نکرده‌اید.</p>
      ) : (
        <div className="space-y-4 mb-10">
          {orders.map((order) => (
            <div key={order.id} className="border rounded p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold">{order.order_number}</p>
                <p className="text-sm">{order.amount?.toLocaleString("fa-IR")} تومان</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(order.created_at).toLocaleString("fa-IR")}
              </p>
              <p className="text-sm mt-2 text-gold">
                {getStageLabel(order.payment_status, order.shipping_status)}
              </p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-bold mb-4">سفارش‌های اختصاصی من</h2>
      {customOrders.length === 0 ? (
        <p className="text-muted-foreground">هنوز درخواست سفارش اختصاصی ثبت نکرده‌اید.</p>
      ) : (
        <div className="space-y-4">
          {customOrders.map((co) => (
            <div key={co.id} className="border rounded p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold">{co.item_type}</p>
                <span className="text-sm text-gold">
                  {getCustomOrderStageLabel(co)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(co.created_at).toLocaleString("fa-IR")}
              </p>
              {co.quoted_price && (
                <p className="text-sm mt-2">
                  قیمت پیشنهادی: {co.quoted_price.toLocaleString("fa-IR")} تومان
                </p>
              )}

              {co.status === "quoted" && (
                <div className="mt-3 space-y-2">
                  <textarea
                    placeholder="نظر یا توضیح (اختیاری)"
                    value={noteInputs[co.id] ?? ""}
                    onChange={(e) =>
                      setNoteInputs((prev) => ({ ...prev, [co.id]: e.target.value }))
                    }
                    className="w-full border rounded p-2 text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => void respond(co.id, "accepted")}
                      className="bg-black text-white px-4 py-2 rounded text-sm"
                    >
                      قبول دارم
                    </button>
                    <button
                      onClick={() => void respond(co.id, "rejected")}
                      className="border px-4 py-2 rounded text-sm"
                    >
                      قبول ندارم
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}