/**
 * Service Worker para Grupo Musical Célula
 * Maneja el cache de recursos estáticos con estrategia optimizada
 * Versión: 3.0 - Optimizado para rendimiento y offline
 */

// Google Analytics
importScripts('https://www.googletagmanager.com/gtag/js?id=G-VKRHM9YWLY');

const CACHE_NAME = 'celula-cache-v3';
const RUNTIME_CACHE = 'celula-runtime-v3';
const IMAGES_CACHE = 'celula-images-v3';
const FONTS_CACHE = 'celula-fonts-v3';

// Recursos críticos para cache inmediato
const urlsToCache = [
    '/',
    '/index.html',
    '/blog.html',
    '/cotizador.html',
    '/css/styles.min.css',
    '/js/navigation.min.js',
    '/js/optimizations.min.js',
    '/js/site-functionality.min.js',
    '/js/video-background.min.js',
    '/js/youtube-carousel.min.js',
    '/js/gallery-dynamic.min.js',
    '/js/chatbot.min.js',
    '/assets/images/logo-blanco.webp',
    '/assets/images/hero-background-480w.webp',
    '/assets/images/hero-background-768w.webp',
    '/assets/images/hero-background-1024w.webp',
    '/manifest.json',
    '/offline.html'
];

// Recursos de fuentes para cache separado
const FONTS_TO_CACHE = [
    '/assets/fonts/open-sans-v34-latin-regular.woff2',
    '/assets/fonts/open-sans-v34-latin-600.woff2',
    '/assets/fonts/open-sans-v34-latin-700.woff2',
    '/assets/fonts/lobster-v28-latin-regular.woff2',
    '/assets/fonts/raleway-v28-latin-regular.woff2',
    '/assets/fonts/raleway-v28-latin-600.woff2'
];

// Recursos que se cachean bajo demanda
const RUNTIME_CACHE_URLS = [
    '/assets/gallery/',
    '/post/',
    '/js/',
    '/css/',
    '/assets/video/'
];

// Recursos de imágenes para cache separado
const IMAGES_CACHE_URLS = [
    '/assets/images/',
    '/assets/icons/',
    '/assets/logo/',
    '/assets/gallery/'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            // Cache principal
            caches.open(CACHE_NAME).then(cache => {
                console.log('✅ Cache principal abierto');
                return cache.addAll(urlsToCache);
            }),
            
            // Cache de fuentes
            caches.open(FONTS_CACHE).then(cache => {
                console.log('✅ Cache de fuentes abierto');
                return cache.addAll(FONTS_TO_CACHE);
            }),
            
            // Crear caché de imágenes (se llenará bajo demanda)
            caches.open(IMAGES_CACHE).then(cache => {
                console.log('✅ Cache de imágenes creado');
            }),
            
            // Crear caché de runtime (se llenará bajo demanda)
            caches.open(RUNTIME_CACHE).then(cache => {
                console.log('✅ Cache de runtime creado');
            })
        ]).then(() => {
            console.log('🚀 Service Worker instalado correctamente');
        })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    // Lista de cachés que mantenemos en esta versión
    const currentCaches = [
        CACHE_NAME,
        RUNTIME_CACHE,
        IMAGES_CACHE,
        FONTS_CACHE
    ];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Eliminar cachés antiguos que no estén en nuestra lista actual
                    if (!currentCaches.includes(cacheName)) {
                        console.log('🗑️ Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Tomar control inmediatamente de todas las pestañas abiertas
            console.log('🔄 Service Worker activado y tomando control');
            return self.clients.claim();
        })
    );
});

// Interceptar peticiones con estrategia optimizada
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // No interceptar peticiones a API
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // Estrategia: Cache First para fuentes (alta prioridad de rendimiento)
    if (request.destination === 'font' || url.pathname.includes('/assets/fonts/')) {
        event.respondWith(
            caches.open(FONTS_CACHE).then(cache => 
                cache.match(request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(request).then(response => {
                        // Solo cachear respuestas exitosas
                        if (response && response.status === 200) {
                            const responseToCache = response.clone();
                            cache.put(request, responseToCache);
                        }
                        return response;
                    }).catch(error => {
                        console.error('Error fetching font:', error);
                        // Sin fallback para fuentes, usará system font
                    });
                })
            )
        );
        return;
    }
    
    // Estrategia: Cache First para imágenes con fallback específico
    if (request.destination === 'image' || 
        IMAGES_CACHE_URLS.some(path => url.pathname.startsWith(path))) {
        
        event.respondWith(
            caches.open(IMAGES_CACHE).then(cache => 
                cache.match(request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(request).then(response => {
                        if (response && response.status === 200) {
                            const responseToCache = response.clone();
                            cache.put(request, responseToCache);
                        }
                        return response;
                    }).catch(() => {
                        // Fallback inteligente para imágenes
                        if (url.pathname.includes('logo')) {
                            return caches.match('/assets/images/logo-blanco.webp');
                        } else if (url.pathname.includes('gallery')) {
                            return caches.match('/assets/images/hero-background-480w.webp');
                        } else if (url.pathname.includes('icons')) {
                            return caches.match('/assets/images/logo-blanco.webp');
                        } else {
                            // Fallback genérico para cualquier imagen
                            return caches.match('/assets/images/hero-background-480w.webp');
                        }
                    });
                })
            )
        );
        return;
    }

    // Estrategia: Cache First para assets estáticos (JS, CSS)
    if (request.destination === 'style' || 
        request.destination === 'script' ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js')) {
        
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request).then(response => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(RUNTIME_CACHE).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                }).catch(error => {
                    console.error('Error fetching asset:', error);
                    // Sin fallback específico para JS/CSS
                });
            })
        );
        return;
    }

    // Estrategia: Network First para HTML con fallback offline
    if (request.destination === 'document' || 
        url.pathname.endsWith('.html') ||
        url.pathname === '/' ||
        url.pathname.endsWith('/')) {
        
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Guardar en cache la respuesta fresca
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // Si tenemos la página en cache, usarla
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Si no está en cache, intentar mostrar la página offline
                            return caches.match('/offline.html');
                        });
                })
        );
        return;
    }

    // Estrategia: Network Only para APIs y recursos externos
    if (url.origin !== location.origin) {
        // No cachear recursos externos
        event.respondWith(fetch(request).catch(error => {
            console.log('Error fetching external resource:', error);
            // Sin fallback para recursos externos
        }));
        return;
    }

    // Estrategia: Stale-While-Revalidate para otros recursos
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            // Usamos una promesa para devolver el contenido cacheado primero si existe
            const fetchPromise = fetch(request)
                .then(networkResponse => {
                    // Actualizar el caché con la nueva respuesta
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(RUNTIME_CACHE).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(error => {
                    console.log('Fetch failed for:', request.url, error);
                    // No fallback, devolvemos el error
                    throw error;
                });

            // Devolvemos el cache inmediatamente si existe, o esperamos el fetch
            return cachedResponse || fetchPromise;
        })
    );
});
