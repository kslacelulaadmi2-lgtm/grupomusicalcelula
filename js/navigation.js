/*! Grupo Musical Célula - Clean Navigation System */document.addEventListener('DOMContentLoaded',function(){console.log('🎵 Inicializando sistema de navegación limpio...');function initSmoothScrolling(){const navLinks=document.querySelectorAll('.nav-link[href^="#"]');navLinks.forEach(link=>{link.addEventListener('click',function(e){e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
        // Temporarily disable scroll spy during scroll
        const observer = window.celulaScrollSpyObserver;
        if (observer) {
            observer.disconnect();
        }

        const headerHeight = document.querySelector('.site-header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Actualizar estado activo
        updateActiveNavLink(this);

        // Cerrar menú móvil si está abierto
        closeMobileMenu();

        // Re-enable scroll spy after a short delay
        setTimeout(() => {
            if (window.celulaScrollSpyObserver) {
                window.celulaScrollSpyObserver.observe(targetElement);
                // Re-observe all sections
                const sections = document.querySelectorAll('section[id]');
                sections.forEach(section => {
                    window.celulaScrollSpyObserver.observe(section);
                });
            }
        }, 600); // Wait for scroll animation to complete
    }
});
});
}

// ===== MENÚ MÓVIL =====
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    console.log('📱 Inicializando menú móvil...');
    console.log('Toggle encontrado:', !!mobileToggle);
    console.log('Menu encontrado:', !!navMenu);

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔘 Click en botón hamburguesa');
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
            console.log('Estado del menú:', navMenu.classList.contains('active') ? 'ABIERTO' : 'CERRADO');
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                if (navMenu.classList.contains('active')) {
                    console.log('🚪 Cerrando menú (click fuera)');
                    closeMobileMenu();
                }
            }
        });

        // Cerrar menú al cambiar tamaño de ventana
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });

        console.log('✅ Menú móvil inicializado correctamente');
    } else {
        console.error('❌ No se encontraron elementos del menú móvil');
    }
}

function closeMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const mobileToggle = document.getElementById('mobile-menu-toggle');

    if (navMenu && mobileToggle) {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
    }
}

// ===== NAVEGACIÓN ACTIVA =====
function updateActiveNavLink(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

// ===== SCROLL SPY =====
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

                if (correspondingLink) {
                    updateActiveNavLink(correspondingLink);
                }
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-100px 0px -100px 0px'
    });

    // Store observer globally so it can be accessed by smooth scrolling function
    window.celulaScrollSpyObserver = observer;

    sections.forEach(section => observer.observe(section));
}

// ===== GALERÍA DE IMÁGENES =====
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (galleryItems.length === 0) return;

    // Crear modal para lightbox
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.innerHTML = `
            <span class="gallery-close">&times;</span>
            <img class="gallery-modal-content" src="" alt="">
        `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('.gallery-modal-content');
    const closeBtn = modal.querySelector('.gallery-close');

    // Agregar eventos a cada item de la galería
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('.gallery-image');

        // Efecto hover mejorado
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });

        // Click para abrir modal
        item.addEventListener('click', function() {
            modal.classList.add('active');
            modalImg.src = img.src;
            modalImg.alt = img.alt;
            document.body.style.overflow = 'hidden';
        });

        // Navegación por teclado
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `Ver imagen ${index + 1}: ${img.alt}`);

        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Cerrar modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ===== CAROUSEL DE GALERÍA =====
function initGalleryCarousel() {
    const carousel = document.getElementById('galleryCarousel');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    if (!carousel || !prevBtn || !nextBtn) return;

    const items = carousel.querySelectorAll('.gallery-item');
    if (items.length === 0) return;

    let currentIndex = 0;
    let itemsToShow = 1; // Mostrar 1 imagen en móvil
    let itemsToScroll = 1; // Navegar de a 1 imagen en móvil

    // Ajustar cantidades según el tamaño de pantalla
    updateItemsToShow();

    function updateItemsToShow() {
        if (window.innerWidth > 768) {
            itemsToShow = 3; // Mostrar 3 imágenes en escritorio
            itemsToScroll = 3; // Avanzar de a 3 imágenes
        } else {
            itemsToShow = 1; // Mostrar 1 imagen en móvil
            itemsToScroll = 1; // Avanzar de a 1 imagen
        }
    }

    function updateCarousel() {
        const containerWidth = carousel.parentElement.clientWidth;
        // Calcular el ancho real disponible considerando los márgenes entre elementos
        const totalMargin = (itemsToShow - 1) * 20; // 10px left + 10px right de margen entre elementos
        const itemWidth = (containerWidth - totalMargin) / itemsToShow;

        // Set width for each item
        items.forEach(item => {
            item.style.flex = `0 0 ${itemWidth}px`;
        });

        // Ajustar el ancho total del carrusel
        carousel.style.width = `${items.length * (itemWidth + 20)}px`; // Ancho + margen de 20px por item

        carousel.style.transform = `translateX(-${currentIndex * (itemWidth + 20)}px)`;
        carousel.style.transition = 'transform 0.3s ease';
    }

    function nextSlide() {
        const containerWidth = carousel.parentElement.clientWidth;
        const totalMargin = (itemsToShow - 1) * 20;
        const itemWidth = (containerWidth - totalMargin) / itemsToShow;
        const maxIndex = Math.max(0, items.length - itemsToShow);

        if (currentIndex < maxIndex) {
            currentIndex++;
            // Actualizar transformación manualmente para considerar el margen
            carousel.style.transform = `translateX(-${currentIndex * (itemWidth + 20)}px)`;
            carousel.style.transition = 'transform 0.3s ease';
        }
    }

    function prevSlide() {
        const containerWidth = carousel.parentElement.clientWidth;
        const totalMargin = (itemsToShow - 1) * 20;
        const itemWidth = (containerWidth - totalMargin) / itemsToShow;

        if (currentIndex > 0) {
            currentIndex--;
            // Actualizar transformación manualmente para considerar el margen
            carousel.style.transform = `translateX(-${currentIndex * (itemWidth + 20)}px)`;
            carousel.style.transition = 'transform 0.3s ease';
        }
    }

    // Inicializar el carrusel
    updateCarousel();

    // Event listeners para los botones
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Actualizar cuando se cambia el tamaño de la ventana
    window.addEventListener('resize', function() {
        updateItemsToShow();
        // Ajustar currentIndex si excede el nuevo máximo
        const maxIndex = Math.max(0, items.length - itemsToShow);
        currentIndex = Math.min(currentIndex, maxIndex);
        updateCarousel();
    });

    // Actualizar tamaño de elementos inicialmente
    setTimeout(updateCarousel, 100);
}

// ===== VIDEO DE FONDO =====
function initBackgroundVideo() {
    const video = document.querySelector('.background-video') || document.querySelector('.hero-video');

    if (!video) return;

    console.log('🎬 Inicializando video de fondo...');

    // Configurar video para autoplay
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    // Eventos de carga
    video.addEventListener('loadedmetadata', function() {
        console.log('📊 Metadatos del video cargados');
    });

    video.addEventListener('loadeddata', function() {
        console.log('✅ Video de fondo cargado y listo');
    });

    video.addEventListener('canplay', function() {
        console.log('▶️ Video listo para reproducir');
        video.play().catch(e => {
            console.warn('⚠️ Autoplay bloqueado:', e);
        });
    });

    video.addEventListener('playing', function() {
        console.log('🎥 Video reproduciéndose');
    });

    video.addEventListener('error', function(e) {
        console.error('❌ Error al cargar video:', e);
        const videoContainer = video.closest('.video-background');
        if (videoContainer) {
            videoContainer.style.background = `
                    linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(45, 45, 45, 0.8) 100%),
                    url('assets/images/hero-background.webp') center/cover no-repeat
                `;
            video.style.display = 'none';
        }
    });

    // Pausar cuando no esté visible
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video.play().catch(e => console.warn('No se pudo reproducir:', e));
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.1 });

    videoObserver.observe(video);

    // Optimización móvil
    if (window.innerWidth <= 768) {
        video.style.display = 'none';
        const videoContainer = video.closest('.video-background');
        if (videoContainer) {
            videoContainer.style.background = `
                    linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(45, 45, 45, 0.8) 100%),
                    url('assets/images/hero-background.webp') center/cover no-repeat
                `;
        }
    }
}

// ===== LAZY LOADING MEJORADO =====
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback para navegadores sin IntersectionObserver
        images.forEach(img => img.classList.add('loaded'));
    }
}

// ===== ACCESIBILIDAD =====
function initAccessibility() {
    // Navegación por teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });

    // Focus trap para menú móvil
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
        navMenu.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                const focusableElements = this.querySelectorAll('a, button');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
}

// ===== INICIALIZACIÓN =====
try {
    initSmoothScrolling();
    initMobileMenu();
    initScrollSpy();
    initGallery();
    initGalleryCarousel();
    initBackgroundVideo();
    initLazyLoading();
    initAccessibility();

    console.log('✅ Sistema de navegación y galería inicializados correctamente');
} catch (error) {
    console.error('❌ Error al inicializar sistema:', error);
}

// ===== UTILIDADES GLOBALES =====
window.CelulaNavigation = {
    scrollToSection: function(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            const headerHeight = document.querySelector('.site-header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    },

    toggleMobileMenu: function() {
        const navMenu = document.getElementById('nav-menu');
        const mobileToggle = document.getElementById('mobile-menu-toggle');

        if (navMenu && mobileToggle) {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        }
    },

    closeMobileMenu: closeMobileMenu
};
});