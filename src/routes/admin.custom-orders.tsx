import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCustomOrders, updateCustomOrder } from "@/lib/custom-orders.functions";

export const Route = createFileRoute("/admin/custom-orders")({
  component: AdminCustomOrders,
});

const STATUS_LABELS: Record<string, string> = {
  new: "درخواست جدید",
  quoted: "قیمت اعلام شد",
  accepted: "پذیرفته شد",
  rejected: "رد شد",
};

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "پرداخت نشده",
  awaiting_payment: "در انتظار پرداخت",
  awaiting_verification: "در انتظار تأیید پرداخت",
  paid: "پرداخت موفق",
  failed: "پرداخت ناموفق",
};

const PRODUCTION_LABELS: Record<string, string> = {
  in_production: "در حال ساخت",
  shipped: "ارسال شد",
  delivered: "تحویل داده شد",
};

type CustomOrder = {
  id: string;
  customer_name: string;
  phone: string;
  item_type: string;
  size: string | null;
  idea_description: string;
  status: string;
  quoted_price: number | null;
  admin_note: string | null;
  customer_note: string | null;
  created_at: string;
  payment_status: string;
  payment_method: string | null;
  receipt_path: string | null;
  card_tracking_number: string | null;
  gateway_ref_id: string | null;
  production_status: string | null;
  city: string | null;
  address: string | null;
  postal_code: string | null;
};

function AdminCustomOrders() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
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
    try {
      const res = await getCustomOrders();
      setOrders(res.orders as CustomOrder[]);
    } catch {
      toast.error("خطا در بارگذاری سفارش‌های اختصاصی");
    }
    setLoading(false);
  }

  async function submitQuote(id: string) {
    const priceStr = priceInputs[id];
    const price = Number(priceStr);
    if (!priceStr || Number.isNaN(price) || price <= 0) {
      toast.error("قیمت معتبر وارد کنید.");
      return;
    }
    try {
      await updateCustomOrder({ data: { id, quotedPrice: price, status: "quoted" } });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, quoted_price: price, status: "quoted" } : o)),
      );
      toast.success("قیمت ثبت شد");
    } catch {
      toast.error("خطا در ثبت قیمت");
    }
  }

  async function changeStatus(id: string, status: string) {
    try {
      await updateCustomOrder({ data: { id, status } });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success("وضعیت بروزرسانی شد");
    } catch {
      toast.error("خطا در تغییر وضعیت");
    }
  }

  async function confirmCardPayment(id: string) {
    const { error } = await supabase
      .from("custom_orders")
      .update({ payment_status: "paid", production_status: "in_production" })
      .eq("id", id);
    if (error) {
      toast.error("خطا: " + error.message);
      return;
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, payment_status: "paid", production_status: "in_production" } : o,
      ),
    );
    toast.success("پرداخت تأیید شد");
  }

  async function updateProductionStatus(id: string, status: string) {
    const { error } = await supabase
      .from("custom_orders")
      .update({ production_status: status })
      .eq("id", id);
    if (error) {
      toast.error("خطا: " + error.message);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, production_status: status } : o)));
    toast.success("وضعیت ساخت بروزرسانی شد");
  }

  async function toggleExpand(order: CustomOrder) {
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
        <h1 className="text-3xl font-bold">سفارش‌های اختصاصی</h1>
        <Link to="/admin/orders" className="text-sm text-muted-foreground hover:text-gold">
          مدیریت سفارش‌ها
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">در حال بارگذاری...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-muted-foreground">هنوز درخواستی ثبت نشده است.</p>
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
                    {order.customer_name} — {order.item_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString("fa-IR")}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gold">{STATUS_LABELS[order.status] ?? order.status}</span>
                  {order.status === "accepted" && (
                    <span
                      className={
                        order.payment_status === "paid" ? "text-green-600" : "text-yellow-600"
                      }
                    >
                      {PAYMENT_LABELS[order.payment_status] ?? order.payment_status}
                    </span>
                  )}
                </div>
              </div>

              {expandedId === order.id && (
                <div className="mt-4 pt-4 border-t space-y-3 text-sm">
                  <p><span className="text-muted-foreground">تلفن: </span>{order.phone}</p>
                  <p><span className="text-muted-foreground">ابعاد: </span>{order.size || "ذکر نشده"}</p>
                  <p><span className="text-muted-foreground">توضیح ایده: </span>{order.idea_description}</p>
                  {order.quoted_price && (
                    <p><span className="text-muted-foreground">قیمت اعلام‌شده: </span>{order.quoted_price.toLocaleString("fa-IR")} تومان</p>
                  )}
                  {order.customer_note && (
                    <p className="bg-muted/40 rounded p-2">
                      <span className="text-muted-foreground">نظر مشتری: </span>
                      {order.customer_note}
                    </p>
                  )}

                  {order.status === "accepted" && (
                    <div className="space-y-3 bg-muted/20 rounded p-3">
                      {order.city && (
                        <p>
                          <span className="text-muted-foreground">آدرس: </span>
                          {order.city} - {order.address} (کدپستی: {order.postal_code})
                        </p>
                      )}
                      <p>
                        <span className="text-muted-foreground">روش پرداخت: </span>
                        {order.payment_method === "online" ? "درگاه آنلاین" : "کارت‌به‌کارت"}
                      </p>

                      {order.payment_method === "card_transfer" && (
                        <div className="space-y-2">
                          <p>
                            <span className="text-muted-foreground">شماره پیگیری: </span>
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

                      {order.payment_method === "card_transfer" &&
                        order.payment_status === "awaiting_verification" && (
                          <button
                            onClick={() => void confirmCardPayment(order.id)}
                            className="bg-black text-white px-4 py-2 rounded text-sm"
                          >
                            تأیید پرداخت کارت‌به‌کارت
                          </button>
                        )}

                      {order.payment_status === "paid" && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">وضعیت ساخت: </span>
                          <select
                            value={order.production_status ?? "in_production"}
                            onChange={(e) => void updateProductionStatus(order.id, e.target.value)}
                            className="border rounded p-1"
                          >
                            {Object.entries(PRODUCTION_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      placeholder="قیمت (تومان)"
                      value={priceInputs[order.id] ?? ""}
                      onChange={(e) => setPriceInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                      className="border rounded p-2 w-40"
                    />
                    <button
                      onClick={() => void submitQuote(order.id)}
                      className="bg-black text-white px-4 py-2 rounded text-sm"
                    >
                      ثبت قیمت
                    </button>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-muted-foreground">وضعیت: </span>
                    <select
                      value={order.status}
                      onChange={(e) => void changeStatus(order.id, e.target.value)}
                      className="border rounded p-1"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
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