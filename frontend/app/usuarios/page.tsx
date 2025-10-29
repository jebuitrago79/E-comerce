"use client";
import CrudPage from "@/components/CrudPage";

export default function UsuariosPage() {
  return (
    <CrudPage
      config={{
        title: "Usuarios",
        listUrl: "/usuarios/?limit=100&offset=0",
        createUrl: "/usuarios/",
        deleteUrl: (id) => `/usuarios/${id}`,
        fields: [
          { name: "nombre", label: "Nombre", required: true },
          { name: "email", label: "Email", required: true },
          { name: "password", label: "Password", required: true, type: "password" },
        ],
      }}
    />
  );
}
