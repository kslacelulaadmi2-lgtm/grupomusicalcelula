/*! YouTube Carousel Dynamic Loader with Lite Embeds */class YouTubeCarousel{constructor(){this.videos=[];this.settings={};this.currentGroupIndex=0;
    this.container = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.autoSlideInterval = null;

    this.init();
}

async init() {
    try {
        await this.loadVideoData();
        this.setupCarousel();
        this.bindEvents();
        this.startAutoSlide();
    } catch (error) {
        console.error('Error inicializando el carrusel de YouTube:', error);
    }
}

async loadVideoData() {
    try {
        const response = await fetch('assets/data/youtube-videos.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.videos = data.videos;
        this.settings = data.settings;
        console.log('✅ Datos de videos de YouTube cargados:', this.videos.length, 'videos');
    } catch (error) {
        console.error('Error cargando datos de videos:', error);
        throw error;
    }
}

setupCarousel() {
    this.container = document.getElementById('youtubeCarouselContainer');
    if (!this.container) {
        console.error('Contenedor del carrusel no encontrado');
        return;
    }

    // Limpiar contenido existente (excepto los botones)
    const existingGroups = this.container.querySelectorAll('.youtube-video-group');
    existingGroups.forEach(group => group.remove());

    // Generar grupos de videos
    this.generateVideoGroups();

    // Configurar botones de navegación
    this.prevBtn = this.container.querySelector('.carousel-btn-prev');
    this.nextBtn = this.container.querySelector('.carousel-btn-next');

    // Mostrar el primer grupo
    this.showGroup(0);
}

generateVideoGroups() {
    const videosPerGroup = this.settings.videosPerGroup || 3;
    const totalGroups = Math.ceil(this.videos.length / videosPerGroup);

    for (let groupIndex = 0; groupIndex < totalGroups; groupIndex++) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'youtube-video-group';
        groupDiv.style.display = groupIndex === 0 ? 'flex' : 'none';

        const startIndex = groupIndex * videosPerGroup;
        const endIndex = Math.min(startIndex + videosPerGroup, this.videos.length);

        for (let i = startIndex; i < endIndex; i++) {
            const video = this.videos[i];
            const videoDiv = this.createLiteEmbed(video);
            groupDiv.appendChild(videoDiv);
        }

        // Insertar antes de los botones de control
        const firstButton = this.container.querySelector('.carousel-btn');
        this.container.insertBefore(groupDiv, firstButton);
    }
}

/**
     * Crea un "lite embed" - solo thumbnail que carga iframe al click
     * Ahorro de recursos: ~1.5MB por video + reducción de requests HTTP
     */
createLiteEmbed(video) {
    const videoDiv = document.createElement('div');
    videoDiv.className = 'youtube-video lite-youtube';
    videoDiv.dataset.videoId = video.id;
    videoDiv.dataset.videoTitle = video.title;
    videoDiv.setAttribute('data-loaded', 'false');

    // Crear thumbnail con botón de play - NO cargar iframe
    videoDiv.innerHTML = `
            <div class="youtube-thumbnail" style="position: relative; width: 100%; height: 100%; cursor: pointer; background: #000;">
                <img src="https://i.ytimg.com/vi/${video.id}/hqdefault.jpg" 
                     alt="${video.title}"
                     class="loaded"
                     style="width: 100%; height: 100%; object-fit: cover; display: block; position: absolute; top: 0; left: 0;"
                     decoding="async"
                     onerror="this.style.display='none';">
                <button class="youtube-play-btn"
                        style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                               width: 68px; height: 48px; background: transparent; border: none; 
                               cursor: pointer; padding: 0; transition: transform 0.2s ease;" 
                        aria-label="Reproducir ${video.title}">
                    <svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%" 
                         style="filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));">
                        <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                        <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                    </svg>
                </button>
            </div>
        `;

    // Evento click para cargar iframe solo cuando el usuario lo solicita
    const playBtn = videoDiv.querySelector('.youtube-play-btn');
    const thumbnail = videoDiv.querySelector('.youtube-thumbnail');

    const loadVideo = () => {
        // Verificar que no esté ya cargado
        if (videoDiv.getAttribute('data-loaded') === 'false') {
            this.loadVideoIframe(videoDiv, video);
            videoDiv.setAttribute('data-loaded', 'true');
        }
    };

    playBtn.addEventListener('click', loadVideo);
    thumbnail.addEventListener('click', loadVideo);

    // Efectos hover solo en el botón
    playBtn.addEventListener('mouseenter', () => {
        playBtn.style.transform = 'translate(-50%, -50%) scale(1.1)';
    });
    playBtn.addEventListener('mouseleave', () => {
        playBtn.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    return videoDiv;
}

/**
     * Carga el iframe de YouTube solo cuando es solicitado
     */
loadVideoIframe(videoDiv, video) {
    // Reemplazar thumbnail con iframe y autoplay
    videoDiv.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${video.id}?rel=0&showinfo=0&autoplay=1"
                    title="${video.title}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    style="width: 100%; height: 100%;">
            </iframe>
        `;
}

bindEvents() {
    if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => {
            this.stopAutoSlide();
            this.previousGroup();
            this.startAutoSlide();
        });
    }

    if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => {
            this.stopAutoSlide();
            this.nextGroup();
            this.startAutoSlide();
        });
    }

    // Pausar auto-slide cuando el mouse está sobre el carrusel
    this.container.addEventListener('mouseenter', () => {
        this.stopAutoSlide();
    });

    this.container.addEventListener('mouseleave', () => {
        this.startAutoSlide();
    });
}

showGroup(groupIndex) {
    const groups = this.container.querySelectorAll('.youtube-video-group');

    groups.forEach((group, index) => {
        if (index === groupIndex) {
            group.style.display = 'flex';
        } else {
            group.style.display = 'none';
            // Liberar memoria desconectando iframes de grupos no visibles
            this.unloadGroupIframes(group);
        }
    });

    this.currentGroupIndex = groupIndex;
}

/**
     * Descarga iframes de videos no visibles para liberar memoria
     * Los videos volverán a su estado de thumbnail
     */
unloadGroupIframes(group) {
    const videos = group.querySelectorAll('.youtube-video');
    videos.forEach(videoDiv => {
        const iframe = videoDiv.querySelector('iframe');
        if (iframe) {
            // Reemplazar iframe con thumbnail para liberar recursos
            const videoId = videoDiv.dataset.videoId;
            const videoTitle = videoDiv.dataset.videoTitle;

            if (videoId) {
                videoDiv.innerHTML = `
                        <div class="youtube-thumbnail" style="position: relative; width: 100%; height: 100%; cursor: pointer; background: #000;">
                            <img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" 
                                 alt="${videoTitle}"
                                 class="loaded"
                                 style="width: 100%; height: 100%; object-fit: cover; display: block; position: absolute; top: 0; left: 0;"
                                 decoding="async"
                                 onerror="this.style.display='none';">
                            <button class="youtube-play-btn"
                                    style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                                           width: 68px; height: 48px; background: transparent; border: none; 
                                           cursor: pointer; padding: 0; transition: transform 0.2s ease;" 
                                    aria-label="Reproducir ${videoTitle}">
                                <svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%" 
                                     style="filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));">
                                    <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                                    <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                                </svg>
                            </button>
                        </div>
                    `;

                // Re-agregar evento click
                const playBtn = videoDiv.querySelector('.youtube-play-btn');
                const thumbnail = videoDiv.querySelector('.youtube-thumbnail');

                const loadVideo = () => {
                    this.loadVideoIframe(videoDiv, { id: videoId, title: videoTitle });
                };

                playBtn.addEventListener('click', loadVideo);
                thumbnail.addEventListener('click', loadVideo);

                // Efectos hover
                playBtn.addEventListener('mouseenter', () => {
                    playBtn.style.transform = 'translate(-50%, -50%) scale(1.1)';
                });
                playBtn.addEventListener('mouseleave', () => {
                    playBtn.style.transform = 'translate(-50%, -50%) scale(1)';
                });

                // Resetear el estado
                videoDiv.setAttribute('data-loaded', 'false');
            }
        }
    });
}

nextGroup() {
    const totalGroups = this.container.querySelectorAll('.youtube-video-group').length;
    const nextIndex = (this.currentGroupIndex + 1) % totalGroups;
    this.showGroup(nextIndex);
}

previousGroup() {
    const totalGroups = this.container.querySelectorAll('.youtube-video-group').length;
    const prevIndex = (this.currentGroupIndex - 1 + totalGroups) % totalGroups;
    this.showGroup(prevIndex);
}

startAutoSlide() {
    if (this.settings.autoSlideInterval && this.settings.autoSlideInterval > 0) {
        this.autoSlideInterval = setInterval(() => {
            this.nextGroup();
        }, this.settings.autoSlideInterval);
    }
}

stopAutoSlide() {
    if (this.autoSlideInterval) {
        clearInterval(this.autoSlideInterval);
        this.autoSlideInterval = null;
    }
}

// Método público para actualizar los videos
async updateVideos() {
    this.stopAutoSlide();
    await this.loadVideoData();
    this.setupCarousel();
    this.bindEvents();
    this.startAutoSlide();
}

// Método público para obtener información del carrusel
getInfo() {
    return {
        totalVideos: this.videos.length,
        totalGroups: this.container ? this.container.querySelectorAll('.youtube-video-group').length : 0,
        currentGroup: this.currentGroupIndex + 1,
        videosPerGroup: this.settings.videosPerGroup || 3,
        optimization: 'Lite Embeds - Carga on-click'
    };
}
}

// Inicializar el carrusel cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si estamos en la página que tiene el carrusel
    const carouselContainer = document.getElementById('youtubeCarouselContainer');
    if (carouselContainer) {
        window.youtubeCarousel = new YouTubeCarousel();
        console.log('✅ Carrusel de YouTube inicializado con Lite Embeds');
    }
});

// Exportar para uso global si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YouTubeCarousel;
}
