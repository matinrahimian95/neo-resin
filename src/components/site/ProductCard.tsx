import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatPrice, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <article className="group overflow-hidden rounded-sm hairline bg-card/60 transition-all duration-500 hover:shadow-lux">
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={900}
            height={1100}
            className="size-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 veil opacity-70" />
        </div>
      </Link>
      <div className="space-y-3 p-5">
        <h3 className="text-base font-bold text-foreground">
          <Link to="/product/$id" params={{ id: product.id }} className="hover:text-gold">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-xs leading-6 text-muted-foreground">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-sm font-bold text-gold">{formatPrice(product.price)}</span>
          <button
            type="button"
            onClick={() => {
              add(product.id);
              toast.success("به سبد خرید اضافه شد", { description: product.name });
            }}
            className="rounded-sm bg-gold-gradient px-4 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            افزودن به سبد
          </button>
        </div>
      </div>
    </article>
  );
}