import { fetchProducts } from "./catalog.server";
import type { CustomerInput } from "./orders.schema";

export type PricedItem = {
  id: string;
  name: string;
  qty: number;
  size?: string;
  unitPrice: number;
};

/** قیمت‌ها همیشه سمت سرور از روی کاتالوگ دیتابیس محاسبه می‌شوند، نه از ورودی کاربر. */
export async function priceLines(
  lines: CustomerInput["lines"],
): Promise<{ items: PricedItem[]; amount: number }> {
  const products = await fetchProducts();
  const items: PricedItem[] = lines.map((line) => {
    const product = products.find((p) => p.id === line.id);
    if (!product) throw new Error(`محصول نامعتبر: ${line.id}`);
    if (product.stock <= 0) throw new Error(`«${product.name}» در حال حاضر ناموجود است.`);
    if (line.qty > product.stock) {
      throw new Error(`موجودی «${product.name}» کمتر از تعداد درخواستی است.`);
    }
    const multiplier = product.sizes?.find((s) => s.label === line.size)?.multiplier ?? 1;
    return {
      id: product.id,
      name: product.name,
      qty: line.qty,
      ...(line.size ? { size: line.size } : {}),
      unitPrice: Math.round(product.price * multiplier),
    };
  });
  const amount = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  if (amount <= 0) throw new Error("مبلغ سفارش نامعتبر است.");
  return { items, amount };
}

export function orderRow(input: CustomerInput, items: PricedItem[], amount: number) {
  return {
    customer_name: input.customerName,
    phone: input.phone,
    email: input.email || null,
    city: input.city,
    postal_code: input.postalCode,
    address: input.address,
    note: input.note || null,
    items,
    amount,
  };
}

export function decodeBase64(data: string): { bytes: Uint8Array; contentType: string } {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(data);
  const contentType = match?.[1] ?? "image/jpeg";
  const raw = match?.[2] ?? data;
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  if (bytes.length > 5 * 1024 * 1024) throw new Error("حجم تصویر رسید بیش از ۵ مگابایت است.");
  if (!contentType.startsWith("image/") && contentType !== "application/pdf") {
    throw new Error("فرمت رسید باید تصویر یا PDF باشد.");
  }
  return { bytes, contentType };
}
