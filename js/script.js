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
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalDescription = document.getElementById('modalDescription');
const closeBtn = document.querySelector('.modal .close');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const loading = document.getElementById('loading');

document.addEventListener('DOMContentLoaded', async function () {

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    
    // Check local storage for theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
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
        });
    }

    // Scroll to Gallery
    window.scrollToGallery = function () {
        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
    };

    try {
        await fetchData();
        renderFilters();
        renderGallery();
        attachModalEvents();
    } catch (error) {
        console.error("Failed to load gallery data:", error);
    }
});

// Hide loading spinner after all assets (including images) are loaded
window.addEventListener('load', function() {
    if (loading) loading.style.display = 'none';
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
        });
    });
}

function renderGallery() {
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';
    
    const filteredPhotos = appState.currentFilter === 'all' 
        ? appState.photos 
        : appState.photos.filter(p => p.collectionId === appState.currentFilter);

    // Keep track of currently displayed items for the modal navigation
    appState.currentItems = filteredPhotos;

    filteredPhotos.forEach((photo, index) => {
        const collection = appState.collections.find(c => c.slug === photo.collectionId);
        const collectionName = collection ? collection.name : photo.collectionId;
        
        const itemHtml = `
            <div class="gallery-item" data-category="${photo.collectionId}" data-index="${index}">
                <img src="${photo.thumbnail}" alt="${photo.title}" loading="lazy" data-full="${photo.fullImage}">
                <div class="item-overlay">
                    <div class="item-info">
                        <p class="image-caption">${photo.caption}</p>
                        <p class="image-category">${collectionName}</p>
                        
                    </div>
                </div>
            </div>
        `;
        galleryContainer.insertAdjacentHTML('beforeend', itemHtml);
    });

    // Re-attach view button events for newly rendered items
    document.querySelectorAll('.gallery-item').forEach((item) => {
        item.addEventListener('click', function (e) {
            const index = parseInt(item.getAttribute('data-index'), 10);
            openModal(index);
        });
    });
}

function updateModal(index) {
    const photo = appState.currentItems[index];
    if (!photo) return;
    
    const collection = appState.collections.find(c => c.slug === photo.collectionId);
    
    modalImg.src = photo.fullImage;
    modalTitle.textContent = photo.title;
    modalCategory.textContent = collection ? collection.name : photo.collectionId;
    modalDescription.textContent = photo.caption;
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
