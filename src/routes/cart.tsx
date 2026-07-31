import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سبد خرید | نئو رزین" },
      { name: "description", content: "بررسی و ویرایش آثار انتخاب‌شده پیش از تکمیل سفارش." },
      { property: "og:title", content: "سبد خرید | نئو رزین" },
      { property: "og:description", content: "سبد خرید آثار رزین دست‌ساز نئو رزین." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, total, setQty, remove } = useCart();

  return (
    <section className="section-y mx-auto max-w-5xl px-5 md:px-8">
      <SectionHeading eyebrow="Cart" title="سبد خرید" />

      {items.length === 0 ? (
        <div className="mt-12 rounded-sm hairline p-12 text-center">
          <p className="text-sm text-muted-foreground">سبد خرید شما خالی است.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-sm bg-gold-gradient px-7 py-3.5 text-sm font-bold text-primary-foreground"
          >
            رفتن به فروشگاه
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ul className="space-y-4">
            {items.map(({ product, qty }) => (
              <li
                key={product.id}
                className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-4 rounded-sm hairline p-4"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  width={900}
                  height={1100}
                  className="size-20 rounded-sm object-cover"
                />
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate text-sm font-bold">{product.name}</h3>
                    <button
                      type="button"
                      aria-label="حذف"
                      onClick={() => remove(product.id)}
                      className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gold">{formatPrice(product.price)}</p>
                  <div className="mt-3 inline-flex items-center gap-3 rounded-sm hairline px-2 py-1">
                    <button
                      type="button"
                      aria-label="کاهش"
                      onClick={() => setQty(product.id, qty - 1)}
                      className="grid size-6 place-items-center text-muted-foreground hover:text-gold"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-6 text-center text-sm font-bold">{qty}</span>
                    <button
                      type="button"
                      aria-label="افزایش"
                      onClick={() => setQty(product.id, qty + 1)}
                      className="grid size-6 place-items-center text-muted-foreground hover:text-gold"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-sm hairline bg-card/50 p-6">
            <h2 className="text-sm font-extrabold">خلاصه سفارش</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>جمع آثار</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>ارسال</dt>
                <dd>رایگان</dd>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-3 font-bold">
                <dt>مبلغ نهایی</dt>
                <dd className="text-gold">{formatPrice(total)}</dd>
              </div>
            </dl>
            <Link
              to="/checkout"
              className="mt-6 block rounded-sm bg-gold-gradient py-3.5 text-center text-sm font-bold text-primary-foreground"
            >
              تکمیل خرید
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}