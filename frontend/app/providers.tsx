"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { CartProvider } from "@/app/context/CartContext";
 // 👈 IMPORTANTE

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <CartProvider>   {/* 👈 Aquí activamos el carrito global */}
        {children}
      </CartProvider>
    </QueryClientProvider>
  );
}
