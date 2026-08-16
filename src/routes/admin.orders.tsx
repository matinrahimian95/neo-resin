import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const PAYMENT_LABELS: Record<string, string> = {
  awaiting_payment: "در انتظار پرداخت",
  paid: "پرداخت موفق",
  failed: "پرداخت ناموفق",
  awaiting_verification: "در انتظار تأیید پرداخت",
};

const SHIPPING_LABELS: Record<string, string> = {
  processing: "در حال آماده‌سازی",
  shipped: "ارسال شد",
  delivered: "تحویل داده شد",
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  amount: number;
  items: unknown;
  payment_method: string;
  payment_status: string;
  shipping_status: string;
  receipt_path: string | null;
  card_tracking_number: string | null;
  created_at: string;
};

function AdminOrders() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [receiptUrls, setReceiptUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/login" });
      } else {
        setCheckingAuth(false);
        void loadOrders();
      }
    });
  }, [navigate]);

  async function loadOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("خطا در بارگذاری سفارش‌ها: " + error.message);
    } else {
      setOrders((data as Order[]) ?? []);
    }
    setLoading(false);
  }

  async function updateShippingStatus(id: string, status: string) {
    const { error } = await supabase
      .from("orders")
      .update({ shipping_status: status })
      .eq("id", id);
    if (error) {
      toast.error("خطا در تغییر وضعیت: " + error.message);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, shipping_status: status } : o)));
    toast.success("وضعیت ارسال بروزرسانی شد");
  }

  async function confirmCardPayment(id: string) {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("id", id);
    if (error) {
      toast.error("خطا: " + error.message);
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, payment_status: "paid" } : o)),
    );
    toast.success("پرداخت تأیید شد");
  }

  async function toggleExpand(order: Order) {
    if (expandedId === order.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(order.id);
    if (order.receipt_path && !receiptUrls[order.id]) {
      const { data, error } = await supabase.storage
        .from("receipts")
        .createSignedUrl(order.receipt_path, 60 * 60);
      if (!error && data) {
        setReceiptUrls((prev) => ({ ...prev, [order.id]: data.signedUrl }));
      }
    }
  }

  if (checkingAuth) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center text-muted-foreground">
        در حال بررسی ورود...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">مدیریت سفارش‌ها</h1>
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-gold">
          مدیریت محصولات
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">در حال بارگذاری...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-muted-foreground">هنوز سفارشی ثبت نشده است.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded p-4">
              <div
                className="flex flex-wrap items-center justify-between gap-3 cursor-pointer"
                onClick={() => void toggleExpand(order)}
              >
                <div>
                  <p className="font-bold">
                    {order.order_number} — {order.customer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString("fa-IR")}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span>{order.amount?.toLocaleString("fa-IR")} تومان</span>
                  <span
                    className={
                      order.payment_status === "paid"
                        ? "text-green-600"
                        : order.payment_status === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }
                  >
                    {PAYMENT_LABELS[order.payment_status] ?? order.payment_status}
                  </span>
                </div>
              </div>

              {expandedId === order.id && (
                <div className="mt-4 pt-4 border-t space-y-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">تلفن: </span>
                    {order.phone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">آدرس: </span>
                    {order.city} - {order.address} (کدپستی: {order.postal_code})
                  </p>
                  <div>
                    <span className="text-muted-foreground">اقلام سفارش: </span>
                    <ul className="list-disc pr-5 mt-1">
                      {Array.isArray(order.items) &&
                        (order.items as Array<{ name: string; size?: string; qty: number }>).map(
                          (item, i) => (
                            <li key={i}>
                              {item.name} {item.size ? `(${item.size})` : ""} × {item.qty}
                            </li>
                          ),
                        )}
                    </ul>
                  </div>

                  {order.payment_method === "card_transfer" && (
                    <div className="space-y-2">
                      <p>
                        <span className="text-muted-foreground">شماره پیگیری کارت‌به‌کارت: </span>
                        {order.card_tracking_number}
                      </p>
{receiptUrls[order.id] ? (
                        <button
                          type="button"
                          onClick={() => window.open(receiptUrls[order.id], "_blank")}
                          className="text-gold underline"
                        >
                          مشاهده تصویر رسید
                        </button>
                      ) : (
                        <p className="text-muted-foreground">در حال بارگذاری رسید...</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
  <span className="text-muted-foreground">وضعیت ارسال: </span>
  <select
    value={order.shipping_status}
    disabled={
      order.payment_method === "card_transfer" &&
      order.payment_status === "awaiting_verification"
    }
    onClick={(e) => e.stopPropagation()}
    onChange={(e) => void updateShippingStatus(order.id, e.target.value)}
    className="border rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {Object.entries(SHIPPING_LABELS).map(([value, label]) => (
      <option key={value} value={value}>
        {label}
      </option>
    ))}
  </select>
  {order.payment_method === "card_transfer" &&
    order.payment_status === "awaiting_verification" && (
      <span className="text-xs text-muted-foreground">
        (ابتدا پرداخت را تأیید کنید)
      </span>
    )}
</div>

                  {order.payment_method === "card_transfer" &&
                    order.payment_status === "awaiting_verification" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void confirmCardPayment(order.id);
                        }}
                        className="bg-black text-white px-4 py-2 rounded text-sm"
                      >
                        تأیید پرداخت کارت‌به‌کارت
                      </button>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}