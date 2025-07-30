
# 📘 Documento Técnico - RedOak

## 🧾 Descripción General

RedOak es una aplicación web (PWA) para la gestión de tareas y reportes laborales. Permite a empleados registrar sus tareas diarias y generar reportes, mientras que los administradores pueden visualizar, editar y exportar esta información. El sistema incluye control de acceso basado en roles, soporte multimedia, geolocalización, funcionalidad offline, y exportación a PDF.

---

## 🧩 Tecnologías Utilizadas

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **PWA**: Instalación, offline mode, media capture
- **Auth**: Supabase Auth con control de roles
- **Media**: Captura desde cámara o carga desde dispositivo
- **Geolocalización**: Integrada al crear tareas

---

## 🔐 Roles

- **Empleado**: Accede solo a su propia información
- **Administrador**: Visualiza, edita y elimina todo. Crea usuarios y modifica roles
- **Extensible**: Posibilidad de agregar más roles con permisos personalizados

---


## 📁 Módulos y Campos

### 👤 Usuarios

- `id`: UUID (PK)
- `full_name`: TEXT
- `email`: TEXT (único)
- `photo_path`: TEXT
- `role`: ENUM('employee', 'administrator', ...)
- `account_name`: TEXT 
- `account_number`: TEXT
- `bsb`: TEXT
- `abn`: TEXT
- `mobile_number`: TEXT
- `address`: TEXT
- `auth_user_id`: UUID (FK a auth.users)
- `created_at`: TIMESTAMP default now()
- `updated_at`: TIMESTAMP

---

### 👤 Clientes

- `id`: UUID (PK)
- `full_name`: TEXT
- `emails`: TEXT (único)
- `service_address`: TEXT
- `created_at`: TIMESTAMP default now()


---

### 📝 Horas Trabajadas

- `id`: UUID (PK)
- `user_id`: UUID (FK a usuarios)
- `date_worked`: DATE
- `customer_id`: UUID (FK a clientes)
- `type_work`: TEXT
- `type_work_other`: TEXT
- `hours`: DECIMAL
- `rate_hour`: DECIMAL
- `descripcion`: TEXT (opcional)
- `location`: GEOJSON o JSONB
- `created_at`: TIMESTAMP default now()
- `invoice_id`: UUID (FK a facturas)

### 📝 Reportes

- `id`: UUID (PK)
- `user_id`: UUID (FK a usuarios)
- `report_date`: DATE
- `report_time`: TIME
- `customer_id`: UUID (FK a clientes)
- `descripcion`: TEXT (opcional)
- `location`: GEOJSON o JSONB
- `created_at`: TIMESTAMP default now()

---

### 📎 Reportes Adjuntos

- `id`: UUID (PK)
- `report_id`: UUID (FK a reportes)
- `path`: TEXT
- `type_file`: TEXT
- `created_at`: TIMESTAMP default now()

---

### 📎 Reportes Observaciones

- `id`: UUID (PK)
- `report_id`: UUID (FK a reportes)
- `type_file`: TEXT
- `path`: TEXT
- `note`: TEXT
- `created_at`: TIMESTAMP default now()

---

### 📄 Facturas

- `id`: UUID (PK)
- `invoice_number`: TEXT
- `user_id`: UUID (FK a usuarios)
- `account_name`: TEXT 
- `account_number`: TEXT
- `bsb`: TEXT (opcional)
- `abn`: TEXT (opcional)
- `mobile_number`: TEXT (opcional)
- `address`: TEXT (opcional)
- `date_off`: DATE
- `status`: ENUM('Creada', 'Enviada', 'En Revisión', 'Pagada')
- `created_at`: TIMESTAMP default now()

### 🔗 Reporte Tareas

- `id`: UUID (PK)
- `reporte_id`: UUID (FK a reportes)
- `tarea_id`: UUID (FK a tareas)

---

### 🕓 Historial de Cambios

- `id`: UUID (PK)
- `modulo`: TEXT ('tarea' o 'reporte')
- `registro_id`: UUID
- `usuario_id`: UUID (FK a usuarios)
- `tipo_cambio`: TEXT
- `datos_anteriores`: JSONB
- `datos_nuevos`: JSONB
- `fecha`: TIMESTAMP

---

## ⚙️ Configuración por Variables `.env`

- `VITE_ENABLE_PWA=true`
- `VITE_ENABLE_OFFLINE=true`

---

## 📦 Funcionalidades PWA

- Instalación en dispositivos móviles/escritorio
- Modo offline con sincronización
- Captura de fotos/videos
- Geolocalización automática
- Exportación a PDF

---

## 📈 Flujos del Usuario

### Empleado
1. Inicia sesión
2. Registra tareas (adjunta media, ubicación, incidencias)
3. Crea y edita reportes (si estado = "Creado")
4. Visualiza tareas y reportes propios

### Administrador
1. Inicia sesión
2. Crea y administra usuarios
3. Visualiza, edita y elimina tareas de todos
4. Visualiza reportes en estado "Enviado"
5. Exporta reportes a PDF
6. Cambia estados de tareas y reportes

---

## 🧪 Validaciones

- Todos los campos obligatorios están validados en el frontend
- Reglas de visibilidad y edición se aplican según rol y estado
- Límites de peso de archivos adaptables por configuración

---

## 📌 Consideraciones Finales

- Base de datos diseñada para escalabilidad
- Flexibilidad para nuevos roles o funcionalidades
- Cumple con estándares modernos de UX y accesibilidad

