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

    // Re-ejecutar cuando el DOM cambie (carousel updates)
    const observer = new MutationObserver(() => {
      this.fixFeaturableAccessibility();
    });

    const reviewsContainer = document.querySelector('[data-featurable-group="review card"]');
    if (reviewsContainer) {
      observer.observe(reviewsContainer.parentElement, {
        childList: true,
        subtree: true
      });
    }
  }

  fixVideoAccessibility() {
    document.querySelectorAll('.persistent-video-element, .hero-background-video').forEach(video => {
      video.setAttribute('aria-hidden', 'true');
      video.setAttribute('role', 'presentation');
    });
  }

  fixSliderFocusability() {
    const updateFocusability = () => {
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
    };

    // Ejecutar inmediatamente
    updateFocusability();

    // Observar cambios
    const observer = new MutationObserver(updateFocusability);

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
