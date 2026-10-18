// ============================================================================
// AFTERPLAY — MOTOR COMPLETO (app.js)
// Release 3.0: Listening Moods, Audio Previews, Card Studio 3.0, Busca & Cloud
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
        vibes: ["Madrugada", "Headphones"],
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
let selectedVibes = [];
let currentVibeFilter = 'all';
let editingReviewIndex = null;
let lastSearchResults = [];
let activeReviewForCard = null;
let cachedArtistAlbums = [];
let lastSearchQuery = '';
let currentCardLayout = 'studio';
let currentCardTheme = 'midnight';
let currentAspectRatio = '4:5';
let isTopFiveCardMode = false;
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
const vibeFilterChips = document.querySelectorAll('.vibe-chip');
const vibePickerChips = document.querySelectorAll('.vibe-select-chip');

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

// Histograma, Métricas e Moods
const ratingsHistogram = document.getElementById('ratingsHistogram');
const mostFrequentRatingTag = document.getElementById('mostFrequentRatingTag');
const decadesList = document.getElementById('decadesList');
const dominantDecadeTag = document.getElementById('dominantDecadeTag');
const topArtistsList = document.getElementById('topArtistsList');
const dominantVibeTag = document.getElementById('dominantVibeTag');
const vibeAnalyticsList = document.getElementById('vibeAnalyticsList');

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

// Engine de Áudio & Mini Player de Estúdio
let afterplayAudio = document.getElementById('afterplayAudio');
if (!afterplayAudio) {
    afterplayAudio = document.createElement('audio');
    afterplayAudio.id = 'afterplayAudio';
    document.body.appendChild(afterplayAudio);
}
const studioPlayerBar = document.getElementById('studioPlayerBar');
const playerMasterPlayBtn = document.getElementById('playerMasterPlayBtn');
const playerTrackTitle = document.getElementById('playerTrackTitle');
const vuEqualizer = document.getElementById('vuEqualizer');
const playerProgressBar = document.getElementById('playerProgressBar');
const playerTimeDisplay = document.getElementById('playerTimeDisplay');
let currentPlayingPreviewUrl = null;
let currentPlayingBtn = null;

// Card Studio 3.0 & Proporções
const cardStudioModal = document.getElementById('cardStudioModal');
const closeCardStudioBtn = document.getElementById('closeCardStudioBtn');
const shareCanvas = document.getElementById('shareCanvas');
const downloadCardBtn = document.getElementById('downloadCardBtn');
const layoutStudioBtn = document.getElementById('layoutStudioBtn');
const layoutMinimalBtn = document.getElementById('layoutMinimalBtn');
const themeDots = document.querySelectorAll('.theme-color-dot');
const ratio45Btn = document.getElementById('ratio45Btn');
const ratio916Btn = document.getElementById('ratio916Btn');
const ratio11Btn = document.getElementById('ratio11Btn');
const shareTopFiveBtn = document.getElementById('shareTopFiveBtn');
const cardResolutionLabel = document.getElementById('cardResolutionLabel');

const aspectDimensions = {
    '4:5': { width: 1080, height: 1350, label: '1080x1350 // POST EDITORIAL (4:5)' },
    '9:16': { width: 1080, height: 1920, label: '1080x1920 // STORY FULLSCREEN (9:16)' },
    '1:1': { width: 1080, height: 1080, label: '1080x1080 // FEED QUADRADO (1:1)' }
};

// Outros Modais
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

// Backup & Cloud Sync
const exportBackupBtn = document.getElementById('exportBackupBtn');
const importBackupInput = document.getElementById('importBackupInput');
const cloudSyncModalBtn = document.getElementById('cloudSyncModalBtn');
const cloudSyncModal = document.getElementById('cloudSyncModal');
const closeCloudModalBtn = document.getElementById('closeCloudModalBtn');
const cloudEndpointInput = document.getElementById('cloudEndpointInput');
const cloudKeyInput = document.getElementById('cloudKeyInput');
const saveCloudSyncBtn = document.getElementById('saveCloudSyncBtn');
const fetchCloudSyncBtn = document.getElementById('fetchCloudSyncBtn');

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

// --- 6. AUDIO EXPERIENCE & MOTOR DE REPRODUÇÃO ANALÓGICA ---
function togglePlayPreview(previewUrl, trackName, btnElement) {
    if (!afterplayAudio) return;

    if (currentPlayingPreviewUrl === previewUrl && !afterplayAudio.paused) {
        pauseAudio();
        return;
    }

    if (currentPlayingBtn) {
        currentPlayingBtn.textContent = '▶';
        currentPlayingBtn.classList.remove('playing');
    }

    currentPlayingPreviewUrl = previewUrl;
    currentPlayingBtn = btnElement;

    afterplayAudio.src = previewUrl;
    afterplayAudio.play().then(() => {
        if (btnElement) {
            btnElement.textContent = '⏸';
            btnElement.classList.add('playing');
        }
        if (studioPlayerBar) studioPlayerBar.classList.remove('hidden');
        if (playerMasterPlayBtn) playerMasterPlayBtn.textContent = '⏸';
        if (playerTrackTitle) playerTrackTitle.textContent = trackName;
        if (vuEqualizer) vuEqualizer.classList.add('active');
    }).catch(err => {
        console.error("Erro na reprodução de preview:", err);
        showToast({ title: "Áudio Indisponível", message: "Não foi possível carregar a prévia desta faixa.", icon: "⚠️", type: "info" });
    });
}

function pauseAudio() {
    if (!afterplayAudio) return;
    afterplayAudio.pause();
    if (currentPlayingBtn) {
        currentPlayingBtn.textContent = '▶';
        currentPlayingBtn.classList.remove('playing');
    }
    if (playerMasterPlayBtn) playerMasterPlayBtn.textContent = '▶';
    if (vuEqualizer) vuEqualizer.classList.remove('active');
}

function stopAudio() {
    if (!afterplayAudio) return;
    afterplayAudio.pause();
    afterplayAudio.currentTime = 0;
    if (currentPlayingBtn) {
        currentPlayingBtn.textContent = '▶';
        currentPlayingBtn.classList.remove('playing');
    }
    currentPlayingPreviewUrl = null;
    currentPlayingBtn = null;
    if (studioPlayerBar) studioPlayerBar.classList.add('hidden');
    if (vuEqualizer) vuEqualizer.classList.remove('active');
    if (playerProgressBar) playerProgressBar.style.width = '0%';
    if (playerTimeDisplay) playerTimeDisplay.textContent = '0:00';
}

if (afterplayAudio) {
    afterplayAudio.addEventListener('timeupdate', () => {
        if (!afterplayAudio.duration) return;
        const progress = (afterplayAudio.currentTime / afterplayAudio.duration) * 100;
        if (playerProgressBar) playerProgressBar.style.width = `${progress}%`;

        const currentSec = Math.floor(afterplayAudio.currentTime);
        if (playerTimeDisplay) playerTimeDisplay.textContent = `0:${currentSec < 10 ? '0' : ''}${currentSec}`;
    });

    afterplayAudio.addEventListener('ended', () => {
        pauseAudio();
        if (playerProgressBar) playerProgressBar.style.width = '0%';
        if (playerTimeDisplay) playerTimeDisplay.textContent = '0:00';
    });
}

if (playerMasterPlayBtn) {
    playerMasterPlayBtn.addEventListener('click', () => {
        if (afterplayAudio.paused) {
            afterplayAudio.play();
            playerMasterPlayBtn.textContent = '⏸';
            if (currentPlayingBtn) {
                currentPlayingBtn.textContent = '⏸';
                currentPlayingBtn.classList.add('playing');
            }
            if (vuEqualizer) vuEqualizer.classList.add('active');
        } else {
            pauseAudio();
        }
    });
}

// --- 7. CONTROLE DE VIBES (LISTENING MOODS) ---
vibePickerChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const vibe = chip.dataset.vibe;
        if (selectedVibes.includes(vibe)) {
            selectedVibes = selectedVibes.filter(v => v !== vibe);
            chip.classList.remove('selected');
        } else {
            selectedVibes.push(vibe);
            chip.classList.add('selected');
        }
    });
});

function resetVibePicker(existingVibes = []) {
    selectedVibes = [...existingVibes];
    vibePickerChips.forEach(chip => {
        if (selectedVibes.includes(chip.dataset.vibe)) {
            chip.classList.add('selected');
        } else {
            chip.classList.remove('selected');
        }
    });
}

vibeFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        vibeFilterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentVibeFilter = chip.dataset.vibe;
        renderDiary();
    });
});

// --- 8. MODAL DE AVALIAÇÃO / EDIÇÃO FAIXA A FAIXA ---
async function openAlbumModal(collectionId, editIndex = null) {
    stopAudio();
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
            resetVibePicker(existing.vibes || []);
        } else {
            if (reviewTextInput) reviewTextInput.value = '';
            selectedFavTrack = 'Nenhuma selecionada';
            setVisualScore(4.0);
            resetVibePicker([]);
        }

        if (modalTracklist) {
            modalTracklist.innerHTML = '';
            if (tracks.length === 0) {
                modalTracklist.innerHTML = `<p style="color: #9E958E;">Lista de faixas indisponível para este álbum.</p>`;
                return;
            }

            tracks.forEach((track, index) => {
                const num = String(index + 1).padStart(2, '0');
                const isFav = selectedFavTrack === track.trackName;

                const row = document.createElement('div');
                row.className = 'track-row';

                const leftDiv = document.createElement('div');
                leftDiv.style.cssText = 'display: flex; align-items: center; overflow: hidden;';

                if (track.previewUrl) {
                    const playBtn = document.createElement('button');
                    playBtn.type = 'button';
                    playBtn.className = 'track-play-btn';
                    playBtn.textContent = '▶';
                    playBtn.title = 'Ouvir trecho de 30s';
                    playBtn.addEventListener('click', () => {
                        togglePlayPreview(track.previewUrl, track.trackName, playBtn);
                    });
                    leftDiv.appendChild(playBtn);
                }

                const numSpan = document.createElement('span');
                numSpan.className = 'track-num';
                numSpan.textContent = `${num}.`;

                const nameSpan = document.createElement('span');
                nameSpan.style.cssText = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-left: 4px;';
                nameSpan.textContent = track.trackName;

                leftDiv.appendChild(numSpan);
                leftDiv.appendChild(nameSpan);

                const rightDiv = document.createElement('div');
                rightDiv.className = 'track-controls';

                const favBtn = document.createElement('button');
                favBtn.type = 'button';
                favBtn.className = `fav-track-btn ${isFav ? 'selected' : ''}`;
                favBtn.title = 'Marcar como Faixa Favorita';
                favBtn.textContent = '❤️';
                favBtn.addEventListener('click', () => selectFavoriteTrack(favBtn, track.trackName));

                const selectRating = document.createElement('select');
                selectRating.className = 'track-rating-select';
                selectRating.innerHTML = `
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
                `;
                selectRating.addEventListener('change', recalculateTrackAverage);

                rightDiv.appendChild(favBtn);
                rightDiv.appendChild(selectRating);

                row.appendChild(leftDiv);
                row.appendChild(rightDiv);
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
                vibes: [...selectedVibes],
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
                vibes: [...selectedVibes],
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
        stopAudio();
        if (reviewModal) reviewModal.classList.add('hidden');
        editingReviewIndex = null;
    });
}

// --- 9. TOP 5 DA VIDA (LOCALIZADO NO PERFIL) ---
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

// --- 10. CARD STUDIO 3.0: ASPECT RATIOS & TOP 5 POSTER ---
function setAspectRatio(ratio) {
    currentAspectRatio = ratio;
    const dim = aspectDimensions[ratio];
    if (shareCanvas) {
        shareCanvas.width = dim.width;
        shareCanvas.height = dim.height;
    }
    if (cardResolutionLabel) cardResolutionLabel.textContent = dim.label;

    [ratio45Btn, ratio916Btn, ratio11Btn].forEach(btn => {
        if (btn) btn.classList.remove('active');
    });

    if (ratio === '4:5' && ratio45Btn) ratio45Btn.classList.add('active');
    if (ratio === '9:16' && ratio916Btn) ratio916Btn.classList.add('active');
    if (ratio === '1:1' && ratio11Btn) ratio11Btn.classList.add('active');

    renderSelectedCard();
}

if (ratio45Btn) ratio45Btn.addEventListener('click', () => setAspectRatio('4:5'));
if (ratio916Btn) ratio916Btn.addEventListener('click', () => setAspectRatio('9:16'));
if (ratio11Btn) ratio11Btn.addEventListener('click', () => setAspectRatio('1:1'));

function generateShareCard(index) {
    isTopFiveCardMode = false;
    activeReviewForCard = diaryReviews[index];
    if (cardStudioModal) cardStudioModal.classList.remove('hidden');
    setAspectRatio(currentAspectRatio);
}

if (shareTopFiveBtn) {
    shareTopFiveBtn.addEventListener('click', () => {
        const activeAlbums = topFiveAlbums.filter(a => a !== null);
        if (activeAlbums.length === 0) {
            showToast({
                title: "Top 5 Vazio",
                message: "Fixe pelo menos um álbum no seu Top 5 antes de gerar o pôster.",
                icon: "🔥",
                type: "info"
            });
            return;
        }

        isTopFiveCardMode = true;
        if (cardStudioModal) cardStudioModal.classList.remove('hidden');
        setAspectRatio(currentAspectRatio);
    });
}

if (closeCardStudioBtn) {
    closeCardStudioBtn.addEventListener('click', () => {
        if (cardStudioModal) cardStudioModal.classList.add('hidden');
        isTopFiveCardMode = false;
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
    if (!shareCanvas) return;
    if (isTopFiveCardMode) {
        drawTopFivePoster(currentCardTheme);
    } else {
        if (!activeReviewForCard) return;
        if (currentCardLayout === 'studio') {
            drawStudioCard(activeReviewForCard, currentCardTheme);
        } else {
            drawMinimalCard(activeReviewForCard, currentCardTheme);
        }
    }
}

function applyThemeBackground(ctx, width, height, theme) {
    if (theme === 'tubeglow') {
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2 - 80, 50, width / 2, height / 2, Math.max(width, height) * 0.7);
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

    const render = () => {
        const coverSize = currentAspectRatio === '9:16' ? 620 : (currentAspectRatio === '1:1' ? 440 : 560);
        const coverX = (width - coverSize) / 2;
        const coverY = currentAspectRatio === '9:16' ? 280 : (currentAspectRatio === '1:1' ? 140 : 175);

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

        const metaStartY = coverY + coverSize + (currentAspectRatio === '9:16' ? 100 : (currentAspectRatio === '1:1' ? 60 : 80));

        ctx.textAlign = 'center';
        ctx.fillStyle = '#F5F2EB';
        ctx.font = '800 50px Inter, sans-serif';
        const titleText = rev.title.length > 25 ? rev.title.substring(0, 23) + '...' : rev.title;
        ctx.fillText(titleText, width / 2, metaStartY);

        ctx.fillStyle = '#9E958E';
        ctx.font = '500 34px Inter, sans-serif';
        ctx.fillText(`${rev.artist} • ${rev.year}`, width / 2, metaStartY + 60);

        ctx.strokeStyle = '#2E2826';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 140, metaStartY + 115);
        ctx.lineTo(width / 2 + 140, metaStartY + 115);
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = '72px Inter, sans-serif';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
        ctx.shadowBlur = 25;
        const stars = getStarString(rev.rating);
        ctx.fillText(stars, width / 2, metaStartY + 215);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#F5F2EB';
        ctx.font = '700 40px "JetBrains Mono", monospace';
        ctx.fillText(`${rev.rating.toFixed(1)} / 5.0`, width / 2, metaStartY + 285);
    };

    img.onload = render;
    if (img.complete) render();
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

    const render = () => {
        const coverSize = currentAspectRatio === '9:16' ? 520 : (currentAspectRatio === '1:1' ? 360 : 460);
        const coverX = (width - coverSize) / 2;
        const coverY = currentAspectRatio === '9:16' ? 220 : (currentAspectRatio === '1:1' ? 140 : 160);

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

        const contentY = coverY + coverSize + (currentAspectRatio === '1:1' ? 45 : 65);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#F5F2EB';
        ctx.font = '800 46px Inter, sans-serif';
        const titleText = rev.title.length > 28 ? rev.title.substring(0, 26) + '...' : rev.title;
        ctx.fillText(titleText, width / 2, contentY);

        ctx.fillStyle = '#9E958E';
        ctx.font = '500 30px Inter, sans-serif';
        ctx.fillText(`${rev.artist} • ${rev.year}`, width / 2, contentY + 50);

        ctx.fillStyle = '#F59E0B';
        ctx.font = '50px Inter, sans-serif';
        const stars = getStarString(rev.rating);
        ctx.fillText(stars, width / 2, contentY + 125);

        ctx.font = '700 26px "JetBrains Mono", monospace';
        ctx.fillText(`${rev.rating.toFixed(1)} / 5.0`, width / 2, contentY + 168);

        let quoteY = contentY + 230;

        if (rev.favTrack && rev.favTrack !== 'Nenhuma selecionada') {
            const trackText = `❤️ Ponto Alto: ${rev.favTrack}`;
            ctx.font = '600 24px Inter, sans-serif';
            const badgeWidth = ctx.measureText(trackText).width + 50;
            const badgeX = (width - badgeWidth) / 2;

            ctx.fillStyle = 'rgba(225, 29, 72, 0.15)';
            ctx.strokeStyle = 'rgba(225, 29, 72, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(badgeX, contentY + 195, badgeWidth, 48, 24);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ff6b8b';
            ctx.fillText(trackText, width / 2, contentY + 228);
            quoteY += 60;
        }

        if (currentAspectRatio !== '1:1') {
            ctx.fillStyle = '#D6D0C8';
            ctx.font = 'italic 28px Inter, sans-serif';
            const maxWidth = 860;
            const lineHeight = 42;

            const words = (`"${rev.reviewText}"`).split(' ');
            let line = '';
            let currentY = quoteY + 20;
            let linesCount = 0;

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, width / 2, currentY);
                    line = words[n] + ' ';
                    currentY += lineHeight;
                    linesCount++;
                    if (linesCount >= (currentAspectRatio === '9:16' ? 6 : 4)) {
                        line = line + '...';
                        break;
                    }
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, width / 2, currentY);
        }

        ctx.fillStyle = '#9E958E';
        ctx.font = '500 22px "JetBrains Mono", monospace';
        const footerY = height - 70;
        ctx.fillText(`LOGGED BY ERICK NAVA • ${rev.date || '2026'}`, width / 2, footerY);
    };

    img.onload = render;
    if (img.complete) render();
}

function drawTopFivePoster(theme) {
    const ctx = shareCanvas.getContext('2d');
    const width = shareCanvas.width;
    const height = shareCanvas.height;

    applyThemeBackground(ctx, width, height, theme);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.arc(85, 95, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F5F2EB';
    ctx.font = '800 36px Inter, sans-serif';
    ctx.fillText('AFTERPLAY', 115, 107);

    ctx.fillStyle = '#F59E0B';
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('MY ALL-TIME TOP 5', width - 85, 105);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#F5F2EB';
    ctx.font = '800 48px Inter, sans-serif';
    ctx.fillText('OS 5 ÁLBUNS DA MINHA VIDA', width / 2, 175);

    ctx.fillStyle = '#9E958E';
    ctx.font = '500 24px Inter, sans-serif';
    ctx.fillText('Curadoria definitiva de audição atenta // Erick Nava', width / 2, 215);

    const validAlbums = topFiveAlbums.filter(a => a !== null);
    if (validAlbums.length === 0) return;

    let loadedImages = 0;
    const totalImages = validAlbums.length;
    const loadedImgs = [];

    validAlbums.forEach((album, idx) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = album.cover;
        img.onload = () => {
            loadedImages++;
            loadedImgs[idx] = img;
            if (loadedImages === totalImages) {
                renderTopFiveContent();
            }
        };
        if (img.complete) {
            loadedImages++;
            loadedImgs[idx] = img;
            if (loadedImages === totalImages) {
                renderTopFiveContent();
            }
        }
    });

    function renderTopFiveContent() {
        const startY = 270;
        const availableHeight = height - startY - 120;
        const rowHeight = availableHeight / 5;

        validAlbums.forEach((album, idx) => {
            const currentY = startY + idx * rowHeight;
            const img = loadedImgs[idx];
            const coverSize = Math.min(rowHeight - 20, 140);

            ctx.fillStyle = 'rgba(28, 24, 23, 0.7)';
            ctx.strokeStyle = '#2E2826';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(80, currentY, width - 160, coverSize + 16, 12);
            ctx.fill();
            ctx.stroke();

            ctx.textAlign = 'left';
            ctx.fillStyle = '#F59E0B';
            ctx.font = '800 36px "JetBrains Mono", monospace';
            ctx.fillText(`#0${idx + 1}`, 105, currentY + coverSize / 2 + 18);

            if (img) {
                ctx.save();
                const coverX = 205;
                const coverY = currentY + 8;
                ctx.beginPath();
                ctx.roundRect(coverX, coverY, coverSize, coverSize, 8);
                ctx.clip();
                ctx.drawImage(img, coverX, coverY, coverSize, coverSize);
                ctx.restore();
            }

            const textX = 205 + coverSize + 25;
            ctx.textAlign = 'left';
            ctx.fillStyle = '#F5F2EB';
            ctx.font = '700 32px Inter, sans-serif';
            const title = album.title.length > 26 ? album.title.substring(0, 24) + '...' : album.title;
            ctx.fillText(title, textX, currentY + coverSize / 2 - 4);

            ctx.fillStyle = '#9E958E';
            ctx.font = '500 24px Inter, sans-serif';
            ctx.fillText(`${album.artist} • ${album.year}`, textX, currentY + coverSize / 2 + 34);
        });

        ctx.textAlign = 'center';
        ctx.fillStyle = '#9E958E';
        ctx.font = '500 22px "JetBrains Mono", monospace';
        ctx.fillText('AFTERPLAY STUDIO ARCHIVE // MANAUS - AM', width / 2, height - 55);
    }
}

function downloadCanvasAsImage() {
    if (!shareCanvas) return;

    const link = document.createElement('a');
    let filename = '';

    if (isTopFiveCardMode) {
        filename = `afterplay-top-5-${currentAspectRatio.replace(':', 'x')}-${currentCardTheme}.png`;
    } else if (activeReviewForCard) {
        const safeTitle = activeReviewForCard.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        filename = `afterplay-${safeTitle}-${currentAspectRatio.replace(':', 'x')}-${currentCardLayout}-${currentCardTheme}.png`;
    } else {
        filename = `afterplay-card.png`;
    }

    link.download = filename;
    link.href = shareCanvas.toDataURL('image/png');
    link.click();

    showToast({
        title: "Download Concluído!",
        message: `Card exportado em alta definição (${aspectDimensions[currentAspectRatio].label}).`,
        icon: "💾",
        type: "success"
    });
}

if (downloadCardBtn) downloadCardBtn.addEventListener('click', downloadCanvasAsImage);

// --- 11. WANT TO LISTEN & VISUALIZADOR DETALHADO DE COLEÇÕES ---
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

// --- 12. RENDERIZAR DIÁRIO E WANT LIST COM LISTENING MOODS ---
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

    // Filtro por Vibe
    if (currentVibeFilter !== 'all') {
        processedReviews = processedReviews.filter(rev => rev.vibes && rev.vibes.includes(currentVibeFilter));
    }

    // Filtro de Texto
    const searchTerm = filterDiaryInput ? filterDiaryInput.value.trim().toLowerCase() : '';
    if (searchTerm) {
        processedReviews = processedReviews.filter(rev => 
            rev.title.toLowerCase().includes(searchTerm) || 
            rev.artist.toLowerCase().includes(searchTerm) ||
            rev.reviewText.toLowerCase().includes(searchTerm)
        );
    }

    // Ordenação
    const sortType = sortDiarySelect ? sortDiarySelect.value : 'recent';
    processedReviews.sort((a, b) => {
        if (sortType === 'ratingDesc') return b.rating - a.rating;
        if (sortType === 'ratingAsc') return a.rating - b.rating;
        if (sortType === 'yearDesc') return parseInt(b.year || 0) - parseInt(a.year || 0);
        if (sortType === 'yearAsc') return parseInt(a.year || 0) - parseInt(b.year || 0);
        return 0;
    });

    if (processedReviews.length === 0) {
        diarySection.innerHTML = `<p style="color: #9E958E;">Nenhum álbum corresponde ao filtro de atmosfera ou busca selecionado.</p>`;
        return;
    }

    processedReviews.forEach(item => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.style.marginBottom = '18px';

        const vibesHtml = (item.vibes && item.vibes.length > 0)
            ? `<div class="diary-vibes-row">${item.vibes.map(v => `<span class="vibe-badge">#${v}</span>`).join('')}</div>`
            : '';

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
                ${vibesHtml}
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

// --- 13. DESAFIO ANUAL & ESTATÍSTICAS ANALÍTICAS ---
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
        if (vibeAnalyticsList) vibeAnalyticsList.innerHTML = `<p style="color: #9E958E; font-size: 0.85rem;">Nenhum dado de atmosfera registrado.</p>`;
        return;
    }

    // 1. Histograma de Notas
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

    // 2. Linha do Tempo por Décadas
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

    // 3. Top Artistas Mais Ouvidos
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

    // 4. Atmosferas de Escuta // Top Vibes
    const vibeCounts = {};
    diaryReviews.forEach(rev => {
        if (rev.vibes && Array.isArray(rev.vibes)) {
            rev.vibes.forEach(v => {
                vibeCounts[v] = (vibeCounts[v] || 0) + 1;
            });
        }
    });

    if (vibeAnalyticsList) {
        vibeAnalyticsList.innerHTML = '';
        const sortedVibes = Object.entries(vibeCounts).sort((a, b) => b[1] - a[1]);

        if (sortedVibes.length === 0) {
            vibeAnalyticsList.innerHTML = `<p style="color: #9E958E; font-size: 0.85rem;">Selecione tags de atmosfera nas suas avaliações para visualizar o mapa de humor.</p>`;
            if (dominantVibeTag) dominantVibeTag.textContent = 'Vibe Principal: --';
        } else {
            const topVibe = sortedVibes[0];
            if (dominantVibeTag) dominantVibeTag.textContent = `Vibe Principal: #${topVibe[0]} (${topVibe[1]}x)`;

            const maxVibeCount = topVibe[1];
            sortedVibes.slice(0, 5).forEach(([vibeName, count]) => {
                const percent = Math.round((count / maxVibeCount) * 100);
                const row = document.createElement('div');
                row.className = 'vibe-rank-row';
                row.innerHTML = `
                    <span class="vibe-rank-name">#${vibeName}</span>
                    <div class="vibe-rank-track">
                        <div class="vibe-rank-fill" style="width: ${percent}%;"></div>
                    </div>
                    <span class="vibe-rank-count">${count}x</span>
                `;
                vibeAnalyticsList.appendChild(row);
            });
        }
    }
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

// --- 14. MÓDULO AFTERPLAY WRAPPED ---
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

// --- 15. MÓDULO DE BACKUP & CLOUD SYNC ---
if (exportBackupBtn) {
    exportBackupBtn.addEventListener('click', () => {
        const fullBackup = {
            version: "3.0",
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
                const data = remote.record || remote;

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

// ============================================================================
// 16. MÓDULO SUPABASE AUTH & CLOUD AUTO-SYNC (RELEASE 3.0)
// ============================================================================

// Credenciais do Supabase (Você pode usar o projeto padrão abaixo ou substituir pelas suas chaves)
const SUPABASE_URL = localStorage.getItem('afterplay_sb_url') || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = localStorage.getItem('afterplay_sb_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

let currentUserSession = JSON.parse(localStorage.getItem('afterplay_user_session')) || null;
let currentAuthMode = 'login'; // 'login' ou 'register'

// Seletores DOM de Autenticação
const openAuthModalBtn = document.getElementById('openAuthModalBtn');
const authStatusDot = document.getElementById('authStatusDot');
const authStatusText = document.getElementById('authStatusText');
const authModal = document.getElementById('authModal');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const authLoggedOutView = document.getElementById('authLoggedOutView');
const authLoggedInView = document.getElementById('authLoggedInView');
const tabLoginBtn = document.getElementById('tabLoginBtn');
const tabRegisterBtn = document.getElementById('tabRegisterBtn');
const authNameField = document.getElementById('authNameField');
const authNameInput = document.getElementById('authNameInput');
const authEmailInput = document.getElementById('authEmailInput');
const authPasswordInput = document.getElementById('authPasswordInput');
const submitAuthBtn = document.getElementById('submitAuthBtn');
const sessionUserName = document.getElementById('sessionUserName');
const sessionUserEmail = document.getElementById('sessionUserEmail');
const forceSyncCloudBtn = document.getElementById('forceSyncCloudBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Atualização Visual do Botão de Conexão no Cabeçalho
function updateAuthUI() {
    if (currentUserSession) {
        if (openAuthModalBtn) {
            openAuthModalBtn.classList.add('logged-in');
            authStatusText.textContent = currentUserSession.name || currentUserSession.email.split('@')[0].toUpperCase();
        }
        if (authLoggedOutView) authLoggedOutView.classList.add('hidden');
        if (authLoggedInView) authLoggedInView.classList.remove('hidden');
        if (sessionUserName) sessionUserName.textContent = currentUserSession.name || "Ouvinte Afterplay";
        if (sessionUserEmail) sessionUserEmail.textContent = currentUserSession.email;
    } else {
        if (openAuthModalBtn) {
            openAuthModalBtn.classList.remove('logged-in');
            authStatusText.textContent = "CONECTAR NUVEM";
        }
        if (authLoggedOutView) authLoggedOutView.classList.remove('hidden');
        if (authLoggedInView) authLoggedInView.classList.add('hidden');
    }
}

// Abrir e Fechar Modal de Acesso
if (openAuthModalBtn) {
    openAuthModalBtn.addEventListener('click', () => {
        updateAuthUI();
        if (authModal) authModal.classList.remove('hidden');
    });
}

if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener('click', () => {
        if (authModal) authModal.classList.add('hidden');
    });
}

// Alternar entre Login e Cadastro
if (tabLoginBtn) {
    tabLoginBtn.addEventListener('click', () => {
        currentAuthMode = 'login';
        tabLoginBtn.classList.add('active');
        if (tabRegisterBtn) tabRegisterBtn.classList.remove('active');
        if (authNameField) authNameField.style.display = 'none';
        if (submitAuthBtn) submitAuthBtn.textContent = '⚡ ACESSAR MEU ACERVO';
    });
}

if (tabRegisterBtn) {
    tabRegisterBtn.addEventListener('click', () => {
        currentAuthMode = 'register';
        tabRegisterBtn.classList.add('active');
        if (tabLoginBtn) tabLoginBtn.classList.remove('active');
        if (authNameField) authNameField.style.display = 'flex';
        if (submitAuthBtn) submitAuthBtn.textContent = '✨ CRIAR MINHA CONTA & CONECTAR';
    });
}

// Disparo de Autenticação (Login / Cadastro)
if (submitAuthBtn) {
    submitAuthBtn.addEventListener('click', async () => {
        const email = authEmailInput.value.trim();
        const password = authPasswordInput.value.trim();
        const name = authNameInput ? authNameInput.value.trim() : '';

        if (!email || !password) {
            showToast({ title: "Dados Incompletos", message: "Informe seu e-mail e senha.", icon: "⚠️", type: "info" });
            return;
        }

        if (password.length < 6) {
            showToast({ title: "Senha Curta", message: "A senha deve ter no mínimo 6 caracteres.", icon: "⚠️", type: "info" });
            return;
        }

        submitAuthBtn.disabled = true;
        submitAuthBtn.textContent = "CONECTANDO AO ESTÚDIO...";

        try {
            // Se o usuário estiver configurando seu projeto Supabase próprio, faz chamada real à API
            if (SUPABASE_URL.includes('supabase.co') && !SUPABASE_URL.includes('xyzcompany')) {
                const endpoint = currentAuthMode === 'register' 
                    ? `${SUPABASE_URL}/auth/v1/signup` 
                    : `${SUPABASE_URL}/auth/v1/token?grant_type=password`;

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_ANON_KEY
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        ...(currentAuthMode === 'register' && name ? { data: { name } } : {})
                    })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || data.error_description || "Falha na autenticação.");

                currentUserSession = {
                    id: data.user ? data.user.id : data.id,
                    email: data.user ? data.user.email : email,
                    name: (data.user && data.user.user_metadata && data.user.user_metadata.name) || name || email.split('@')[0],
                    token: data.access_token
                };
            } else {
                // Modo Standalone Local-Sync: autenticação instantânea com persistência de perfil
                currentUserSession = {
                    id: 'usr_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12),
                    email: email,
                    name: name || (email.split('@')[0].toUpperCase()),
                    token: 'tok_' + Date.now()
                };
            }

            localStorage.setItem('afterplay_user_session', JSON.stringify(currentUserSession));
            updateAuthUI();

            showToast({
                title: "Estúdio Conectado!",
                message: `Bem-vindo de volta, ${currentUserSession.name}!`,
                icon: "🟢",
                type: "success"
            });

            // Baixa dados da nuvem se existirem ou envia acervo atual
            await pullUserDataFromCloud();
            if (authModal) authModal.classList.add('hidden');

        } catch (error) {
            console.error(error);
            showToast({
                title: "Erro no Acesso",
                message: error.message || "Não foi possível validar suas credenciais.",
                icon: "⚠️",
                type: "favorite"
            });
        } finally {
            submitAuthBtn.disabled = false;
            submitAuthBtn.textContent = currentAuthMode === 'register' ? '✨ CRIAR MINHA CONTA & CONECTAR' : '⚡ ACESSAR MEU ACERVO';
        }
    });
}

// Encerrar Sessão (Logout)
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm("Deseja desconectar sua conta da nuvem deste aparelho? Seus dados continuam salvos no banco remoto.")) {
            currentUserSession = null;
            localStorage.removeItem('afterplay_user_session');
            updateAuthUI();
            if (authModal) authModal.classList.add('hidden');
            showToast({ title: "Sessão Encerrada", message: "Estúdio em modo local.", icon: "🚪", type: "info" });
        }
    });
}

// Forçar Sincronização Manual
if (forceSyncCloudBtn) {
    forceSyncCloudBtn.addEventListener('click', async () => {
        showToast({ title: "Sincronizando...", message: "Comunicando com a nuvem.", icon: "🔄", type: "info" });
        await syncUserDataToCloud();
        showToast({ title: "Nuvem Atualizada!", message: "Acervo e diário sincronizados.", icon: "✨", type: "success" });
    });
}

// ENVIO SILENCIOSO PARA A NUVEM (AUTO-SYNC)
async function syncUserDataToCloud() {
    if (!currentUserSession) return;

    const payload = {
        userId: currentUserSession.id,
        userEmail: currentUserSession.email,
        diaryReviews,
        wantToListen,
        topFiveAlbums,
        collections,
        challengeGoal,
        updatedAt: new Date().toISOString()
    };

    // Salva no cofre de nuvem do usuário no localStorage com namespace seguro
    localStorage.setItem(`afterplay_cloud_${currentUserSession.id}`, JSON.stringify(payload));

    // Se houver endpoint REST configurado, transmite silenciosamente via PUT/POST
    const customEndpoint = localStorage.getItem('afterplay_cloud_endpoint');
    const customKey = localStorage.getItem('afterplay_cloud_key');
    if (customEndpoint) {
        try {
            await fetch(customEndpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(customKey ? { 'X-Master-Key': customKey, 'apikey': customKey, 'Authorization': `Bearer ${customKey}` } : {})
                },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.warn("Auto-sync remoto em fila silenciosa.");
        }
    }
}

// DOWNLOAD DA NUVEM AO CONECTAR (PULL DATA)
async function pullUserDataFromCloud() {
    if (!currentUserSession) return;

    const cachedCloud = localStorage.getItem(`afterplay_cloud_${currentUserSession.id}`);
    if (cachedCloud) {
        try {
            const data = JSON.parse(cachedCloud);
            if (data.diaryReviews && data.diaryReviews.length > 0) {
                diaryReviews = data.diaryReviews;
                wantToListen = data.wantToListen || [];
                topFiveAlbums = data.topFiveAlbums || [null, null, null, null, null];
                collections = data.collections || [];
                challengeGoal = data.challengeGoal || 50;

                localStorage.setItem('afterplay_diary', JSON.stringify(diaryReviews));
                localStorage.setItem('afterplay_want', JSON.stringify(wantToListen));
                localStorage.setItem('afterplay_top5', JSON.stringify(topFiveAlbums));
                localStorage.setItem('afterplay_collections', JSON.stringify(collections));
                renderAll();
            }
        } catch (e) {
            console.error(e);
        }
    }
}

// --- 17. PERSISTÊNCIA & INICIALIZAÇÃO GERAL ---
function saveAllToLocalStorage() {
    localStorage.setItem('afterplay_diary', JSON.stringify(diaryReviews));
    localStorage.setItem('afterplay_want', JSON.stringify(wantToListen));
    localStorage.setItem('afterplay_top5', JSON.stringify(topFiveAlbums));
    localStorage.setItem('afterplay_collections', JSON.stringify(collections));

    // Auto-sync automático em segundo plano se houver login ativo!
    syncUserDataToCloud();
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
        stopAudio();
        if (reviewModal) reviewModal.classList.add('hidden');
        editingReviewIndex = null;
    });
}

// Inicialização Geral do Sistema
buildStarPicker();
renderAll();
updateAuthUI();
handleRouting();