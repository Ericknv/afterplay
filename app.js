// ============================================================================
// AFTERPLAY — MOTOR COMPLETO (app.js)
// Release 2.0: Busca Dedicada, Deezer, Coleções Detalhadas, Wrapped & Analytics
// ============================================================================

// --- 1. BANCO DE DADOS LOCAL (LOCALSTORAGE) ---
let diaryReviews = JSON.parse(localStorage.getItem('afterplay_diary')) || [
    {
        id: 1440857781,
        title: "Random Access Memories",
        artist: "Daft Punk",
        year: "2013",
        cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b4/13/e9/b413e91d-40aa-a1a8-b8e3-2b43b3e2226b/886443927087.jpg/600x600bb.jpg",
        rating: 5.0,
        favTrack: "Giorgio by Moroder",
        reviewText: "Uma aula de produção analógica. Ouvir a bateria e o baixo gravados ao vivo em estúdio traz um calor humano absurdo para a música eletrônica.",
        date: "17/10/2026"
    }
];

let wantToListen = JSON.parse(localStorage.getItem('afterplay_want')) || [];

let topFiveAlbums = JSON.parse(localStorage.getItem('afterplay_top5')) || [
    {
        id: 1440857781,
        title: "Random Access Memories",
        artist: "Daft Punk",
        year: "2013",
        cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b4/13/e9/b413e91d-40aa-a1a8-b8e3-2b43b3e2226b/886443927087.jpg/600x600bb.jpg"
    },
    null, null, null, null
];

let collections = JSON.parse(localStorage.getItem('afterplay_collections')) || [
    {
        id: 1,
        name: "Obras-primas dos Anos 70",
        description: "Discos emblemáticos de rock progressivo, MPB e soul analógico.",
        albums: []
    }
];

let challengeGoal = parseInt(localStorage.getItem('afterplay_challenge_goal')) || 50;

// Estados Temporários
let currentAlbumInModal = null;
let albumToAddToCollection = null;
let selectedFavTrack = "Nenhuma selecionada";
let selectedVisualScore = 5.0;
let editingReviewIndex = null;
let lastSearchResults = [];
let activeReviewForCard = null;
let cachedArtistAlbums = [];
let lastSearchQuery = '';
let currentCardLayout = 'studio';
let currentCardTheme = 'midnight';
let wrappedType = 'monthly';
let currentWrappedData = null;
let activeOpenCollectionId = null;

// Views do SPA Router
const views = {
    '#/': document.getElementById('viewHome'),
    '#/diario': document.getElementById('viewHome'),
    '#/busca': document.getElementById('viewSearch'),
    '#/want-to-listen': document.getElementById('viewWant'),
    '#/colecoes': document.getElementById('viewCollections'),
    '#/perfil': document.getElementById('viewProfile')
};

// Drawer Lateral
const menuToggleBtn = document.getElementById('menuToggleBtn');
const sideDrawer = document.getElementById('sideDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');
const drawerLinks = document.querySelectorAll('.drawer-link');

// Busca Dedicada
const dedicatedSearchInput = document.getElementById('dedicatedSearchInput');
const dedicatedSearchBtn = document.getElementById('dedicatedSearchBtn');
const searchResultsTitle = document.getElementById('searchResultsTitle');
const artistsBlock = document.getElementById('artistsBlock');
const artistsResultsGrid = document.getElementById('artistsResultsGrid');
const albumsBlockTitle = document.getElementById('albumsBlockTitle');
const searchResultsGrid = document.getElementById('searchResultsGrid');
const backToSearchBtn = document.getElementById('backToSearchBtn');
const discographyArtistName = document.getElementById('discographyArtistName');
const discographySortControl = document.getElementById('discographySortControl');
const sortDiscographySelect = document.getElementById('sortDiscographySelect');

// Diário e Fila
const diarySection = document.getElementById('diarySection');
const wantGrid = document.getElementById('wantGrid');
const collectionsGrid = document.getElementById('collectionsGrid');
const topFiveGrid = document.getElementById('topFiveGrid');

const diaryCount = document.getElementById('diaryCount');
const wantCount = document.getElementById('wantCount');
const collectionsCount = document.getElementById('collectionsCount');

const sortDiarySelect = document.getElementById('sortDiarySelect');
const filterDiaryInput = document.getElementById('filterDiaryInput');

// Visualizador Detalhado de Coleções
const collectionsMainContainer = document.getElementById('collectionsMainContainer');
const collectionDetailContainer = document.getElementById('collectionDetailContainer');
const backToCollectionsBtn = document.getElementById('backToCollectionsBtn');
const collectionDetailTitle = document.getElementById('collectionDetailTitle');
const collectionDetailDesc = document.getElementById('collectionDetailDesc');
const collectionDetailCount = document.getElementById('collectionDetailCount');
const collectionDetailAvg = document.getElementById('collectionDetailAvg');
const collectionDetailGrid = document.getElementById('collectionDetailGrid');

// Estatísticas do Perfil
const statReviews = document.getElementById('statReviews');
const statWant = document.getElementById('statWant');
const statCollections = document.getElementById('statCollections');
const statAvgRating = document.getElementById('statAvgRating');

// Desafio Anual
const editGoalBtn = document.getElementById('editGoalBtn');
const challengeHeadline = document.getElementById('challengeHeadline');
const progressBarFill = document.getElementById('progressBarFill');
const challengePercentText = document.getElementById('challengePercentText');
const challengeRemainingText = document.getElementById('challengeRemainingText');
const challengePaceBadge = document.getElementById('challengePaceBadge');

// Histograma e Métricas
const ratingsHistogram = document.getElementById('ratingsHistogram');
const mostFrequentRatingTag = document.getElementById('mostFrequentRatingTag');
const decadesList = document.getElementById('decadesList');
const dominantDecadeTag = document.getElementById('dominantDecadeTag');
const topArtistsList = document.getElementById('topArtistsList');

// Modais
const reviewModal = document.getElementById('reviewModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalModeTag = document.getElementById('modalModeTag');
const modalCover = document.getElementById('modalCover');
const modalAlbumTitle = document.getElementById('modalAlbumTitle');
const modalArtistYear = document.getElementById('modalArtistYear');
const modalTracklist = document.getElementById('modalTracklist');
const calculatedAvgBadge = document.getElementById('calculatedAvgBadge');
const reviewTextInput = document.getElementById('reviewTextInput');
const saveReviewBtn = document.getElementById('saveReviewBtn');
const pinTopFiveBtn = document.getElementById('pinTopFiveBtn');
const modalAddCollectionBtn = document.getElementById('modalAddCollectionBtn');
const interactiveStarPicker = document.getElementById('interactiveStarPicker');
const displayScoreText = document.getElementById('displayScoreText');

const createCollectionModal = document.getElementById('createCollectionModal');
const openCreateCollectionBtn = document.getElementById('openCreateCollectionBtn');
const closeCreateCollectionBtn = document.getElementById('closeCreateCollectionBtn');
const newCollectionNameInput = document.getElementById('newCollectionNameInput');
const newCollectionDescInput = document.getElementById('newCollectionDescInput');
const submitCreateCollectionBtn = document.getElementById('submitCreateCollectionBtn');

const addToCollectionModal = document.getElementById('addToCollectionModal');
const closeAddToCollectionBtn = document.getElementById('closeAddToCollectionBtn');
const targetAlbumNameDisplay = document.getElementById('targetAlbumNameDisplay');
const collectionChoicesList = document.getElementById('collectionChoicesList');

const cardStudioModal = document.getElementById('cardStudioModal');
const closeCardStudioBtn = document.getElementById('closeCardStudioBtn');
const shareCanvas = document.getElementById('shareCanvas');
const downloadCardBtn = document.getElementById('downloadCardBtn');
const layoutStudioBtn = document.getElementById('layoutStudioBtn');
const layoutMinimalBtn = document.getElementById('layoutMinimalBtn');
const themeDots = document.querySelectorAll('.theme-color-dot');

const wrappedModal = document.getElementById('wrappedModal');
const closeWrappedBtn = document.getElementById('closeWrappedBtn');
const wrappedModalTag = document.getElementById('wrappedModalTag');
const wrappedPeriodSubtitle = document.getElementById('wrappedPeriodSubtitle');
const wrappedHeroTitle = document.getElementById('wrappedHeroTitle');
const wrappedKpiCount = document.getElementById('wrappedKpiCount');
const wrappedKpiAvg = document.getElementById('wrappedKpiAvg');
const wrappedKpiArtist = document.getElementById('wrappedKpiArtist');
const wrappedTopAlbumContainer = document.getElementById('wrappedTopAlbumContainer');
const wrappedCoversGrid = document.getElementById('wrappedCoversGrid');
const exportWrappedCardBtn = document.getElementById('exportWrappedCardBtn');
const wrappedTypeMonthlyBtn = document.getElementById('wrappedTypeMonthlyBtn');
const wrappedTypeYearlyBtn = document.getElementById('wrappedTypeYearlyBtn');
const monthlySelectors = document.getElementById('monthlySelectors');
const yearlySelectors = document.getElementById('yearlySelectors');
const wrappedMonthSelect = document.getElementById('wrappedMonthSelect');
const wrappedYearSelect = document.getElementById('wrappedYearSelect');
const wrappedFullYearSelect = document.getElementById('wrappedFullYearSelect');
const openWrappedBtn = document.getElementById('openWrappedBtn');

const toastContainer = document.getElementById('toastContainer');

// --- 0. CONTROLE DO MENU LATERAL (DRAWER) ---
function openDrawer() {
    if (sideDrawer && drawerOverlay) {
        sideDrawer.classList.add('open');
        drawerOverlay.classList.remove('hidden');
    }
}

function closeDrawer() {
    if (sideDrawer && drawerOverlay) {
        sideDrawer.classList.remove('open');
        drawerOverlay.classList.add('hidden');
    }
}

if (menuToggleBtn) menuToggleBtn.addEventListener('click', openDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

// --- 1. SPA ROUTER ENGINE ---
function handleRouting() {
    let hash = window.location.hash || '#/';
    if (!views[hash]) hash = '#/';

    Object.values(views).forEach(view => {
        if (view) view.classList.add('hidden');
    });

    if (views[hash]) views[hash].classList.remove('hidden');

    drawerLinks.forEach(link => {
        const routeAttr = link.getAttribute('href');
        if (routeAttr === hash || (hash === '#/diario' && routeAttr === '#/')) {
            link.classList.add('active-route');
        } else {
            link.classList.remove('active-route');
        }
    });

    if (hash === '#/perfil') {
        renderProfileStats();
    }

    if (hash === '#/busca' && dedicatedSearchInput) {
        setTimeout(() => dedicatedSearchInput.focus(), 150);
    }

    if (hash !== '#/colecoes' && activeOpenCollectionId !== null) {
        closeCollectionDetail();
    }

    closeDrawer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', handleRouting);

window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        window.location.hash = '#/busca';
    }
});

// --- 2. SISTEMA DE TOASTS VISUAIS ---
function showToast({ title, message, icon = '🎵', type = 'success', spin = false, duration = 3800 }) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    toast.innerHTML = `
        <div class="toast-icon ${spin ? 'spin-icon' : ''}">${icon}</div>
        <div class="toast-body">
            <span class="toast-title">${title}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" title="Fechar">✕</button>
    `;

    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    const closeToast = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 350);
    };

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) closeBtn.addEventListener('click', closeToast);
    setTimeout(closeToast, duration);
}

// --- 3. COMUNICAÇÃO JSONP (ITUNES & DEEZER) ---
function fetchFromiTunes(url) {
    return new Promise((resolve, reject) => {
        const callbackName = 'afterplay_cb_' + Math.round(100000 * Math.random());
        window[callbackName] = function(data) {
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
            resolve(data);
        };
        const script = document.createElement('script');
        script.src = `${url}&callback=${callbackName}`;
        script.onerror = () => {
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
            reject(new Error('Falha na conexão JSONP'));
        };
        document.body.appendChild(script);
    });
}

function fetchArtistPhotoFromDeezer(artistName) {
    return new Promise((resolve) => {
        const callbackName = 'deezer_cb_' + Math.round(100000 * Math.random());
        const script = document.createElement('script');
        
        const timer = setTimeout(() => {
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
            resolve(null);
        }, 3000);

        window[callbackName] = function(data) {
            clearTimeout(timer);
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
            if (data && data.data && data.data.length > 0) {
                const artist = data.data[0];
                resolve(artist.picture_medium || artist.picture_big || null);
            } else {
                resolve(null);
            }
        };

        script.src = `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&output=jsonp&callback=${callbackName}`;
        script.onerror = () => {
            clearTimeout(timer);
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
            resolve(null);
        };

        document.body.appendChild(script);
    });
}

// --- 4. SELETOR DE MEIA ESTRELA (0.5 a 5.0) ---
function buildStarPicker() {
    if (!interactiveStarPicker) return;
    interactiveStarPicker.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const starWrapper = document.createElement('div');
        starWrapper.className = 'star-wrapper';
        starWrapper.dataset.starIndex = i;

        const starBase = document.createElement('span');
        starBase.textContent = '★';

        const starFill = document.createElement('span');
        starFill.className = 'star-fill';
        starFill.textContent = '★';

        const leftHitbox = document.createElement('div');
        leftHitbox.className = 'half-hitbox hitbox-left';
        leftHitbox.addEventListener('mouseenter', () => previewVisualScore(i - 0.5));
        leftHitbox.addEventListener('click', () => setVisualScore(i - 0.5));

        const rightHitbox = document.createElement('div');
        rightHitbox.className = 'half-hitbox hitbox-right';
        rightHitbox.addEventListener('mouseenter', () => previewVisualScore(i));
        rightHitbox.addEventListener('click', () => setVisualScore(i));

        starWrapper.appendChild(starBase);
        starWrapper.appendChild(starFill);
        starWrapper.appendChild(leftHitbox);
        starWrapper.appendChild(rightHitbox);

        interactiveStarPicker.appendChild(starWrapper);
    }

    interactiveStarPicker.addEventListener('mouseleave', () => {
        updateStarFills(selectedVisualScore);
        if (displayScoreText) displayScoreText.textContent = `${selectedVisualScore.toFixed(1)} ★`;
    });
}

function previewVisualScore(score) {
    updateStarFills(score);
    if (displayScoreText) displayScoreText.textContent = `${score.toFixed(1)} ★`;
}

function setVisualScore(score) {
    selectedVisualScore = parseFloat(score);
    updateStarFills(selectedVisualScore);
    if (displayScoreText) displayScoreText.textContent = `${selectedVisualScore.toFixed(1)} ★`;
}

function updateStarFills(targetScore) {
    if (!interactiveStarPicker) return;
    const wrappers = interactiveStarPicker.querySelectorAll('.star-wrapper');
    wrappers.forEach((wrapper, index) => {
        const starNum = index + 1;
        const fill = wrapper.querySelector('.star-fill');
        if (!fill) return;
        if (targetScore >= starNum) {
            fill.style.width = '100%';
        } else if (targetScore >= starNum - 0.5) {
            fill.style.width = '50%';
        } else {
            fill.style.width = '0%';
        }
    });
}

// --- 5. BUSCA NA PÁGINA DEDICADA & DISCOGRAFIAS ---
async function searchAlbums() {
    if (!dedicatedSearchInput) return;
    const query = dedicatedSearchInput.value.trim();
    if (!query) {
        showToast({ title: "Agulha fora do disco", message: "Digite um álbum ou artista para pesquisar.", icon: "🎙️", type: "info" });
        return;
    }

    lastSearchQuery = query;

    if (artistsBlock) artistsBlock.classList.remove('hidden');
    if (backToSearchBtn) backToSearchBtn.classList.add('hidden');
    if (discographyArtistName) discographyArtistName.classList.add('hidden');
    if (discographySortControl) discographySortControl.classList.add('hidden');
    if (albumsBlockTitle) albumsBlockTitle.textContent = "💽 ÁLBUNS ENCONTRADOS";

    if (searchResultsTitle) searchResultsTitle.textContent = `RESULTADOS PARA "${query.toUpperCase()}"`;
    if (artistsResultsGrid) artistsResultsGrid.innerHTML = `<p style="color: #9E958E; font-size: 0.85rem;">Localizando artistas...</p>`;
    if (searchResultsGrid) searchResultsGrid.innerHTML = `<p style="color: #9E958E; font-size: 0.85rem;">Girando os discos na base de dados...</p>`;

    try {
        const artistUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicArtist&limit=4`;
        const albumsUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=25`;

        const [artistsData, albumsData] = await Promise.all([
            fetchFromiTunes(artistUrl),
            fetchFromiTunes(albumsUrl)
        ]);

        // Renderiza Artistas com Foto Deezer
        if (artistsData.results && artistsData.results.length > 0) {
            if (artistsResultsGrid) {
                artistsResultsGrid.innerHTML = '';
                artistsData.results.forEach(async (artist) => {
                    const card = document.createElement('div');
                    card.className = 'artist-card';
                    card.onclick = () => loadArtistDiscography(artist.artistId, artist.artistName);

                    card.innerHTML = `
                        <div class="artist-avatar" id="avatar-${artist.artistId}">
                            <span>🎙️</span>
                        </div>
                        <div class="artist-info">
                            <div class="artist-name-title" title="${artist.artistName}">${artist.artistName}</div>
                            <span class="artist-genre-tag">${artist.primaryGenreName || 'Música'}</span>
                            <button class="btn-open-disco">Ver Discografia ›</button>
                        </div>
                    `;
                    artistsResultsGrid.appendChild(card);

                    const photoUrl = await fetchArtistPhotoFromDeezer(artist.artistName);
                    const avatarContainer = document.getElementById(`avatar-${artist.artistId}`);
                    if (avatarContainer && photoUrl) {
                        avatarContainer.innerHTML = `<img src="${photoUrl}" alt="${artist.artistName}" onerror="this.onerror=null; this.parentElement.innerHTML='🎙️';">`;
                    }
                });
            }
        } else {
            if (artistsBlock) artistsBlock.classList.add('hidden');
        }

        // Renderiza Álbuns
        if (!albumsData.results || albumsData.results.length === 0) {
            if (!artistsData.results || artistsData.results.length === 0) {
                if (searchResultsTitle) searchResultsTitle.textContent = `NENHUM RESULTADO`;
                if (searchResultsGrid) searchResultsGrid.innerHTML = `<p style="color: #9E958E;">Nenhum disco ou artista localizado com esse termo.</p>`;
                return;
            }
            if (searchResultsGrid) searchResultsGrid.innerHTML = `<p style="color: #9E958E;">Nenhum álbum avulso. Explore a discografia do artista acima!</p>`;
            return;
        }

        lastSearchResults = albumsData.results;
        if (albumsBlockTitle) albumsBlockTitle.textContent = `💽 ÁLBUNS ENCONTRADOS (${albumsData.results.length})`;
        renderAlbumCards(albumsData.results);

    } catch (error) {
        console.error(error);
        showToast({ title: "Ruído no Sinal", message: "Erro ao consultar acervo musical.", icon: "📻", type: "favorite" });
    }
}

function renderAlbumCards(albumsList) {
    if (!searchResultsGrid) return;
    searchResultsGrid.innerHTML = '';
    albumsList.forEach(album => {
        const highResCover = album.artworkUrl100 ? album.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://via.placeholder.com/600';
        const releaseYear = album.releaseDate ? album.releaseDate.substring(0, 4) : 'N/A';

        const card = document.createElement('div');
        card.className = 'search-album-card';
        card.innerHTML = `
            <div>
                <img src="${highResCover}" alt="${album.collectionName}">
                <div class="search-album-title" title="${album.collectionName}">${album.collectionName}</div>
                <div class="search-album-artist">${album.artistName} • ${releaseYear}</div>
            </div>
            <div class="card-actions">
                <button class="btn-evaluate" onclick="openAlbumModal(${album.collectionId})">★ Avaliar</button>
                <button class="btn-want" title="Salvar no Want to Listen" onclick="addToWantList(${album.collectionId})">🕒</button>
                <button class="btn-want" title="Adicionar à Coleção" onclick="openAddToCollectionModal(${album.collectionId})">📁</button>
            </div>
        `;
        searchResultsGrid.appendChild(card);
    });
}

async function loadArtistDiscography(artistId, artistName) {
    if (artistsBlock) artistsBlock.classList.add('hidden');
    if (backToSearchBtn) backToSearchBtn.classList.remove('hidden');
    if (discographyArtistName) {
        discographyArtistName.classList.remove('hidden');
        discographyArtistName.textContent = `› Discografia: ${artistName}`;
    }
    if (discographySortControl) discographySortControl.classList.remove('hidden');

    if (searchResultsTitle) searchResultsTitle.textContent = `DISCOGRAFIA COMPLETA`;
    if (albumsBlockTitle) albumsBlockTitle.textContent = `CARREGANDO ÁLBUNS DE ${artistName.toUpperCase()}...`;
    if (searchResultsGrid) searchResultsGrid.innerHTML = `<p style="color: #9E958E;">Reunindo fitas e vinis da carreira do artista...</p>`;

    try {
        const discoUrl = `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=100`;
        const data = await fetchFromiTunes(discoUrl);

        if (!data.results || data.results.length <= 1) {
            if (searchResultsGrid) searchResultsGrid.innerHTML = `<p style="color: #9E958E;">Nenhum álbum registrado para este artista.</p>`;
            return;
        }

        let allAlbums = data.results.slice(1);
        const seenTitles = new Set();
        cachedArtistAlbums = allAlbums.filter(album => {
            const cleanTitle = album.collectionName.toLowerCase().replace(/[\(\[].*?[\)\]]/g, '').trim();
            if (seenTitles.has(cleanTitle)) return false;
            seenTitles.add(cleanTitle);
            return true;
        });

        lastSearchResults = cachedArtistAlbums;
        sortAndRenderDiscography();

        showToast({
            title: "Discografia Carregada!",
            message: `${cachedArtistAlbums.length} discos encontrados para ${artistName}.`,
            icon: "💽",
            type: "success"
        });

    } catch (error) {
        console.error(error);
        showToast({ title: "Erro na Discografia", message: "Não foi possível carregar a discografia.", icon: "⚠️", type: "favorite" });
    }
}

function sortAndRenderDiscography() {
    if (!sortDiscographySelect) return;
    const sortType = sortDiscographySelect.value;
    cachedArtistAlbums.sort((a, b) => {
        const yearA = parseInt(a.releaseDate ? a.releaseDate.substring(0, 4) : 0);
        const yearB = parseInt(b.releaseDate ? b.releaseDate.substring(0, 4) : 0);
        return sortType === 'yearAsc' ? yearA - yearB : yearB - yearA;
    });

    if (albumsBlockTitle) albumsBlockTitle.textContent = `TODOS OS ÁLBUNS (${cachedArtistAlbums.length} OBRAS DISPONÍVEIS)`;
    renderAlbumCards(cachedArtistAlbums);
}

if (sortDiscographySelect) sortDiscographySelect.addEventListener('change', sortAndRenderDiscography);

if (backToSearchBtn) {
    backToSearchBtn.addEventListener('click', () => {
        if (lastSearchQuery && dedicatedSearchInput) {
            dedicatedSearchInput.value = lastSearchQuery;
            searchAlbums();
        }
    });
}

if (dedicatedSearchBtn) dedicatedSearchBtn.addEventListener('click', searchAlbums);
if (dedicatedSearchInput) {
    dedicatedSearchInput.addEventListener('keypress', e => { 
        if (e.key === 'Enter') searchAlbums(); 
    });
}

// --- 6. MODAL DE AVALIAÇÃO / EDIÇÃO FAIXA A FAIXA ---
async function openAlbumModal(collectionId, editIndex = null) {
    editingReviewIndex = editIndex;
    if (reviewModal) reviewModal.classList.remove('hidden');
    if (modalTracklist) modalTracklist.innerHTML = `<p style="color: #9E958E; padding: 10px;">Carregando lista de faixas do álbum...</p>`;
    if (calculatedAvgBadge) calculatedAvgBadge.textContent = 'Média das Faixas: --';

    if (editingReviewIndex !== null) {
        if (modalModeTag) modalModeTag.textContent = 'STUDIO LOGGING CONSOLE // RE-MIXANDO REVIEW';
        if (saveReviewBtn) saveReviewBtn.textContent = '💾 ATUALIZAR REVIEW';
    } else {
        if (modalModeTag) modalModeTag.textContent = 'STUDIO LOGGING CONSOLE // NOVA AVALIAÇÃO';
        if (saveReviewBtn) saveReviewBtn.textContent = '💾 SALVAR AVALIAÇÃO NO DIÁRIO';
    }

    try {
        const lookupUrl = `https://itunes.apple.com/lookup?id=${collectionId}&entity=song`;
        const data = await fetchFromiTunes(lookupUrl);

        const albumInfo = data.results[0];
        const tracks = data.results.slice(1);

        const highResCover = albumInfo.artworkUrl100 ? albumInfo.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://via.placeholder.com/600';
        const releaseYear = albumInfo.releaseDate ? albumInfo.releaseDate.substring(0, 4) : 'N/A';

        currentAlbumInModal = {
            id: albumInfo.collectionId,
            title: albumInfo.collectionName,
            artist: albumInfo.artistName,
            year: releaseYear,
            cover: highResCover
        };

        if (modalCover) modalCover.src = highResCover;
        if (modalAlbumTitle) modalAlbumTitle.textContent = currentAlbumInModal.title;
        if (modalArtistYear) modalArtistYear.textContent = `${currentAlbumInModal.artist} • ${currentAlbumInModal.year}`;

        if (editingReviewIndex !== null) {
            const existing = diaryReviews[editingReviewIndex];
            if (reviewTextInput) reviewTextInput.value = existing.reviewText;
            selectedFavTrack = existing.favTrack;
            setVisualScore(existing.rating);
        } else {
            if (reviewTextInput) reviewTextInput.value = '';
            selectedFavTrack = 'Nenhuma selecionada';
            setVisualScore(4.0);
        }

        if (modalTracklist) {
            modalTracklist.innerHTML = '';
            if (tracks.length === 0) {
                modalTracklist.innerHTML = `<p style="color: #9E958E;">Lista de faixas indisponível para este álbum.</p>`;
                return;
            }

            tracks.forEach((track, index) => {
                const num = String(index + 1).padStart(2, '0');
                const safeTrackName = track.trackName.replace(/'/g, "\\'");
                const isFav = selectedFavTrack === track.trackName;

                const row = document.createElement('div');
                row.className = 'track-row';
                row.innerHTML = `
                    <div>
                        <span class="track-num">${num}.</span>
                        <span>${track.trackName}</span>
                    </div>
                    <div class="track-controls">
                        <button type="button" class="fav-track-btn ${isFav ? 'selected' : ''}" title="Marcar como Faixa Favorita" onclick="selectFavoriteTrack(this, '${safeTrackName}')">❤️</button>
                        <select class="track-rating-select" onchange="recalculateTrackAverage()">
                            <option value="">--</option>
                            <option value="5.0">5.0 ★</option>
                            <option value="4.5">4.5 ★</option>
                            <option value="4.0">4.0 ★</option>
                            <option value="3.5">3.5 ★</option>
                            <option value="3.0">3.0 ★</option>
                            <option value="2.5">2.5 ★</option>
                            <option value="2.0">2.0 ★</option>
                            <option value="1.5">1.5 ★</option>
                            <option value="1.0">1.0 ★</option>
                            <option value="0.5">0.5 ★</option>
                        </select>
                    </div>
                `;
                modalTracklist.appendChild(row);
            });
        }

    } catch (error) {
        console.error(error);
        if (modalTracklist) modalTracklist.innerHTML = `<p style="color: #E11D48;">Erro ao carregar faixas.</p>`;
    }
}

function editDiaryReview(index) {
    const item = diaryReviews[index];
    openAlbumModal(item.id, index);
}

function selectFavoriteTrack(btnElement, trackName) {
    document.querySelectorAll('.fav-track-btn').forEach(btn => btn.classList.remove('selected'));
    btnElement.classList.add('selected');
    selectedFavTrack = trackName;

    showToast({
        title: "Faixa do Coração",
        message: `"${trackName}" marcada como ponto alto do disco!`,
        icon: "🎷",
        type: "favorite",
        duration: 2500
    });
}

function recalculateTrackAverage() {
    const selects = document.querySelectorAll('.track-rating-select');
    let sum = 0;
    let count = 0;

    selects.forEach(sel => {
        if (sel.value !== '') {
            sum += parseFloat(sel.value);
            count++;
        }
    });

    if (count > 0) {
        const avg = (sum / count);
        if (calculatedAvgBadge) calculatedAvgBadge.textContent = `Média das Faixas: ${avg.toFixed(1)} ★`;
        const roundedHalf = Math.round(avg * 2) / 2;
        setVisualScore(roundedHalf);
    } else {
        if (calculatedAvgBadge) calculatedAvgBadge.textContent = 'Média das Faixas: --';
    }
}

if (saveReviewBtn) {
    saveReviewBtn.addEventListener('click', () => {
        if (!currentAlbumInModal) return;

        const reviewText = (reviewTextInput && reviewTextInput.value.trim()) || "Álbum registrado no Afterplay.";

        if (editingReviewIndex !== null) {
            diaryReviews[editingReviewIndex] = {
                ...diaryReviews[editingReviewIndex],
                rating: selectedVisualScore,
                favTrack: selectedFavTrack,
                reviewText: reviewText
            };
            showToast({ title: "Review Remasterizada", message: `"${currentAlbumInModal.title}" foi atualizado!`, icon: "🎛️", type: "success" });
        } else {
            const newReview = {
                id: currentAlbumInModal.id,
                title: currentAlbumInModal.title,
                artist: currentAlbumInModal.artist,
                year: currentAlbumInModal.year,
                cover: currentAlbumInModal.cover,
                rating: selectedVisualScore,
                favTrack: selectedFavTrack,
                reviewText: reviewText,
                date: new Date().toLocaleDateString('pt-BR')
            };
            diaryReviews.unshift(newReview);
            wantToListen = wantToListen.filter(item => item.id !== currentAlbumInModal.id);

            showToast({
                title: "Disco Catalogado!",
                message: `"${currentAlbumInModal.title}" entrou no seu diário com nota ${selectedVisualScore.toFixed(1)} ★.`,
                icon: "💽",
                spin: true,
                type: "success"
            });
        }

        saveAllToLocalStorage();
        renderAll();
        if (reviewModal) reviewModal.classList.add('hidden');
        editingReviewIndex = null;
    });
}

// --- 7. TOP 5 DA VIDA (LOCALIZADO NO PERFIL) ---
if (pinTopFiveBtn) {
    pinTopFiveBtn.addEventListener('click', () => {
        if (!currentAlbumInModal) return;

        if (topFiveAlbums.some(a => a && a.id === currentAlbumInModal.id)) {
            showToast({ title: "Já em Alta Rotação", message: `"${currentAlbumInModal.title}" já está no seu Top 5!`, icon: "🔥", type: "info" });
            return;
        }

        const emptyIndex = topFiveAlbums.findIndex(slot => slot === null);
        if (emptyIndex !== -1) {
            topFiveAlbums[emptyIndex] = { ...currentAlbumInModal };
        } else {
            const slotChoice = prompt('Seu Top 5 está cheio! Qual posição (de 1 a 5) você quer substituir por este álbum?');
            const idx = parseInt(slotChoice) - 1;
            if (idx >= 0 && idx < 5) {
                topFiveAlbums[idx] = { ...currentAlbumInModal };
            } else {
                return;
            }
        }

        saveAllToLocalStorage();
        renderTopFive();
        showToast({ title: "Hall da Fama Musical", message: `"${currentAlbumInModal.title}" fixado no Top 5!`, icon: "✨", type: "success" });
    });
}

function removeTopFiveSlot(index, event) {
    event.stopPropagation();
    const removedTitle = topFiveAlbums[index] ? topFiveAlbums[index].title : "Álbum";
    topFiveAlbums[index] = null;
    saveAllToLocalStorage();
    renderTopFive();
    showToast({ title: "Vinil Guardado", message: `"${removedTitle}" retirado do Top 5.`, icon: "📦", type: "info" });
}

function renderTopFive() {
    if (!topFiveGrid) return;
    topFiveGrid.innerHTML = '';
    topFiveAlbums.forEach((album, index) => {
        const slotNum = String(index + 1).padStart(2, '0');
        const slotDiv = document.createElement('div');

        if (album) {
            slotDiv.className = 'album-slot';
            slotDiv.onclick = () => openAlbumModal(album.id);
            slotDiv.innerHTML = `
                <span class="slot-number">${slotNum}</span>
                <button class="remove-slot-btn" title="Remover do Top 5" onclick="removeTopFiveSlot(${index}, event)">✕</button>
                <div class="vinyl-disc"></div>
                <img src="${album.cover}" alt="${album.title}" class="album-cover">
                <div class="slot-info">
                    <strong>${album.title}</strong>
                    <span>${album.artist} (${album.year})</span>
                </div>
            `;
        } else {
            slotDiv.className = 'album-slot empty-slot';
            slotDiv.onclick = () => { window.location.hash = '#/busca'; };
            slotDiv.innerHTML = `
                <span class="slot-number">${slotNum}</span>
                <div class="empty-placeholder">+ Busque p/ Fixar</div>
            `;
        }
        topFiveGrid.appendChild(slotDiv);
    });
}

function deleteDiaryReview(index) {
    const rev = diaryReviews[index];
    if (confirm(`Tem certeza que deseja retirar "${rev.title}" do seu diário?`)) {
        diaryReviews.splice(index, 1);
        saveAllToLocalStorage();
        renderDiary();
        showToast({ title: "Fita Rebobinada", message: `A review de "${rev.title}" foi removida.`, icon: "🗑️", type: "favorite" });
    }
}

// --- 8. GERADOR DE CARD VISUAL EM CANVAS (STUDIO & MINIMALISTA) ---
function generateShareCard(index) {
    activeReviewForCard = diaryReviews[index];
    if (cardStudioModal) cardStudioModal.classList.remove('hidden');
    renderSelectedCard();
}

if (closeCardStudioBtn) {
    closeCardStudioBtn.addEventListener('click', () => {
        if (cardStudioModal) cardStudioModal.classList.add('hidden');
    });
}

if (layoutStudioBtn) {
    layoutStudioBtn.addEventListener('click', () => {
        currentCardLayout = 'studio';
        layoutStudioBtn.classList.add('active');
        if (layoutMinimalBtn) layoutMinimalBtn.classList.remove('active');
        renderSelectedCard();
    });
}

if (layoutMinimalBtn) {
    layoutMinimalBtn.addEventListener('click', () => {
        currentCardLayout = 'minimal';
        layoutMinimalBtn.classList.add('active');
        if (layoutStudioBtn) layoutStudioBtn.classList.remove('active');
        renderSelectedCard();
    });
}

themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
        themeDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        currentCardTheme = dot.dataset.theme;
        renderSelectedCard();
    });
});

function renderSelectedCard() {
    if (!activeReviewForCard || !shareCanvas) return;
    if (currentCardLayout === 'studio') {
        drawStudioCard(activeReviewForCard, currentCardTheme);
    } else {
        drawMinimalCard(activeReviewForCard, currentCardTheme);
    }
}

function applyThemeBackground(ctx, width, height, theme) {
    if (theme === 'tubeglow') {
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2 - 80, 50, width / 2, height / 2, 750);
        bgGrad.addColorStop(0, '#54260b');
        bgGrad.addColorStop(0.5, '#241209');
        bgGrad.addColorStop(1, '#0e0806');
        ctx.fillStyle = bgGrad;
    } else if (theme === 'deepvelvet') {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(0.5, '#110e24');
        bgGrad.addColorStop(1, '#07060d');
        ctx.fillStyle = bgGrad;
    } else if (theme === 'graphite') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#2b2f38');
        bgGrad.addColorStop(0.5, '#1a1c22');
        bgGrad.addColorStop(1, '#111216');
        ctx.fillStyle = bgGrad;
    } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#1c1817');
        bgGrad.addColorStop(0.45, '#121010');
        bgGrad.addColorStop(1, '#0a0808');
        ctx.fillStyle = bgGrad;
    }
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = theme === 'tubeglow' ? 'rgba(245, 158, 11, 0.4)' : '#2E2826';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, width - 60, height - 60);
}

function drawMinimalCard(rev, theme) {
    const ctx = shareCanvas.getContext('2d');
    const width = shareCanvas.width;
    const height = shareCanvas.height;

    applyThemeBackground(ctx, width, height, theme);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.arc(85, 95, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F5F2EB';
    ctx.font = '800 36px Inter, sans-serif';
    ctx.fillText('AFTERPLAY', 112, 107);

    ctx.fillStyle = '#9E958E';
    ctx.font = '500 20px "JetBrains Mono", monospace';
    ctx.fillText('// YOUR MUSIC LISTENING DIARY', 355, 105);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = rev.cover;

    const renderMinimalContent = () => {
        const coverSize = 560;
        const coverX = (width - coverSize) / 2;
        const coverY = 175;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 50;
        ctx.shadowOffsetY = 25;

        const radius = 22;
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, radius);
        ctx.clip();
        ctx.drawImage(img, coverX, coverY, coverSize, coverSize);
        ctx.restore();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#F5F2EB';
        ctx.font = '800 52px Inter, sans-serif';
        const titleText = rev.title.length > 25 ? rev.title.substring(0, 23) + '...' : rev.title;
        ctx.fillText(titleText, width / 2, 830);

        ctx.fillStyle = '#9E958E';
        ctx.font = '500 36px Inter, sans-serif';
        ctx.fillText(`${rev.artist} • ${rev.year}`, width / 2, 895);

        ctx.strokeStyle = '#2E2826';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 140, 960);
        ctx.lineTo(width / 2 + 140, 960);
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = '76px Inter, sans-serif';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
        ctx.shadowBlur = 25;
        const stars = getStarString(rev.rating);
        ctx.fillText(stars, width / 2, 1080);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#F5F2EB';
        ctx.font = '700 42px "JetBrains Mono", monospace';
        ctx.fillText(`${rev.rating.toFixed(1)} / 5.0`, width / 2, 1160);
    };

    img.onload = renderMinimalContent;
    if (img.complete) renderMinimalContent();
}

function drawStudioCard(rev, theme) {
    const ctx = shareCanvas.getContext('2d');
    const width = shareCanvas.width;
    const height = shareCanvas.height;

    applyThemeBackground(ctx, width, height, theme);

    const amberLine = ctx.createLinearGradient(100, 0, width - 100, 0);
    amberLine.addColorStop(0, 'rgba(245, 158, 11, 0)');
    amberLine.addColorStop(0.5, '#F59E0B');
    amberLine.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = amberLine;
    ctx.fillRect(80, 32, width - 160, 4);

    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.arc(90, 95, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F5F2EB';
    ctx.font = '800 38px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('AFTERPLAY', 120, 107);

    ctx.fillStyle = '#F59E0B';
    ctx.font = '500 24px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('LISTENING LOG // ARCHIVE', width - 90, 105);
    ctx.textAlign = 'left';

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = rev.cover;

    const renderStudioContent = () => {
        const coverSize = 460;
        const coverX = (width - coverSize) / 2;
        const coverY = 160;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;

        const radius = 24;
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, radius);
        ctx.clip();
        ctx.drawImage(img, coverX, coverY, coverSize, coverSize);
        ctx.restore();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#F5F2EB';
        ctx.font = '800 48px Inter, sans-serif';
        const titleText = rev.title.length > 28 ? rev.title.substring(0, 26) + '...' : rev.title;
        ctx.fillText(titleText, width / 2, 690);

        ctx.fillStyle = '#9E958E';
        ctx.font = '500 32px Inter, sans-serif';
        ctx.fillText(`${rev.artist} • ${rev.year}`, width / 2, 745);

        ctx.fillStyle = '#F59E0B';
        ctx.font = '54px Inter, sans-serif';
        const stars = getStarString(rev.rating);
        ctx.fillText(stars, width / 2, 830);

        ctx.font = '700 28px "JetBrains Mono", monospace';
        ctx.fillText(`${rev.rating.toFixed(1)} / 5.0`, width / 2, 878);

        if (rev.favTrack && rev.favTrack !== 'Nenhuma selecionada') {
            const trackText = `❤️ Ponto Alto: ${rev.favTrack}`;
            ctx.font = '600 26px Inter, sans-serif';
            const badgeWidth = ctx.measureText(trackText).width + 60;
            const badgeX = (width - badgeWidth) / 2;
            const badgeY = 920;

            ctx.fillStyle = 'rgba(225, 29, 72, 0.15)';
            ctx.strokeStyle = 'rgba(225, 29, 72, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeWidth, 52, 26);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ff6b8b';
            ctx.fillText(trackText, width / 2, badgeY + 36);
        }

        ctx.fillStyle = '#D6D0C8';
        ctx.font = 'italic 30px Inter, sans-serif';
        const maxWidth = 860;
        const lineHeight = 44;
        const startY = 1030;

        const words = (`"${rev.reviewText}"`).split(' ');
        let line = '';
        let currentY = startY;
        let linesCount = 0;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, width / 2, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
                linesCount++;
                if (linesCount >= 4) {
                    line = line + '...';
                    break;
                }
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, width / 2, currentY);

        ctx.fillStyle = '#9E958E';
        ctx.font = '500 22px "JetBrains Mono", monospace';
        ctx.fillText(`LOGGED BY ERICK NAVA • ${rev.date || 'OCT 2026'}`, width / 2, 1270);
    };

    img.onload = renderStudioContent;
    if (img.complete) renderStudioContent();
}

function downloadCanvasAsImage() {
    if (!activeReviewForCard || !shareCanvas) return;

    const link = document.createElement('a');
    const safeTitle = activeReviewForCard.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.download = `afterplay-${safeTitle}-${currentCardLayout}-${currentCardTheme}.png`;
    link.href = shareCanvas.toDataURL('image/png');
    link.click();

    showToast({
        title: "Download Concluído!",
        message: `Card ${currentCardLayout.toUpperCase()} baixado em alta resolução.`,
        icon: "💾",
        type: "success"
    });
}

if (downloadCardBtn) downloadCardBtn.addEventListener('click', downloadCanvasAsImage);

// --- 9. WANT TO LISTEN & VISUALIZADOR DETALHADO DE COLEÇÕES ---
function addToWantList(collectionId) {
    let found = lastSearchResults.find(a => a.collectionId === collectionId);
    if (!found) {
        const inDiary = diaryReviews.find(a => a.id === collectionId);
        if (inDiary) found = { collectionId: inDiary.id, collectionName: inDiary.title, artistName: inDiary.artist, releaseDate: inDiary.year, artworkUrl100: inDiary.cover };
    }
    if (!found) return;

    if (wantToListen.some(item => item.id === collectionId)) {
        showToast({ title: "Já na Fila", message: `"${found.collectionName}" já está na lista!`, icon: "🕒", type: "info" });
        return;
    }

    wantToListen.unshift({
        id: found.collectionId,
        title: found.collectionName,
        artist: found.artistName,
        year: found.releaseDate ? found.releaseDate.substring(0, 4) : 'N/A',
        cover: found.artworkUrl100.replace('100x100bb', '600x600bb')
    });

    saveAllToLocalStorage();
    renderWantList();
    showToast({ title: "Na Fila da Vitrola", message: `"${found.collectionName}" guardado para ouvir!`, icon: "📻", type: "info" });
}

if (openCreateCollectionBtn) {
    openCreateCollectionBtn.addEventListener('click', () => {
        if (newCollectionNameInput) newCollectionNameInput.value = '';
        if (newCollectionDescInput) newCollectionDescInput.value = '';
        if (createCollectionModal) createCollectionModal.classList.remove('hidden');
    });
}

if (closeCreateCollectionBtn) {
    closeCreateCollectionBtn.addEventListener('click', () => {
        if (createCollectionModal) createCollectionModal.classList.add('hidden');
    });
}

if (submitCreateCollectionBtn) {
    submitCreateCollectionBtn.addEventListener('click', () => {
        const name = newCollectionNameInput ? newCollectionNameInput.value.trim() : '';
        const desc = newCollectionDescInput ? newCollectionDescInput.value.trim() : '';

        if (!name) {
            showToast({ title: "Coleção sem Título", message: "Digite um nome para a pasta temática.", icon: "⚠️", type: "info" });
            return;
        }

        const newCollection = {
            id: Date.now(),
            name: name,
            description: desc || "Coleção temática criada no Afterplay.",
            albums: []
        };

        collections.unshift(newCollection);
        saveAllToLocalStorage();
        renderCollections();
        if (createCollectionModal) createCollectionModal.classList.add('hidden');

        showToast({
            title: "Pasta Temática Criada!",
            message: `A coleção "${name}" está pronta para receber discos.`,
            icon: "📁",
            type: "success"
        });
    });
}

function deleteCollection(collectionId, event) {
    if (event) event.stopPropagation();
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;

    if (confirm(`Deseja apagar a coleção "${col.name}"? Os álbuns do seu diário não serão excluídos.`)) {
        collections = collections.filter(c => c.id !== collectionId);
        saveAllToLocalStorage();
        if (activeOpenCollectionId === collectionId) {
            closeCollectionDetail();
        } else {
            renderCollections();
        }
        showToast({ title: "Pasta Desmontada", message: `Coleção "${col.name}" excluída.`, icon: "🗑️", type: "info" });
    }
}

if (backToCollectionsBtn) {
    backToCollectionsBtn.addEventListener('click', () => {
        closeCollectionDetail();
    });
}

function closeCollectionDetail() {
    activeOpenCollectionId = null;
    if (collectionDetailContainer) collectionDetailContainer.classList.add('hidden');
    if (collectionsMainContainer) collectionsMainContainer.classList.remove('hidden');
    renderCollections();
}

function openCollectionDetail(collectionId) {
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;

    activeOpenCollectionId = collectionId;
    if (collectionsMainContainer) collectionsMainContainer.classList.add('hidden');
    if (collectionDetailContainer) collectionDetailContainer.classList.remove('hidden');

    if (collectionDetailTitle) collectionDetailTitle.textContent = col.name;
    if (collectionDetailDesc) collectionDetailDesc.textContent = col.description;
    if (collectionDetailCount) collectionDetailCount.textContent = col.albums.length;

    if (collectionDetailAvg) {
        const ratedAlbums = col.albums.map(a => {
            const foundInDiary = diaryReviews.find(r => r.id === a.id);
            return foundInDiary ? foundInDiary.rating : null;
        }).filter(r => r !== null);

        if (ratedAlbums.length > 0) {
            const avg = (ratedAlbums.reduce((sum, r) => sum + r, 0) / ratedAlbums.length).toFixed(1);
            collectionDetailAvg.textContent = `${avg} ★`;
        } else {
            collectionDetailAvg.textContent = `-- ★`;
        }
    }

    renderCollectionDetailAlbums(col);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCollectionDetailAlbums(col) {
    if (!collectionDetailGrid) return;
    collectionDetailGrid.innerHTML = '';

    if (col.albums.length === 0) {
        collectionDetailGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
                <p style="color: #9E958E; font-size: 0.95rem;">Esta pasta ainda não possui discos arquivados.</p>
                <a href="#/busca" class="btn-open-disco" style="display: inline-block; margin-top: 12px; text-decoration: none; padding: 8px 16px;">
                    🔍 Explorar Acervo e Adicionar Álbuns
                </a>
            </div>
        `;
        return;
    }

    col.albums.forEach(album => {
        const foundInDiary = diaryReviews.find(r => r.id === album.id);
        const ratingBadge = foundInDiary 
            ? `<span class="numeric-score" style="font-size: 0.75rem;">${foundInDiary.rating.toFixed(1)} ★</span>` 
            : `<span style="font-size: 0.72rem; color: var(--text-muted);">Não avaliado</span>`;

        const card = document.createElement('div');
        card.className = 'search-album-card';
        card.innerHTML = `
            <div>
                <img src="${album.cover}" alt="${album.title}">
                <div class="search-album-title" title="${album.title}">${album.title}</div>
                <div class="search-album-artist">${album.artist} • ${album.year}</div>
                <div style="margin-top: 6px;">${ratingBadge}</div>
            </div>
            <div class="card-actions" style="margin-top: 12px;">
                <button class="btn-evaluate" onclick="openAlbumModal(${album.id})">★ Ver / Avaliar</button>
                <button class="btn-remove-from-col" title="Retirar da pasta" onclick="removeAlbumFromCollection(${col.id}, ${album.id}, event)">🗑️ Tirar</button>
            </div>
        `;
        collectionDetailGrid.appendChild(card);
    });
}

function removeAlbumFromCollection(collectionId, albumId, event) {
    if (event) event.stopPropagation();
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;

    const removedAlbum = col.albums.find(a => a.id === albumId);
    col.albums = col.albums.filter(a => a.id !== albumId);
    saveAllToLocalStorage();

    showToast({
        title: "Disco Removido da Pasta",
        message: `"${removedAlbum ? removedAlbum.title : 'Álbum'}" foi retirado de "${col.name}".`,
        icon: "📦",
        type: "info"
    });

    if (activeOpenCollectionId === collectionId) {
        openCollectionDetail(collectionId);
    } else {
        renderCollections();
    }
}

function openAddToCollectionModal(collectionId) {
    let found = lastSearchResults.find(a => a.collectionId === collectionId);
    if (!found) {
        const inDiary = diaryReviews.find(a => a.id === collectionId);
        if (inDiary) found = { collectionId: inDiary.id, collectionName: inDiary.title, artistName: inDiary.artist, releaseDate: inDiary.year, artworkUrl100: inDiary.cover };
    }
    if (!found && currentAlbumInModal && currentAlbumInModal.id === collectionId) {
        found = { collectionId: currentAlbumInModal.id, collectionName: currentAlbumInModal.title, artistName: currentAlbumInModal.artist, releaseDate: currentAlbumInModal.year, artworkUrl100: currentAlbumInModal.cover };
    }
    if (!found) return;

    albumToAddToCollection = {
        id: found.collectionId,
        title: found.collectionName,
        artist: found.artistName,
        year: found.releaseDate ? String(found.releaseDate).substring(0, 4) : 'N/A',
        cover: found.artworkUrl100.replace('100x100bb', '600x600bb')
    };

    if (targetAlbumNameDisplay) targetAlbumNameDisplay.textContent = `🎵 ${albumToAddToCollection.title} — ${albumToAddToCollection.artist}`;
    if (!collectionChoicesList) return;
    collectionChoicesList.innerHTML = '';

    if (collections.length === 0) {
        collectionChoicesList.innerHTML = `<p style="color: #9E958E; font-size: 0.85rem;">Você ainda não criou nenhuma pasta temática. Crie uma na aba Coleções!</p>`;
    } else {
        collections.forEach(col => {
            const btn = document.createElement('button');
            btn.className = 'choice-item-btn';
            const alreadyIn = col.albums.some(a => a.id === albumToAddToCollection.id);

            btn.innerHTML = `
                <span>📁 ${col.name}</span>
                <span style="font-size: 0.75rem; color: ${alreadyIn ? '#10B981' : 'var(--amber-glow)'};">
                    ${alreadyIn ? '✓ Já incluído' : '+ Adicionar'}
                </span>
            `;

            btn.onclick = () => {
                if (alreadyIn) {
                    showToast({ title: "Já Arquivado", message: `Este disco já está na pasta "${col.name}"!`, icon: "📁", type: "info" });
                    return;
                }
                col.albums.push(albumToAddToCollection);
                saveAllToLocalStorage();
                renderCollections();
                if (addToCollectionModal) addToCollectionModal.classList.add('hidden');

                showToast({
                    title: "Vinil Arquivado!",
                    message: `"${albumToAddToCollection.title}" adicionado à pasta "${col.name}".`,
                    icon: "💽",
                    type: "success"
                });
            };

            collectionChoicesList.appendChild(btn);
        });
    }

    if (addToCollectionModal) addToCollectionModal.classList.remove('hidden');
}

if (closeAddToCollectionBtn) {
    closeAddToCollectionBtn.addEventListener('click', () => {
        if (addToCollectionModal) addToCollectionModal.classList.add('hidden');
    });
}

if (modalAddCollectionBtn) {
    modalAddCollectionBtn.addEventListener('click', () => {
        if (currentAlbumInModal) {
            openAddToCollectionModal(currentAlbumInModal.id);
        }
    });
}

function renderCollections() {
    if (collectionsCount) collectionsCount.textContent = collections.length;
    if (!collectionsGrid) return;
    collectionsGrid.innerHTML = '';

    if (collections.length === 0) {
        collectionsGrid.innerHTML = `<p style="color: #9E958E; grid-column: 1/-1;">Nenhuma coleção criada ainda. Clique no botão "+ Nova Coleção" acima!</p>`;
        return;
    }

    collections.forEach(col => {
        const card = document.createElement('div');
        card.className = 'collection-card';
        card.onclick = () => openCollectionDetail(col.id);

        let coversHtml = '';
        for (let i = 0; i < 4; i++) {
            if (col.albums[i]) {
                coversHtml += `<img src="${col.albums[i].cover}" alt="Capa" class="collection-mini-cover">`;
            } else {
                coversHtml += `<div class="collection-empty-cover">+</div>`;
            }
        }

        card.innerHTML = `
            <div>
                <div class="collection-header-row">
                    <span class="collection-title">${col.name}</span>
                    <span class="collection-badge">${col.albums.length} discos</span>
                </div>
                <p class="collection-desc">${col.description}</p>
                <div class="collection-covers-preview">
                    ${coversHtml}
                </div>
            </div>
            <div class="collection-actions-row">
                <span style="font-size: 0.75rem; color: var(--amber-glow); font-weight: 600;">Abrir Pasta ›</span>
                <button class="btn-delete-collection" onclick="deleteCollection(${col.id}, event)">🗑️ Excluir</button>
            </div>
        `;

        collectionsGrid.appendChild(card);
    });
}

// --- 10. RENDERIZAR DIÁRIO E WANT LIST ---
function getStarString(score) {
    const fullStars = Math.floor(score);
    const halfStar = (score % 1) >= 0.5 ? '½' : '';
    return '★'.repeat(fullStars) + halfStar;
}

function renderDiary() {
    if (diaryCount) diaryCount.textContent = diaryReviews.length;
    if (!diarySection) return;
    diarySection.innerHTML = '';

    if (diaryReviews.length === 0) {
        diarySection.innerHTML = `<p style="color: #9E958E;">Nenhuma avaliação ainda. Explore o acervo na página de busca para começar seu diário!</p>`;
        return;
    }

    let processedReviews = diaryReviews.map((item, originalIndex) => ({ ...item, originalIndex }));

    const searchTerm = filterDiaryInput ? filterDiaryInput.value.trim().toLowerCase() : '';
    if (searchTerm) {
        processedReviews = processedReviews.filter(rev => 
            rev.title.toLowerCase().includes(searchTerm) || 
            rev.artist.toLowerCase().includes(searchTerm) ||
            rev.reviewText.toLowerCase().includes(searchTerm)
        );
    }

    const sortType = sortDiarySelect ? sortDiarySelect.value : 'recent';
    processedReviews.sort((a, b) => {
        if (sortType === 'ratingDesc') return b.rating - a.rating;
        if (sortType === 'ratingAsc') return a.rating - b.rating;
        if (sortType === 'yearDesc') return parseInt(b.year || 0) - parseInt(a.year || 0);
        if (sortType === 'yearAsc') return parseInt(a.year || 0) - parseInt(b.year || 0);
        return 0;
    });

    if (processedReviews.length === 0) {
        diarySection.innerHTML = `<p style="color: #9E958E;">Nenhum álbum corresponde ao filtro pesquisado.</p>`;
        return;
    }

    processedReviews.forEach(item => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.style.marginBottom = '18px';
        card.innerHTML = `
            <img src="${item.cover}" alt="${item.title}" class="review-cover">
            <div class="review-content">
                <div class="review-header">
                    <div>
                        <h3>${item.title} <span class="release-year">(${item.year})</span></h3>
                        <p class="artist-name">${item.artist} • Ouvido em ${item.date}</p>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="edit-card-btn" title="Adicionar à Coleção" onclick="openAddToCollectionModal(${item.id})">📁 Coleção</button>
                        <button class="edit-card-btn" title="Editar Avaliação" onclick="editDiaryReview(${item.originalIndex})">✏️ Editar</button>
                        <button class="share-card-btn" onclick="generateShareCard(${item.originalIndex})">📤 Gerar Card</button>
                        <button class="remove-slot-btn" style="position: static; padding: 6px 10px; background: rgba(225, 29, 72, 0.15); color: #ff6b8b; border: 1px solid var(--crimson-rec);" title="Excluir review" onclick="deleteDiaryReview(${item.originalIndex})">🗑️</button>
                    </div>
                </div>
                <div class="rating-row">
                    <span class="stars">${getStarString(item.rating)}</span>
                    <span class="numeric-score">${item.rating.toFixed(1)} / 5.0</span>
                    <span class="fav-track-badge">❤️ Favorita: ${item.favTrack}</span>
                </div>
                <p class="review-text">"${item.reviewText}"</p>
            </div>
        `;
        diarySection.appendChild(card);
    });
}

function renderWantList() {
    if (wantCount) wantCount.textContent = wantToListen.length;
    if (!wantGrid) return;
    wantGrid.innerHTML = '';

    if (wantToListen.length === 0) {
        wantGrid.innerHTML = `<p style="color: #9E958E; grid-column: 1/-1;">Sua fila Want to Listen está vazia. Visite a página de busca para adicionar novos discos!</p>`;
        return;
    }

    wantToListen.forEach(album => {
        const card = document.createElement('div');
        card.className = 'search-album-card';
        card.innerHTML = `
            <div>
                <img src="${album.cover}" alt="${album.title}">
                <div class="search-album-title">${album.title}</div>
                <div class="search-album-artist">${album.artist} • ${album.year}</div>
            </div>
            <div class="card-actions">
                <button class="btn-evaluate" onclick="openAlbumModal(${album.id})">★ Ouvir e Avaliar</button>
                <button class="btn-want" title="Adicionar à Coleção" onclick="openAddToCollectionModal(${album.id})">📁</button>
            </div>
        `;
        wantGrid.appendChild(card);
    });
}

// --- 11. DESAFIO ANUAL & ESTATÍSTICAS ---
function renderListeningChallenge() {
    if (!challengeHeadline || !progressBarFill || !challengePercentText) return;
    const currentYear = new Date().getFullYear();
    const completedCount = diaryReviews.length;
    const percent = Math.min(100, Math.round((completedCount / challengeGoal) * 100));
    
    challengeHeadline.textContent = `Meta de Audição: ${completedCount} de ${challengeGoal} álbuns em ${currentYear}`;
    progressBarFill.style.width = `${percent}%`;
    challengePercentText.textContent = `${percent}% concluído`;

    const remaining = Math.max(0, challengeGoal - completedCount);
    if (challengeRemainingText) {
        if (remaining === 0) {
            challengeRemainingText.textContent = `🎉 Desafio concluído! Você zerou sua meta musical de ${currentYear}!`;
        } else {
            challengeRemainingText.textContent = `Faltam ${remaining} ${remaining === 1 ? 'álbum' : 'álbuns'} para alcançar sua meta`;
        }
    }

    if (challengePaceBadge) {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
        const expectedCountByNow = Math.round((dayOfYear / 365) * challengeGoal);

        if (completedCount >= challengeGoal) {
            challengePaceBadge.className = 'pace-badge';
            challengePaceBadge.textContent = '🏆 Meta Atingida!';
        } else if (completedCount >= expectedCountByNow) {
            const diff = completedCount - expectedCountByNow;
            challengePaceBadge.className = 'pace-badge';
            challengePaceBadge.textContent = diff === 0 
                ? '⚡ No ritmo exato da vitrola' 
                : `⚡ ${diff} ${diff === 1 ? 'disco' : 'discos'} à frente do ritmo!`;
        } else {
            const diff = expectedCountByNow - completedCount;
            challengePaceBadge.className = 'pace-badge behind';
            challengePaceBadge.textContent = `⏳ ${diff} ${diff === 1 ? 'disco' : 'discos'} atrás do ritmo anual`;
        }
    }
}

if (editGoalBtn) {
    editGoalBtn.addEventListener('click', () => {
        const input = prompt('Qual a sua meta de álbuns para ouvir em 2026?', challengeGoal);
        const newGoal = parseInt(input);

        if (newGoal && newGoal > 0) {
            challengeGoal = newGoal;
            localStorage.setItem('afterplay_challenge_goal', challengeGoal);
            renderListeningChallenge();

            showToast({
                title: "Meta Atualizada!",
                message: `Novo objetivo definido para ${challengeGoal} álbuns em 2026.`,
                icon: "🎯",
                type: "success"
            });
        }
    });
}

function renderMusicAnalytics() {
    if (!ratingsHistogram || !decadesList || !topArtistsList) return;

    if (diaryReviews.length === 0) {
        ratingsHistogram.innerHTML = `<p style="color: #9E958E; font-size: 0.85rem; width: 100%; text-align: center;">Avalie discos para gerar o histograma de notas.</p>`;
        decadesList.innerHTML = `<p style="color: #9E958E; font-size: 0.85rem;">Nenhum dado de época disponível ainda.</p>`;
        topArtistsList.innerHTML = `<p style="color: #9E958E; font-size: 0.85rem;">Nenhum artista catalogado.</p>`;
        return;
    }

    const possibleScores = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
    const scoreCounts = {};
    possibleScores.forEach(s => scoreCounts[s] = 0);

    diaryReviews.forEach(rev => {
        const rounded = Math.round(rev.rating * 2) / 2;
        if (scoreCounts[rounded] !== undefined) scoreCounts[rounded]++;
    });

    const maxCount = Math.max(...Object.values(scoreCounts), 1);
    let peakScore = 5.0;
    let highestCount = 0;

    ratingsHistogram.innerHTML = '';
    possibleScores.forEach(score => {
        const count = scoreCounts[score];
        if (count > highestCount) {
            highestCount = count;
            peakScore = score;
        }

        const heightPercent = Math.max(6, Math.round((count / maxCount) * 100));
        const isPeak = count === highestCount && count > 0;

        const col = document.createElement('div');
        col.className = 'hist-bar-col';
        col.innerHTML = `
            <span class="hist-count-label">${count > 0 ? count : ''}</span>
            <div class="hist-bar-fill ${isPeak ? 'active-peak' : ''}" style="height: ${heightPercent}%;"></div>
            <span class="hist-score-label">${score.toFixed(1)}</span>
        `;
        ratingsHistogram.appendChild(col);
    });

    if (mostFrequentRatingTag) {
        mostFrequentRatingTag.textContent = highestCount > 0 ? `Pico: ${peakScore.toFixed(1)} ★ (${highestCount}x)` : 'Pico: --';
    }

    const decadeBuckets = {};
    diaryReviews.forEach(rev => {
        const year = parseInt(rev.year);
        if (year && !isNaN(year)) {
            const decadeStart = Math.floor(year / 10) * 10;
            const decadeLabel = `${decadeStart}s`;
            decadeBuckets[decadeLabel] = (decadeBuckets[decadeLabel] || 0) + 1;
        }
    });

    const sortedDecades = Object.keys(decadeBuckets).sort((a, b) => parseInt(b) - parseInt(a));
    decadesList.innerHTML = '';

    if (sortedDecades.length === 0) {
        decadesList.innerHTML = `<p style="color: #9E958E; font-size: 0.85rem;">Datas de lançamento não informadas.</p>`;
    } else {
        const dominantDecade = Object.entries(decadeBuckets).reduce((a, b) => b[1] > a[1] ? b : a, ['', 0]);
        if (dominantDecadeTag) dominantDecadeTag.textContent = `Dominante: Anos ${dominantDecade[0]}`;

        sortedDecades.forEach(decade => {
            const count = decadeBuckets[decade];
            const percent = Math.round((count / diaryReviews.length) * 100);

            const row = document.createElement('div');
            row.className = 'decade-row';
            row.innerHTML = `
                <div class="decade-meta">
                    <span class="decade-name">Anos ${decade}</span>
                    <span class="decade-stats">${count} ${count === 1 ? 'disco' : 'discos'} (${percent}%)</span>
                </div>
                <div class="decade-bar-track">
                    <div class="decade-bar-fill" style="width: ${percent}%;"></div>
                </div>
            `;
            decadesList.appendChild(row);
        });
    }

    const artistStats = {};
    diaryReviews.forEach(rev => {
        const name = rev.artist.trim();
        if (!artistStats[name]) artistStats[name] = { count: 0, totalRating: 0 };
        artistStats[name].count++;
        artistStats[name].totalRating += rev.rating;
    });

    const sortedArtists = Object.keys(artistStats)
        .map(name => ({
            name,
            count: artistStats[name].count,
            avgRating: (artistStats[name].totalRating / artistStats[name].count).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count || parseFloat(b.avgRating) - parseFloat(a.avgRating))
        .slice(0, 6);

    topArtistsList.innerHTML = '';
    sortedArtists.forEach((artist, index) => {
        const rankNum = String(index + 1).padStart(2, '0');
        const item = document.createElement('div');
        item.className = 'ranking-item';
        item.innerHTML = `
            <span class="rank-position">#${rankNum}</span>
            <div class="rank-details">
                <div class="rank-artist-name" title="${artist.name}">${artist.name}</div>
                <div class="rank-stats-text">${artist.count} ${artist.count === 1 ? 'álbum avaliado' : 'álbuns avaliados'} • Média: ${artist.avgRating} ★</div>
            </div>
        `;
        topArtistsList.appendChild(item);
    });
}

function renderProfileStats() {
    if (statReviews) statReviews.textContent = diaryReviews.length;
    if (statWant) statWant.textContent = wantToListen.length;
    if (statCollections) statCollections.textContent = collections.length;

    if (statAvgRating) {
        if (diaryReviews.length > 0) {
            const sum = diaryReviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avg = (sum / diaryReviews.length).toFixed(1);
            statAvgRating.textContent = `${avg} ★`;
        } else {
            statAvgRating.textContent = `0.0 ★`;
        }
    }

    renderTopFive();
    renderListeningChallenge();
    renderMusicAnalytics();
}

// --- 12. MÓDULO AFTERPLAY WRAPPED ---
if (wrappedTypeMonthlyBtn) {
    wrappedTypeMonthlyBtn.addEventListener('click', () => {
        wrappedType = 'monthly';
        wrappedTypeMonthlyBtn.classList.add('active');
        if (wrappedTypeYearlyBtn) wrappedTypeYearlyBtn.classList.remove('active');
        if (monthlySelectors) monthlySelectors.classList.remove('hidden');
        if (yearlySelectors) yearlySelectors.classList.add('hidden');
    });
}

if (wrappedTypeYearlyBtn) {
    wrappedTypeYearlyBtn.addEventListener('click', () => {
        wrappedType = 'yearly';
        wrappedTypeYearlyBtn.classList.add('active');
        if (wrappedTypeMonthlyBtn) wrappedTypeMonthlyBtn.classList.remove('active');
        if (yearlySelectors) yearlySelectors.classList.remove('hidden');
        if (monthlySelectors) monthlySelectors.classList.add('hidden');
    });
}

if (openWrappedBtn) {
    openWrappedBtn.addEventListener('click', () => {
        let filteredAlbums = [];
        let periodTitle = '';

        if (wrappedType === 'monthly') {
            const month = wrappedMonthSelect ? wrappedMonthSelect.value : '10';
            const year = wrappedYearSelect ? wrappedYearSelect.value : '2026';
            const monthNames = {
                "01": "JANEIRO", "02": "FEVEREIRO", "03": "MARÇO", "04": "ABRIL",
                "05": "MAIO", "06": "JUNHO", "07": "JULHO", "08": "AGOSTO",
                "09": "SETEMBRO", "10": "OUTUBRO", "11": "NOVEMBRO", "12": "DEZEMBRO"
            };
            periodTitle = `${monthNames[month]} DE ${year}`;

            filteredAlbums = diaryReviews.filter(rev => {
                if (!rev.date) return false;
                const parts = rev.date.split('/');
                return parts.length === 3 && parts[1] === month && parts[2] === year;
            });

            if (wrappedModalTag) wrappedModalTag.textContent = 'AFTERPLAY WRAPPED // RETROSPECTIVA MENSAL';
        } else {
            const year = wrappedFullYearSelect ? wrappedFullYearSelect.value : '2026';
            periodTitle = `ANO DE ${year}`;

            filteredAlbums = diaryReviews.filter(rev => {
                if (!rev.date) return false;
                const parts = rev.date.split('/');
                return parts.length === 3 && parts[2] === year;
            });

            if (wrappedModalTag) wrappedModalTag.textContent = 'AFTERPLAY WRAPPED // RETROSPECTIVA ANUAL';
        }

        if (filteredAlbums.length === 0) {
            showToast({
                title: "Sem Fitas no Período",
                message: `Nenhum álbum foi registrado em ${periodTitle}.`,
                icon: "📻",
                type: "info"
            });
            return;
        }

        const totalCount = filteredAlbums.length;
        const avgRating = (filteredAlbums.reduce((sum, a) => sum + a.rating, 0) / totalCount).toFixed(1);

        const sortedByRating = [...filteredAlbums].sort((a, b) => b.rating - a.rating);
        const topAlbum = sortedByRating[0];

        const artistCounts = {};
        filteredAlbums.forEach(a => artistCounts[a.artist] = (artistCounts[a.artist] || 0) + 1);
        const leadArtist = Object.entries(artistCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0];

        currentWrappedData = {
            type: wrappedType,
            periodTitle,
            totalCount,
            avgRating,
            topAlbum,
            leadArtist,
            albums: filteredAlbums
        };

        if (wrappedPeriodSubtitle) wrappedPeriodSubtitle.textContent = periodTitle;
        if (wrappedHeroTitle) wrappedHeroTitle.textContent = wrappedType === 'monthly' ? "Sua Trilha Sonora do Mês" : "O Som do Seu Ano";
        if (wrappedKpiCount) wrappedKpiCount.textContent = totalCount;
        if (wrappedKpiAvg) wrappedKpiAvg.textContent = `${avgRating} ★`;
        if (wrappedKpiArtist) wrappedKpiArtist.textContent = leadArtist;

        if (wrappedTopAlbumContainer) {
            wrappedTopAlbumContainer.innerHTML = `
                <img src="${topAlbum.cover}" alt="${topAlbum.title}" class="wrapped-spotlight-cover">
                <div class="wrapped-spotlight-meta">
                    <h4>${topAlbum.title}</h4>
                    <p>${topAlbum.artist} • ${topAlbum.year}</p>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="stars" style="font-size: 1rem;">${getStarString(topAlbum.rating)}</span>
                        <span class="numeric-score" style="font-size: 0.8rem;">${topAlbum.rating.toFixed(1)} ★</span>
                    </div>
                    ${topAlbum.favTrack && topAlbum.favTrack !== 'Nenhuma selecionada' 
                        ? `<span class="fav-track-badge" style="margin-top: 6px; display: inline-block;">❤️ Ponto Alto: ${topAlbum.favTrack}</span>` 
                        : ''}
                </div>
            `;
        }

        if (wrappedCoversGrid) {
            wrappedCoversGrid.innerHTML = '';
            filteredAlbums.forEach(album => {
                const img = document.createElement('img');
                img.src = album.cover;
                img.alt = album.title;
                img.title = `${album.title} — ${album.artist} (${album.rating.toFixed(1)} ★)`;
                img.className = 'wrapped-thumb-cover';
                wrappedCoversGrid.appendChild(img);
            });
        }

        if (wrappedModal) wrappedModal.classList.remove('hidden');

        showToast({
            title: "Retrospectiva Gerada!",
            message: `Compilado de ${periodTitle} aberto com sucesso.`,
            icon: "✨",
            type: "success"
        });
    });
}

if (closeWrappedBtn) {
    closeWrappedBtn.addEventListener('click', () => {
        if (wrappedModal) wrappedModal.classList.add('hidden');
    });
}

if (exportWrappedCardBtn) {
    exportWrappedCardBtn.addEventListener('click', () => {
        if (!currentWrappedData) return;

        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1350;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const bgGrad = ctx.createRadialGradient(width / 2, 450, 80, width / 2, height / 2, 850);
        bgGrad.addColorStop(0, '#3b1c0b');
        bgGrad.addColorStop(0.45, '#161211');
        bgGrad.addColorStop(1, '#090808');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#2E2826';
        ctx.lineWidth = 14;
        ctx.strokeRect(30, 30, width - 60, height - 60);

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, width - 100, height - 100);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#E11D48';
        ctx.beginPath();
        ctx.arc(90, 100, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F5F2EB';
        ctx.font = '800 36px Inter, sans-serif';
        ctx.fillText('AFTERPLAY WRAPPED', 120, 112);

        ctx.fillStyle = '#F59E0B';
        ctx.font = '700 24px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(currentWrappedData.periodTitle, width - 90, 110);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = currentWrappedData.topAlbum.cover;

        img.onload = () => {
            const coverSize = 480;
            const coverX = (width - coverSize) / 2;
            const coverY = 180;

            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 50;
            ctx.shadowOffsetY = 25;

            const radius = 22;
            ctx.beginPath();
            ctx.roundRect(coverX, coverY, coverSize, coverSize, radius);
            ctx.clip();
            ctx.drawImage(img, coverX, coverY, coverSize, coverSize);
            ctx.restore();

            ctx.textAlign = 'center';
            ctx.fillStyle = '#F59E0B';
            ctx.font = '700 24px "JetBrains Mono", monospace';
            ctx.fillText('★ ÁLBUM NÚMERO 1 ★', width / 2, 715);

            ctx.fillStyle = '#F5F2EB';
            ctx.font = '800 50px Inter, sans-serif';
            const titleText = currentWrappedData.topAlbum.title.length > 25 
                ? currentWrappedData.topAlbum.title.substring(0, 23) + '...' 
                : currentWrappedData.topAlbum.title;
            ctx.fillText(titleText, width / 2, 780);

            ctx.fillStyle = '#9E958E';
            ctx.font = '500 34px Inter, sans-serif';
            ctx.fillText(`${currentWrappedData.topAlbum.artist} • ${currentWrappedData.topAlbum.year}`, width / 2, 835);

            const boxY = 910;
            const boxWidth = 270;
            const boxHeight = 130;
            const gap = 30;
            const startX = (width - (boxWidth * 3 + gap * 2)) / 2;

            const kpis = [
                { label: 'DISCOS OUVIDOS', val: String(currentWrappedData.totalCount) },
                { label: 'NOTA MÉDIA', val: `${currentWrappedData.avgRating} ★` },
                { label: 'TOP ARTISTA', val: currentWrappedData.leadArtist }
            ];

            kpis.forEach((kpi, idx) => {
                const bx = startX + idx * (boxWidth + gap);
                ctx.fillStyle = 'rgba(28, 24, 23, 0.85)';
                ctx.strokeStyle = '#2E2826';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(bx, boxY, boxWidth, boxHeight, 10);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#F59E0B';
                ctx.font = '800 36px "JetBrains Mono", monospace';
                const valText = kpi.val.length > 12 ? kpi.val.substring(0, 10) + '..' : kpi.val;
                ctx.fillText(valText, bx + boxWidth / 2, boxY + 62);

                ctx.fillStyle = '#9E958E';
                ctx.font = '600 18px Inter, sans-serif';
                ctx.fillText(kpi.label, bx + boxWidth / 2, boxY + 100);
            });

            ctx.fillStyle = '#D6D0C8';
            ctx.font = 'italic 26px Inter, sans-serif';
            const quote = `"${currentWrappedData.topAlbum.reviewText}"`;
            const quoteText = quote.length > 90 ? quote.substring(0, 87) + '..."' : quote;
            ctx.fillText(quoteText, width / 2, 1140);

            ctx.fillStyle = '#9E958E';
            ctx.font = '500 22px "JetBrains Mono", monospace';
            ctx.fillText(`AFTERPLAY ARCHIVE // ERICK NAVA • ${currentWrappedData.periodTitle}`, width / 2, 1265);

            const link = document.createElement('a');
            const safePeriod = currentWrappedData.periodTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
            link.download = `afterplay-wrapped-${safePeriod}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            showToast({
                title: "Pôster Wrapped Baixado!",
                message: `Retrospectiva de ${currentWrappedData.periodTitle} salva em 1080x1350 PNG.`,
                icon: "💾",
                type: "success"
            });
        };

        if (img.complete) img.onload();
    });
}

// --- 13. MÓDULO DE BACKUP & PORTABILIDADE (SPRINT 14) ---
const exportBackupBtn = document.getElementById('exportBackupBtn');
const importBackupInput = document.getElementById('importBackupInput');
const cloudSyncModalBtn = document.getElementById('cloudSyncModalBtn');
const cloudSyncModal = document.getElementById('cloudSyncModal');
const closeCloudModalBtn = document.getElementById('closeCloudModalBtn');
const cloudEndpointInput = document.getElementById('cloudEndpointInput');
const cloudKeyInput = document.getElementById('cloudKeyInput');
const saveCloudSyncBtn = document.getElementById('saveCloudSyncBtn');
const fetchCloudSyncBtn = document.getElementById('fetchCloudSyncBtn');

// 1. Exportar Backup JSON Local
if (exportBackupBtn) {
    exportBackupBtn.addEventListener('click', () => {
        const fullBackup = {
            version: "2.0",
            exportDate: new Date().toISOString(),
            diaryReviews,
            wantToListen,
            topFiveAlbums,
            collections,
            challengeGoal
        };

        const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
        const downloadAnchor = document.createElement('a');
        const dateStamp = new Date().toISOString().split('T')[0];
        downloadAnchor.setAttribute("href", jsonString);
        downloadAnchor.setAttribute("download", `afterplay-backup-${dateStamp}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        showToast({
            title: "Backup Concluído!",
            message: "Arquivo JSON gerado e salvo nos seus downloads.",
            icon: "💾",
            type: "success"
        });
    });
}

// 2. Restaurar Backup a partir de Arquivo JSON
if (importBackupInput) {
    importBackupInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.diaryReviews && Array.isArray(data.diaryReviews)) {
                    diaryReviews = data.diaryReviews;
                    wantToListen = data.wantToListen || [];
                    topFiveAlbums = data.topFiveAlbums || [null, null, null, null, null];
                    collections = data.collections || [];
                    challengeGoal = data.challengeGoal || 50;

                    saveAllToLocalStorage();
                    renderAll();

                    showToast({
                        title: "Acervo Restaurado!",
                        message: `${diaryReviews.length} avaliações restauradas com sucesso.`,
                        icon: "🔄",
                        type: "success"
                    });
                } else {
                    throw new Error("Formato de arquivo inválido.");
                }
            } catch (err) {
                console.error(err);
                showToast({
                    title: "Erro na Leitura",
                    message: "Arquivo de backup inválido ou corrompido.",
                    icon: "⚠️",
                    type: "favorite"
                });
            }
        };
        reader.readAsText(file);
    });
}

// 3. Sincronização em Nuvem (Cloud Sync)
if (cloudSyncModalBtn) {
    cloudSyncModalBtn.addEventListener('click', () => {
        if (cloudEndpointInput) cloudEndpointInput.value = localStorage.getItem('afterplay_cloud_endpoint') || '';
        if (cloudKeyInput) cloudKeyInput.value = localStorage.getItem('afterplay_cloud_key') || '';
        if (cloudSyncModal) cloudSyncModal.classList.remove('hidden');
    });
}

if (closeCloudModalBtn) {
    closeCloudModalBtn.addEventListener('click', () => {
        if (cloudSyncModal) cloudSyncModal.classList.add('hidden');
    });
}

if (saveCloudSyncBtn) {
    saveCloudSyncBtn.addEventListener('click', async () => {
        const endpoint = cloudEndpointInput.value.trim();
        const key = cloudKeyInput.value.trim();

        if (!endpoint) {
            showToast({ title: "Endpoint Ausente", message: "Informe a URL ou Endpoint do seu banco na nuvem.", icon: "⚠️", type: "info" });
            return;
        }

        localStorage.setItem('afterplay_cloud_endpoint', endpoint);
        localStorage.setItem('afterplay_cloud_key', key);

        const payload = {
            diaryReviews,
            wantToListen,
            topFiveAlbums,
            collections,
            challengeGoal,
            updatedAt: new Date().toISOString()
        };

        try {
            showToast({ title: "Transmitindo...", message: "Enviando acervo para a nuvem.", icon: "☁️", type: "info" });
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(key ? { 'X-Master-Key': key, 'apikey': key, 'Authorization': `Bearer ${key}` } : {})
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast({ title: "Nuvem Sincronizada!", message: "Acervo enviado para o banco com sucesso.", icon: "✨", type: "success" });
                if (cloudSyncModal) cloudSyncModal.classList.add('hidden');
            } else {
                throw new Error("Erro na resposta do servidor.");
            }
        } catch (error) {
            console.error(error);
            showToast({ title: "Falha na Transmissão", message: "Não foi possível conectar com o endpoint.", icon: "⚠️", type: "favorite" });
        }
    });
}

if (fetchCloudSyncBtn) {
    fetchCloudSyncBtn.addEventListener('click', async () => {
        const endpoint = cloudEndpointInput.value.trim();
        const key = cloudKeyInput.value.trim();

        if (!endpoint) {
            showToast({ title: "Endpoint Ausente", message: "Informe a URL do banco para puxar os dados.", icon: "⚠️", type: "info" });
            return;
        }

        try {
            showToast({ title: "Buscando...", message: "Puxando dados da nuvem.", icon: "🔄", type: "info" });
            const res = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    ...(key ? { 'X-Master-Key': key, 'apikey': key, 'Authorization': `Bearer ${key}` } : {})
                }
            });

            if (res.ok) {
                const remote = await res.json();
                const data = remote.record || remote; // Normaliza formato JSONBin / direto

                if (data.diaryReviews) {
                    diaryReviews = data.diaryReviews;
                    wantToListen = data.wantToListen || [];
                    topFiveAlbums = data.topFiveAlbums || [null, null, null, null, null];
                    collections = data.collections || [];
                    challengeGoal = data.challengeGoal || 50;

                    saveAllToLocalStorage();
                    renderAll();

                    showToast({ title: "Sincronizado da Nuvem!", message: "Seus dados foram atualizados do banco.", icon: "✨", type: "success" });
                    if (cloudSyncModal) cloudSyncModal.classList.add('hidden');
                }
            } else {
                throw new Error("Falha ao recuperar dados da nuvem.");
            }
        } catch (error) {
            console.error(error);
            showToast({ title: "Erro de Download", message: "Não foi possível baixar os dados remotos.", icon: "⚠️", type: "favorite" });
        }
    });
}

// --- PERSISTÊNCIA & BOOTSTRAPPING ---
function saveAllToLocalStorage() {
    localStorage.setItem('afterplay_diary', JSON.stringify(diaryReviews));
    localStorage.setItem('afterplay_want', JSON.stringify(wantToListen));
    localStorage.setItem('afterplay_top5', JSON.stringify(topFiveAlbums));
    localStorage.setItem('afterplay_collections', JSON.stringify(collections));
}

function renderAll() {
    renderDiary();
    renderWantList();
    renderCollections();
    renderProfileStats();
}

if (sortDiarySelect) sortDiarySelect.addEventListener('change', renderDiary);
if (filterDiaryInput) filterDiaryInput.addEventListener('input', renderDiary);

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        if (reviewModal) reviewModal.classList.add('hidden');
        editingReviewIndex = null;
    });
}

buildStarPicker();
renderAll();
handleRouting();