# Asistente de Artículos con Gemini

Este proyecto es un script inteligente diseñado para integrarse en cualquier artículo de blog. Analiza automáticamente el contenido del post y genera 4 sugerencias interactivas para que los lectores puedan profundizar en temas relacionados. Al hacer clic en una sugerencia, el asistente obtiene y muestra una respuesta detallada directamente en la página, sin necesidad de que el usuario abandone el sitio.

## Características Principales

- **Análisis Automático:** Lee el contenido del artículo directamente desde el DOM.
- **Sugerencias Inteligentes:** Utiliza la API de Gemini para generar 4 preguntas o temas de exploración relevantes.
- **Respuestas Instantáneas:** Proporciona respuestas dentro del mismo widget, creando una experiencia de usuario fluida.
- **Fácil de Integrar:** Se puede añadir a cualquier sitio web con un simple fragmento de código HTML.
- **Despliegue Sencillo:** Optimizado para un despliegue rápido en plataformas como Vercel.

---

## Despliegue en Vercel

Para que la aplicación funcione en tu propio sitio, necesitas desplegarla en un servicio de hosting como Vercel y configurar tu clave de API de Gemini.

### Paso 1: Obtener una API Key de Gemini

1.  Ve a [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Inicia sesión con tu cuenta de Google.
3.  Haz clic en "**Create API key**" para generar una nueva clave.
4.  Copia la clave y guárdala en un lugar seguro. La necesitarás en el siguiente paso.

### Paso 2: Desplegar el Proyecto en Vercel

1.  **Haz un Fork/Clona este Repositorio:** Primero, necesitas tener este proyecto en tu propia cuenta de GitHub.
2.  **Crea un Nuevo Proyecto en Vercel:**
    *   Inicia sesión en tu cuenta de [Vercel](https://vercel.com/).
    *   Desde tu panel de control, haz clic en "**Add New...**" > "**Project**".
    *   Importa el repositorio de GitHub que acabas de crear.
3.  **Configura las Variables de Entorno:**
    *   En la pantalla de configuración del proyecto ("Configure Project"), expande la sección "**Environment Variables**".
    *   Añade una nueva variable con la siguiente configuración:
        *   **Name:** `API_KEY`
        *   **Value:** Pega aquí la clave de API de Gemini que copiaste en el Paso 1.
    *   Esta es la forma segura de usar tu clave sin exponerla en el código.
4.  **Despliega:**
    *   Haz clic en el botón "**Deploy**".
    *   Vercel construirá y desplegará automáticamente tu aplicación. Una vez completado, te proporcionará una URL pública (por ejemplo: `https://tu-proyecto.vercel.app`).

---

## Integración en tu Blog

Ahora que tu aplicación está desplegada y funcionando en Vercel, puedes integrarla en tu blog.

### Paso 1: Obtén la URL de tu Script

La URL que necesitas es la de tu despliegue en Vercel, apuntando al archivo `index.tsx`. Por ejemplo:

`https://tu-proyecto.vercel.app/index.tsx`

### Paso 2: Prepara el Código de Inserción

Copia el siguiente bloque de código y **reemplaza la URL de ejemplo** con la URL que obtuviste en el paso anterior.

```html
<!-- Punto de montaje para la App de Sugerencias Gemini -->
<div id="root"></div>

<!-- Script para cargar la aplicación desde tu servidor de Vercel -->
<!-- ¡IMPORTANTE! Reemplaza la URL con la ruta real de tu despliegue -->
<script type="module" src="https://tu-proyecto.vercel.app/index.tsx"></script>
```

### Paso 3: Pega el Script en tu Blog

1.  Pega el bloque de código que acabas de preparar al final de la plantilla de tus artículos, justo antes de la etiqueta de cierre `</body>`.
2.  **Asegúrate** de que el contenido principal de tus artículos esté envuelto en un `div` con el id `page-wrapper`, ya que la aplicación buscará este elemento para leer el texto.

```html
<!-- ... El contenido de tu artículo está aquí dentro ... -->
<div id="page-wrapper">
    <h1>Mi increíble artículo</h1>
    <p>Este es el primer párrafo...</p>
    <p>Y este es el segundo...</p>
</div>

<!-- ... otros elementos de tu página ... -->

<!-- Pega el script aquí al final -->
<div id="root"></div>
<script type="module" src="https://tu-proyecto.vercel.app/index.tsx"></script>

</body>
</html>
```

¡Y listo! El asistente de artículos debería aparecer ahora en las páginas de tu blog.
