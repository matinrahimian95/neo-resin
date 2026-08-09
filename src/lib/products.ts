import trayImg from "@/assets/cat-tray.jpg";
import clockImg from "@/assets/cat-clock.jpg";
import jewelryImg from "@/assets/cat-jewelry.jpg";
import accessoriesImg from "@/assets/cat-accessories.jpg";
import customImg from "@/assets/cat-custom.jpg";
import heroImg from "@/assets/hero.jpg";
import textureImg from "@/assets/texture.jpg";
import artistImg from "@/assets/artist.jpg";

/** کلید تصویر در دیتابیس → فایل واقعی داخل باندل */
export const imageMap: Record<string, string> = {
  tray: trayImg,
  clock: clockImg,
  jewelry: jewelryImg,
  accessories: accessoriesImg,
  custom: customImg,
  hero: heroImg,
  texture: textureImg,
  artist: artistImg,
};

export const resolveImage = (key: string) => imageMap[key] ?? heroImg;

export type CategorySlug = "trays" | "clocks" | "jewelry" | "accessories" | "custom";

export type Category = {
  slug: CategorySlug;
  title: string;
  caption: string;
  image: string;
};

export const categories: Category[] = [
  { slug: "trays", title: "سینی‌های رزین", caption: "شکوه طلا بر بستر شب", image: trayImg },
  { slug: "clocks", title: "ساعت‌های دیواری", caption: "زمان، دست‌ساز و بی‌تکرار", image: clockImg },
  { slug: "jewelry", title: "زیورآلات", caption: "جواهری از جنس هنر", image: jewelryImg },
  {
    slug: "accessories",
    title: "اکسسوری",
    caption: "جزئیاتی که دیده می‌شوند",
    image: accessoriesImg,
  },
  { slug: "custom", title: "سفارش اختصاصی", caption: "اثری تنها برای شما", image: customImg },
];

export type ProductSize = { label: string; multiplier: number };

export type Product = {
  id: string;
  name: string;
  category: CategorySlug;
  price: number;
  image: string;
  description: string;
  longDescription: string;
  stock: number;
  featured: boolean;
  gallery: string[];
  sizes: ProductSize[];
  dimensions: Record<string, string>;
  weightGrams: number | null;
  material: string | null;
  prepDays: number | null;
  features: string[];
};

export type Review = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
};

export const stockLabel = (stock: number) =>
  stock <= 0 ? "ناموجود" : stock <= 3 ? `تنها ${stock} عدد باقی مانده` : "موجود در انبار";

export const formatPrice = (value: number) =>
  `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;