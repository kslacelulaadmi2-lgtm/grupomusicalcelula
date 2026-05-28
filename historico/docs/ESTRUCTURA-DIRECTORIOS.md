# Estructura de Directorios del Proyecto

## 📁 Raíz del Proyecto
```
celula-site/
├── index.html              # Página principal
├── blog.html               # Página del blog
├── cotizador.html          # Calculadora de cotizaciones
├── offline.html            # Página offline para PWA
├── manifest.json           # Manifiesto PWA
├── sw.js                   # Service Worker
├── robots.txt              # Configuración para crawlers
├── sitemap.xml             # Mapa del sitio
├── _headers                # Headers para Cloudflare Pages
├── wrangler.toml           # Configuración de Cloudflare
├── package.json            # Dependencias del proyecto
└── .gitignore              # Archivos ignorados por Git
```

## 📚 Directorios Principales

### `/assets/` - Recursos Multimedia
```
assets/
├── data/                   # Datos JSON (blog-posts.json, etc.)
├── equipo/                 # Fotos del equipo
├── fonts/                  # Fuentes autohospedadas
├── gallery/                # Imágenes de la galería
├── icons/                  # Iconos e imágenes pequeñas
├── images/                 # Imágenes generales del sitio
├── logo/                   # Logos del grupo
├── video/                  # Videos optimizados
└── Viejas-Fotos/          # Archivo de fotos antiguas
```

### `/js/` - JavaScript
```
js/
├── chatbot.js              # Chatbot con Gemini AI
├── chatbot.min.js          # Versión minificada
├── blog-pagination.js      # Paginación del blog
├── form-handler.js         # Manejo de formularios
├── gallery-dynamic.js      # Galería dinámica
├── navigation.js           # Navegación del sitio
├── optimizations.js        # Optimizaciones de rendimiento
├── site-functionality.js   # Funcionalidades generales
├── video-background.js     # Video de fondo
├── youtube-carousel.js     # Carrusel de YouTube
└── *.min.js                # Versiones minificadas
```

### `/css/` - Estilos
```
css/
├── styles.css              # Estilos principales
└── styles.min.css          # Versión minificada
```

### `/functions/` - Cloudflare Functions
```
functions/
├── api/
│   ├── chatbot.js          # API del chatbot
│   ├── send-email.js       # API de envío de emails
│   └── quote.js            # API de cotizaciones
├── package.json            # Dependencias de functions
└── .wranglerignore         # Archivos ignorados
```

### `/post/` - Artículos del Blog
```
post/
├── post-0.html             # Artículo 0
├── post-1.html             # Artículo 1
└── ...                     # Otros artículos
```

### `/docs/` - Documentación
```
docs/
├── AGENTS.md               # Guía para AI assistants
├── DEPLOYMENT.md           # Guía de deployment a AWS Amplify
├── DEPLOY.md               # Guía de deployment legacy
├── ESTRUCTURA-PROYECTO.md  # Estructura del proyecto
├── ESTRUCTURA-DIRECTORIOS.md # Este archivo
├── API-EMAIL-DOCUMENTATION.md
├── CLOUDFLARE_PAGES_SETUP.md
├── REPORTE-FINAL-OPTIMIZACIONES.md
├── PARALELO.md             # Documentación de trabajo paralelo
├── STRUCTURE.md            # Estructura completa del proyecto
├── CHANGELOG_VIDEO_SECRETOS.md
├── REORGANIZATION_COMPLETE.md
└── ...                     # Otros documentos
```

### `/scripts/` - Scripts de Utilidad
```
scripts/
├── minify-all.sh           # Minificar JS y CSS
├── convert-images-to-webp.sh
├── optimize-video.sh
├── generate-blog-images.sh
├── download-fonts.sh
└── ...                     # Otros scripts
```

### `/public/` - Archivos Públicos
```
public/
└── forms/                  # Manejadores de formularios
    └── resend-handler.js
```

### `/archived/` - Archivos Archivados
```
archived/
├── old-html/               # HTML antiguo
├── old-posts/              # Posts antiguos
├── old-scripts/            # Scripts antiguos
├── reports/                # Reportes JSON
└── test-files/             # Archivos de prueba
```

### `/widgets/` - Widgets Externos
```
widgets/
└── google-reviews/         # Widget de reseñas de Google
```

### `/temp/` - Archivos Temporales
```
temp/                       # Archivos temporales (ignorados por git)
```

## 🔧 Archivos de Configuración

- `.gitignore` - Archivos ignorados por Git
- `.npmrc` - Configuración de npm
- `wrangler.toml` - Configuración de Cloudflare Wrangler
- `package.json` - Dependencias y scripts npm
- `manifest.json` - Configuración PWA

## 📝 Convenciones

### Nombres de Archivos
- HTML: lowercase con guiones (`blog.html`, `cotizador.html`)
- JavaScript: camelCase (`chatbot.js`, `formHandler.js`)
- CSS: lowercase con guiones (`styles.css`)
- Scripts: lowercase con guiones (`minify-all.sh`)
- Docs: UPPERCASE con guiones (`README.md`, `DEPLOY.md`)

### Minificación
- Archivos fuente: `nombre.js`, `nombre.css`
- Minificados: `nombre.min.js`, `nombre.min.css`
- Siempre mantener ambas versiones

### Assets
- Imágenes: WebP cuando sea posible
- Videos: múltiples calidades (1080p, 720p, 360p)
- Fuentes: autohospedadas en `/assets/fonts/`

## 🚀 Workflow

1. **Desarrollo**: Editar archivos fuente en `/js/` y `/css/`
2. **Minificación**: Ejecutar `npm run minify`
3. **Testing**: Ejecutar `npm run dev`
4. **Deploy**: Ejecutar `npm run deploy`

## 📦 Gestión de Archivos

### Qué Guardar en Git
✅ Código fuente
✅ Documentación
✅ Configuración
✅ Assets optimizados

### Qué NO Guardar en Git
❌ `node_modules/`
❌ `.env` y variables de entorno
❌ Archivos temporales
❌ Archivos de historial (`.history/`)
❌ Builds intermedios

## 🔄 Mantenimiento

### Limpieza Regular
```bash
# Limpiar archivos temporales
rm -rf temp/*

# Limpiar node_modules
rm -rf node_modules functions/node_modules

# Reinstalar dependencias
npm install
cd functions && npm install
```

### Actualizar Dependencias
```bash
# Actualizar proyecto principal
npm update

# Actualizar functions
cd functions && npm update
```

---

**Última actualización**: 20 de Noviembre, 2025
