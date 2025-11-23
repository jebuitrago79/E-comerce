"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

export type CartItem = {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string;
  cantidad: number;
};

type CartContextType = {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, "cantidad">) => void;
  removeItem: (id: number) => void;
  updateCantidad: (id: number, cantidad: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, "cantidad">) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          cantidad: copy[idx].cantidad + 1,
        };
        console.log("CARRITO (update):", copy);
        return copy;
      }
      const nuevo = [...prev, { ...item, cantidad: 1 }];
      console.log("CARRITO (add):", nuevo);
      return nuevo;
    });
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateCantidad = (id: number, cantidad: number) => {
    if (cantidad <= 0) {
      setItems((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              cantidad,
            }
          : p
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + it.precio * it.cantidad, 0),
    [items]
  );

  const value: CartContextType = {
    items,
    total,
    addItem,
    removeItem,
    updateCantidad,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return ctx;
}
