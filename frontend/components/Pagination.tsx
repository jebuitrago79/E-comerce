"use client";
export default function Pagination({
  page, pageSize, total, onPage,
}: { page: number; pageSize: number; total?: number; onPage: (p:number)=>void; }) {
  const prev = () => onPage(Math.max(1, page - 1));
  const next = () => onPage(page + 1);
  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      {typeof total === "number" && (
        <span className="mr-2 text-xs text-slate-500">
          {(page - 1) * pageSize + 1}–{page * pageSize} {total ? `de ~${total}` : ""}
        </span>
      )}
      <button className="btn-primary !bg-slate-200 !text-slate-800 hover:!bg-slate-300" onClick={prev}>Anterior</button>
      <button className="btn-primary" onClick={next}>Siguiente</button>
    </div>
  );
}
