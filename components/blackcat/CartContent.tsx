"use client";

// components/blackcat/CartContent.tsx
// Global cart state — persisted to localStorage.
// Wraps the entire Black Cat layout so every page can read/write cart.

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CartItem {
  id: string;            // productId + size = unique key
  productId: string;
  slug: string;
  title: string;
  price: number;
  size: string;          // "N/A" for non-apparel
  image?: string;        // CDN URL of front image
  stripePriceId: string;
  quantity: number;
  inventory: number;     // cap adds at this number
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem:    (item: Omit<CartItem, "id" | "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty:  (id: string, qty: number) => void;
  clearCart:  () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "bca_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const addItem = useCallback((incoming: Omit<CartItem, "id" | "quantity">) => {
    const id = `${incoming.productId}__${incoming.size}`;
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        // Increment up to inventory cap
        return prev.map(i =>
          i.id === id
            ? { ...i, quantity: Math.min(i.quantity + 1, i.inventory) }
            : i
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
    <CartContext.Provider value={{ items, count, subtotal, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}