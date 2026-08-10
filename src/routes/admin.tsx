import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

const categories = [
  { value: "trays", label: "سینی" },
  { value: "clocks", label: "ساعت" },
  { value: "jewelry", label: "زیورآلات" },
  { value: "accessories", label: "اکسسوری" },
  { value: "custom", label: "سفارش اختصاصی" },
  { value: "containers", label: "ظروف رزینی" },
  { value: "sweets", label: "شیرینی‌خوری" },
];

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/login" });
      } else {
        setCheckingAuth(false);
      }
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const file = form.get("image_file") as File | null;

    if (!title) {
      toast.error("نام محصول را وارد کنید.");
      return;
    }

    setLoading(true);

    let imageKey = "";

    if (file && file.size > 0) {
      const ext = file.name.split(".").pop();
      const path = `${slugify(title)}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file);

      if (uploadError) {
        setLoading(false);
        toast.error("خطا در آپلود عکس: " + uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      imageKey = publicUrlData.publicUrl;
    }

    const product = {
      title,
      slug: slugify(title),
      price: Number(form.get("price")) || 0,
      description: String(form.get("description") ?? ""),
      long_description: String(form.get("description") ?? ""),
      category: String(form.get("category") ?? "trays"),
      stock: Number(form.get("stock")) || 0,
      image_key: imageKey,
      sort_order: 0,
      featured: false,
      published: true,
    };

    const { error } = await supabase.from("products").insert(product);

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }

    toast.success("محصول با موفقیت ثبت شد");
    e.currentTarget.reset();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  if (checkingAuth) {
    return (
      <div className="max-w-3xl mx-auto p-10 text-center text-muted-foreground">
        در حال بررسی ورود...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">مدیریت محصولات</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-destructive"
        >
          خروج
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="title"
          placeholder="نام محصول"
          className="w-full border p-3 rounded"
          required
        />

        <input
          name="price"
          placeholder="قیمت (تومان)"
          type="number"
          className="w-full border p-3 rounded"
          required
        />

        <select name="category" className="w-full border p-3 rounded" required>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <input
          name="stock"
          placeholder="موجودی"
          type="number"
          defaultValue={1}
          className="w-full border p-3 rounded"
        />

        <textarea
          name="description"
          placeholder="توضیحات"
          className="w-full border p-3 rounded"
          rows={4}
        />

        <div>
          <label className="text-sm text-muted-foreground block mb-2">
            عکس محصول
          </label>
          <input
            name="image_file"
            type="file"
            accept="image/*"
            className="w-full border p-3 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded w-full"
        >
          {loading ? "در حال ثبت..." : "ثبت محصول"}
        </button>
      </form>
    </div>
  );
}
