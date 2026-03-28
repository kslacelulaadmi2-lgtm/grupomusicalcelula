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
            // Remover event listeners previos clonando el elemento
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);

            // Agregar event listener para flip con click/tap
            newCard.addEventListener('click', function(e) {
                // Prevenir que el click en los botones active el flip
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    return;
                }

                this.classList.toggle('flipped');
                console.log(`🔄 Tarjeta ${index + 1} ${this.classList.contains('flipped') ? 'volteada' : 'restaurada'}`);
            });

            // En móvil, agregar soporte para touch
            if (isMobile) {
                newCard.addEventListener('touchstart', function(e) {
                    // Prevenir que el touch en los botones active el flip
                    if (e.target.tagName === 'A' || e.target.closest('a')) {
                        return;
                    }
                    // El evento click se disparará automáticamente después del touchstart
                }, { passive: true });
            }

            console.log(`✅ Tarjeta ${index + 1} configurada con flip por ${isMobile ? 'tap' : 'click'}`);
        });
    }

    // Ejecutar al cargar
    handleServiceCards();

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
