import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart";

const nav = [
  { to: "/", label: "خانه" },
  { to: "/shop", label: "فروشگاه" },
  { to: "/custom-orders", label: "سفارش اختصاصی" },
  { to: "/about", label: "درباره هنرمند" },
  { to: "/faq", label: "سوالات متداول" },
  { to: "/contact", label: "تماس" },
] as const;

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 md:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-gradient text-sm font-black text-primary-foreground">
            N
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-extrabold tracking-tight text-gold-gradient">
              Neo_resin
            </span>
            <span className="block truncate text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
              Handcrafted Resin Art
            </span>
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="text-sm text-muted-foreground transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/cart"
            aria-label="سبد خرید"
            className="relative grid size-10 place-items-center rounded-full hairline text-foreground transition-colors hover:text-gold"
          >
            <ShoppingBag className="size-4.5" />
            {count > 0 && (
              <span className="absolute -top-1.5 -left-1.5 grid size-5 place-items-center rounded-full bg-gold-gradient text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label="منو"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full hairline lg:hidden"
          >
            {open ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/60 px-5 py-3 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              className="block border-b border-border/40 py-3 text-sm text-muted-foreground last:border-0"
              activeProps={{ className: "text-gold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}