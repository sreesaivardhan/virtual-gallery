// Virtual Photography Gallery JS - JSON Driven

let appState = {
    photos: [],
    collections: [],
    currentFilter: 'all',
    currentItems: [],
    currentIndex: -1
};

const galleryContainer = document.getElementById('gallery-container');
const filterContainer = document.getElementById('filter-container');
const filmstripContainer = document.getElementById('filmstrip-container');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalStory = document.getElementById('modalStory');
const modalLocation = document.getElementById('modalLocation');
const modalDate = document.getElementById('modalDate');
const modalTags = document.getElementById('modalTags');
const closeBtn = document.querySelector('.modal .close');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

document.addEventListener('DOMContentLoaded', async function () {

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    
    // Check local storage for theme
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'dark' || currentTheme === null) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        });
    }

    // Hamburger menu for mobile
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            const expanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !expanded);
        });
    }

    // Scroll to Gallery
    window.scrollToGallery = function () {
        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
    };

    try {
        await fetchData();
        renderShowcase();
        renderFilters();
        renderGallery();
        renderFilmstrip();
        renderStats();
        attachModalEvents();
        
        // Use event delegation for gallery items to prevent listener duplication/mismatch bugs
        if (galleryContainer) {
            galleryContainer.addEventListener('click', function(e) {
                const item = e.target.closest('.gallery-item');
                if (item) {
                    const index = parseInt(item.getAttribute('data-index'), 10);
                    openModal(index);
                }
            });
        }
        
        // IG Card Logic
        const igCard = document.getElementById('ig-card');
        const closeIg = document.getElementById('close-ig');
        if (igCard && closeIg) {
            if (!localStorage.getItem('ig-dismissed')) {
                igCard.classList.remove('hidden');
            }
            closeIg.addEventListener('click', function() {
                igCard.classList.add('hidden');
                localStorage.setItem('ig-dismissed', 'true');
            });
        }
        // Remove loader once everything is rendered successfully
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.classList.add('hidden');
            setTimeout(() => {
                loadingEl.remove();
            }, 500);
        }

    } catch (error) {
        console.error("Failed to load gallery data:", error);
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.innerHTML = '<p>Unable to load gallery.</p>';
        }
    }
});


async function fetchData() {
    const [collectionsRes, photosRes] = await Promise.all([
        fetch('data/collections.json'),
        fetch('data/photos.json')
    ]);
    
    appState.collections = await collectionsRes.json();
    appState.photos = await photosRes.json();
    
    // Sort collections and photos by displayOrder
    appState.collections.sort((a, b) => a.displayOrder - b.displayOrder);
    appState.photos.sort((a, b) => a.displayOrder - b.displayOrder);
}

function renderFilmstrip() {
    if (!filmstripContainer) return;
    filmstripContainer.innerHTML = '';
    // Select a few premium photos for the filmstrip
    const stripPhotos = appState.photos.slice(0, 7); 
    
    let innerHtml = '';
    stripPhotos.forEach(photo => {
        innerHtml += `<img src="${photo.thumbnail}" alt="${photo.title}" loading="lazy" class="filmstrip-img">`;
    });
    
    // Duplicate the content to create a seamless infinite loop
    filmstripContainer.innerHTML = `
        <div class="filmstrip-track">
            ${innerHtml}
            ${innerHtml}
        </div>
    `;
}

function renderShowcase() {
    const showcaseContainer = document.getElementById('collection-showcase');
    if (!showcaseContainer) return;
    showcaseContainer.innerHTML = '';
    
    appState.collections.forEach(collection => {
        const photoCount = appState.photos.filter(p => p.collectionId === collection.slug).length;
        
        const cardHtml = `
            <div class="showcase-card" data-filter="${collection.slug}">
                <div class="showcase-content">
                    <h3 class="showcase-title">${collection.name}</h3>
                    <p class="showcase-desc">${collection.shortDescription || collection.description || ''}</p>
                </div>
                <div class="showcase-meta">
                    <span class="showcase-count">${photoCount} Photographs</span>
                    <span class="showcase-arrow">&rarr;</span>
                </div>
            </div>
        `;
        showcaseContainer.insertAdjacentHTML('beforeend', cardHtml);
    });

    const cards = showcaseContainer.querySelectorAll('.showcase-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const filterId = this.getAttribute('data-filter');
            const filterBtn = document.querySelector(`.filter-btn[data-filter="${filterId}"]`);
            if (filterBtn) {
                filterBtn.click();
            }
        });
    });
}

function renderFilters() {
    if (!filterContainer) return;
    // "All Photos" is already in HTML, we just append the rest
    appState.collections.forEach(collection => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.setAttribute('data-filter', collection.slug);
        btn.textContent = collection.name;
        filterContainer.appendChild(btn);
    });

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.currentFilter = btn.getAttribute('data-filter');
            renderGallery();
            
            // Smooth scroll so the first gallery row is visible
            setTimeout(() => {
                const galleryGrid = document.getElementById('gallery-container');
                if (galleryGrid) {
                    const headerOffset = 100; // Leave breathing room above the grid
                    const elementPosition = galleryGrid.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }, 100);
        });
    });
}

function renderStats() {
    const statsContainer = document.getElementById('dynamic-stats');
    if (!statsContainer) return;
    
    const photoCount = appState.photos.length;
    const collectionCount = appState.collections.length;
    
    const locations = new Set();
    const years = new Set();
    
    appState.photos.forEach(p => {
        if (p.location) locations.add(p.location);
        if (p.dateCaptured) {
            const yearMatch = p.dateCaptured.match(/\d{4}/);
            if (yearMatch) years.add(yearMatch[0]);
        }
    });
    
    const statsHtml = `
        <div class="stat-item">
            <span class="stat-value">${photoCount}</span>
            <span class="stat-label">PHOTOGRAPHS</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${collectionCount}</span>
            <span class="stat-label">COLLECTIONS</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${locations.size}</span>
            <span class="stat-label">LOCATIONS</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${years.size}</span>
            <span class="stat-label">YEARS CAPTURED</span>
        </div>
    `;
    statsContainer.innerHTML = statsHtml;
}

function renderGallery() {
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';
    
    let filteredPhotos = [];
    if (appState.currentFilter === 'all') {
        const grouped = {};
        appState.collections.forEach(c => grouped[c.slug] = []);
        appState.photos.forEach(p => {
            if (!grouped[p.collectionId]) grouped[p.collectionId] = [];
            grouped[p.collectionId].push(p);
        });
        
        let maxLen = 0;
        const keys = Object.keys(grouped);
        keys.forEach(k => {
            if (grouped[k].length > maxLen) maxLen = grouped[k].length;
        });
        
        for (let i = 0; i < maxLen; i++) {
            keys.forEach(k => {
                if (grouped[k][i]) {
                    filteredPhotos.push(grouped[k][i]);
                }
            });
        }
    } else {
        filteredPhotos = appState.photos.filter(p => p.collectionId === appState.currentFilter);
    }

    // Keep track of currently displayed items for the modal navigation
    appState.currentItems = filteredPhotos;

    filteredPhotos.forEach((photo, index) => {
        const collection = appState.collections.find(c => c.slug === photo.collectionId);
        const collectionName = collection ? collection.name : photo.collectionId;
        
        // Editorial hierarchy: Make specific index patterns span multiple columns
        const spanClass = (index % 5 === 0) ? ' editorial-span' : '';
        
        const itemHtml = `
            <div class="gallery-item${spanClass}" data-category="${photo.collectionId}" data-index="${index}">
                <img src="${photo.thumbnail}" alt="${photo.title}" loading="lazy" data-full="${photo.fullImage}">
                <div class="item-overlay">
                    <div class="item-info">
                        <p class="image-caption">${photo.title}</p>
                        <p class="image-category">${collectionName}</p>
                        
                    </div>
                </div>
            </div>
        `;
        galleryContainer.insertAdjacentHTML('beforeend', itemHtml);
    });

    // Event listener for opening modal is handled via delegation in DOMContentLoaded
}

function updateModal(index) {
    const photo = appState.currentItems[index];
    if (!photo) return;
    
    const collection = appState.collections.find(c => c.slug === photo.collectionId);
    
    modalImg.src = photo.fullImage;
    modalTitle.textContent = photo.title;
    modalCategory.textContent = collection ? collection.name : photo.collectionId;
    
    if(modalStory) modalStory.textContent = photo.story || "";
    
    if(modalLocation) {
        if(photo.location) {
            modalLocation.textContent = photo.location;
            modalLocation.href = photo.mapUrl || "#";
        } else {
            modalLocation.textContent = "Unknown";
            modalLocation.removeAttribute('href');
        }
    }
    
    if(modalDate) modalDate.textContent = photo.dateCaptured || "Unknown";
    if(modalTags) modalTags.textContent = photo.tags ? photo.tags.join(" · ") : "";
}

function openModal(index) {
    appState.currentIndex = index;
    updateModal(appState.currentIndex);
    if(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function showPrev() {
    if (appState.currentItems.length === 0) return;
    appState.currentIndex = (appState.currentIndex - 1 + appState.currentItems.length) % appState.currentItems.length;
    updateModal(appState.currentIndex);
}

function showNext() {
    if (appState.currentItems.length === 0) return;
    appState.currentIndex = (appState.currentIndex + 1) % appState.currentItems.length;
    updateModal(appState.currentIndex);
}

function attachModalEvents() {
    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });
    }
    if(prevBtn) prevBtn.addEventListener('click', showPrev);
    if(nextBtn) nextBtn.addEventListener('click', showNext);
    document.addEventListener('keydown', function (e) {
        if (modal && modal.style.display === 'block') {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        }
    });
}
