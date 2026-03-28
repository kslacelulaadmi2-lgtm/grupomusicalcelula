/*! Grupo Musical Célula - Persistent Video Background Module */class PersistentVideoBackground{constructor(options={}){this.options={videoBaseName:options.videoBaseName||'assets/video/background',fallbackImage:options.fallbackImage||'assets/images/hero-background.webp',selector:options.selector||'.persistent-video-bg',
    mobileBreakpoint: options.mobileBreakpoint || 768,
    tabletBreakpoint: options.tabletBreakpoint || 1024,
    desktopBreakpoint: options.desktopBreakpoint || 1440,
    volume: options.volume || 0,
    loop: options.loop !== false,
    muted: options.muted !== false,
    overlayColor: options.overlayColor || 'rgba(0, 0, 0, 0.5)',
    ...options
};

this.videoElement = null;
this.container = null;
this.isMobile = this.checkIsMobile();
this.isVisible = true;
this.currentOrientation = this.getOrientation();
this.devicePixelRatio = window.devicePixelRatio || 1;

this.init();
}

getOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

getDeviceType() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent.toLowerCase();

    // Detectar tipo de dispositivo
    const isMobileDevice = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTabletDevice = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);

    if (isMobileDevice && width <= this.options.mobileBreakpoint) {
        return 'mobile';
    } else if ((isTabletDevice || width <= this.options.tabletBreakpoint) && width > this.options.mobileBreakpoint) {
        return 'tablet';
    } else if (width <= this.options.desktopBreakpoint) {
        return 'desktop';
    } else {
        return 'large-desktop';
    }
}

getVideoSrc() {
    const deviceType = this.getDeviceType();
    const orientation = this.getOrientation();

    // Si es móvil en portrait, usar video mobile-background
    if (deviceType === 'mobile' && orientation === 'portrait') {
        return this.normalizePath('assets/video/mobile-background.webm');
    }

    // Para todo lo demás (desktop, tablet, mobile landscape), usar background normal
    return this.normalizePath('assets/video/background-1080p.webm');
}

getBackgroundImage() {
    const width = window.innerWidth;
    const deviceType = this.getDeviceType();
    const orientation = this.getOrientation();

    // Si es móvil en portrait, usar mobile-background
    if (deviceType === 'mobile' && orientation === 'portrait') {
        return this.normalizePath('assets/images/mobile-background.webp');
    }

    // Usar la misma lógica que las media queries del CSS
    if (width <= 480) {
        return this.normalizePath('assets/images/hero-background-480w.webp');
    } else if (width <= 768) {
        return this.normalizePath('assets/images/hero-background-768w.webp');
    } else if (width <= 1024) {
        return this.normalizePath('assets/images/hero-background-1024w.webp');
    } else {
        return this.normalizePath('assets/images/hero-background-1920w.webp');
    }
}

normalizePath(path) {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.substring(1).split('/');

    // If we're on the root, return the path as is
    if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === '')) {
        return path;
    }

    // Count how many directory levels we're in
    let depth = pathParts.length - 1;

    // If we're on a file (like blog.html), subtract one more
    if (pathParts[pathParts.length - 1].includes('.')) {
        depth--;
    }

    // Build relative path prefix
    let prefix = '';
    for (let i = 0; i < depth; i++) {
        prefix += '../';
    }

    return prefix + path;
}

checkIsMobile() {
    return window.innerWidth <= this.options.mobileBreakpoint ||
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

init() {
    this.createVideoBackground();
    this.setupEventListeners();
    this.applyVideoBackground();
}

createVideoBackground() {
    this.container = document.createElement('div');
    this.container.className = 'persistent-video-container';
    this.container.setAttribute('data-orientation', this.currentOrientation);
    this.container.setAttribute('data-device', this.getDeviceType());

    this.videoElement = document.createElement('video');
    this.videoElement.autoplay = true;
    this.videoElement.muted = true; // Siempre muted para permitir autoplay
    this.videoElement.loop = this.options.loop;
    this.videoElement.playsInline = true;
    this.videoElement.preload = 'auto';
    this.videoElement.volume = 0; // Volumen en 0 para autoplay
    this.videoElement.className = 'persistent-video-element';
    this.videoElement.setAttribute('playsinline', ''); // Atributo adicional para iOS
    this.videoElement.setAttribute('webkit-playsinline', ''); // Para Safari antiguo

    const sourceElement = document.createElement('source');
    sourceElement.src = this.getVideoSrc();
    sourceElement.type = 'video/webm';

    this.videoElement.appendChild(sourceElement);

    const overlay = document.createElement('div');
    overlay.className = 'persistent-video-overlay';

    this.container.appendChild(this.videoElement);
    this.container.appendChild(overlay);

    if (document.body.firstChild) {
        document.body.insertBefore(this.container, document.body.firstChild);
    } else {
        document.body.appendChild(this.container);
    }

    this.addStyles();
    this.updateVideoPosition();

    console.log('🎬 Video de fondo creado con src:', sourceElement.src);

    // Intentar reproducir cuando el video esté listo
    this.videoElement.addEventListener('loadeddata', () => {
        console.log('📊 Video cargado, intentando reproducir...');
        this.playVideo();
    });

    this.videoElement.addEventListener('canplay', () => {
        console.log('▶️ Video listo para reproducir');
        this.playVideo();
    });

    this.videoElement.addEventListener('playing', () => {
        console.log('🎥 Video reproduciéndose');
    });

    // Para móviles: intentar reproducir en el primer toque/click
    const playOnFirstInteraction = () => {
        console.log('👆 Interacción detectada, intentando reproducir video...');
        this.playVideo();
        document.removeEventListener('touchstart', playOnFirstInteraction);
        document.removeEventListener('click', playOnFirstInteraction);
    };

    document.addEventListener('touchstart', playOnFirstInteraction, { once: true, passive: true });
    document.addEventListener('click', playOnFirstInteraction, { once: true });
}

updateVideoPosition() {
    const orientation = this.getOrientation();
    const deviceType = this.getDeviceType();

    // Actualizar atributos del contenedor
    this.container.setAttribute('data-orientation', orientation);
    this.container.setAttribute('data-device', deviceType);

    // Ajustar object-position basado en orientación y dispositivo
    if (orientation === 'portrait' && deviceType === 'mobile') {
        this.videoElement.style.objectPosition = 'center center';
    } else if (orientation === 'landscape' && deviceType === 'mobile') {
        this.videoElement.style.objectPosition = 'center center';
    } else {
        this.videoElement.style.objectPosition = 'center center';
    }
}

addStyles() {
    const style = document.createElement('style');
    style.id = 'persistent-video-bg-styles';
    const backgroundImage = this.getBackgroundImage();

    style.textContent = `
            .persistent-video-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                height: 100dvh; /* Dynamic viewport height for mobile browsers */
                z-index: 0;
                overflow: hidden;
                opacity: 1;
                pointer-events: none;
                background: url('${backgroundImage}') center/cover no-repeat;
                background-attachment: fixed;
            }
            
            /* Responsive background images */
            @media (max-width: 480px) {
                .persistent-video-container {
                    background-image: url('${this.normalizePath('assets/images/hero-background-480w.webp')}');
                }
            }
            
            @media (min-width: 481px) and (max-width: 768px) {
                .persistent-video-container {
                    background-image: url('${this.normalizePath('assets/images/hero-background-768w.webp')}');
                }
            }
            
            @media (min-width: 769px) and (max-width: 1024px) {
                .persistent-video-container {
                    background-image: url('${this.normalizePath('assets/images/hero-background-1024w.webp')}');
                }
            }
            
            @media (min-width: 1025px) {
                .persistent-video-container {
                    background-image: url('${this.normalizePath('assets/images/hero-background-1920w.webp')}');
                }
            }
            
            .persistent-video-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.3);
                z-index: 1;
            }

            .persistent-video-element {
                position: absolute;
                top: 50%;
                left: 50%;
                min-width: 100%;
                min-height: 100%;
                width: auto;
                height: auto;
                max-width: none;
                z-index: 2;
                transform: translate(-50%, -50%);
                object-fit: cover;
                object-position: center center;
                will-change: transform;
                pointer-events: none;
                opacity: 1;
                transition: opacity 0.5s ease-in-out;
            }

            /* Optimizaciones para diferentes orientaciones */
            .persistent-video-container[data-orientation="portrait"] .persistent-video-element {
                width: 100%;
                height: auto;
                min-height: 100%;
            }

            .persistent-video-container[data-orientation="landscape"] .persistent-video-element {
                width: auto;
                height: 100%;
                min-width: 100%;
            }

            /* Optimizaciones para dispositivos móviles */
            @media (max-width: 768px) {
                .persistent-video-container {
                    background-attachment: scroll !important; /* Mejor rendimiento en móviles */
                    background-size: cover !important;
                    background-position: center !important;
                    opacity: 1 !important; /* Forzar visibilidad en móviles */
                }
                
                .persistent-video-element {
                    transform: translate(-50%, -50%) scale(1.05);
                }
                
                /* En móviles portrait, asegurar que todo el contenido sea visible */
                @media (orientation: portrait) {
                    .persistent-video-container {
                        background-size: cover !important;
                        background-position: center center !important;
                    }
                    
                    .persistent-video-element {
                        width: 100%;
                        height: auto;
                        min-height: 100%;
                    }
                }
            }

            /* Optimizaciones para tablets */
            @media (min-width: 769px) and (max-width: 1024px) {
                .persistent-video-element {
                    transform: translate(-50%, -50%) scale(1.02);
                }
            }

            /* Optimizaciones para pantallas grandes */
            @media (min-width: 1441px) {
                .persistent-video-element {
                    min-width: 100%;
                    min-height: 100%;
                }
            }

            .persistent-video-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: ${this.options.overlayColor || 'rgba(0, 0, 0, 0.5)'};
                z-index: 3;
                pointer-events: none;
            }

            .hero-section,
            .content-section,
            .banda-section,
            .videos-section,
            .site-container {
                background: transparent !important;
                position: relative;
                z-index: 10;
            }

            header, nav, .site-header {
                z-index: 100 !important;
            }
        `;

    document.head.appendChild(style);
}

setupEventListeners() {
    let resizeTimeout;
    let orientationTimeout;

    // Manejar cambios de tamaño de ventana
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newOrientation = this.getOrientation();
            const orientationChanged = newOrientation !== this.currentOrientation;

            if (orientationChanged) {
                this.currentOrientation = newOrientation;
                this.updateVideoPosition();

                // Actualizar imagen de fondo según orientación
                const newBackgroundImage = this.getBackgroundImage();
                this.container.style.backgroundImage = `url('${newBackgroundImage}')`;
            }

            const newSrc = this.getVideoSrc();
            const currentSrc = this.videoElement.querySelector('source').src;

            // Solo actualizar si la fuente realmente cambió
            if (!currentSrc.includes(newSrc)) {
                this.updateVideoSource(newSrc);
            }
        }, 300); // Debounce optimizado
    });

    // Manejar cambios de orientación específicamente
    if (window.screen && window.screen.orientation) {
        window.screen.orientation.addEventListener('change', () => {
            clearTimeout(orientationTimeout);
            orientationTimeout = setTimeout(() => {
                this.currentOrientation = this.getOrientation();
                this.updateVideoPosition();
            }, 200);
        });
    }

    // Manejar visibilidad de la página
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            this.pauseVideo();
        } else if (this.isVisible) {
            this.playVideo();
        }
    });

    // Pausar video cuando está fuera del viewport (performance)
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.playVideo();
                } else {
                    this.pauseVideo();
                }
            });
        }, { threshold: 0.1 });

        observer.observe(this.container);
    }

    // Detectar conexión lenta y ajustar calidad
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            const updateVideoQuality = () => {
                if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    console.log('Slow connection detected, video may be paused for performance');
                    this.pauseVideo();
                }
            };

            connection.addEventListener('change', updateVideoQuality);
            updateVideoQuality();
        }
    }
}

applyVideoBackground() {
    this.container.classList.add('active');
    this.playVideo();
}

playVideo() {
    if (this.videoElement) {
        // Asegurar que el video esté muted para permitir autoplay
        this.videoElement.muted = true;
        this.videoElement.playsInline = true;

        const playPromise = this.videoElement.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('✅ Video reproduciéndose correctamente');
            }).catch(e => {
                console.warn('⚠️ Video playback prevented:', e);
                this.setupPlayOnInteraction();
            });
        }
    }
}

pauseVideo() {
    if (this.videoElement) {
        this.videoElement.pause();
    }
}

setupPlayOnInteraction() {
    const playOnInteraction = () => {
        this.videoElement.play().catch(e => console.warn('Still cannot play video:', e));
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
    };

    document.addEventListener('click', playOnInteraction);
    document.addEventListener('touchstart', playOnInteraction);
}

updateVideoSource(newSrc) {
    if (this.videoElement && this.videoElement.querySelector('source').src !== window.location.origin + newSrc) {
        console.log(`Updating video source to: ${newSrc}`);
        this.videoElement.querySelector('source').src = newSrc;
        this.videoElement.load();
        this.playVideo();
    }
}

destroy() {
    if (this.container) {
        this.container.remove();
    }
    const styles = document.getElementById('persistent-video-bg-styles');
    if (styles) {
        styles.remove();
    }
}
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Inicializando video background...');
    console.log('📍 Ruta actual:', window.location.pathname);

    const videoBgConfig = {
        videoBaseName: 'assets/video/background', // Base name for the video files
        fallbackImage: 'assets/images/hero-background.webp',
        mobileBreakpoint: 768,
        tabletBreakpoint: 1024,
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        muted: true,
        loop: true
    };

    const existingContainer = document.querySelector('.persistent-video-container');
    if (!existingContainer) {
        console.log('✅ Creando nuevo contenedor de video background');
        window.CelulaVideoBackground = new PersistentVideoBackground(videoBgConfig);
    } else {
        console.log('⚠️ Contenedor de video ya existe, omitiendo inicialización');
    }

    window.PersistentVideoBackgroundClass = PersistentVideoBackground;
});

// Also initialize when the page is loaded to ensure all resources are available
window.addEventListener('load', function() {
    if (window.CelulaVideoBackground) {
        // Try to play the video again once everything is loaded
        setTimeout(() => {
            window.CelulaVideoBackground.playVideo();
        }, 500);
    }
});
