import trayImg from "@/assets/cat-tray.jpg";
import clockImg from "@/assets/cat-clock.jpg";
import jewelryImg from "@/assets/cat-jewelry.jpg";
import accessoriesImg from "@/assets/cat-accessories.jpg";
import customImg from "@/assets/cat-custom.jpg";
import heroImg from "@/assets/hero.jpg";
import textureImg from "@/assets/texture.jpg";
import artistImg from "@/assets/artist.jpg";

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

export type Product = {
  id: string;
  name: string;
  category: CategorySlug;
  price: number;
  image: string;
  description: string;
  featured?: boolean;
  gallery?: string[];
  sizes?: { label: string; multiplier: number }[];
  details?: string[];
};

const defaultSizes = [
  { label: "کوچک", multiplier: 0.8 },
  { label: "متوسط", multiplier: 1 },
  { label: "بزرگ", multiplier: 1.35 },
];

const baseProducts: Product[] = [
  {
    id: "tray-noir",
    name: "سینی نوآر طلاکوب",
    category: "trays",
    price: 4850000,
    image: trayImg,
    description: "سینی رزین دست‌ساز با رگه‌های ورق طلا و دستگیره برنجی، مناسب پذیرایی رسمی.",
    featured: true,
  },
  {
    id: "clock-eclipse",
    name: "ساعت اکلیپس",
    category: "clocks",
    price: 6200000,
    image: clockImg,
    description: "ساعت دیواری گرد با بستر مشکی مات و جریان‌های طلایی، موتور بی‌صدا.",
    featured: true,
  },
  {
    id: "jewel-drop",
    name: "ست آویز قطره طلا",
    category: "jewelry",
    price: 1980000,
    image: jewelryImg,
    description: "گردنبند و گوشواره رزین شفاف با پولک‌های طلا و بندهای استیل طلایی.",
    featured: true,
  },
  {
    id: "acc-coaster",
    name: "ست زیرلیوانی مرمر شب",
    category: "accessories",
    price: 1450000,
    image: accessoriesImg,
    description: "چهار زیرلیوانی رزین با لبه‌های طلایی و پایه نمدی.",
    featured: true,
  },
  {
    id: "custom-piece",
    name: "سفارش اختصاصی رزین",
    category: "custom",
    price: 7500000,
    image: customImg,
    description: "طراحی و اجرای اثر سفارشی بر اساس ابعاد، رنگ و ایده شما.",
  },
  {
    id: "tray-petite",
    name: "سینی کوچک آتلیه",
    category: "trays",
    price: 2650000,
    image: trayImg,
    description: "سینی جمع‌وجور برای میز کنسول یا سرو دسر، پرداخت آینه‌ای.",
  },
  {
    id: "clock-minimal",
    name: "ساعت مینیمال طلا",
    category: "clocks",
    price: 4300000,
    image: clockImg,
    description: "طرح ساده با ایندکس‌های طلایی و بستر رزین شب‌رنگ.",
  },
  {
    id: "acc-keyring",
    name: "جاکلیدی رزین طلا",
    category: "accessories",
    price: 620000,
    image: accessoriesImg,
    description: "جاکلیدی دست‌ساز با حلقه طلایی و رزین مشکی براق.",
  },
];

export const featuredProducts = products.filter((p) => p.featured);

export const formatPrice = (value: number) =>
  `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;