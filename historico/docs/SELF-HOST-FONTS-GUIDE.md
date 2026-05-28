# Self-Host Google Fonts Implementation Guide

## Objetivo
Eliminar la dependencia de Google Fonts alojándolas localmente, mejorando el tiempo de carga en 100-200ms y cumpliendo con GDPR.

---

## 📦 Fuentes Utilizadas Actualmente

```
Lobster: wght@400
Open Sans: wght@400;600;700
Raleway: wght@400;600
```

**URL actual:**
```html
<link href="https://fonts.googleapis.com/css2?family=Lobster:wght@400&family=Open+Sans:wght@400;600;700&family=Raleway:wght@400;600&display=swap" rel="stylesheet">
```

---

## 🔧 Paso a Paso

### **1. Descargar Fuentes**

**Opción recomendada: Google Webfonts Helper**
- URL: https://gwfh.mranftl.com/fonts

**Para cada fuente:**

#### **Lobster:**
1. Ir a https://gwfh.mranftl.com/fonts/lobster
2. Seleccionar charset: `latin`
3. Seleccionar weight: `regular (400)`
4. Descargar archivos: `.woff` y `.woff2`

#### **Open Sans:**
1. Ir a https://gwfh.mranftl.com/fonts/open-sans
2. Seleccionar weights: `regular (400)`, `600`, `700`
3. Descargar archivos `.woff` y `.woff2`

#### **Raleway:**
1. Ir a https://gwfh.mranftl.com/fonts/raleway
2. Seleccionar weights: `regular (400)`, `600`
3. Descargar archivos `.woff` y `.woff2`

---

### **2. Estructura de Archivos**

Crear directorio:
```bash
mkdir -p assets/fonts
```

Organización:
```
assets/fonts/
├── lobster-v28-latin-regular.woff2
├── lobster-v28-latin-regular.woff
├── open-sans-v34-latin-regular.woff2
├── open-sans-v34-latin-regular.woff
├── open-sans-v34-latin-600.woff2
├── open-sans-v34-latin-600.woff
├── open-sans-v34-latin-700.woff2
├── open-sans-v34-latin-700.woff
├── raleway-v28-latin-regular.woff2
├── raleway-v28-latin-regular.woff
├── raleway-v28-latin-600.woff2
└── raleway-v28-latin-600.woff
```

---

### **3. CSS @font-face**

Crear `assets/fonts/fonts.css`:

```css
/* Lobster Regular */
@font-face {
    font-display: swap;
    font-family: 'Lobster';
    font-style: normal;
    font-weight: 400;
    src: url('../fonts/lobster-v28-latin-regular.woff2') format('woff2'),
         url('../fonts/lobster-v28-latin-regular.woff') format('woff');
}

/* Open Sans Regular */
@font-face {
    font-display: swap;
    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 400;
    src: url('../fonts/open-sans-v34-latin-regular.woff2') format('woff2'),
         url('../fonts/open-sans-v34-latin-regular.woff') format('woff');
}

/* Open Sans 600 */
@font-face {
    font-display: swap;
    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 600;
    src: url('../fonts/open-sans-v34-latin-600.woff2') format('woff2'),
         url('../fonts/open-sans-v34-latin-600.woff') format('woff');
}

/* Open Sans 700 (Bold) */
@font-face {
    font-display: swap;
    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 700;
    src: url('../fonts/open-sans-v34-latin-700.woff2') format('woff2'),
         url('../fonts/open-sans-v34-latin-700.woff') format('woff');
}

/* Raleway Regular */
@font-face {
    font-display: swap;
    font-family: 'Raleway';
    font-style: normal;
    font-weight: 400;
    src: url('../fonts/raleway-v28-latin-regular.woff2') format('woff2'),
         url('../fonts/raleway-v28-latin-regular.woff') format('woff');
}

/* Raleway 600 */
@font-face {
    font-display: swap;
    font-family: 'Raleway';
    font-style: normal;
    font-weight: 600;
    src: url('../fonts/raleway-v28-latin-600.woff2') format('woff2'),
         url('../fonts/raleway-v28-latin-600.woff') format('woff');
}
```

---

### **4. Actualizar HTML**

**ANTES (index.html):**
```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Lobster:wght@400&family=Open+Sans:wght@400;600;700&family=Raleway:wght@400;600&display=swap" rel="stylesheet">
```

**DESPUÉS:**
```html
<!-- Fuentes locales -->
<link rel="preload" href="assets/fonts/fonts.css" as="style">
<link rel="stylesheet" href="assets/fonts/fonts.css">
```

**O mejor, preload de las fuentes:**
```html
<link rel="preload" href="assets/fonts/open-sans-v34-latin-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/lobster-v28-latin-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/fonts/fonts.css">
```

---

### **5. Actualizar _headers**

Agregar cache para fuentes:

```
# Fuentes locales - cache 1 año
/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *
```

---

## 📊 Beneficios

| Aspecto | Antes (Google) | Después (Local) | Mejora |
|---------|----------------|-----------------|--------|
| Requests | 1-2 externos | 0 externos | ✓ |
| Latencia | ~100-200ms | ~0ms | 100-200ms ⚡ |
| GDPR | ⚠️ Problemático | ✅ Compliant | ✓ |
| Offline | ❌ | ✅ (con SW) | ✓ |
| Tamaño | Variable | ~120KB total | Similar |

**Tamaños aproximados:**
- Lobster: ~25KB (.woff2)
- Open Sans (3 weights): ~60KB
- Raleway (2 weights): ~35KB
- **Total:** ~120KB (una sola vez, luego cacheado)

---

## ⚠️ Consideraciones

### **Pros:**
- ✅ Sin dependencia externa
- ✅ Mejor para GDPR/privacidad
- ✅ Funciona offline
- ✅ Cache permanente
- ✅ Sin latencia DNS

### **Contras:**
- ⚠️ Mantenimiento manual de actualizaciones
- ⚠️ ~120KB adicionales en primera carga
- ⚠️ No se beneficia de cache compartido de Google

---

## 🚀 Implementación Rápida

### **Comandos automatizados:**

```bash
# 1. Crear directorio
mkdir -p assets/fonts

# 2. Descargar fuentes (manual desde gwfh.mranftl.com)
# O usar google-webfonts-helper CLI si está disponible

# 3. Crear fonts.css
cat > assets/fonts/fonts.css << 'EOF'
/* Pegar el @font-face de arriba */
EOF

# 4. Actualizar index.html
# (Manual: reemplazar link de Google Fonts)

# 5. Verificar
ls -lh assets/fonts/
```

---

## 📝 Checklist

- [ ] Crear directorio `assets/fonts/`
- [ ] Descargar fuentes desde Google Webfonts Helper
- [ ] Crear `assets/fonts/fonts.css` con @font-face
- [ ] Actualizar `index.html` (remover Google Fonts link)
- [ ] Agregar preload de fuentes críticas
- [ ] Actualizar `_headers` con cache para fuentes
- [ ] Verificar rendering correcto
- [ ] Medir impacto con Lighthouse

---

## 🔍 Verificación

### **Verificar que las fuentes cargan:**
```javascript
// En consola del navegador:
document.fonts.forEach(font => console.log(font.family, font.weight));
```

### **DevTools Network:**
- Verificar que las fuentes se cargan desde `/assets/fonts/`
- No debe haber requests a `fonts.googleapis.com`
- Verificar header `Cache-Control: max-age=31536000`

---

## 💡 Alternativa: Subset de Fuentes

Para reducir aún más el tamaño:

```bash
# Generar subset solo con caracteres usados
pyftsubset open-sans-regular.woff2 \
  --text-file=chars-used.txt \
  --output-file=open-sans-subset.woff2
```

**Beneficio:** Reducción adicional de 30-50%

---

## 📈 Prioridad

**Alta prioridad si:**
- Preocupación por GDPR
- Target audience en regiones con conexión lenta
- Necesidad de funcionalidad offline

**Baja prioridad si:**
- PageSpeed ya > 90
- No hay concerns de privacidad
- Budget limitado de tiempo

---

## 🌐 URLs de Referencia

- **Google Webfonts Helper:** https://gwfh.mranftl.com/fonts
- **Font Subsetting:** https://github.com/fonttools/fonttools
- **GDPR y Fonts:** https://www.cookiebot.com/en/google-fonts-gdpr/

---

**Guía de Self-Hosting de Fuentes**  
**Última actualización:** 20/11/2025 03:24
