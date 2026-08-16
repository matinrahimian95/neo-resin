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
  created_at: string;
};

function AdminCustomOrders() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});

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
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div>
                  <p className="font-bold">
                    {order.customer_name} — {order.item_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString("fa-IR")}
                  </p>
                </div>
                <span className="text-sm text-gold">{STATUS_LABELS[order.status] ?? order.status}</span>
              </div>

              {expandedId === order.id && (
                <div className="mt-4 pt-4 border-t space-y-3 text-sm">
                  <p><span className="text-muted-foreground">تلفن: </span>{order.phone}</p>
                  <p><span className="text-muted-foreground">ابعاد: </span>{order.size || "ذکر نشده"}</p>
                  <p><span className="text-muted-foreground">توضیح ایده: </span>{order.idea_description}</p>
                  {order.quoted_price && (
                    <p><span className="text-muted-foreground">قیمت اعلام‌شده: </span>{order.quoted_price.toLocaleString("fa-IR")} تومان</p>
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