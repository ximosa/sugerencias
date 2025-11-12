# Asistente de Artículos con Gemini

Este proyecto es un script inteligente diseñado para integrarse en cualquier artículo de blog. Analiza automáticamente el contenido del post y genera 4 sugerencias interactivas para que los lectores puedan profundizar en temas relacionados. Al hacer clic en una sugerencia, el asistente obtiene y muestra una respuesta detallada directamente en la página, sin necesidad de que el usuario abandone el sitio.

## Características Principales

- **Análisis Automático:** Lee el contenido del artículo directamente desde el DOM.
- **Sugerencias Inteligentes:** Utiliza la API de Gemini para generar 4 preguntas o temas de exploración relevantes.
- **Respuestas Instantáneas:** Proporciona respuestas dentro del mismo widget, creando una experiencia de usuario fluida.
- **Integración Súper Fácil:** Se añade a cualquier web con un simple fragmento de código HTML.
- **Proceso de Build Moderno:** Utiliza Vite para compilar todo el código en un único archivo JavaScript optimizado.

---

## Despliegue en Vercel

Para que la aplicación funcione, necesitas desplegarla en un servicio de hosting como Vercel y configurar tu clave de API de Gemini.

### Paso 1: Obtener una API Key de Gemini

1.  Ve a [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Inicia sesión con tu cuenta de Google.
3.  Haz clic en "**Create API key**" para generar una nueva clave.
4.  Copia la clave y guárdala en un lugar seguro.

### Paso 2: Desplegar el Proyecto en Vercel

1.  **Haz un Fork/Clona este Repositorio:** Primero, necesitas tener este proyecto en tu propia cuenta de GitHub.
2.  **Crea un Nuevo Proyecto en Vercel:**
    *   Inicia sesión en tu cuenta de [Vercel](https://vercel.com/).
    *   Desde tu panel de control, haz clic en "**Add New...**" > "**Project**".
    *   Importa el repositorio de GitHub que acabas de crear.
3.  **Configura el Proyecto y las Variables de Entorno:**
    *   Vercel debería detectar automáticamente que estás usando Vite. Si no es así, selecciona **Vite** como "Framework Preset".
    *   Expande la sección "**Environment Variables**".
    *   Añade una nueva variable con la siguiente configuración:
        *   **Name:** `VITE_API_KEY` (¡Es importante que empiece con `VITE_`!)
        *   **Value:** Pega aquí la clave de API de Gemini que copiaste en el Paso 1.
    *   Verifica la configuración de "Build and Output Settings":
        *   **Build Command:** `npm run build` o `vite build`
        *   **Output Directory:** `dist`
4.  **Despliega:**
    *   Haz clic en el botón "**Deploy**".
    *   Vercel instalará las dependencias, ejecutará el comando de build (creando el archivo `dist/widget.js`) y desplegará tu aplicación.

---

## Integración en tu Blog

### Paso 1: Prepara el Contenido de tu Artículo

Asegúrate de que el texto principal de tu artículo esté dentro de un elemento con `id="page-wrapper"`.

```html
<div id="page-wrapper">
    <h1>El Título de Mi Artículo</h1>
    <p>Este es el primer párrafo de mi increíble contenido...</p>
</div>
```

### Paso 2: Pega el Script en tu Web

Copia el siguiente bloque de código y pégalo justo antes de la etiqueta de cierre `</body>` en la plantilla de tu blog.

```html
<!-- Punto de montaje para la App de Sugerencias Gemini -->
<div id="root"></div>

<!-- Script de la aplicación de sugerencias -->
<script src="https://sugerencias-iota.vercel.app/widget.js" defer></script>
```

**¡Eso es todo!** El asistente aparecerá automáticamente, ya que el archivo `widget.js` ahora existe y es servido correctamente por Vercel.
