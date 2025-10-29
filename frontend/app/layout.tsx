import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

export const metadata = { title: "E-commerce" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900">
        <Providers>
          <Navbar />
          <main className="max-w-6xl mx-auto p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
