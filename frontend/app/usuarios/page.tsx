import CrudPage from "@/components/CrudPage";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID;

export default function UsuariosPage() {
  return (
    <CrudPage
      title="Usuarios"
      queryKey="usuarios"
      // baseUrl={`/tenants/${TENANT}/usuarios`}
      baseUrl={`/usuarios`}
      listParams="?limit=50&offset=0"
      fields={[
        { key: "nombre", label: "Nombre", required: true },
        { key: "correo", label: "Correo" },      // o "email" según tu modelo
        // Si tu backend espera "password" al crear (y NO lo devuelve al listar),
        // puedes mantenerlo aquí y el backend simplemente lo ignorará en listado.
        { key: "password", label: "Contraseña" }, // si tu create la usa
      ]}
      // Opcional: encripta/transforma antes de enviar
      buildCreatePayload={(data) => {
        if (!data.password) return data;
        // ejemplo: renombrar "password" a "password_plain" si tu API lo espera
        return { ...data /*, password_plain: data.password */ };
      }}
      buildUpdatePayload={(data) => {
        // si no quieres enviar password en updates vacía:
        const copy = { ...data };
        if (!copy.password) delete copy.password;
        return copy;
      }}
    />
  );
}
