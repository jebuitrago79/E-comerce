import React from "react";

export default function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="bg-white/95 rounded-2xl border border-slate-200 shadow-sm 
                 shadow-slate-900/5 hover:shadow-xl hover:shadow-indigo-500/10 
                 hover:-translate-y-0.5 transition-all duration-200 p-5"
    >
      <h2 className="text-lg font-semibold text-slate-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}
