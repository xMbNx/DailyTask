# Daily Task

Gestor de tareas por categorías. Frontend estático (HTML + CSS + JS, sin build) desplegado en Vercel, con los datos y el inicio de sesión en Supabase.

## ¿Qué incluye?

- **[index.html](index.html)** — página de inicio: listado de tus proyectos con su resumen (pendientes, completadas, progreso). Desde aquí se crean, renombran y eliminan proyectos.
- **[dailytask.html](dailytask.html)** — la aplicación de tareas: categorías con color, tareas con prioridad y subtareas, progreso por categoría y global, búsqueda, modo claro/oscuro y varias columnas de vista. Se abre como `dailytask.html?p=<proyecto>`.
- **[auth.js](auth.js)** — cliente de Supabase y pantalla de inicio de sesión, compartidos por las dos páginas.
- **[config.js](config.js)** — URL y clave pública (anon) de tu proyecto de Supabase.
- **[supabase/schema.sql](supabase/schema.sql)** — tabla `projects` y políticas de seguridad (RLS).

## Cómo se guardan los datos

Cada proyecto es una fila de la tabla `projects`, con todo su tablero en una columna `jsonb` (`{ "categories": [...] }`, el mismo formato que exporta "Exportar JSON"). Los cambios se guardan solos, un instante después de hacerlos. Si el mismo proyecto se modifica desde otra pestaña o dispositivo, la app lo detecta (por `updated_at`) y pregunta en vez de sobrescribir.

Las políticas RLS hacen que cada usuario solo pueda leer y modificar sus propios proyectos. La anon key de `config.js` es pública por diseño.

Las preferencias de vista (tema, zoom, columnas, categorías ocultas) siguen en el `localStorage` de cada navegador.

## Puesta en marcha

1. **Supabase**: crea un proyecto en [supabase.com](https://supabase.com).
   - SQL Editor → pega [supabase/schema.sql](supabase/schema.sql) → Run.
   - Authentication → Users → *Add user* con tu email y contraseña.
   - Authentication → Sign In / Providers → desactiva *Allow new users to sign up*, para que nadie más pueda registrarse.
2. **Config**: copia la *Project URL* y la *anon key* (Project Settings → API) en [config.js](config.js).
3. **Vercel**: sube el repo a GitHub e impórtalo en Vercel (Framework preset: *Other*, sin build command ni output directory). [vercel.json](vercel.json) ya permite las conexiones a `*.supabase.co`.
4. **Migrar datos antiguos**: en la web, crea el proyecto (por ejemplo "IoT Fenster"), ábrelo y usa *Importar JSON* con su antiguo `.json`.

## Desarrollo local

Sirve la carpeta por HTTP y abre `http://localhost:8000`:

```bash
python -m http.server 8000
```
