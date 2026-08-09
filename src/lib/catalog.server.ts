import type { Product, Review, CategorySlug, ProductSize } from "./products";
import { resolveImage } from "./products";
import { createPublicServerClient } from "./supabase-public.server";

const SELECT =
  "id, slug, title, description, long_description, price, category, stock, image_key, gallery, sizes, dimensions_cm, weight_grams, material, prep_days, features, featured, sort_order";

type Row = {
  slug: string;
  title: string;
  description: string;
  long_description: string;
  price: number;
  category: string;
  stock: number;
  image_key: string;
  gallery: unknown;
  sizes: unknown;
  dimensions_cm: unknown;
  weight_grams: number | null;
  material: string | null;
  prep_days: number | null;
  features: unknown;
  featured: boolean;
};

export function mapProduct(row: Row): Product {
  const gallery = (Array.isArray(row.gallery) ? (row.gallery as string[]) : []).map(resolveImage);
  return {
    id: row.slug,
    name: row.title,
    category: row.category as CategorySlug,
    price: row.price,
    image: resolveImage(row.image_key),
    description: row.description,
    longDescription: row.long_description || row.description,
    stock: row.stock,
    featured: row.featured,
    gallery: gallery.length ? gallery : [resolveImage(row.image_key)],
    sizes: (Array.isArray(row.sizes) ? (row.sizes as ProductSize[]) : []) ?? [],
    dimensions: (row.dimensions_cm as Record<string, string>) ?? {},
    weightGrams: row.weight_grams,
    material: row.material,
    prepDays: row.prep_days,
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .order("sort_order", { ascending: true });
  if (error) throw new Error("خواندن محصولات ناموفق بود.");
  return (data as unknown as Row[]).map(mapProduct);
}

export async function fetchProduct(slug: string): Promise<{ product: Product; reviews: Review[] } | null> {
  const supabase = createPublicServerClient();
  const { data } = await supabase.from("products").select(SELECT).eq("slug", slug).maybeSingle();
  if (!data) return null;
  const row = data as unknown as Row & { id: string };
  const { data: reviewRows } = await supabase
    .from("product_reviews")
    .select("id, author_name, rating, body, created_at")
    .eq("product_id", row.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(50);
  const reviews: Review[] = (reviewRows ?? []).map((r) => ({
    id: r.id,
    authorName: r.author_name,
    rating: r.rating,
    body: r.body,
    createdAt: r.created_at,
  }));
  return { product: mapProduct(row), reviews };
}

export async function insertReview(input: {
  slug: string;
  authorName: string;
  rating: number;
  body: string;
}) {
  const supabase = createPublicServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("slug", input.slug)
    .maybeSingle();
  if (!product) throw new Error("محصول پیدا نشد.");
  const { error } = await supabase.from("product_reviews").insert({
    product_id: product.id,
    author_name: input.authorName,
    rating: input.rating,
    body: input.body,
    is_approved: false,
  });
  if (error) throw new Error("ثبت نظر ناموفق بود.");
  return { ok: true as const };
}