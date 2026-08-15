import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getMyOrders, logoutCustomer } from "@/lib/customers.functions";

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

type Order = {
  id: string;
  order_number: string;
  amount: number;
  items: unknown;
  payment_status: string;
  shipping_status: string;
  created_at: string;
};

function AccountOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.orders as Order[]))
      .catch(() => {
        navigate({ to: "/account/login" });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleLogout() {
    await logoutCustomer();
    navigate({ to: "/account/login" });
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
        <h1 className="text-2xl font-bold">سفارش‌های من</h1>
        <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-destructive">
          خروج
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید.</p>
      ) : (
        <div className="space-y-4">
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
    </div>
  );
}