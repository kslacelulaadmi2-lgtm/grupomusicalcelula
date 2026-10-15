// js/blog-pagination.js — single clean implementation
document.addEventListener('DOMContentLoaded', function () {
    const postsPerPage = 6;

    // Embedded fallback posts (small)
    let blogPosts = [
    {
        "id": "post-33",
        "title": "Tendencias de música y ambiente para fiestas de XV años en CDMX",
        "excerpt": "Ideas de música, baile sorpresa, iluminación y animación para una fiesta de XV años en CDMX que reúna a jóvenes y adultos en la pista.",
        "date": "Septiembre de 2026",
        "image": "assets/gallery/banda-12.webp",
        "url": "/post/33"
    },
    {
        "id": "post-32",
        "title": "🎶 Bienvenidos al Mundo Musical de Grupo Musical Versátil La Célula",
        "excerpt": "En Grupo Musical Versátil La Célula creemos que la música no solo se escucha, se vive. Descubre nuestra esencia, versatilidad y cómo creamos experiencias inolvidables.",
        "date": "Agosto de 2026",
        "image": "assets/gallery/banda-15.webp",
        "url": "post/post-32.html"
    },
    {
        "id": "post-31",
        "title": "La Célula en Santa Moto: rock, motos y música en vivo",
        "excerpt": "Revive una presentación de Grupo Musical La Célula en Santa Moto: ambiente biker, rock y la energía de la música en vivo en una grabación del show.",
        "date": "Julio de 2026",
        "image": "assets/gallery/banda-14.webp",
        "url": "/post/31"
    },
    {
        "id": "post-0",
        "title": "Por qué un grupo versátil es el secreto para el éxito de tu evento corporativo en CDMX",
        "excerpt": "Descubre cómo la música en vivo, un repertorio versátil y una producción profesional pueden transformar el evento corporativo de tu empresa en CDMX.",
        "date": "Junio de 2026",
        "image": "assets/gallery/banda-24.webp",
        "url": "/post/0"
    }
];

    // Try to load external posts, otherwise keep the fallback
    (async function loadPosts() {
        try {
            const res = await fetch('assets/data/blog-posts.json');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) blogPosts = data;
            }
        } catch (e) {
            // silently fallback to embedded posts
            console.warn('Could not load assets/data/blog-posts.json, using embedded list.', e);
        }
        initPagination(blogPosts);
    })();

    function initPagination(posts) {
        const container = document.getElementById('blog-posts-container');
        if (!container) return;

        // The featured article is already visible above the grid.
        const featuredId = document.querySelector('[data-featured-post]')?.dataset.featuredPost;
        if (featuredId) posts = posts.filter(post => post.id !== featuredId);

        function createBlogPost(post) {
            const article = document.createElement('article');
            article.className = 'blog-post-card fade-in';

            let inner = '';
            inner += '<div class="post-image">';
            inner += '<img src="' + (post.image || 'assets/gallery/banda-1.webp') + '" alt="' + (post.title || '') + '" class="post-img">';
            inner += '</div>';
            inner += '<div class="post-content-card">';
            inner += '<div class="post-meta">';
            inner += '<span class="post-date">' + (post.date || '') + '</span>';
            inner += '</div>';
            inner += '<h3 class="post-title">' + (post.title || '') + '</h3>';
            inner += '<p class="post-excerpt">' + (post.excerpt || '') + '</p>';
            inner += '<a href="' + (post.url || '#') + '" class="btn btn-secondary">Leer más</a>';
            inner += '</div>';

            article.innerHTML = inner;
            return article;
        }

        // Render all posts into the container
        const allPosts = posts.map(p => createBlogPost(p));
        container.innerHTML = '';
        allPosts.forEach(p => container.appendChild(p));

        const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage));
        let currentPage = 1;

        function showPage(pageNumber) {
            const startIndex = (pageNumber - 1) * postsPerPage;
            const endIndex = startIndex + postsPerPage;

            allPosts.forEach(post => (post.style.display = 'none'));
            for (let i = startIndex; i < Math.min(endIndex, allPosts.length); i++) {
                allPosts[i].style.display = 'block';
            }
            currentPage = pageNumber;
        }

        function updatePagination() {
            const paginationContainer = document.querySelector('.pagination ul');
            if (!paginationContainer) return;
            paginationContainer.innerHTML = '';

            function makeButton(label, page, disabled, isActiveLabel) {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#';
                a.className = 'page-link ' + (disabled ? 'page-link-inactive' : 'page-link-active') + (isActiveLabel ? ' page-link-active' : '');
                a.textContent = label;
                a.dataset.page = page;
                if (!disabled) {
                    a.addEventListener('click', function (ev) {
                        ev.preventDefault();
                        goToPage(page);
                    });
                } else {
                    a.addEventListener('click', function (ev) { ev.preventDefault(); });
                }
                li.appendChild(a);
                return li;
            }

            // Prev
            paginationContainer.appendChild(makeButton('← Anterior', Math.max(1, currentPage - 1), currentPage === 1, false));

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                paginationContainer.appendChild(makeButton(String(i), i, false, i === currentPage));
            }

            // Next
            paginationContainer.appendChild(makeButton('Siguiente →', Math.min(totalPages, currentPage + 1), currentPage === totalPages, false));
        }

        function goToPage(pageNumber) {
            if (pageNumber < 1 || pageNumber > totalPages) return;
            showPage(pageNumber);
            updatePagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // export in case other scripts expect window.changePage
        window.changePage = goToPage;

        // initial render
        showPage(currentPage);
        updatePagination();
    }
});
