import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const product = {
      name: String(form.get("name")),
      price: Number(form.get("price")),
      description: String(form.get("description")),
      image_url: "",
    };

    setLoading(true);

    const { error } = await supabase
      .from("products")
      .insert(product);

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }

    toast.success("محصول با موفقیت ثبت شد");

    e.currentTarget.reset();
  }

  return (
    <div className="max-w-3xl mx-auto p-10">

      <h1 className="text-3xl font-bold mb-8">
        مدیریت محصولات
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <input
          name="name"
          placeholder="نام محصول"
          className="w-full border p-3 rounded"
          required
        />

        <input
          name="price"
          placeholder="قیمت"
          type="number"
          className="w-full border p-3 rounded"
          required
        />

        <textarea
          name="description"
          placeholder="توضیحات"
          className="w-full border p-3 rounded"
        />

        <input
          type="file"
          className="w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded"
        >
          {loading ? "در حال ثبت..." : "ثبت محصول"}
        </button>

      </form>

    </div>
  );
}
