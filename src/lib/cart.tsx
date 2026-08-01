import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { products, type Product } from "./products";

export type CartLine = { id: string; qty: number; size?: string };

export type CartItem = {
  key: string;
  product: Product;
  qty: number;
  size?: string;
  unitPrice: number;
};

export const lineKey = (id: string, size?: string) => `${id}::${size ?? ""}`;

type CartContextValue = {
  lines: CartLine[];
  items: CartItem[];
  count: number;
  total: number;
  add: (id: string, qty?: number, size?: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "neo-resin-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const add = useCallback((id: string, qty = 1, size?: string) => {
    setLines((prev) => {
      const key = lineKey(id, size);
      const found = prev.find((l) => lineKey(l.id, l.size) === key);
      if (found)
        return prev.map((l) =>
          lineKey(l.id, l.size) === key ? { ...l, qty: l.qty + qty } : l,
        );
      return [...prev, { id, qty, size }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => lineKey(l.id, l.size) !== key)
        : prev.map((l) => (lineKey(l.id, l.size) === key ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => lineKey(l.id, l.size) !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const items: CartItem[] = lines
      .map((l) => {
        const product = products.find((p) => p.id === l.id);
        if (!product) return null;
        const multiplier =
          product.sizes?.find((s) => s.label === l.size)?.multiplier ?? 1;
        return {
          key: lineKey(l.id, l.size),
          product,
          qty: l.qty,
          size: l.size,
          unitPrice: Math.round(product.price * multiplier),
        };
      })
      .filter(Boolean) as CartItem[];
    return {
      lines,
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.unitPrice, 0),
      add,
      setQty,
      remove,
      clear,
    };
  }, [lines, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}