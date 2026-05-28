# Guía de Mantenimiento

## 🔧 Tareas Regulares

### Limpieza del Proyecto

```bash
# Limpieza básica (archivos temporales)
bash scripts/cleanup.sh

# Limpieza profunda (incluye node_modules)
bash scripts/cleanup.sh --deep
```

### Actualización de Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated
cd functions && npm outdated && cd ..

# Actualizar todas las dependencias
npm update
cd functions && npm update && cd ..

# Actualizar una dependencia específica
npm install package@latest
```

### Regenerar Minificados

```bash
# Minificar todos los archivos
npm run minify

# O manualmente
bash scripts/minify-all.sh
```

## 📁 Organización de Archivos

### Estructura Recomendada

✅ **Mantener en raíz**:
- Páginas HTML principales (index.html, blog.html, etc.)
- Archivos de configuración (package.json, wrangler.toml, etc.)
- Archivos de sistema (robots.txt, sitemap.xml, manifest.json)

❌ **NO en raíz**:
- Archivos JSON de reportes → `archived/reports/`
- Archivos de prueba → `archived/test-files/`
- Documentación → `docs/`
- Scripts → `scripts/`

### Directorio `archived/`

```
archived/
├── old-html/         # HTML antiguo que ya no se usa
├── old-posts/        # Posts antiguos eliminados
├── old-scripts/      # Scripts obsoletos
├── reports/          # Reportes JSON históricos
└── test-files/       # Archivos de prueba temporales
```

### Qué Archivar

Mover a `archived/` cuando:
- Archivos ya no se usan pero son históricos
- Reportes de análisis pasados
- Versiones antiguas de código
- Archivos de prueba completados

Eliminar completamente:
- Archivos `.history/` del editor
- Archivos temporales (`.bak`, `.backup`, `*~`)
- node_modules (se regeneran con `npm install`)

## 🔄 Git

### Verificar Estado

```bash
# Ver estado actual
git status

# Ver archivos ignorados
git status --ignored

# Ver diferencias
git diff
```

### Limpiar Git

```bash
# Limpiar archivos no rastreados (¡CUIDADO!)
git clean -fd

# Ver qué se limpiaría (sin hacerlo)
git clean -fdn
```

### .gitignore Actualizado

El `.gitignore` ya excluye:
- `node_modules/`
- `.env` y variables de entorno
- `.history/` (historial del editor)
- `temp/`, `tmp/`
- `archived/` (archivos archivados)
- Archivos de sistema (`.DS_Store`, `Thumbs.db`)

## 📊 Monitoreo

### Verificar Tamaño del Proyecto

```bash
# Tamaño total
du -sh .

# Por directorio
du -sh */ | sort -h

# Archivos más grandes
find . -type f -exec du -h {} + | sort -rh | head -20
```

### Verificar Enlaces Rotos

```bash
# Buscar referencias a archivos que no existen
grep -r "src=\"" *.html | while read line; do
  file=$(echo $line | cut -d'"' -f2)
  [ ! -f "$file" ] && echo "Missing: $file in $line"
done
```

## 🚀 Optimizaciones Periódicas

### Imágenes

```bash
# Convertir nuevas imágenes a WebP
bash scripts/convert-images-to-webp.sh

# Optimizar imágenes responsivas
bash scripts/optimize-images-responsive.sh
```

### Videos

```bash
# Optimizar videos
bash scripts/optimize-video.sh

# Generar versiones responsivas
bash scripts/generate-responsive-videos.sh
```

### Blog

```bash
# Actualizar imágenes del blog
bash scripts/update-blog-images.sh

# Generar imágenes para nuevos posts
bash scripts/generate-blog-images.sh
```

## 🔍 Diagnóstico

### Verificar Integridad

```bash
# Verificar referencias minificadas
bash scripts/update-minified-references.sh

# Verificar referencias de imágenes
bash scripts/update-image-references.sh
```

### Testing Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# En otra terminal, probar endpoints
curl http://localhost:8788/
curl http://localhost:8788/blog.html
curl -X POST http://localhost:8788/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Test"}'
```

## 📝 Checklist de Mantenimiento

### Semanal
- [ ] Revisar logs de errores en Cloudflare
- [ ] Verificar funcionamiento de formularios
- [ ] Backup de archivos importantes

### Mensual
- [ ] Actualizar dependencias (`npm update`)
- [ ] Regenerar minificados si hay cambios
- [ ] Limpiar archivos temporales
- [ ] Revisar y archivar reportes viejos
- [ ] Verificar enlaces rotos

### Trimestral
- [ ] Auditoría de seguridad (dependencias)
- [ ] Optimizar imágenes nuevas
- [ ] Revisar y actualizar documentación
- [ ] Backup completo del proyecto
- [ ] Revisar Core Web Vitals

## 🆘 Resolución de Problemas

### El sitio no carga

1. Verificar deployment: `wrangler pages deployment list`
2. Ver logs: Panel de Cloudflare → Pages → Deployment logs
3. Probar localmente: `npm run dev`

### Formularios no funcionan

1. Verificar API keys en variables de entorno
2. Revisar logs de Functions en Cloudflare
3. Probar endpoint directamente con curl
4. Verificar configuración de Resend

### Chatbot no responde

1. Verificar `GEMINI_API_KEY` en variables de entorno
2. Revisar console del navegador
3. Verificar endpoint `/api/chatbot` funciona
4. Revisar logs en Cloudflare Functions

### Imágenes no cargan

1. Verificar rutas en HTML
2. Verificar que archivos existen en `/assets/`
3. Verificar formato (WebP vs PNG/JPG)
4. Verificar configuración de `_headers`

## 📦 Backup

### Qué hacer backup

✅ Hacer backup de:
- Código fuente (`*.html`, `*.js`, `*.css`)
- Assets (`/assets/`)
- Configuración (`package.json`, `wrangler.toml`)
- Documentación (`/docs/`)
- Scripts (`/scripts/`)

❌ NO hacer backup de:
- `node_modules/`
- `.history/`
- Archivos temporales
- Logs

### Cómo hacer backup

```bash
# Crear tarball
tar -czf celula-site-backup-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.history' \
  --exclude='temp' \
  --exclude='.wrangler' \
  .

# O usar git
git archive --format=zip --output=celula-site-$(date +%Y%m%d).zip HEAD
```

---

**Última actualización**: 20 de Noviembre, 2025
