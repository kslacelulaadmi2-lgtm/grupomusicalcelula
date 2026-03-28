/*! Galería Dinámica - Grupo Musical Célula */document.addEventListener('DOMContentLoaded',function(){const galleryImages=[{src:'assets/gallery/banda-1.webp',alt:'Grupo Musical La Célula en vivo',text:'En vivo'},
    { src: 'assets/gallery/banda-2.webp', alt: 'Presentación musical', text: 'Presentación' },
    { src: 'assets/gallery/banda-3.webp', alt: 'Evento corporativo', text: 'Eventos' },
    { src: 'assets/gallery/banda-4.webp', alt: 'Boda musical', text: 'Bodas' },
    { src: 'assets/gallery/banda-5.webp', alt: 'Fiesta privada', text: 'Fiestas' },
    { src: 'assets/gallery/banda-6.webp', alt: 'Espectáculo musical', text: 'Shows' },
    { src: 'assets/gallery/banda-7.webp', alt: 'Grupo musical La Célula en el escenario', text: 'Escenario' },
    { src: 'assets/gallery/banda-8.webp', alt: 'Grupo musical La Célula en concierto', text: 'Concierto' },
    { src: 'assets/gallery/banda-9.webp', alt: 'Grupo musical La Célula actuando', text: 'Actuación' },
    { src: 'assets/gallery/banda-10.webp', alt: 'Grupo musical La Célula en evento', text: 'Evento' },
    { src: 'assets/gallery/banda-11.webp', alt: 'Grupo musical La Célula en desfile', text: 'Desfile' },
    { src: 'assets/gallery/banda-12.webp', alt: 'Grupo musical La Célula grupo completo', text: 'Grupo' },
    { src: 'assets/gallery/banda-13.webp', alt: 'Grupo musical La Célula con público', text: 'Público' },
    { src: 'assets/gallery/banda-14.webp', alt: 'Grupo musical La Célula en actuación', text: 'Actuación' },
    { src: 'assets/gallery/banda-15.webp', alt: 'Grupo musical La Célula en boda', text: 'Boda' },
    { src: 'assets/gallery/banda-16.webp', alt: 'Grupo musical La Célula en fiesta', text: 'Fiesta' },
    { src: 'assets/gallery/banda-17.webp', alt: 'Grupo musical La Célula en show', text: 'Show' },
    { src: 'assets/gallery/banda-18.webp', alt: 'Grupo musical La Célula en presentación', text: 'Presentación' },
    { src: 'assets/gallery/banda-19.webp', alt: 'Grupo musical La Célula en evento corporativo', text: 'Corporativo' },
    { src: 'assets/gallery/banda-20.webp', alt: 'Grupo musical La Célula en aniversario', text: 'Aniversario' },
    { src: 'assets/gallery/banda-21.webp', alt: 'Grupo Musical La Célula en XV años', text: 'XV años' },
    { src: 'assets/gallery/banda-22.webp', alt: 'Grupo musical La Célula en graduación', text: 'Graduación' },
    { src: 'assets/gallery/banda-23.webp', alt: 'Grupo musical La Célula en evento social', text: 'Social' },
    { src: 'assets/gallery/banda-24.webp', alt: 'Grupo musical La Célula en concierto al aire libre', text: 'Aire libre' },
    { src: 'assets/gallery/banda-25.webp', alt: 'Grupo musical La Célula en evento privado', text: 'Privado' },
    { src: 'assets/gallery/banda-26.webp', alt: 'Grupo musical La Célula en festival', text: 'Festival' }
];

// Función para crear un elemento de galería
function createGalleryItem(imageData) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML =
            '<img src="' + imageData.src + '" alt="' + imageData.alt + '" class="gallery-image">' +
            '<div class="gallery-overlay">' +
                '<span class="gallery-text">' + imageData.text + '</span>' +
            '</div>';
    return item;
}

// Actualizar la galería dinámicamente
function updateGallery() {
    const carousel = document.getElementById('galleryCarousel');
    if (!carousel) return;

    // Limpiar el carrusel
    carousel.innerHTML = '';

    // Agregar las imágenes dinámicamente
    galleryImages.forEach(image => {
        const galleryItem = createGalleryItem(image);
        carousel.appendChild(galleryItem);
    });

    // Inicializar el carrusel después de que los elementos estén en el DOM
    setTimeout(() => {
        initCarousel();
    }, 50);
}

// Inicializar el carrusel
function initCarousel() {
    const carousel = document.getElementById('galleryCarousel');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    if (!carousel || !prevBtn || !nextBtn) return;

    const items = carousel.querySelectorAll('.gallery-item');
    if (items.length === 0) return;

    let currentIndex = 0;
    let itemsToShow = 1;

    // Ajustar cantidades según el tamaño de pantalla
    const updateItemsToShow = () => {
        if (window.innerWidth > 768) {
            itemsToShow = 3;
        } else {
            itemsToShow = 1;
        }
    };

    const updateCarousel = () => {
        const containerWidth = carousel.parentElement.clientWidth;

        if (window.innerWidth > 768) {
            // Desktop: mostrar 3 imágenes
            const totalMargin = (itemsToShow - 1) * 20;
            const itemWidth = (containerWidth - totalMargin) / itemsToShow;

            items.forEach(item => {
                item.style.flex = `0 0 ${itemWidth}px`;
                item.style.marginRight = '20px';
            });

            const offset = currentIndex * (itemWidth + 20);
            carousel.style.transform = `translateX(-${offset}px)`;
        } else {
            // Mobile: una imagen completa a la vez
            // Usar el ancho exacto del primer item para calcular el offset
            items.forEach((item, index) => {
                item.style.flex = `0 0 ${containerWidth}px`;
                item.style.marginRight = '0';
                item.style.marginLeft = '0';
            });

            // Calcular offset usando el ancho exacto del elemento
            if (items.length > 0) {
                const itemWidth = items[0].offsetWidth;
                const offset = currentIndex * itemWidth;
                carousel.style.transform = `translateX(-${offset}px)`;
            } else {
                carousel.style.transform = 'translateX(0px)';
            }
        }

        carousel.style.transition = 'transform 0.3s ease';
    };

    const nextSlide = () => {
        const maxIndex = Math.max(0, items.length - itemsToShow);

        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    };

    // Inicializar el carrusel
    updateItemsToShow();
    updateCarousel();

    // Event listeners para los botones
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Actualizar cuando se cambia el tamaño de la ventana
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateItemsToShow();
            const maxIndex = Math.max(0, items.length - itemsToShow);
            currentIndex = Math.min(currentIndex, maxIndex);
            updateCarousel();
        }, 150);
    });

    // Lightbox functionality
    initLightbox(items, galleryImages);
}

// Inicializar lightbox para visualización fullscreen
function initLightbox(items, images) {
    // Crear modal lightbox
    let lightbox = document.getElementById('gallery-lightbox');

    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'gallery-lightbox';
        lightbox.className = 'gallery-lightbox';
        lightbox.innerHTML = `
                <button class="lightbox-close" aria-label="Cerrar">&times;</button>
                <button class="lightbox-prev" aria-label="Anterior">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                </button>
                <button class="lightbox-next" aria-label="Siguiente">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                </button>
                <img class="lightbox-image" src="" alt="">
                <div class="lightbox-caption"></div>
                <div class="lightbox-counter"></div>
            `;
        document.body.appendChild(lightbox);
    }

    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    let currentLightboxIndex = 0;

    const openLightbox = (index) => {
        currentLightboxIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    const updateLightboxImage = () => {
        const image = images[currentLightboxIndex];
        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt;
        lightboxCaption.textContent = image.text;
        lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${images.length}`;
    };

    const showNext = () => {
        currentLightboxIndex = (currentLightboxIndex + 1) % images.length;
        updateLightboxImage();
    };

    const showPrev = () => {
        currentLightboxIndex = (currentLightboxIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    };

    // Event listeners para abrir lightbox
    items.forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(index);
        });
    });

    // Event listeners para controles del lightbox
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Cerrar al hacer clic fuera de la imagen
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });

    // Touch gestures para mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightboxImg.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    lightboxImg.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    const handleSwipe = () => {
        if (touchEndX < touchStartX - 50) showNext();
        if (touchEndX > touchStartX + 50) showPrev();
    };
}

// Ejecutar la actualización de la galería cuando se haya cargado todo
updateGallery();
});
