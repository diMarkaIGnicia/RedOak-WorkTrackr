# RedOak Task Manager

Aplicación PWA de gestión de tareas construida con React, Vite, TypeScript, Tailwind CSS y Supabase.

---

## 🚀 Características principales
- **Frontend:** React + Vite + TypeScript
- **Estilos:** Tailwind CSS 3.x
- **Backend:** Supabase (auth y base de datos)
- **Despliegue local:** Node.js (sin Docker)
- **Diseño:** Responsive y profesional, login con Supabase, gestión de tareas

---

## 🛠️ Instalación y uso local

1. **Clona el repositorio:**
   ```bash
   git clone <URL_DEL_REPO>
   cd WorkTrackr
   ```

2. **Instala dependencias:**
   ```bash
   npm install
   ```

3. **Genera el CSS de Tailwind:**
   En una terminal:
   ```bash
   npm run build:css
   ```
   (Esto compila Tailwind en modo watch. Déjalo corriendo mientras desarrollas.)

4. **Levanta el servidor de desarrollo:**
   En otra terminal:
   ```bash
   npm run dev
   ```

5. **Abre la app:**
   Ve a [http://localhost:5173](http://localhost:5173)

---

## 📝 Scripts útiles
- `npm run dev`        → Inicia Vite en modo desarrollo
- `npm run build:css`  → Compila Tailwind CSS en modo watch
- `npm run build`      → Compila la app para producción
- `npm run preview`    → Sirve la app ya compilada

---

## ⚠️ Notas importantes
- **Tailwind CSS:** Usa la versión 3.x (`^3.3.5`). No actualices a v4 hasta que Vite y los plugins sean 100% compatibles.
- **Node:** Recomendado Node 18 o superior.
- **Docker:** El entorno Docker está en desarrollo. Para evitar errores de dependencias nativas, usa el entorno local.
- **Supabase:** Configura tus claves en `.env` si usas funcionalidades de backend.

---

## 📦 Estructura del proyecto
```
WorkTrackr/
├── src/
│   ├── pages/         # Páginas principales (Login, Dashboard, etc)
│   ├── components/    # Componentes reutilizables
│   ├── index.css      # Entrada principal de Tailwind
│   ├── output.css     # CSS generado por Tailwind
│   └── main.tsx       # Entry point de React
├── tailwind.config.js # Configuración de Tailwind
├── package.json       # Dependencias y scripts
├── Dockerfile         # (opcional) Entorno Docker
├── docker-compose.yml # (opcional) Orquestación Docker
└── README.md          # Este archivo
```

---

## 🆘 Problemas frecuentes
- Si Tailwind no genera clases, revisa la versión y reinstala dependencias.
- Si ves errores de Rollup o Vite en Docker, usa el entorno local.
- Si el CSS no se aplica, asegúrate de que `src/output.css` esté importado en tu app.

---

## 📚 Recursos útiles
- [Tailwind CSS Docs](https://tailwindcss.com/docs/installation)
- [Vite Docs](https://vitejs.dev/)
- [Supabase Docs](https://supabase.com/docs)

---

¡Feliz desarrollo con RedOak! Si tienes dudas, abre un issue o contacta al equipo.
