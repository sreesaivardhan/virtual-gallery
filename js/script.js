// Virtual Photography Gallery JS

document.addEventListener('DOMContentLoaded', function () {
    // Hamburger menu for mobile
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    hamburger.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Scroll to Gallery
    window.scrollToGallery = function () {
        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
    };

    // Gallery Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Modal Functionality
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');
    const modalDescription = document.getElementById('modalDescription');
    const closeBtn = document.querySelector('.modal .close');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentIndex = -1;
    let currentItems = Array.from(galleryItems);

    function updateModal(index) {
        const item = currentItems[index];
        if (!item) return;
        const img = item.querySelector('img');
        modalImg.src = img.getAttribute('data-full') || img.src;
        modalTitle.textContent = img.alt;
        modalCategory.textContent = item.getAttribute('data-category').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const desc = item.querySelector('h3');
        modalDescription.textContent = desc ? desc.textContent : '';
    }

    function openModal(index) {
        currentIndex = index;
        updateModal(currentIndex);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
        updateModal(currentIndex);
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % currentItems.length;
        updateModal(currentIndex);
    }

    // Open modal on view button click
    document.querySelectorAll('.view-btn').forEach((btn, idx) => {
        btn.addEventListener('click', function (e) {
            // Only show modal for visible items
            currentItems = Array.from(galleryItems).filter(item => item.style.display !== 'none');
            const itemEl = btn.closest('.gallery-item');
            const index = currentItems.indexOf(itemEl);
            openModal(index);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    document.addEventListener('keydown', function (e) {
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        }
    });

    // Hide loading spinner after DOM is loaded
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
});
