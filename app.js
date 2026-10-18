// ============================================================================
// AFTERPLAY — MOTOR COMPLETO (Sprint 8: Gerador Gráfico de Card em Canvas PNG)
// ============================================================================

// --- 1. BANCO DE DADOS LOCAL ---
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

// Estado temporário
let currentAlbumInModal = null;
let albumToAddToCollection = null;
let selectedFavTrack = "Nenhuma selecionada";
let selectedVisualScore = 5.0;
let editingReviewIndex = null;
let lastSearchResults = [];
let activeReviewForCard = null;

// Elementos da Interface
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResultsSection = document.getElementById('searchResultsSection');
const searchResultsGrid = document.getElementById('searchResultsGrid');
const searchResultsTitle = document.getElementById('searchResultsTitle');
const closeSearchBtn = document.getElementById('closeSearchBtn');

// Menu Hamburger & Drawer
const menuToggleBtn = document.getElementById('menuToggleBtn');
const sideDrawer = document.getElementById('sideDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');
const drawerLinks = document.querySelectorAll('.drawer-link');

// Views do SPA Router
const views = {
    '#/': document.getElementById('viewHome'),
    '#/diario': document.getElementById('viewHome'),
    '#/want-to-listen': document.getElementById('viewWant'),
    '#/colecoes': document.getElementById('viewCollections'),
    '#/perfil': document.getElementById('viewProfile')
};

const topFiveGrid = document.getElementById('topFiveGrid');
const diarySection = document.getElementById('diarySection');
const wantGrid = document.getElementById('wantGrid');
const collectionsGrid = document.getElementById('collectionsGrid');

const diaryCount = document.getElementById('diaryCount');
const wantCount = document.getElementById('wantCount');
const collectionsCount = document.getElementById('collectionsCount');

const diaryControls = document.getElementById('diaryControls');
const sortDiarySelect = document.getElementById('sortDiarySelect');
const filterDiaryInput = document.getElementById('filterDiaryInput');

// Estatísticas do Perfil
const statReviews = document.getElementById('statReviews');
const statWant = document.getElementById('statWant');
const statCollections = document.getElementById('statCollections');
const statAvgRating = document.getElementById('statAvgRating');

// Modal de Review
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

// Modais de Coleção
const openCreateCollectionBtn = document.getElementById('openCreateCollectionBtn');
const createCollectionModal = document.getElementById('createCollectionModal');
const closeCreateCollectionBtn = document.getElementById('closeCreateCollectionBtn');
const newCollectionNameInput = document.getElementById('newCollectionNameInput');
const newCollectionDescInput = document.getElementById('newCollectionDescInput');
const submitCreateCollectionBtn = document.getElementById('submitCreateCollectionBtn');

const addToCollectionModal = document.getElementById('addToCollectionModal');
const closeAddToCollectionBtn = document.getElementById('closeAddToCollectionBtn');
const targetAlbumNameDisplay = document.getElementById('targetAlbumNameDisplay');
const collectionChoicesList = document.getElementById('collectionChoicesList');

// Modal do Card Studio (HTML5 Canvas)
const cardStudioModal = document.getElementById('cardStudioModal');
const closeCardStudioBtn = document.getElementById('closeCardStudioBtn');
const shareCanvas = document.getElementById('shareCanvas');
const downloadCardBtn = document.getElementById('downloadCardBtn');

const toastContainer = document.getElementById('toastContainer');

// --- 0. CONTROLE DO MENU LATERAL (DRAWER) ---
function openDrawer() {
    sideDrawer.classList.add('open');
    drawerOverlay.classList.remove('hidden');
}

function closeDrawer() {
    sideDrawer.classList.remove('open');
    drawerOverlay.classList.add('hidden');
}

menuToggleBtn.addEventListener('click', openDrawer);
closeDrawerBtn.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

// --- 1. SPA ROUTER ENGINE ---
function handleRouting() {
    let hash = window.location.hash || '#/';
    if (!views[hash]) hash = '#/';

    Object.values(views).forEach(view => view.classList.add('hidden'));
    views[hash].classList.remove('hidden');

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

    closeDrawer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', handleRouting);

// --- 2. SISTEMA DE TOASTS VISUAIS ---
function showToast({ title, message, icon = '🎵', type = 'success', spin = false, duration = 3800 }) {
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

    toast.querySelector('.toast-close').addEventListener('click', closeToast);
    setTimeout(closeToast, duration);
}

// --- 3. COMUNICAÇÃO JSONP COM A API ---
function fetchFromiTunes(url) {
    return new Promise((resolve, reject) => {
        const callbackName = 'afterplay_cb_' + Math.round(100000 * Math.random());
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(data);
        };
        const script = document.createElement('script');
        script.src = `${url}&callback=${callbackName}`;
        script.onerror = () => {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('Falha na conexão JSONP'));
        };
        document.body.appendChild(script);
    });
}

// --- 4. SELETOR DE MEIA ESTRELA (0.5 a 5.0) ---
function buildStarPicker() {
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
        displayScoreText.textContent = `${selectedVisualScore.toFixed(1)} ★`;
    });
}

function previewVisualScore(score) {
    updateStarFills(score);
    displayScoreText.textContent = `${score.toFixed(1)} ★`;
}

function setVisualScore(score) {
    selectedVisualScore = parseFloat(score);
    updateStarFills(selectedVisualScore);
    displayScoreText.textContent = `${selectedVisualScore.toFixed(1)} ★`;
}

function updateStarFills(targetScore) {
    const wrappers = interactiveStarPicker.querySelectorAll('.star-wrapper');
    wrappers.forEach((wrapper, index) => {
        const starNum = index + 1;
        const fill = wrapper.querySelector('.star-fill');
        if (targetScore >= starNum) {
            fill.style.width = '100%';
        } else if (targetScore >= starNum - 0.5) {
            fill.style.width = '50%';
        } else {
            fill.style.width = '0%';
        }
    });
}

// --- 5. BUSCA DE ÁLBUNS ---
async function searchAlbums() {
    const query = searchInput.value.trim();
    if (!query) {
        showToast({ title: "Agulha fora do disco", message: "Digite um álbum ou artista para pesquisar.", icon: "🎙️", type: "info" });
        return;
    }

    searchResultsSection.classList.remove('hidden');
    searchResultsTitle.textContent = `🔎 BUSCANDO POR "${query.toUpperCase()}"...`;
    searchResultsGrid.innerHTML = `<p style="color: #9E958E;">Girando os discos na base de dados...</p>`;

    try {
        const apiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=10`;
        const data = await fetchFromiTunes(apiUrl);

        if (!data.results || data.results.length === 0) {
            searchResultsTitle.textContent = `🔎 NENHUM ÁLBUM ENCONTRADO`;
            searchResultsGrid.innerHTML = `<p style="color: #9E958E;">Nenhum disco encontrado.</p>`;
            return;
        }

        lastSearchResults = data.results;
        searchResultsTitle.textContent = `🔎 RESULTADOS PARA "${query.toUpperCase()}" (${data.results.length} ÁLBUNS)`;
        searchResultsGrid.innerHTML = '';

        data.results.forEach(album => {
            const highResCover = album.artworkUrl100.replace('100x100bb', '600x600bb');
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
    } catch (error) {
        console.error(error);
        showToast({ title: "Ruído no Sinal", message: "Erro ao consultar acervo musical.", icon: "📻", type: "favorite" });
    }
}

// --- 6. MODAL DE AVALIAÇÃO / EDIÇÃO ---
async function openAlbumModal(collectionId, editIndex = null) {
    editingReviewIndex = editIndex;
    reviewModal.classList.remove('hidden');
    modalTracklist.innerHTML = `<p style="color: #9E958E; padding: 10px;">Carregando lista de faixas do álbum...</p>`;
    calculatedAvgBadge.textContent = 'Média das Faixas: --';

    if (editingReviewIndex !== null) {
        modalModeTag.textContent = 'STUDIO LOGGING CONSOLE // RE-MIXANDO REVIEW';
        saveReviewBtn.textContent = '💾 ATUALIZAR REVIEW';
    } else {
        modalModeTag.textContent = 'STUDIO LOGGING CONSOLE // NOVA AVALIAÇÃO';
        saveReviewBtn.textContent = '💾 SALVAR AVALIAÇÃO NO DIÁRIO';
    }

    try {
        const lookupUrl = `https://itunes.apple.com/lookup?id=${collectionId}&entity=song`;
        const data = await fetchFromiTunes(lookupUrl);

        const albumInfo = data.results[0];
        const tracks = data.results.slice(1);

        const highResCover = albumInfo.artworkUrl100.replace('100x100bb', '600x600bb');
        const releaseYear = albumInfo.releaseDate ? albumInfo.releaseDate.substring(0, 4) : 'N/A';

        currentAlbumInModal = {
            id: albumInfo.collectionId,
            title: albumInfo.collectionName,
            artist: albumInfo.artistName,
            year: releaseYear,
            cover: highResCover
        };

        modalCover.src = highResCover;
        modalAlbumTitle.textContent = currentAlbumInModal.title;
        modalArtistYear.textContent = `${currentAlbumInModal.artist} • ${currentAlbumInModal.year}`;

        if (editingReviewIndex !== null) {
            const existing = diaryReviews[editingReviewIndex];
            reviewTextInput.value = existing.reviewText;
            selectedFavTrack = existing.favTrack;
            setVisualScore(existing.rating);
        } else {
            reviewTextInput.value = '';
            selectedFavTrack = 'Nenhuma selecionada';
            setVisualScore(4.0);
        }

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

    } catch (error) {
        console.error(error);
        modalTracklist.innerHTML = `<p style="color: #E11D48;">Erro ao carregar faixas.</p>`;
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
        calculatedAvgBadge.textContent = `Média das Faixas: ${avg.toFixed(1)} ★`;
        const roundedHalf = Math.round(avg * 2) / 2;
        setVisualScore(roundedHalf);
    } else {
        calculatedAvgBadge.textContent = 'Média das Faixas: --';
    }
}

saveReviewBtn.addEventListener('click', () => {
    if (!currentAlbumInModal) return;

    const reviewText = reviewTextInput.value.trim() || "Álbum registrado no Afterplay.";

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
    reviewModal.classList.add('hidden');
    editingReviewIndex = null;
});

// --- 7. TOP 5 DA VIDA ---
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

function removeTopFiveSlot(index, event) {
    event.stopPropagation();
    const removedTitle = topFiveAlbums[index] ? topFiveAlbums[index].title : "Álbum";
    topFiveAlbums[index] = null;
    saveAllToLocalStorage();
    renderTopFive();
    showToast({ title: "Vinil Guardado", message: `"${removedTitle}" retirado do Top 5.`, icon: "📦", type: "info" });
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

// --- 8. GERADOR DE CARD VISUAL EM CANVAS (STUDIO & MINIMALISTA COM TEMAS) ---
let currentCardLayout = 'studio'; // 'studio' ou 'minimal'
let currentCardTheme = 'midnight'; // 'midnight', 'tubeglow', 'deepvelvet', 'graphite'

const layoutStudioBtn = document.getElementById('layoutStudioBtn');
const layoutMinimalBtn = document.getElementById('layoutMinimalBtn');
const themeDots = document.querySelectorAll('.theme-color-dot');

function generateShareCard(index) {
    activeReviewForCard = diaryReviews[index];
    cardStudioModal.classList.remove('hidden');
    renderSelectedCard();
}

closeCardStudioBtn.addEventListener('click', () => cardStudioModal.classList.add('hidden'));

// Alternar Layout
layoutStudioBtn.addEventListener('click', () => {
    currentCardLayout = 'studio';
    layoutStudioBtn.classList.add('active');
    layoutMinimalBtn.classList.remove('active');
    renderSelectedCard();
});

layoutMinimalBtn.addEventListener('click', () => {
    currentCardLayout = 'minimal';
    layoutMinimalBtn.classList.add('active');
    layoutStudioBtn.classList.remove('active');
    renderSelectedCard();
});

// Alternar Temas
themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
        themeDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        currentCardTheme = dot.dataset.theme;
        renderSelectedCard();
    });
});

function renderSelectedCard() {
    if (!activeReviewForCard) return;
    if (currentCardLayout === 'studio') {
        drawStudioCard(activeReviewForCard, currentCardTheme);
    } else {
        drawMinimalCard(activeReviewForCard, currentCardTheme);
    }
}

// Pintura do Fundo Baseado no Tema Escolhido
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
    } else { // 'midnight' (padrão)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#1c1817');
        bgGrad.addColorStop(0.45, '#121010');
        bgGrad.addColorStop(1, '#0a0808');
        ctx.fillStyle = bgGrad;
    }
    ctx.fillRect(0, 0, width, height);

    // Moldura externa elegante
    ctx.strokeStyle = theme === 'tubeglow' ? 'rgba(245, 158, 11, 0.4)' : '#2E2826';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, width - 60, height - 60);
}

// ==========================================
// 1. DESENHO DO CARD MINIMALISTA (ESSENTIAL)
// ==========================================
function drawMinimalCard(rev, theme) {
    const ctx = shareCanvas.getContext('2d');
    const width = shareCanvas.width;   // 1080
    const height = shareCanvas.height; // 1350

    applyThemeBackground(ctx, width, height, theme);

    // Header Minimalista: Logo + Slogan
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

    // Capa do Álbum (Tamanho Maior: 560x560)
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
        ctx.moveTo(coverX + radius, coverY);
        ctx.lineTo(coverX + coverSize - radius, coverY);
        ctx.quadraticCurveTo(coverX + coverSize, coverY, coverX + coverSize, coverY + radius);
        ctx.lineTo(coverX + coverSize, coverY + coverSize - radius);
        ctx.quadraticCurveTo(coverX + coverSize, coverY + coverSize, coverX + coverSize - radius, coverY + coverSize);
        ctx.lineTo(coverX + radius, coverY + coverSize);
        ctx.quadraticCurveTo(coverX, coverY + coverSize, coverX, coverY + coverSize - radius);
        ctx.lineTo(coverX, coverY + radius);
        ctx.quadraticCurveTo(coverX, coverY, coverX + radius, coverY);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, coverX, coverY, coverSize, coverSize);
        ctx.restore();

        // Dados do Álbum e Artista
        ctx.textAlign = 'center';
        ctx.fillStyle = '#F5F2EB';
        ctx.font = '800 52px Inter, sans-serif';
        const titleText = rev.title.length > 25 ? rev.title.substring(0, 23) + '...' : rev.title;
        ctx.fillText(titleText, width / 2, 830);

        ctx.fillStyle = '#9E958E';
        ctx.font = '500 36px Inter, sans-serif';
        ctx.fillText(`${rev.artist} • ${rev.year}`, width / 2, 895);

        // Linha divisória minimalista
        ctx.strokeStyle = '#2E2826';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 140, 960);
        ctx.lineTo(width / 2 + 140, 960);
        ctx.stroke();

        // Avaliação em Super Destaque (Estrelas Grandes)
        ctx.fillStyle = '#F59E0B';
        ctx.font = '76px Inter, sans-serif';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
        ctx.shadowBlur = 25;
        const stars = getStarString(rev.rating);
        ctx.fillText(stars, width / 2, 1080);
        ctx.shadowBlur = 0; // reset

        ctx.fillStyle = '#F5F2EB';
        ctx.font = '700 42px "JetBrains Mono", monospace';
        ctx.fillText(`${rev.rating.toFixed(1)} / 5.0`, width / 2, 1160);
    };

    img.onload = renderMinimalContent;
    if (img.complete) renderMinimalContent();
}

// ==========================================
// 2. DESENHO DO CARD STUDIO EDITORIAL
// ==========================================
function drawStudioCard(rev, theme) {
    const ctx = shareCanvas.getContext('2d');
    const width = shareCanvas.width;
    const height = shareCanvas.height;

    applyThemeBackground(ctx, width, height, theme);

    // Linha de luz âmbar no topo
    const amberLine = ctx.createLinearGradient(100, 0, width - 100, 0);
    amberLine.addColorStop(0, 'rgba(245, 158, 11, 0)');
    amberLine.addColorStop(0.5, '#F59E0B');
    amberLine.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = amberLine;
    ctx.fillRect(80, 32, width - 160, 4);

    // Header
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

    // Capa do Álbum
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
        ctx.moveTo(coverX + radius, coverY);
        ctx.lineTo(coverX + coverSize - radius, coverY);
        ctx.quadraticCurveTo(coverX + coverSize, coverY, coverX + coverSize, coverY + radius);
        ctx.lineTo(coverX + coverSize, coverY + coverSize - radius);
        ctx.quadraticCurveTo(coverX + coverSize, coverY + coverSize, coverX + coverSize - radius, coverY + coverSize);
        ctx.lineTo(coverX + radius, coverY + coverSize);
        ctx.quadraticCurveTo(coverX, coverY + coverSize, coverX, coverY + coverSize - radius);
        ctx.lineTo(coverX, coverY + radius);
        ctx.quadraticCurveTo(coverX, coverY, coverX + radius, coverY);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, coverX, coverY, coverSize, coverSize);
        ctx.restore();

        // Metadados
        ctx.textAlign = 'center';
        ctx.fillStyle = '#F5F2EB';
        ctx.font = '800 48px Inter, sans-serif';
        const titleText = rev.title.length > 28 ? rev.title.substring(0, 26) + '...' : rev.title;
        ctx.fillText(titleText, width / 2, 690);

        ctx.fillStyle = '#9E958E';
        ctx.font = '500 32px Inter, sans-serif';
        ctx.fillText(`${rev.artist} • ${rev.year}`, width / 2, 745);

        // Estrelas
        ctx.fillStyle = '#F59E0B';
        ctx.font = '54px Inter, sans-serif';
        const stars = getStarString(rev.rating);
        ctx.fillText(stars, width / 2, 830);

        ctx.font = '700 28px "JetBrains Mono", monospace';
        ctx.fillText(`${rev.rating.toFixed(1)} / 5.0`, width / 2, 878);

        // Faixa Favorita
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

        // Resenha Escrita (Word Wrap)
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
            if (metrics.width > maxWidth && n > 0) {
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

        // Rodapé Editorial
        ctx.fillStyle = '#9E958E';
        ctx.font = '500 22px "JetBrains Mono", monospace';
        ctx.fillText(`LOGGED BY ERICK NAVA • ${rev.date || 'OCT 2026'}`, width / 2, 1270);
    };

    img.onload = renderStudioContent;
    if (img.complete) renderStudioContent();
}

function downloadCanvasAsImage() {
    if (!activeReviewForCard) return;

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

downloadCardBtn.addEventListener('click', downloadCanvasAsImage);
// --- 9. ADICIONAR AO WANT LIST & COLEÇÕES ---
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

// --- 10. MÓDULO DE COLEÇÕES TEMÁTICAS ---
openCreateCollectionBtn.addEventListener('click', () => {
    newCollectionNameInput.value = '';
    newCollectionDescInput.value = '';
    createCollectionModal.classList.remove('hidden');
});

closeCreateCollectionBtn.addEventListener('click', () => createCollectionModal.classList.add('hidden'));

submitCreateCollectionBtn.addEventListener('click', () => {
    const name = newCollectionNameInput.value.trim();
    const desc = newCollectionDescInput.value.trim();

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
    createCollectionModal.classList.add('hidden');

    showToast({
        title: "Pasta Temática Criada!",
        message: `A coleção "${name}" está pronta para receber discos.`,
        icon: "📁",
        type: "success"
    });
});

function deleteCollection(collectionId) {
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;

    if (confirm(`Deseja apagar a coleção "${col.name}"? Os álbuns do seu diário não serão excluídos.`)) {
        collections = collections.filter(c => c.id !== collectionId);
        saveAllToLocalStorage();
        renderCollections();
        showToast({ title: "Pasta Desmontada", message: `Coleção "${col.name}" excluída.`, icon: "🗑️", type: "info" });
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

    targetAlbumNameDisplay.textContent = `🎵 ${albumToAddToCollection.title} — ${albumToAddToCollection.artist}`;
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
                addToCollectionModal.classList.add('hidden');

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

    addToCollectionModal.classList.remove('hidden');
}

closeAddToCollectionBtn.addEventListener('click', () => addToCollectionModal.classList.add('hidden'));

modalAddCollectionBtn.addEventListener('click', () => {
    if (currentAlbumInModal) {
        openAddToCollectionModal(currentAlbumInModal.id);
    }
});

function renderCollections() {
    collectionsCount.textContent = collections.length;
    collectionsGrid.innerHTML = '';

    if (collections.length === 0) {
        collectionsGrid.innerHTML = `<p style="color: #9E958E; grid-column: 1/-1;">Nenhuma coleção criada ainda. Clique no botão "+ Nova Coleção" acima!</p>`;
        return;
    }

    collections.forEach(col => {
        const card = document.createElement('div');
        card.className = 'collection-card';

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
                <span style="font-size: 0.75rem; color: var(--text-muted);">ID: #${col.id.toString().slice(-4)}</span>
                <button class="btn-delete-collection" onclick="deleteCollection(${col.id})">🗑️ Excluir Pasta</button>
            </div>
        `;

        collectionsGrid.appendChild(card);
    });
}

// --- 11. RENDERIZAR DIÁRIO E WANT LIST ---
function getStarString(score) {
    const fullStars = Math.floor(score);
    const halfStar = (score % 1) >= 0.5 ? '½' : '';
    return '★'.repeat(fullStars) + halfStar;
}

function renderTopFive() {
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
            slotDiv.onclick = () => searchInput.focus();
            slotDiv.innerHTML = `
                <span class="slot-number">${slotNum}</span>
                <div class="empty-placeholder">+ Busque p/ Fixar</div>
            `;
        }
        topFiveGrid.appendChild(slotDiv);
    });
}

function renderDiary() {
    diaryCount.textContent = diaryReviews.length;
    diarySection.innerHTML = '';

    if (diaryReviews.length === 0) {
        diarySection.innerHTML = `<p style="color: #9E958E;">Nenhuma avaliação ainda. Busque um álbum acima para começar seu diário!</p>`;
        return;
    }

    let processedReviews = diaryReviews.map((item, originalIndex) => ({ ...item, originalIndex }));

    const searchTerm = filterDiaryInput.value.trim().toLowerCase();
    if (searchTerm) {
        processedReviews = processedReviews.filter(rev => 
            rev.title.toLowerCase().includes(searchTerm) || 
            rev.artist.toLowerCase().includes(searchTerm) ||
            rev.reviewText.toLowerCase().includes(searchTerm)
        );
    }

    const sortType = sortDiarySelect.value;
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
    wantCount.textContent = wantToListen.length;
    wantGrid.innerHTML = '';

    if (wantToListen.length === 0) {
        wantGrid.innerHTML = `<p style="color: #9E958E; grid-column: 1/-1;">Sua fila Want to Listen está vazia. Clique no ícone 🕒 nos resultados da busca!</p>`;
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

// --- 12. DESAFIO ANUAL DE AUDIÇÃO & PERFIL ---
let challengeGoal = parseInt(localStorage.getItem('afterplay_challenge_goal')) || 50;

const editGoalBtn = document.getElementById('editGoalBtn');
const challengeHeadline = document.getElementById('challengeHeadline');
const progressBarFill = document.getElementById('progressBarFill');
const challengePercentText = document.getElementById('challengePercentText');
const challengeRemainingText = document.getElementById('challengeRemainingText');
const challengePaceBadge = document.getElementById('challengePaceBadge');

function renderListeningChallenge() {
    const currentYear = new Date().getFullYear();
    
    // Conta quantos álbuns do diário foram ouvidos em 2026 (ou no ano atual)
    const completedCount = diaryReviews.length; // Cada review conta como 1 álbum escutado

    const percent = Math.min(100, Math.round((completedCount / challengeGoal) * 100));
    
    challengeHeadline.textContent = `Meta de Audição: ${completedCount} de ${challengeGoal} álbuns em ${currentYear}`;
    progressBarFill.style.width = `${percent}%`;
    challengePercentText.textContent = `${percent}% concluído`;

    const remaining = Math.max(0, challengeGoal - completedCount);
    if (remaining === 0) {
        challengeRemainingText.textContent = `🎉 Desafio concluído! Você zerou sua meta musical de ${currentYear}!`;
    } else {
        challengeRemainingText.textContent = `Faltam ${remaining} ${remaining === 1 ? 'álbum' : 'álbuns'} para alcançar sua meta`;
    }

    // Cálculo de Ritmo (Pace Tracker)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    const totalDaysInYear = 365;
    const expectedCountByNow = Math.round((dayOfYear / totalDaysInYear) * challengeGoal);

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

// Botão para Ajustar a Meta Anual
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

function renderProfileStats() {
    statReviews.textContent = diaryReviews.length;
    statWant.textContent = wantToListen.length;
    statCollections.textContent = collections.length;

    if (diaryReviews.length > 0) {
        const sum = diaryReviews.reduce((acc, curr) => acc + curr.rating, 0);
        const avg = (sum / diaryReviews.length).toFixed(1);
        statAvgRating.textContent = `${avg} ★`;
    } else {
        statAvgRating.textContent = `0.0 ★`;
    }

    renderListeningChallenge();
}

function saveAllToLocalStorage() {
    localStorage.setItem('afterplay_diary', JSON.stringify(diaryReviews));
    localStorage.setItem('afterplay_want', JSON.stringify(wantToListen));
    localStorage.setItem('afterplay_top5', JSON.stringify(topFiveAlbums));
    localStorage.setItem('afterplay_collections', JSON.stringify(collections));
}

function renderAll() {
    renderTopFive();
    renderDiary();
    renderWantList();
    renderCollections();
    renderProfileStats();
}

// Listeners gerais
sortDiarySelect.addEventListener('change', renderDiary);
filterDiaryInput.addEventListener('input', renderDiary);

closeModalBtn.addEventListener('click', () => {
    reviewModal.classList.add('hidden');
    editingReviewIndex = null;
});
searchBtn.addEventListener('click', searchAlbums);
searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') searchAlbums(); });
closeSearchBtn.addEventListener('click', () => searchResultsSection.classList.add('hidden'));

// Inicialização
buildStarPicker();
renderAll();
handleRouting();