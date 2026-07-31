import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
        <div>
          <p className="text-xl font-extrabold text-gold-gradient">Neo_resin</p>
          <p className="mt-1 text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
            Handcrafted Resin Art
          </p>
          <p className="mt-4 max-w-xs text-sm leading-7 text-muted-foreground">
            آثار رزین دست‌ساز، ساخته‌شده در آتلیه‌ای کوچک با وسواس یک جواهرساز و زبان طراحی سیاه و
            طلا.
          </p>
        </div>

        <div className="text-sm">
          <p className="mb-4 font-bold text-foreground">دسترسی سریع</p>
          <ul className="space-y-3 text-muted-foreground">
            <li>
              <Link to="/shop" className="transition-colors hover:text-gold">
                فروشگاه
              </Link>
            </li>
            <li>
              <Link to="/custom-orders" className="transition-colors hover:text-gold">
                سفارش اختصاصی
              </Link>
            </li>
            <li>
              <Link to="/faq" className="transition-colors hover:text-gold">
                سوالات متداول
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-gold">
                تماس با ما
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-4 font-bold text-foreground">ارتباط</p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Instagram className="size-4 shrink-0 text-gold" />
              <span dir="ltr">@neo_resin</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-gold" />
              <span dir="ltr">+98 912 000 0000</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-gold" />
              <span dir="ltr">hello@neoresin.art</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 px-5 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Neo_resin — تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}