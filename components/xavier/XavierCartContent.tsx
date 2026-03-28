"use client";

// components/xavier/XavierCartContent.tsx
// Global cart state for Xavier London Art — persisted to localStorage.

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface XavierCartItem {
  id: string;
  productId: string;
  slug: string;
  title: string;
  price: number;
  size: string;       // "N/A" for non-apparel
  image?: string;
  stripePriceId: string;
  quantity: number;
  inventory: number;
}

interface XavierCartContextValue {
  items: XavierCartItem[];
  count: number;
  subtotal: number;
  addItem:    (item: Omit<XavierCartItem, "id" | "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty:  (id: string, qty: number) => void;
  clearCart:  () => void;
}

const XavierCartContext = createContext<XavierCartContextValue | null>(null);

const STORAGE_KEY = "xavier_cart_v1";

export function XavierCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems]       = useState<XavierCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  const addItem = useCallback((incoming: Omit<XavierCartItem, "id" | "quantity">) => {
    const id = `${incoming.productId}__${incoming.size}`;
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i =>
          i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, i.inventory) } : i
        );
      }
      return [...prev, { ...incoming, id, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) { removeItem(id); return; }
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: Math.min(qty, i.inventory) } : i)
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const count    = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <XavierCartContext.Provider value={{ items, count, subtotal, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </XavierCartContext.Provider>
  );
}

export function useXavierCart() {
  const ctx = useContext(XavierCartContext);
  if (!ctx) throw new Error("useXavierCart must be used inside XavierCartProvider");
  return ctx;
}
