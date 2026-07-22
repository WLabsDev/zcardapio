"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/mock/types";

export type SelectedOption = {
  groupName: string;
  name: string;
  price: number;
};

export type CartItem = {
  /** identifica a linha: mesmo produto com opções diferentes vira outra linha */
  key: string;
  product: Product;
  quantity: number;
  notes?: string;
  options: SelectedOption[];
};

export function itemUnitPrice(item: CartItem) {
  return item.product.price + item.options.reduce((a, o) => a + o.price, 0);
}

type CartContextValue = {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity: number,
    notes?: string,
    options?: SelectedOption[]
  ) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredItems(storageKey: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({
  restaurantSlug,
  children,
}: {
  restaurantSlug: string;
  children: React.ReactNode;
}) {
  const storageKey = `zcardapio:cart:${restaurantSlug}`;
  const [items, setItems] = useState<CartItem[]>(() =>
    readStoredItems(storageKey)
  );

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // localStorage indisponível (modo privado etc.) — carrinho segue apenas em memória
    }
  }, [storageKey, items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (
      product: Product,
      quantity: number,
      notes?: string,
      options: SelectedOption[] = []
    ) => {
      const key = [
        product.id,
        options.map((o) => o.name).join("|"),
        notes ?? "",
      ].join("::");
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { key, product, quantity, notes, options }];
      });
    };

    const removeItem = (key: string) =>
      setItems((prev) => prev.filter((i) => i.key !== key));

    const updateQuantity = (key: string, quantity: number) =>
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.key !== key)
          : prev.map((i) => (i.key === key ? { ...i, quantity } : i))
      );

    const total = items.reduce(
      (acc, i) => acc + itemUnitPrice(i) * i.quantity,
      0
    );
    const count = items.reduce((acc, i) => acc + i.quantity, 0);

    return {
      items,
      addItem,
      removeItem,
      updateQuantity,
      clear: () => setItems([]),
      total,
      count,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
