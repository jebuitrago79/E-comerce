import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

export const metadata = { title: "E-commerce" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Contenedor tipo dashboard */}
            <main className="flex-1 flex items-stretch justify-center px-4 py-8">
              <div className="w-full max-w-6xl bg-slate-50 text-slate-900 rounded-3xl shadow-2xl shadow-slate-950/40 border border-white/10 backdrop-blur-md px-6 py-8">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
