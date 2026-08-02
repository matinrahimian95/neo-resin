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
            آثار رزین دست‌ساز؛ ساخته‌شده با دست، با تمرکز بر تمیزی، ظرافت و دقت در جزئیات.
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
              <a
                href="https://instagram.com/neo_resin_"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="transition-colors hover:text-gold"
              >
                @neo_resin_
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-gold" />
              <a href="tel:+989370956690" dir="ltr" className="transition-colors hover:text-gold">
                0937 095 6690
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-gold" />
              <a
                href="https://wa.me/989370956690"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold"
              >
                واتساپ
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-gold" />
              <a
                href="mailto:matinrahimian95@gmail.com"
                dir="ltr"
                className="transition-colors hover:text-gold"
              >
                matinrahimian95@gmail.com
              </a>
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