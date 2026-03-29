/*! Funcionalidad general del sitio - Grupo Musical Célula */function isMobileDevice(){return(typeof window.orientation!=='undefined')||(navigator.userAgent.indexOf('IEMobile')!==-1);}

// Funcionalidad general del sitio
document.addEventListener('DOMContentLoaded', function() {

    // Smooth scrolling para enlaces internos
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Actualizar estado activo
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Menú móvil - Manejado por navigation.js

    // Lazy loading para imágenes
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Animaciones al scroll
    const animatedElements = document.querySelectorAll('.fade-in');
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.6s ease-out';
            }
        });
    });

    animatedElements.forEach(el => animationObserver.observe(el));

    // Manejo de tarjetas de servicios con efecto flip
    function handleServiceCards() {
        const serviceCards = document.querySelectorAll('.service-card');
        const isMobile = window.innerWidth <= 768;

        console.log(`📱 Detectado: ${isMobile ? 'Móvil' : 'Desktop'} (${window.innerWidth}px)`);
        console.log(`🎴 Tarjetas encontradas: ${serviceCards.length}`);

        serviceCards.forEach((card, index) => {
            if (card.closest('.services-carousel')) return;

            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);

            newCard.addEventListener('click', function(e) {
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    return;
                }

                this.classList.toggle('flipped');
                console.log(`🔄 Tarjeta ${index + 1} ${this.classList.contains('flipped') ? 'volteada' : 'restaurada'}`);
            });

            if (isMobile) {
                newCard.addEventListener('touchstart', function(e) {
                    if (e.target.tagName === 'A' || e.target.closest('a')) {
                        return;
                    }
                }, { passive: true });
            }

            console.log(`✅ Tarjeta ${index + 1} configurada con flip por ${isMobile ? 'tap' : 'click'}`);
        });
    }

    function handleServicesCarousel() {
        const carousel = document.querySelector('.services-carousel');
        const track = document.getElementById('servicesCarouselTrack');
        const dotsContainer = carousel?.querySelector('.services-carousel-dots');
        const cards = track?.querySelectorAll('.service-card');

        if (!carousel || !track || !cards || cards.length === 0) return;

        let currentSlide = 0;
        const totalSlides = cards.length;

        function createDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('span');
                dot.className = 'services-carousel-dot' + (i === 0 ? ' active' : '');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }

        function goToSlide(index) {
            currentSlide = index;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            const dots = dotsContainer?.querySelectorAll('.services-carousel-dot');
            dots?.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        function nextSlide() {
            goToSlide((currentSlide + 1) % totalSlides);
        }

        function prevSlide() {
            goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
        }

        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else prevSlide();
            }
        }, { passive: true });

        const prevBtn = carousel.querySelector('.services-carousel-prev');
        const nextBtn = carousel.querySelector('.services-carousel-next');
        prevBtn?.addEventListener('click', prevSlide);
        nextBtn?.addEventListener('click', nextSlide);

        createDots();
    }

    handleServicesCarousel();
    handleServiceCards();

    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            handleServicesCarousel();
        }, 250);
    });

    // Detectar cambios de tamaño de ventana
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            console.log('🔄 Reconfigurando tarjetas por cambio de tamaño...');
            handleServiceCards();
        }, 250);
    });

    console.log('✅ Grupo Musical Célula - Sitio homologado cargado correctamente');
});
