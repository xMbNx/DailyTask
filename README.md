# Daily Task

Gestor de tareas por categorías, 100% estático (HTML + CSS + JS, sin backend ni build) pensado para usarse en local.

## ¿Qué incluye?

- **[index.html](index.html)** — página de inicio: muestra el listado de tus proyectos (cada uno es un archivo `.html` independiente en la misma carpeta), con un resumen de tareas pendientes/completadas/progreso de cada uno. Desde aquí puedes crear un proyecto nuevo, renombrarlo o eliminarlo.
- **[dailytask.html](dailytask.html)** — la aplicación de tareas en sí (plantilla base): categorías con color, tareas con prioridad y subtareas, progreso por categoría y global, búsqueda, modo claro/oscuro, y varias columnas de vista.
- **test.html** — un proyecto de ejemplo creado a partir de la plantilla.

## Cómo funciona el almacenamiento

Cada proyecto guarda sus datos en el `localStorage` del navegador, namespaced por el nombre del propio archivo `.html` (así, `dailytask.html` y una copia `mi-proyecto.html` no comparten datos). Opcionalmente, en Chrome/Edge de escritorio se puede vincular un archivo `.json` en la misma carpeta (vía File System Access API) para guardar ahí una copia legible de los datos.

Al ser una app 100% cliente, **no hay sincronización entre dispositivos ni navegadores**: los datos viven donde los guardes (ese navegador, o ese archivo `.json` local).

## Cómo usarlo

Al no usar módulos ES ni build, basta con abrir `index.html` en el navegador. Algunas funciones (como `fetch` de archivos vecinos o crear/eliminar proyectos desde `index.html`) requieren servirlo por HTTP en vez de abrirlo con doble clic, por ejemplo:

```bash
python -m http.server 8000
```

Y abrir `http://localhost:8000/index.html`.

## Crear un proyecto nuevo

Desde `index.html`, pulsa "Elegir carpeta" (una vez) para dar acceso a la carpeta del proyecto, y luego "+ Nuevo proyecto". Se crea una copia de `dailytask.html` con el nombre que elijas, totalmente independiente de los demás proyectos.
