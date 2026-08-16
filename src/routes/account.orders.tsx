import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getMyOrders, logoutCustomer } from "@/lib/customers.functions";
import { getMyCustomOrders } from "@/lib/custom-orders.functions";

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
};

function AccountOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);

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
                  {CUSTOM_STATUS_LABELS[co.status] ?? co.status}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}