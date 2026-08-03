import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  return (
    <div className="max-w-3xl mx-auto p-10">

      <h1 className="text-3xl font-bold mb-8">
        مدیریت محصولات
      </h1>

      <form className="space-y-5">

        <input
          placeholder="نام محصول"
          className="w-full border p-3 rounded"
        />

        <input
          placeholder="قیمت"
          className="w-full border p-3 rounded"
        />

        <textarea
          placeholder="توضیحات"
          className="w-full border p-3 rounded"
        />

        <input
          type="file"
        />

        <button
          type="submit"
          className="bg-black text-white px-6 py-3 rounded"
        >
          ثبت محصول
        </button>

      </form>

    </div>
  );
}
 
