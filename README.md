# Asistente de Artículos con Gemini

Este proyecto es un script inteligente diseñado para integrarse en cualquier artículo de blog. Analiza automáticamente el contenido del post y genera sugerencias interactivas para que los lectores puedan profundizar en temas relacionados. Al hacer clic en una sugerencia, el asistente obtiene y muestra una respuesta detallada directamente en la página, sin necesidad de que el usuario abandone el sitio.

## Visión Futura: Creación de Artículos Interactivos

### ¿Qué Hace Este Script?

El **Asistente de Artículos con Gemini** transforma artículos estáticos en experiencias interactivas y dinámicas que:

#### 🤖 **Análisis Inteligente del Contenido**
- Examina automáticamente el texto del artículo usando IA avanzada (Gemini 2.5 Pro)
- Identifica temas clave, conceptos complejos y áreas de oportunidad
- Genera preguntas relevantes que los lectores realmente se harían

#### 💡 **Generación de Sugerencias Contextuales**
- Crea 3-4 preguntas o temas de seguimiento personalizados
- Cada sugerencia está directamente relacionada con el contenido específico del artículo
- Adapta las preguntas al nivel de profundidad y complejidad del texto original

#### ⚡ **Respuestas Instantáneas con Streaming**
- Proporciona respuestas detalladas sin salir de la página
- Efecto de "escritura en tiempo real" para una experiencia moderna
- Respuestas formateadas en HTML con listas, negritas y estructura clara

#### 🔄 **Sistema de Recuperación Inteligente**
- Fallback automático entre modelos de Gemini cuando hay sobrecarga
- Reintentos automáticos con backoff exponencial
- Caché inteligente para evitar llamadas API redundantes

#### 🎯 **Experiencia de Usuario Premium**
- Carga diferida para no impactar el rendimiento inicial
- Animaciones suaves y estados de carga atractivos
- Navegación fluida entre sugerencias y respuestas
- Diseño responsive que funciona en todos los dispositivos

### Impacto en la Creación de Contenido Futuro

#### Para Escritores y Bloggers:
- **Aumenta el engagement:** Los lectores pasan más tiempo en el artículo
- **Reduce la tasa de rebote:** Contenido interactivo mantiene la atención
- **Genera valor adicional:** Proporciona respuestas a preguntas comunes sin trabajo extra

#### Para Lectores:
- **Experiencia enriquecida:** Pueden profundizar en temas sin abandonar la página
- **Aprendizaje continuo:** Descubren conexiones y conceptos relacionados
- **Interacción directa:** Pueden hacer preguntas específicas sobre el contenido

#### Para Plataformas de Contenido:
- **Mayor tiempo en sitio:** Más minutos por sesión
- **Mejor SEO:** Aumento del engagement y señales positivas para buscadores
- **Diferenciación competitiva:** Contenido dinámico vs artículos estáticos

## Características Técnicas Avanzadas

- **Modelos Gemini Actuales:** `models/gemini-2.5-pro` (primario) y `models/gemini-flash-latest` (fallback)
- **Carga Diferida Inteligente:** Solo se ejecuta cuando el usuario llega al widget
- **Progressive Enhancement:** Funciona incluso en navegadores antiguos
- **Caching Estratégico:** Reduce costos y mejora velocidad
- **Streaming de Respuestas:** Efecto de escritura en tiempo real
- **Manejo de Errores Robusto:** Recuperación automática de fallos de API

## Caso de Uso Futuro

Imagina escribir un artículo sobre "Machine Learning Básico". El widget automáticamente generaría sugerencias como:

- "¿Cómo elegir el algoritmo correcto para mi dataset?"
- "¿Qué es el overfitting y cómo evitarlo?"
- "¿Cómo implementar ML en producción?"
- "¿Cuáles son las mejores librerías para principiantes?"

Cada clic proporciona una respuesta detallada, convirtiendo un artículo de 5 minutos en una sesión de aprendizaje de 20 minutos. El lector obtiene valor educativo adicional mientras el blogger aumenta significativamente su engagement sin esfuerzo extra.

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
<script src="https://tu-dominio.com/widget.js" defer></script>
```

**¡Eso es todo!** El asistente aparecerá automáticamente, ya que el archivo `widget.js` ahora existe y es servido correctamente por tu hosting.
