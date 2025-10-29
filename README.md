# 🛒 Proyecto Integrador — Plataforma E-commerce

## 📋 Descripción general
Este proyecto forma parte del **Proyecto Integrador del Programa de Ingeniería de Sistemas y Computación** de la **Universidad Católica de Colombia (2025)**.  
El objetivo es desarrollar una **plataforma de comercio electrónico** orientada a pequeños emprendimientos y microempresas (MIPYMES), que permita gestionar productos físicos y digitales mediante un sistema **seguro, modular y escalable**.

El proyecto combina **tecnología backend (FastAPI + PostgreSQL)** y **frontend (Next.js + Tailwind)** dentro de una arquitectura monolítica modular, desplegable en la nube.

---

## 🚀 Objetivo general
Desarrollar una API de comercio electrónico orientada a pequeños emprendimientos en Colombia, que permita la gestión de productos físicos y digitales, ofreciendo una alternativa **segura, confiable y accesible** frente a las plataformas informales de venta.

---

## 🎯 Objetivos específicos
- Documentar los requerimientos funcionales y no funcionales del sistema.  
- Implementar un **API RESTful** para registro de usuarios, gestión de productos y procesamiento de ventas.  
- Ejecutar **pruebas unitarias e integrales** para garantizar la estabilidad del sistema.  
- Desplegar el API en un entorno en la nube (Supabase / Azure for Students).  
- Integrar el frontend con el backend mediante rutas dinámicas y consumo de endpoints.  

---

## 🧩 Arquitectura del proyecto
La aplicación está estructurada bajo un modelo **monolítico modular cliente-servidor**, en el cual:
- El **backend (FastAPI)** expone los endpoints REST del sistema.  
- El **frontend (Next.js)** consume dichos endpoints para ofrecer una interfaz web moderna y funcional.  

E-commerce/
│
├── backend/ # API principal
│ ├── CRUD/ # Lógica de negocio
│ ├── Modelos/ # Modelos SQLModel
│ ├── Routers/ # Rutas del API
│ ├── db/ # Conexión y configuración BD
│ ├── tests/ # Pruebas unitarias
│ └── main.py # Punto de entrada FastAPI
│
├── frontend/ # Aplicación web (Next.js)
│ ├── app/ # Rutas y vistas
│ ├── components/ # Componentes reutilizables
│ ├── hooks/ # Hooks personalizados
│ ├── lib/ # Lógica de API calls
│ └── public/ # Recursos estáticos
│
└── requirements.txt # Dependencias del backend


---

## ⚙️ Tecnologías utilizadas

| Capa | Tecnología | Descripción |
|------|-------------|-------------|
| **Backend** | Python 3.11 | Lenguaje principal |
|  | FastAPI | Framework para la API REST |
|  | SQLModel / SQLAlchemy | ORM para la base de datos |
|  | Pydantic | Validación y serialización |
| **Base de datos** | PostgreSQL | Sistema relacional (ACID) |
| **Frontend** | Next.js + React | Framework para interfaz web |
|  | TailwindCSS | Estilos y diseño responsivo |
| **Infraestructura** | Supabase / Azure for Students | Despliegue en la nube |
| **Control de versiones** | GitHub | Repositorio del proyecto |
| **Documentación** | Swagger / OpenAPI | Documentación del API |

---

## 👥 Roles del equipo
- **Julian Buitrago Camacho** – Líder de proyecto e infraestructura  
- **Juan Esteban Arroyo** – Líder de pruebas y diseño  
- **Miguel Ángel Pérez** – Líder de calidad  

---

## 🧠 Requisitos funcionales
- Registro y autenticación de usuarios (emprendedores, clientes).  
- Gestión de productos físicos y digitales (crear, actualizar, eliminar, consultar).  
- Administración de catálogo con búsqueda y filtrado.  
- Panel de control para vendedores (productos, ventas).  
- Documentación interactiva con **Swagger/OpenAPI**.  
- Integración con frontend mediante consumo de API.  

### Requisitos no funcionales
- **Seguridad:** Autenticación y autorización básica (JWT/Tokens).  
- **Rendimiento:** Respuesta en menos de 2 segundos por operación.  
- **Confiabilidad:** Integridad en los datos de productos y ventas.  
- **Trazabilidad:** Seguimiento del ciclo de vida de los productos.  
- **Disponibilidad:** Despliegue en nube y documentación pública.  

---

## 🧪 Ejecución del proyecto

### 🔹 Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


