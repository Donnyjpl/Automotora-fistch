# 🚗 Automotora Fitsch

Sistema de gestión de ventas para automotora, desarrollado con **Django REST Framework** y **React + Tailwind CSS**. Permite administrar vendedores, compradores, autos y ventas, con control de acceso por roles.

---

## ✨ Características

- **Autenticación JWT** con roles diferenciados (Admin / Usuario)
- **Dashboard exclusivo para Admin** con estadísticas generales
- **Gestión de ventas** con filtros, búsqueda y paginación
- **Boleta imprimible** generada directamente desde el navegador
- **Control de permisos** tanto en el frontend como en el backend
- **Diseño moderno** con sidebar responsive y tema naranja corporativo

---

## 🛠️ Tecnologías

**Backend**
- Python / Django
- Django REST Framework
- SimpleJWT — autenticación por tokens
- drf-spectacular — documentación automática (Swagger / ReDoc)

**Frontend**
- React + Vite
- React Router v6
- Tailwind CSS
- React Hot Toast

---

## 🗂️ Estructura del proyecto

```
automotora-fitsch/
├── backend/
│   ├── core/               # App principal (modelos, vistas, serializers)
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── permissions.py
│   └── automotora/         # Configuración del proyecto Django
│       ├── settings.py
│       └── urls.py
└── frontend/
    └── src/
        ├── api/            # Lógica de autenticación y llamadas a la API
        ├── components/     # Componentes reutilizables (PrivateRoute, etc.)
        ├── pages/          # Páginas principales
        └── hooks/          # Custom hooks (paginación, etc.)
```

---

## 🚀 Instalación

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Roles y permisos

| Acción                        | Usuario | Admin |
|-------------------------------|:-------:|:-----:|
| Ver ventas                    |    ✅   |  ✅   |
| Registrar venta               |    ✅   |  ✅   |
| Anular / eliminar venta       |    ❌   |  ✅   |
| Acceder al Dashboard          |    ❌   |  ✅   |
| Gestionar vendedores y autos  |    ✅   |  ✅   |

---

## 📄 Documentación de la API

Con el servidor corriendo, accede a:

- Swagger UI → `http://localhost:8000/api/docs/`
- ReDoc → `http://localhost:8000/api/redoc/`
---

## 📸 Capturas
---
<img width="1183" height="551" alt="Captura de pantalla 2026-03-01 200951" src="https://github.com/user-attachments/assets/851f6bad-85d4-42f2-b74c-a3b455737360" />
<img width="1192" height="705" alt="Captura de pantalla 2026-03-01 201013" src="https://github.com/user-attachments/assets/22e82d08-6fcf-4dfc-a668-832924648a43" />

<img width="1141" height="632" alt="Captura de pantalla 2026-03-01 201033" src="https://github.com/user-attachments/assets/7dc02413-38db-4b58-8d45-efe58c2621bd" />
## 👤 Autor
Desarrollado por **Donni Plaza** — proyecto de gestión interna para automotora.
