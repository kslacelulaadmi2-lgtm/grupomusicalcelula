# Grupo Musical Versátil La Célula — Sitio Web

Sitio web oficial y estático de **Grupo Musical Versátil La Célula**, alojado en **Vercel**.
Este documento explica de forma completa cómo está hecho el proyecto, cómo editarlo,
cómo desplegarlo y qué debe saber cualquier persona que lo vaya a mantener.

---

## 1. Visión general

- **Tipo:** Sitio web estático (HTML + CSS + JavaScript) servido por Vercel.
- **Backend:** Una única función serverless en Vercel (`/api/send-email`) que envía
  correos con **Resend**. No hay base de datos ni servidor propio.
- **Propósito:** Presentar la banda, mostrar galería/video, publicar blog, y captar
  leads de cotización y contacto vía formulario y WhatsApp.
- **Dominio:** `https://grupomusicalcelula.com`

### Páginas principales

| Ruta                | Archivo fuente        | Descripción                                              |
|---------------------|-----------------------|----------------------------------------------------------|
| `/` (inicio)        | `index.html`          | Home: hero con video, servicios, galería, contacto.      |
| `/blog`             | `blog.html`           | Listado de artículos con paginación.                     |
| `/post/:id`         | `post/post-*.html`    | Artículo individual del blog.                            |
| `/cotizador`        | `cotizador.html`      | Formulario de solicitud de cotización (envía por email). |
| `/whatsapp`         | `whatsapp.html`       | Landing de redirección a WhatsApp con cuenta regresiva.  |

> Nota: las URLs limpias (`/blog`, `/cotizador`, `/whatsapp`, `/post/:id`) se
> resuelven con `vercel.json`. Los archivos físicos terminan en `.html`.

---

## 2. Estructura del repositorio

```
celula-site/
├── index.html              # Página de inicio
├── blog.html               # Blog (listado)
├── cotizador.html          # Formulario de cotización
├── whatsapp.html           # Redirección a WhatsApp
├── post/                   # Artículos del blog (post-0.html, post-31.html, post-32.html)
├── assets/                 # Imágenes, video, fuentes, iconos, logo y datos
│   ├── data/               # blog-posts.json, youtube-videos.json
│   ├── fonts/              # Fuentes auto-alojadas (woff2)
│   ├── gallery/            # Fotos de la banda (webp)
│   ├── icons/              # Iconos de redes sociales
│   ├── images/             # Imágenes generales y de fondo
│   ├── logo/               # Logos
│   └── video/              # Videos de fondo (webm/mp4)
├── css/
│   ├── styles.css          # Estilos fuente (editar este)
│   └── styles.min.css      # Minificado (se genera solo en el build)
├── js/                     # JavaScript fuente (editar los .js, no los .min.js)
│   ├── *.js                # Código fuente de cada módulo
│   └── *.min.js            # Minificados (se generan solos en el build)
├── api/
│   └── send-email.js       # Función serverless (Resend) para formularios
├── public/
│   └── _vercel-analytics.html
├── tools/                  # Scripts de build, validación y minificación
├── config/
│   └── eslint.config.js
├── manifest.json           # Configuración PWA
├── sw.js                   # Service Worker (PWA / caché offline)
├── robots.txt
├── sitemap.xml
├── vercel.json             # Configuración de Vercel (build, redirects, rewrites, headers)
├── package.json
└── README.md
```

### Módulos JavaScript (`js/`)

| Archivo                  | Función                                                      |
|--------------------------|--------------------------------------------------------------|
| `navigation.js`          | Menú, navegación y comportamiento responsive.                |
| `video-background.js`    | Reproducción de video de fondo.                              |
| `gallery-dynamic.js`     | Carga dinámica de la galería.                                |
| `youtube-carousel.js`    | Carrusel de videos de YouTube.                               |
| `blog-pagination.js`     | Paginación del blog (usa `assets/data/blog-posts.json`).     |
| `form-handler.js`        | Valida y envía el formulario de cotización a `/api/send-email`. |
| `conversion-tracking.js` | Dispara conversiones de Google Ads en clics de WhatsApp/teléfono. |
| `accessibility-fixes.js` | Mejoras de accesibilidad.                                    |
| `optimizations.js`       | Optimizaciones de carga/rendimiento.                         |
| `site-functionality.js`  | Funcionalidad general del sitio.                             |

---

## 3. Cómo funciona el despliegue

El flujo es **estático + una función serverless**:

1. Vercel ejecuta `npm install` y luego `npm run build` (comando definido en `vercel.json`).
2. `npm run build` = `prebuild` + `tools/build.js`:
   - `prebuild` corre `validate` y `minify` (valida HTML y minifica JS/CSS).
   - `build.js` copia `index.html`, `blog.html`, `cotizador.html`, `whatsapp.html`,
     `post/`, `assets/`, `css/`, `js/`, `manifest.json`, `robots.txt`, `sitemap.xml`
     y `sw.js` a la carpeta `dist/`.
   - Reescribe las referencias `*.js` → `*.min.js` dentro del HTML en `dist/`.
3. Vercel publica el contenido de `dist/` como sitio estático.
4. La carpeta `dist/` está ignorada por git (es un artefacto de build). No se commitea.

> Para editar estilos o scripts, **modifica `css/styles.css` y los `js/*.js` (fuente)**.
> Los archivos `*.min.*` se regeneran automáticamente al hacer build. No edites los `.min`.

---

## 4. Configuración en Vercel (`vercel.json`)

- **Build:** `npm run build` → salida en `dist/`.
- **Clean URLs / sin barra final:** activos.
- **Headers de seguridad:** `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`
  en todas las rutas; caché inmutable de 1 año para `/assets/*`.
- **Rewrites (internos):**
  - `/whatsapp` → `whatsapp.html`
  - `/api/send-email` → `api/send-email.js` (función serverless)
  - `/post/:id` → `post/post-:id.html`
- **Redirects (permanentes):**
  - `/bodas`, `/xv`, `/privada` → `https://marketing-celula.vercel.app/...`
    **Estas tres secciones viven en un proyecto Vercel distinto** (`marketing-celula`).
    No están en este repositorio; para cambiarlas hay que editar ese otro proyecto.
  - `/cotizador.html` → `/cotizador`, `/blog.html` → `/blog`
  - `/post/post-:id.html` → `/post/:id`

---

## 5. Formulario de contacto y correos (API)

Todo el envío de correos pasa por **`api/send-email.js`**, una función serverless de Vercel
que usa **Resend** (`resend`). Soporta dos destinos independientes (por si se quiere
enviar copia a un segundo correo).

Tipos de mensaje que maneja:
- `form_cotizador` — envío del formulario de cotización (`cotizador.html`).
- `chatbot_summary` — resumen de conversación de chatbot (ver sección 8 sobre el chatbot).

### Variables de entorno requeridas (Vercel → Settings → Environment Variables)

Configura **al menos un par completo** (1 ó 2). Si ninguno está completo, la API responde 500.

| Variable            | Descripción                                  |
|---------------------|----------------------------------------------|
| `RESEND_API_KEY_1`  | API key de Resend del destino 1.             |
| `CONTACT_EMAIL_1`   | Correo receptor del destino 1.               |
| `RESEND_API_KEY_2`  | (Opcional) API key de Resend del destino 2.  |
| `CONTACT_EMAIL_2`   | (Opcional) Correo receptor del destino 2.    |

Resend: https://resend.com/api-keys

---

## 6. Desarrollo local

Requisitos: **Node.js 18+**.

```bash
# 1) Instalar dependencias
npm install

# 2) Servidor de desarrollo (Vercel)
npm run dev
# Abre la URL que imprime el comando (por defecto http://localhost:3000)

# 3) Para probar el envío de correos localmente necesitas las variables de
#    entorno de la sección 5 en tu entorno (p. ej. un archivo .env local,
#    ya que Vercel las inyecta automáticamente en producción).
```

### Scripts disponibles (`package.json`)

| Script              | Qué hace                                                      |
|---------------------|---------------------------------------------------------------|
| `npm run dev`       | Servidor de desarrollo con Vercel.                           |
| `npm run build`     | Valida, minifica y construye `dist/`.                         |
| `npm run validate`  | Valida la estructura HTML (herramienta propia).               |
| `npm run minify`    | Minifica JS y CSS fuente.                                      |
| `npm run lint`      | ESLint sobre `js/**` (usa `config/eslint.config.js`).         |
| `npm run deploy`    | Despliegue a producción (`vercel --prod`).                    |
| `npm run deploy:preview` | Despliegue de preview (`vercel`).                        |

---

## 7. Gestión de contenido

### Añadir un artículo al blog
1. Crea `post/post-XX.html` (puedes copiar la estructura de `post/post-0.html`).
2. Agrega una entrada en `assets/data/blog-posts.json` con `id`, `title`, `excerpt`,
   `date`, `image` y `url` (`post/post-XX.html`).
3. La paginación (`js/blog-pagination.js`) lee ese JSON automáticamente.
4. Regenera `sitemap.xml` si es necesario y haz build/deploy.

### Cambiar imágenes, video o logos
- Coloca los archivos en `assets/` (respeta las subcarpetas) y actualiza las rutas en el HTML.
- Se recomienda formato `webp` para imágenes y `webm` para video de fondo (peso menor).

### Cambiar textos y secciones
- Edita directamente el HTML de la página correspondiente (`index.html`, etc.).

---

## 8. Analítica y seguimiento

- **Google Tag Manager / gtag:** ID `GT-5MXH55ZG`, cargado en las 4 páginas principales
  (`index.html`, `blog.html`, `cotizador.html`, `whatsapp.html`, línea ~6).
- **Google Ads (conversiones):** cuenta `AW-943484255`, disparadas en clics de
  WhatsApp/teléfono por `js/conversion-tracking.js`.
- **Vercel Analytics / Speed Insights:** incluido vía dependencias del proyecto.

> Para cambiar el ID de medición, edita el `id=GT-...` en las cabeceras de las páginas
> y la cuenta `AW-...` en `js/conversion-tracking.js`.

### Sobre el chatbot (importante)
El sitio está preparado para un chatbot: `whatsapp.html` lee un mensaje guardado en
`sessionStorage` (`celulaWhatsAppLeadMessage`) y `api/send-email.js` acepta el tipo
`chatbot_summary`. **Sin embargo, el código del chatbot (front-end/IA) NO está en este
repositorio**; es una integración externa o fue removida. Si se implementa de nuevo, debe
apuntar a `/api/send-email` con `type: "chatbot_summary"` o a la ruta de API correspondiente.

---

## 9. Mantenimiento y troubleshooting

- **No se commitea `dist/`, `node_modules/`, `.vercel/`:** son artefactos (ver `.gitignore`).
- **El build falla en `validate`/`minify`:** corrige el error reportado y vuelve a `npm run build`.
- **El formulario no envía correo:** revisa que las variables de la sección 5 estén
  configuradas en Vercel y sean válidas en Resend.
- **`/bodas`, `/xv`, `/privada` no cargan:** esas secciones están en el proyecto
  `marketing-celula`, no aquí.
- **Cambios en CSS/JS no se ven en producción:** recuerda que el build usa los `.min`.
  Edita la fuente y haz build/deploy.

---

## 10. Resumen para el nuevo responsable

- Repo estático en Vercel, sin backend propio.
- Edita HTML/CSS/JS fuente y despliega con `npm run deploy` (o conecta el repo a Vercel
  para despliegue automático al hacer push).
- El único código server-side es `api/send-email.js` (Resend), configurable con 2 correos.
- El blog se gestiona con `assets/data/blog-posts.json` + `post/*.html`.
- Secciones bodas/XV/privada son un proyecto aparte (`marketing-celula`).
- El chatbot no forma parte de este repositorio actualmente.

---

## 11. Contacto

- **Web:** https://grupomusicalcelula.com
- **Email:** contacto@grupomusicalcelula.com
- **WhatsApp:** https://wa.me/+525535412631
