# 🎯 Guía de Implementación GTM para Sitio Principal

**Sitio:** grupomusicalcelula.com (sitio principal)  
**GTM Container:** GTM-5783XFN4 (el mismo usado en marketing)  
**Objetivo:** Centralizar tracking de conversiones y eventos

---

## 📋 Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [Paso 1: Instalar GTM en el Sitio](#paso-1-instalar-gtm-en-el-sitio)
3. [Paso 2: Configurar Variables](#paso-2-configurar-variables)
4. [Paso 3: Configurar Activadores](#paso-3-configurar-activadores)
5. [Paso 4: Configurar Etiquetas](#paso-4-configurar-etiquetas)
6. [Paso 5: Probar con Tag Assistant](#paso-5-probar-con-tag-assistant)
7. [Paso 6: Publicar](#paso-6-publicar)
8. [Eventos a Rastrear](#eventos-a-rastrear)
9. [Troubleshooting](#troubleshooting)

---

## Pre-requisitos

✅ Acceso al código del sitio principal (grupomusicalcelula.com)  
✅ Acceso a GTM Container: `GTM-5783XFN4`  
✅ Acceso a Google Ads (Cuenta: 943484255)  
✅ Conocer qué eventos/conversiones quieres rastrear

---

## Paso 1: Instalar GTM en el Sitio

### 1.1 Identificar Archivos HTML

Encuentra todos los archivos HTML del sitio principal:
- `index.html` (página principal)
- `blog.html` (blog)
- `cotizador.html` (cotizador)
- `testimonios.html` (testimonios)
- Cualquier otro archivo HTML

### 1.2 Agregar Snippet de GTM

En **TODOS** los archivos HTML, agrega el código de GTM:

#### En el `<head>` (inmediatamente después de la etiqueta de apertura):

```html
<head>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-5783XFN4');</script>
    <!-- End Google Tag Manager -->
    
    <!-- Resto del contenido del head -->
    <meta charset="UTF-8">
    ...
</head>
```

#### En el `<body>` (inmediatamente después de la etiqueta de apertura):

```html
<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5783XFN4"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    
    <!-- Resto del contenido del body -->
    <header>
    ...
</body>
```

### 1.3 Eliminar Código Antiguo (Si Existe)

❌ **Elimina** cualquier código viejo de tracking:
- Snippets de `gtag.js` directo
- Google Analytics antiguo (`analytics.js`)
- Google Ads snippets directos
- Funciones como `gtag_report_conversion()`

⚠️ **Importante:** Todo el tracking se manejará desde GTM, no necesitas código adicional en el HTML.

---

## Paso 2: Configurar Variables

Las variables capturan datos para usar en tus etiquetas.

### Variables Ya Creadas en GTM-5783XFN4:

✅ `DL - formName` (para formularios de marketing)  
✅ `DL - eventType`  
✅ `DL - eventDate`  
✅ `DL - formValue`

### Variables Nuevas para el Sitio Principal:

#### 2.1 Variable: Página Vista

1. En GTM → **Variables** → **Nueva**
2. Nombre: `Page Path`
3. Tipo: **Variable de página** → `Page Path`
4. **Guardar**

#### 2.2 Variable: Click Text

1. **Nueva** variable
2. Nombre: `Click Text`
3. Tipo: **Variable de clic** → `Click Text`
4. **Guardar**

#### 2.3 Variable: Click URL

1. **Nueva** variable
2. Nombre: `Click URL`
3. Tipo: **Variable de clic** → `Click URL`
4. **Guardar**

#### 2.4 Variables Personalizadas (según tus eventos)

**Ejemplo para Cotizador:**

1. **Nueva** variable
2. Nombre: `DL - cotizadorData`
3. Tipo: **Variable de capa de datos**
4. Nombre de variable: `cotizadorData`
5. Versión: **Versión 2**
6. **Guardar**

---

## Paso 3: Configurar Activadores

Los activadores determinan cuándo se disparan las etiquetas.

### 3.1 Activador: Vista de Cotizador

1. En GTM → **Activadores** → **Nuevo**
2. Nombre: `Pageview - Cotizador`
3. Tipo: **Vista de página**
4. Se activa en: **Algunas vistas de página**
5. Condición: `Page Path` **contiene** `/cotizador`
6. **Guardar**

### 3.2 Activador: Click en Botón de Cotización

1. **Nuevo** activador
2. Nombre: `Click - Botón Cotizar`
3. Tipo: **Todos los clics**
4. Se activa en: **Algunos clics**
5. Condición: 
   - `Click Text` **contiene** `Cotizar`
   - O `Click Classes` **contiene** `btn-cotizar`
   - O `Click ID` **es igual a** `btnCotizar`
6. **Guardar**

### 3.3 Activador: Envío de Formulario Cotizador

1. **Nuevo** activador
2. Nombre: `Form Submit - Cotizador`
3. Tipo: **Envío de formulario**
4. Se activa en: **Algunos formularios**
5. Condición:
   - `Form ID` **es igual a** `cotizadorForm`
   - O `Page Path` **contiene** `/cotizador`
6. **Guardar**

### 3.4 Activador: Click en WhatsApp

1. **Nuevo** activador
2. Nombre: `Click - WhatsApp`
3. Tipo: **Todos los clics**
4. Se activa en: **Algunos clics**
5. Condición: `Click URL` **contiene** `wa.me`
6. **Guardar**

### 3.5 Activador: Click en Teléfono

1. **Nuevo** activador
2. Nombre: `Click - Teléfono`
3. Tipo: **Todos los clics**
4. Se activa en: **Algunos clics**
5. Condición: `Click URL` **contiene** `tel:`
6. **Guardar**

---

## Paso 4: Configurar Etiquetas

Las etiquetas envían datos a Google Ads, Analytics, etc.

### 4.1 Etiqueta: Google Ads - Conversión Cotizador

1. En GTM → **Etiquetas** → **Nueva**
2. Nombre: `Google Ads - Cotizador Completado`
3. Tipo: **Seguimiento de conversiones de Google Ads**
4. Configuración:
   - **ID de conversión:** `943484255`
   - **Etiqueta de conversión:** `jZjxCKPzodYbEN_a8cED` (la misma de marketing)
   - **Valor:** `10` (o el valor que consideres para un cotizador)
   - **Código de moneda:** `MXN`
5. **Activación:** `Form Submit - Cotizador`
6. **Guardar**

### 4.2 Etiqueta: Evento GA4 - Vista Cotizador

Si usas Google Analytics 4:

1. **Nueva** etiqueta
2. Nombre: `GA4 - Vista Cotizador`
3. Tipo: **Evento de Google Analytics 4**
4. **Measurement ID:** `GT-5MXH55ZG` (si es el mismo que en marketing)
5. **Nombre del evento:** `view_cotizador`
6. **Activación:** `Pageview - Cotizador`
7. **Guardar**

### 4.3 Etiqueta: Evento GA4 - Click WhatsApp

1. **Nueva** etiqueta
2. Nombre: `GA4 - Click WhatsApp`
3. Tipo: **Evento de Google Analytics 4**
4. **Measurement ID:** `GT-5MXH55ZG`
5. **Nombre del evento:** `click_whatsapp`
6. **Parámetros del evento:**
   - `page_location`: `{{Page URL}}`
   - `link_text`: `{{Click Text}}`
7. **Activación:** `Click - WhatsApp`
8. **Guardar**

### 4.4 Etiqueta: Evento GA4 - Click Teléfono

1. **Nueva** etiqueta
2. Nombre: `GA4 - Click Teléfono`
3. Tipo: **Evento de Google Analytics 4**
4. **Measurement ID:** `GT-5MXH55ZG`
5. **Nombre del evento:** `click_phone`
6. **Parámetros del evento:**
   - `page_location`: `{{Page URL}}`
7. **Activación:** `Click - Teléfono`
8. **Guardar**

---

## Paso 5: Probar con Tag Assistant

### 5.1 Activar Preview Mode

1. En GTM, click en **Vista previa** (arriba a la derecha)
2. Ingresa la URL: `https://grupomusicalcelula.com`
3. Click en **Connect**

### 5.2 Verificar en el Sitio

Se abrirá tu sitio con el panel de Tag Assistant en la parte inferior.

**Verifica:**

1. **Al cargar la página:**
   - ✅ GTM contenedor carga
   - ✅ Vinculador de conversiones se dispara (ya configurado)

2. **Al navegar a /cotizador:**
   - ✅ Evento `Pageview - Cotizador` se dispara
   - ✅ Etiqueta `GA4 - Vista Cotizador` se activa

3. **Al hacer click en WhatsApp:**
   - ✅ Evento `Click - WhatsApp` se dispara
   - ✅ Etiqueta `GA4 - Click WhatsApp` se activa

4. **Al enviar formulario:**
   - ✅ Evento `Form Submit - Cotizador` se dispara
   - ✅ Etiqueta `Google Ads - Cotizador Completado` se activa

### 5.3 Revisar Variables

En Tag Assistant, al dispararse un evento:
- Click en el evento
- Ve a la pestaña **Variables**
- Verifica que las variables capturen los datos correctos

---

## Paso 6: Publicar

### 6.1 Verificar Cambios

1. En GTM, revisa el resumen de cambios pendientes (arriba a la derecha)
2. Verifica que todas las etiquetas, activadores y variables estén correctas

### 6.2 Publicar Versión

1. Click en **Enviar** (arriba a la derecha)
2. **Nombre de versión:** `v2 - Implementación sitio principal`
3. **Descripción:** 
   ```
   - Agregado tracking para cotizador
   - Eventos de WhatsApp y teléfono
   - Google Ads conversiones
   - GA4 eventos personalizados
   ```
4. Click en **Publicar**

---

## Eventos a Rastrear

### Eventos Recomendados para el Sitio Principal:

| Evento | Descripción | Activador | Conversión |
|--------|-------------|-----------|------------|
| **view_cotizador** | Usuario visita cotizador | Pageview | No |
| **cotizador_completed** | Usuario completa cotizador | Form Submit | ✅ Sí |
| **click_whatsapp** | Click en botón WhatsApp | Click URL | Opcional |
| **click_phone** | Click en número de teléfono | Click URL | Opcional |
| **view_blog_post** | Usuario lee artículo del blog | Pageview | No |
| **click_cta_hero** | Click en CTA principal | Click | Opcional |
| **scroll_depth** | Usuario hace scroll (50%, 75%, 100%) | Scroll | No |

### Eventos Específicos por Sección:

#### **Cotizador**
```javascript
// Push al dataLayer cuando se completa
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
    event: 'cotizador_completed',
    cotizadorData: {
        tipoEvento: 'Boda',
        numeroInvitados: 150,
        fechaEvento: '2025-06-15',
        presupuesto: '30000'
    }
});
```

#### **Blog**
```javascript
// Push al leer un artículo
window.dataLayer.push({
    event: 'view_blog_post',
    postTitle: 'Título del artículo',
    postCategory: 'Consejos',
    postAuthor: 'La Célula'
});
```

#### **Testimonios**
```javascript
// Push al ver testimonios
window.dataLayer.push({
    event: 'view_testimonial',
    testimonialCount: 3
});
```

---

## Paso 7: Implementar Push al DataLayer en el Código

### 7.1 En el Cotizador (cotizador.html o .js)

Busca el código de envío del formulario y agrega:

```javascript
// Cuando el formulario se envía exitosamente
function onCotizadorSubmit(formData) {
    // Push al dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'cotizador_completed',
        cotizadorData: {
            tipoEvento: formData.evento,
            numeroInvitados: formData.invitados,
            fechaEvento: formData.fecha,
            presupuesto: formData.presupuesto || 'No especificado'
        }
    });
    
    // Resto de tu código (redirect, WhatsApp, etc.)
    // ...
}
```

### 7.2 En el Blog (blog.html)

Al cargar un artículo:

```javascript
// Al inicio del archivo JS del blog
document.addEventListener('DOMContentLoaded', function() {
    const postTitle = document.querySelector('h1')?.textContent;
    const postCategory = document.querySelector('.category')?.textContent;
    
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'view_blog_post',
        postTitle: postTitle,
        postCategory: postCategory
    });
});
```

---

## Configuración Avanzada (Opcional)

### Tracking de Scroll Depth

1. En GTM → **Variables** → Habilitar variables integradas:
   - ✅ Scroll Depth Threshold
   - ✅ Scroll Depth Units

2. **Nuevo** activador:
   - Nombre: `Scroll - 50% o más`
   - Tipo: **Profundidad de desplazamiento**
   - Profundidades: `50`, `75`, `100`
   - **Guardar**

3. **Nueva** etiqueta:
   - Nombre: `GA4 - Scroll Depth`
   - Tipo: **Evento de Google Analytics 4**
   - Nombre del evento: `scroll`
   - Parámetros:
     - `scroll_depth`: `{{Scroll Depth Threshold}}`
   - Activación: `Scroll - 50% o más`

### Tracking de Videos (si tienes videos)

1. **Nuevo** activador:
   - Nombre: `Video - YouTube`
   - Tipo: **Video de YouTube**
   - Capturar: `Start`, `Complete`, `Progress` (25%, 50%, 75%)
   - **Guardar**

2. **Nueva** etiqueta:
   - Nombre: `GA4 - Video Interaction`
   - Tipo: **Evento de Google Analytics 4**
   - Nombre del evento: `video_{{Video Status}}`
   - Activación: `Video - YouTube`

---

## Troubleshooting

### ❌ GTM no carga

**Causa:** Snippet mal copiado o conflicto con otro código

**Solución:**
```javascript
// En consola del navegador, verifica:
console.log(window.dataLayer);
// Debe mostrar un array, no 'undefined'
```

### ❌ Eventos no se disparan

**Causa:** Activadores mal configurados

**Solución:**
1. Usa GTM Preview mode
2. Realiza la acción (click, submit, etc.)
3. Ve a **Tag Assistant** → pestaña **Summary**
4. Si no aparece el evento, revisa las condiciones del activador

### ❌ Conversiones no aparecen en Google Ads

**Causa:** Tarda 24-48 horas en aparecer

**Solución:**
1. Verifica en Tag Assistant que la etiqueta se dispara
2. Espera 24-48 horas
3. Revisa en Google Ads → Herramientas → Conversiones

### ❌ Variables capturan valores incorrectos

**Causa:** Nombre de variable incorrecto en el dataLayer

**Solución:**
```javascript
// Verifica que el nombre coincida exactamente:
window.dataLayer.push({
    event: 'cotizador_completed',
    cotizadorData: { ... }  // Este nombre debe coincidir con la variable en GTM
});
```

---

## Checklist Final

Antes de considerar la implementación completa:

### En el Código:
- [ ] Snippet de GTM en todas las páginas HTML (`<head>` y `<body>`)
- [ ] Código antiguo de tracking eliminado
- [ ] Push al dataLayer implementado en formularios/eventos clave
- [ ] Probado localmente sin errores en consola

### En GTM:
- [ ] Variables creadas y probadas
- [ ] Activadores configurados correctamente
- [ ] Etiquetas vinculadas a activadores correctos
- [ ] Conversión de Google Ads configurada
- [ ] Probado con Tag Assistant
- [ ] Publicado con nombre de versión descriptivo

### En Producción:
- [ ] Sitio desplegado con cambios
- [ ] GTM Preview mode conectado al sitio en vivo
- [ ] Eventos se disparan correctamente
- [ ] Conversiones registrándose en Google Ads (esperar 24-48h)
- [ ] No hay errores en consola del navegador

---

## 📊 Monitoreo Post-Implementación

### Día 1-2:
- ✅ Verifica que GTM cargue en todas las páginas
- ✅ Prueba cada evento manualmente
- ✅ Revisa consola del navegador en busca de errores

### Semana 1:
- ✅ Revisa conversiones en Google Ads
- ✅ Analiza eventos en GA4 (si configurado)
- ✅ Compara datos con el sistema anterior (si existía)

### Mensual:
- ✅ Audita etiquetas que no se usan
- ✅ Optimiza activadores si es necesario
- ✅ Agrega nuevos eventos según necesidades

---

## 📞 Recursos

- **GTM Dashboard:** https://tagmanager.google.com/ (GTM-5783XFN4)
- **Google Ads:** Cuenta 943484255
- **Tag Assistant:** https://tagassistant.google.com/
- **GTM Docs:** https://support.google.com/tagmanager
- **DataLayer Reference:** https://developers.google.com/tag-platform/devguides/datalayer

---

## 🎯 Ejemplo de Implementación Completa

### Archivo: cotizador.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-5783XFN4');</script>
    <!-- End Google Tag Manager -->
    
    <meta charset="UTF-8">
    <title>Cotizador - Grupo La Célula</title>
</head>
<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5783XFN4"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    
    <form id="cotizadorForm">
        <!-- Campos del formulario -->
        <input type="text" name="evento" placeholder="Tipo de evento">
        <input type="number" name="invitados" placeholder="Número de invitados">
        <input type="date" name="fecha">
        <button type="submit">Enviar Cotización</button>
    </form>
    
    <script>
        document.getElementById('cotizadorForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            // Push al dataLayer ANTES de enviar/redirigir
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'cotizador_completed',
                cotizadorData: {
                    tipoEvento: formData.get('evento'),
                    numeroInvitados: formData.get('invitados'),
                    fechaEvento: formData.get('fecha')
                }
            });
            
            // Ahora sí, envía el formulario o redirige
            // ... tu código aquí ...
        });
    </script>
</body>
</html>
```

---

**¿Listo para implementar GTM en el sitio principal?** 🚀

Esta guía te llevará paso a paso. Si tienes dudas sobre algún paso específico, consulta la sección de troubleshooting o los recursos al final.
