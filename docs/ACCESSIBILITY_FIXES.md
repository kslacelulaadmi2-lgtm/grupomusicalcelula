# Correcciones de Accesibilidad - Lighthouse

## Resumen de Problemas Detectados

### 1. ❌ Botones sin nombres accesibles (Widget Featurable)
**Problema:** Los botones del carousel de reseñas no tienen aria-label  
**Ubicación:** Generados dinámicamente por widget de Featurable  
**Impacto:** Lectores de pantalla leen "botón" sin contexto

**Solución:**
```javascript
// Agregar al script que inicializa Featurable
document.querySelectorAll('.carousel__btn--left').forEach(btn => {
  btn.setAttribute('aria-label', 'Reseña anterior');
});
document.querySelectorAll('.carousel__btn--right').forEach(btn => {
  btn.setAttribute('aria-label', 'Reseña siguiente');
});
```

### 2. ❌ Imágenes sin atributo alt (Widget Featurable)
**Problema:** Imágenes de perfil de reviewers sin alt  
**Ubicación:** `.review__reviewer-img` generado por Featurable  
**Impacto:** Lectores de pantalla no pueden describir imágenes

**Solución:**
```javascript
// Agregar después de cargar el widget
document.querySelectorAll('.review__reviewer-img').forEach(img => {
  const reviewerName = img.closest('.review__header')?.querySelector('.review__reviewer-name')?.textContent || 'Usuario';
  img.setAttribute('alt', `Foto de perfil de ${reviewerName}`);
});
```

### 3. ❌ Elementos focables dentro de [aria-hidden="true"]
**Problema:** Botones "Leer más" dentro de slides ocultos son focables  
**Ubicación:** `.slick-slide[aria-hidden="true"] button.review__read-more`  
**Impacto:** Tab navigation llega a elementos invisibles

**Solución:**
```javascript
// Actualizar tabindex cuando cambia el slide activo
const observer = new MutationObserver(() => {
  document.querySelectorAll('.slick-slide').forEach(slide => {
    const isHidden = slide.getAttribute('aria-hidden') === 'true';
    const buttons = slide.querySelectorAll('button, a');
    buttons.forEach(btn => {
      btn.setAttribute('tabindex', isHidden ? '-1' : '0');
    });
  });
});

observer.observe(document.querySelector('.slick-slider'), {
  attributes: true,
  subtree: true,
  attributeFilter: ['aria-hidden']
});
```

### 4. ⚠️ Contraste de colores insuficiente

#### 4.1 Section Titles
**Ubicación:** `index.html:298, 326`  
**Problema:** Texto gris sobre fondo oscuro (ratio < 4.5:1)

**Solución en `css/styles.css`:**
```css
.section-title {
    font: var(--font-large);
    text-align: center;
    margin-bottom: 20px;
    color: #ffffff; /* Cambiar de var(--content-text) a blanco puro */
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8); /* Agregar sombra para mejor legibilidad */
}

.section-description {
    font: var(--font-body);
    text-align: center;
    margin-bottom: 60px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
    color: #f0f0f0; /* Texto más claro */
}
```

#### 4.2 Botón "Cotiza tu evento"
**Ubicación:** `index.html:179`  
**Problema:** Azul claro sobre azul (#3d9be9) tiene bajo contraste

**Solución en `css/styles.css`:**
```css
.btn-primary {
    background: #2563eb; /* Azul más oscuro para mejor contraste */
    color: #ffffff;
    box-shadow: var(--button-shadow);
    font-weight: 600; /* Bold para mejor legibilidad */
}

.btn-primary:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
}
```

### 5. ❌ Video sin subtítulos (captions)
**Problema:** Video background sin `<track kind="captions">`  
**Ubicación:** `.persistent-video-element`  
**Impacto:** Usuarios sordos no tienen acceso al audio

**Solución:**
El video background es decorativo (sin diálogo/narración), debe marcarse como tal:

```html
<!-- En el script que genera el video -->
<video 
  autoplay 
  loop 
  playsinline 
  preload="auto" 
  class="persistent-video-element"
  webkit-playsinline
  muted
  aria-hidden="true"
  role="presentation">
  <source src="assets/video/background-720p.webm" type="video/webm">
</video>
```

## Implementación

### Archivo: `js/accessibility-fixes.js`

```javascript
/**
 * Correcciones de accesibilidad para widgets de terceros
 */

class AccessibilityFixes {
  constructor() {
    this.init();
  }

  init() {
    // Esperar a que Featurable cargue
    if (typeof Featurable !== 'undefined') {
      this.fixFeaturableAccessibility();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.fixFeaturableAccessibility(), 1000);
      });
    }

    // Fijar video background
    this.fixVideoAccessibility();

    // Fijar slides focables
    this.fixSliderFocusability();
  }

  fixFeaturableAccessibility() {
    // Botones de carousel
    document.querySelectorAll('[class*="carousel__btn--left"]').forEach(btn => {
      if (!btn.getAttribute('aria-label')) {
        btn.setAttribute('aria-label', 'Ver reseña anterior');
      }
    });

    document.querySelectorAll('[class*="carousel__btn--right"]').forEach(btn => {
      if (!btn.getAttribute('aria-label')) {
        btn.setAttribute('aria-label', 'Ver reseña siguiente');
      }
    });

    // Imágenes de reviewers
    document.querySelectorAll('[class*="review__reviewer-img"]').forEach(img => {
      if (!img.getAttribute('alt')) {
        const reviewContainer = img.closest('[class*="review"]');
        const reviewerName = reviewContainer?.querySelector('[class*="reviewer-name"]')?.textContent?.trim();
        img.setAttribute('alt', reviewerName ? `Foto de ${reviewerName}` : 'Foto de perfil del cliente');
      }
    });
  }

  fixVideoAccessibility() {
    document.querySelectorAll('.persistent-video-element, .hero-background-video').forEach(video => {
      video.setAttribute('aria-hidden', 'true');
      video.setAttribute('role', 'presentation');
    });
  }

  fixSliderFocusability() {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('[class*="slick-slide"]').forEach(slide => {
        const isHidden = slide.getAttribute('aria-hidden') === 'true';
        const focusables = slide.querySelectorAll('button, a, input, select, textarea, [tabindex]');
        
        focusables.forEach(el => {
          if (isHidden) {
            el.setAttribute('tabindex', '-1');
          } else if (!el.hasAttribute('tabindex') || el.getAttribute('tabindex') === '-1') {
            el.setAttribute('tabindex', '0');
          }
        });
      });
    });

    const sliders = document.querySelectorAll('[class*="slick-slider"]');
    sliders.forEach(slider => {
      observer.observe(slider, {
        attributes: true,
        subtree: true,
        attributeFilter: ['aria-hidden']
      });
    });
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AccessibilityFixes());
} else {
  new AccessibilityFixes();
}
```

### Incluir en `index.html`:

```html
<!-- Antes del cierre de </body> -->
<script src="js/accessibility-fixes.js" defer></script>
```

## Mejoras CSS (Aplicar a `css/styles.css`)

```css
/* Mejorar contraste de textos */
.section-title {
    color: #ffffff !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.section-description {
    color: #f0f0f0 !important;
}

.text-white {
    color: #ffffff !important;
}

/* Mejorar contraste de botones */
.btn-primary {
    background: #2563eb;
    color: #ffffff;
    font-weight: 600;
}

.btn-primary:hover {
    background: #1d4ed8;
}

.btn-secondary {
    background: #fbbf24; /* Amarillo más oscuro */
    color: #000000;
    font-weight: 600;
}
```

## Verificación

### Después de implementar:

1. **Test con Lighthouse**
   - Accesibilidad debe subir a >90
   
2. **Test manual con screen reader**
   - Botones de carousel se leen correctamente
   - Imágenes tienen alt descriptivo
   - Tab navigation no va a elementos ocultos

3. **Test de contraste**
   - Usar herramienta: https://webaim.org/resources/contrastchecker/
   - Ratio mínimo: 4.5:1 para texto normal
   - Ratio mínimo: 3:1 para texto grande

## Prioridad

1. **Alta:** Contraste de colores (crítico para legibilidad)
2. **Alta:** Botones sin aria-label (crítico para screen readers)
3. **Media:** Imágenes sin alt
4. **Media:** Elementos focables en aria-hidden
5. **Baja:** Video sin captions (es decorativo)

## Notas

- Los problemas de Featurable son inherentes al widget de terceros
- No podemos modificar su código fuente
- Usamos JavaScript para "parchar" después de que cargue
- Considerar alternativa a Featurable si la accesibilidad es crítica
