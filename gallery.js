// Data galerie - ZDE UPRAVTE CESTY A TAGY
const galleryData = [
    {
        src: 'Gallery/image_1.jpg', // Cesta relativní k gallery.html
        tags: ['Futurama', 'Simpsonovi', 'Rick and Morty'],
        title: 'placeholder'
    },
    {
        src: 'Gallery/image_2.jpg',
        tags: ['placeholder'],
        title: 'placeholder'
    },
    {
        src: 'Gallery/image_3.jpg',
        tags: ['placeholder'],
        title: 'placeholder'
    },
    {
        src: 'Gallery/image_4.jpg',
        tags: ['placeholder'],
        title: 'placeholder'
    },
    {
        src: 'Gallery/image_5.jpg',
        tags: ['placeholder'],
        title: 'placeholder'
    },
    {
        src: 'Gallery/image_6.jpg',
        tags: ['placeholder'],
        title: 'placeholder'
    },
    {
        src: 'Gallery/image_7.jpg',
        tags: ['placeholder'],
        title: 'placeholder'
    },
    {
        src: 'Gallery/image_8.png',
        tags: ['placeholder'],
        title: 'placeholder'
    },
        {
        src: 'Gallery/image_9.png',
        tags: ['placeholder'],
        title: 'placeholder'
    },
    // Příklad pro testování (pokud obrázky neexistují, zobrazí se placeholder)
    {
        src: 'Gallery/placeholder.png',
        tags: ['demo', 'test'],
        title: 'Demo obrázek'
    }
];

// Získání unikátních tagů pro našeptávač
const allTags = [...new Set(galleryData.flatMap(item => item.tags))];

const galleryGrid = document.getElementById('gallery-grid');
const searchInput = document.getElementById('search-input');
const autocompleteList = document.getElementById('autocomplete-list');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const captionText = document.getElementById('caption');
const closeBtn = document.querySelector('.close-lightbox');

// Vykreslení galerie
function renderGallery(items) {
    galleryGrid.innerHTML = '';
    if (items.length === 0) {
        galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Žádné obrázky nenalezeny.</p>';
        return;
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.onclick = () => openLightbox(item);

        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.title;
        img.loading = 'lazy'; // Optimalizace načítání
        
        // Fallback pro chybějící obrázky
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/400x300?text=Obrázek+nenalezen';
        };

        div.appendChild(img);
        galleryGrid.appendChild(div);
    });
}

// Vyhledávání a našeptávač
searchInput.addEventListener('input', function() {
    const val = this.value.toLowerCase();
    closeAllLists();
    
    // Filtrování galerie
    const filtered = galleryData.filter(item => {
        return item.tags.some(tag => tag.toLowerCase().includes(val)) || 
               item.title.toLowerCase().includes(val);
    });
    renderGallery(filtered);

    if (!val) return;

    // Zobrazení našeptávače
    const matches = allTags.filter(tag => tag.toLowerCase().includes(val));
    matches.forEach(match => {
        const item = document.createElement('div');
        // Zvýraznění shody
        const regex = new RegExp(`(${val})`, 'gi');
        item.innerHTML = match.replace(regex, "<strong>$1</strong>");
        
        item.addEventListener('click', function() {
            searchInput.value = match;
            // Spustit filtrování s vybraným tagem
            const finalFilter = galleryData.filter(i => i.tags.includes(match));
            renderGallery(finalFilter);
            closeAllLists();
        });
        autocompleteList.appendChild(item);
    });
});

function closeAllLists() {
    autocompleteList.innerHTML = '';
}

// Zavření našeptávače při kliknutí mimo
document.addEventListener('click', function (e) {
    if (e.target !== searchInput) closeAllLists();
});

// Lightbox funkce
function openLightbox(item) {
    lightbox.style.display = 'block';
    lightboxImg.src = item.src;
    captionText.innerHTML = `<strong>${item.title}</strong><br>Tagy: ${item.tags.join(', ')}`;
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

closeBtn.onclick = closeLightbox;
lightbox.onclick = (e) => { if (e.target === lightbox) closeLightbox(); };
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// Inicializace
renderGallery(galleryData);