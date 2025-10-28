export function errorToText(err: any): string {
  const data = err?.response?.data;
  if (!data) return err?.message || "Error de red";

  // FastAPI 422 (lista de issues)
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((d: any) => {
        const loc = Array.isArray(d.loc) ? d.loc.join(".") : d.loc;
        return `${loc}: ${d.msg}`;
      })
      .join(" | ");
  }
  if (typeof data.detail === "string") return data.detail;
  if (typeof data === "string") return data;

  return "Error inesperado";
}
