// ============================================================================
// MÓDULO DE PORTFÓLIO & CATÁLOGO MULTIMÍDIA MODERNO (REATORADO & TECNOLÓGICO)
// DK Revestimentos - Ateliê de Marcenaria Fina & Revestimentos Arquitetônicos
// ============================================================================
// Recursos:
// 1. Site Público: Totalmente limpo, responsivo, sem opções administrativas.
//    - Cards com visual minimalista (apenas mídia + título elegante).
//    - Play instantâneo de vídeo diretamente no card com 1 clique (sem abrir modais).
// 2. Painel Administrativo: Gestão completa e centralizada (criação e edição NADA fora dele).
//    - Adição por Link inteligente (Google Drive, YouTube, Shorts, Vimeo, Web) ou Upload do Aparelho.
//    - Detecção automática de plataforma e proporção (📱 Vertical / 🖥️ Horizontal).
// ============================================================================

let currentPortfolioFilter = 'all';
let currentAdminPortfolioFilter = 'all';
let currentAdminSearchTerm = '';
let currentlyPlayingVideoId = null;

let editorCurrentMode = 'create'; // 'create' | 'edit'
let editorSelectedFile = null;
let editorGeneratedPoster = null;

// ----------------------------------------------------------------------------
// 1. IDENTIFICADORES INTELIGENTES DE VÍDEO (GOOGLE DRIVE, YOUTUBE, VIMEO)
// ----------------------------------------------------------------------------

function extractGoogleDriveId(url) {
  if (!url) return null;
  url = url.trim();
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
                url.match(/^([a-zA-Z0-9_-]{25,})$/);
  return match ? (match[1] || match[0]) : null;
}

function extractYouTubeId(url) {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return (match && match[1]) ? match[1] : null;
}

function extractVimeoId(url) {
  if (!url) return null;
  const regExp = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+)\/video\/|video\/|))(\d+)/i;
  const match = url.match(regExp);
  return (match && match[1]) ? match[1] : null;
}

function parseVideoSource(url) {
  if (!url) return { type: 'unknown', id: null, embedUrl: null, posterUrl: null, originalUrl: '' };
  url = url.trim();

  // 1. Google Drive
  const driveId = extractGoogleDriveId(url);
  if (driveId && (url.includes('drive.google.com') || url.includes('docs.google.com') || url.length >= 28)) {
    return {
      type: 'gdrive',
      id: driveId,
      embedUrl: 'https://drive.google.com/file/d/' + driveId + '/preview',
      posterUrl: null,
      originalUrl: url
    };
  }

  // 2. YouTube & YouTube Shorts
  const ytId = extractYouTubeId(url);
  if (ytId) {
    const isShorts = url.toLowerCase().includes('/shorts/');
    return {
      type: 'youtube',
      id: ytId,
      embedUrl: 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0&modestbranding=1',
      posterUrl: 'https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg',
      isShorts: isShorts,
      originalUrl: url
    };
  }

  // 3. Vimeo
  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return {
      type: 'vimeo',
      id: vimeoId,
      embedUrl: 'https://player.vimeo.com/video/' + vimeoId + '?autoplay=1&color=8a4f26',
      posterUrl: null,
      originalUrl: url
    };
  }

  // 4. Arquivo Direto MP4/WebM ou Blob local
  if (url.startsWith('data:video') || url.startsWith('blob:') || url.match(/\.(mp4|mov|webm|m4v)($|\?)/i)) {
    return {
      type: 'direct',
      id: null,
      embedUrl: url,
      posterUrl: null,
      originalUrl: url
    };
  }

  return { type: 'unknown', id: null, embedUrl: url, posterUrl: null, originalUrl: url };
}

function isVideoMedia(item) {
  if (!item) return false;
  if (item.tipoMidia === 'video' || item.tipo_midia === 'video') return true;
  const url = (item.midiaUrl || item.midia_url || '').toLowerCase();
  if (!url) return false;
  return (
    url.startsWith('data:video') || 
    url.startsWith('blob:') ||
    url.endsWith('.mp4') || 
    url.endsWith('.mov') || 
    url.endsWith('.webm') || 
    url.includes('/video/') ||
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    url.includes('drive.google.com')
  );
}

// ----------------------------------------------------------------------------
// 2. RECUPERAÇÃO DO ESTADO DE PROJETOS
// ----------------------------------------------------------------------------

function getAllPortfolioProjects() {
  if (typeof db !== 'undefined' && db.portfolio && Array.isArray(db.portfolio) && db.portfolio.length > 0) {
    return db.portfolio;
  }
  try {
    const cached = localStorage.getItem('marcenaria_portfolio');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof db !== 'undefined') db.portfolio = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  if (typeof DEFAULT_REAL_PORTFOLIO !== 'undefined' && Array.isArray(DEFAULT_REAL_PORTFOLIO)) {
    if (typeof db !== 'undefined') db.portfolio = [...DEFAULT_REAL_PORTFOLIO];
    return DEFAULT_REAL_PORTFOLIO;
  }
  return [];
}

// ----------------------------------------------------------------------------
// 3. CATÁLOGO PÚBLICO (SIMPLES, TECNOLÓGICO, RESPONSIVO, SEM NADA DE ADMIN)
// ----------------------------------------------------------------------------

function setPortfolioFormatFilter(filterType, btnEl) {
  currentPortfolioFilter = filterType;
  if (btnEl && btnEl.parentElement) {
    btnEl.parentElement.querySelectorAll('.portfolio-format-btn').forEach(btn => btn.classList.remove('active'));
    btnEl.classList.add('active');
  }
  renderPublicCatalog();
}

function renderPublicCatalog() {
  const container = document.getElementById('portfolioCatalog');
  if (!container) return;
  container.innerHTML = '';

  const allProjects = getAllPortfolioProjects();

  // Contadores
  const totalCount = allProjects.length;
  const videoCount = allProjects.filter(p => isVideoMedia(p)).length;
  const photoCount = totalCount - videoCount;

  // Barra de filtros do site público
  let formatBar = document.getElementById('portfolioFormatBar');
  if (!formatBar) {
    formatBar = document.createElement('div');
    formatBar.id = 'portfolioFormatBar';
    formatBar.className = 'portfolio-format-bar-container';
    container.parentNode.insertBefore(formatBar, container);
  }

  formatBar.innerHTML = `
    <div class="portfolio-format-bar">
      <button type="button" class="portfolio-format-btn ${currentPortfolioFilter === 'all' ? 'active' : ''}" onclick="setPortfolioFormatFilter('all', this)">
        <span>✨ Todos</span>
        <span class="count-pill">${totalCount}</span>
      </button>
      <button type="button" class="portfolio-format-btn ${currentPortfolioFilter === 'video' ? 'active' : ''}" onclick="setPortfolioFormatFilter('video', this)">
        <span>🎥 Vídeos & Tours</span>
        <span class="count-pill">${videoCount}</span>
      </button>
      <button type="button" class="portfolio-format-btn ${currentPortfolioFilter === 'foto' ? 'active' : ''}" onclick="setPortfolioFormatFilter('foto', this)">
        <span>📷 Fotografias</span>
        <span class="count-pill">${photoCount}</span>
      </button>
    </div>
  `;

  // Aplicação do filtro selecionado
  let filteredProjects = allProjects;
  if (currentPortfolioFilter === 'video') {
    filteredProjects = allProjects.filter(p => isVideoMedia(p));
  } else if (currentPortfolioFilter === 'foto') {
    filteredProjects = allProjects.filter(p => !isVideoMedia(p));
  }

  if (filteredProjects.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 60px 24px; background: #ffffff; border: 1px solid var(--border-soft); border-radius: var(--radius); box-shadow: var(--shadow-subtle);">
        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Nenhum projeto encontrado nesta categoria</h3>
        <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 16px;">Selecione outra opção acima para visualizar as mídias da marcenaria.</p>
        <button type="button" class="btn btn-outline btn-sm" onclick="setPortfolioFormatFilter('all')">Ver Todos os Trabalhos</button>
      </div>
    `;
    return;
  }

  // Renderiza cada card: APENAS MÍDIA + TÍTULO DO PROJETO (NADA DE EDIÇÃO OU BOTÕES FORA DO ADMIN)
  filteredProjects.forEach(item => {
    const isVideo = isVideoMedia(item);
    const isVertical = item.proporcao === 'vertical';
    const card = document.createElement('div');
    card.className = `project-card ${isVertical ? 'card-proporcao-vertical' : 'card-proporcao-horizontal'} ${isVideo ? 'card-tipo-video' : 'card-tipo-foto'}`;
    card.setAttribute('data-project-id', item.id);

    let mediaTag = '';
    let badgeText = '';

    if (isVideo) {
      const vSource = parseVideoSource(item.midiaUrl);
      const posterImg = item.posterUrl || vSource.posterUrl || '';

      if (vSource.type === 'gdrive') {
        badgeText = isVertical ? '📁 REELS' : '📁 VÍDEO';
      } else if (vSource.type === 'youtube' && vSource.isShorts) {
        badgeText = '▶ SHORTS';
      } else if (vSource.type === 'youtube') {
        badgeText = '▶ VÍDEO';
      } else {
        badgeText = isVertical ? '▶ REELS' : '▶ TOUR HD';
      }

      mediaTag = `
        <div class="project-media-wrapper-aspect ${isVertical ? 'aspect-vertical-9-16' : 'aspect-horizontal-16-11'}" id="mediaSlot_${item.id}">
          ${posterImg ? `
            <img src="${posterImg}" alt="${item.titulo}" class="project-media" loading="lazy">
          ` : `
            <div style="width:100%; height:100%; background:#090a0f; display:flex; align-items:center; justify-content:center; color:#fff; font-size:32px;">🎥</div>
          `}
          <div class="video-play-indicator">
            <div class="video-play-btn" title="Assistir Vídeo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
            <span class="video-play-label">Assistir Vídeo</span>
          </div>
          <span class="project-media-type-badge">${badgeText}</span>
        </div>
      `;

      card.innerHTML = `
        <div class="project-media-wrap" onclick="togglePlayInlineVideo('${item.id}', this)" style="cursor: pointer;" title="Clique para reproduzir o vídeo no card">
          ${mediaTag}
        </div>
        <div class="project-info project-card-minimal-footer">
          <h3 class="project-title" onclick="togglePlayInlineVideo('${item.id}', this)" style="cursor: pointer;" title="Clique para reproduzir">${item.titulo}</h3>
        </div>
      `;
    } else {
      const badgeFormat = isVertical ? '📱 VERTICAL' : '🖥️ PANORÂMICA';
      const imgSrc = (item.midiaUrl && item.midiaUrl.endsWith('.pdf')) ? (item.posterUrl || 'assets/portfolio/pdf_page1.jpg') : item.midiaUrl;
      
      mediaTag = `
        <div class="project-media-wrapper-aspect ${isVertical ? 'aspect-vertical-9-16' : 'aspect-horizontal-16-11'}">
          <img src="${imgSrc}" alt="${item.titulo}" class="project-media" loading="lazy">
          <span class="project-media-type-badge badge-photo-subtle">${badgeFormat}</span>
        </div>
      `;

      card.innerHTML = `
        <div class="project-media-wrap" onclick="openProjectDetails('${item.id}')" style="cursor: pointer;" title="Clique para ampliar fotografia">
          ${mediaTag}
        </div>
        <div class="project-info project-card-minimal-footer">
          <h3 class="project-title" onclick="openProjectDetails('${item.id}')" style="cursor: pointer;" title="Ampliar imagem">${item.titulo}</h3>
        </div>
      `;
    }

    container.appendChild(card);
  });
}

// ----------------------------------------------------------------------------
// 4. REPRODUÇÃO INTELIGENTE DE VÍDEO DIRETO NO CARD (1 CLIQUE)
// ----------------------------------------------------------------------------

function togglePlayInlineVideo(projectId, triggerEl) {
  const allProjects = getAllPortfolioProjects();
  const project = allProjects.find(p => String(p.id) === String(projectId));
  if (!project || !isVideoMedia(project)) return;

  const card = triggerEl ? triggerEl.closest('.project-card') : document.querySelector(`.project-card[data-project-id="${projectId}"]`);
  const slot = document.getElementById(`mediaSlot_${projectId}`);
  if (!slot || !card) return;

  // Se já está reproduzindo este mesmo vídeo, para e volta ao poster
  if (currentlyPlayingVideoId === projectId && card.classList.contains('is-playing-inline')) {
    stopInlineVideo(projectId);
    return;
  }

  // Para qualquer outro vídeo que esteja tocando no momento
  if (currentlyPlayingVideoId && currentlyPlayingVideoId !== projectId) {
    stopInlineVideo(currentlyPlayingVideoId);
  }

  currentlyPlayingVideoId = projectId;
  card.classList.add('is-playing-inline');

  const vSource = parseVideoSource(project.midiaUrl);
  const isVertical = project.proporcao === 'vertical';
  const gdriveId = project.gdriveId || extractGoogleDriveId(project.midiaUrl);

  let playerHtml = '';

  // 1. Arquivo direto MP4 / WebM / Local (Máxima qualidade nativa)
  if (vSource.type === 'direct' || (project.midiaUrl && project.midiaUrl.endsWith('.mp4'))) {
    const fallbackEmbed = gdriveId ? `https://drive.google.com/file/d/${gdriveId}/preview` : '';
    playerHtml = `
      <div style="position: relative; width: 100%; height: 100%; background: #000; display: flex; align-items: center; justify-content: center;">
        <video src="${project.midiaUrl}" 
               ${project.posterUrl ? `poster="${project.posterUrl}"` : ''} 
               controls autoplay playsinline 
               style="width: 100%; height: 100%; object-fit: contain; background: #000;"
               onerror="if ('${fallbackEmbed}') { this.parentElement.innerHTML = '<iframe src=\\'${fallbackEmbed}\\' style=\\'position:absolute;top:0;left:0;width:100%;height:100%;border:0;\\' allow=\\'autoplay; encrypted-media; fullscreen\\' allowfullscreen></iframe>'; }">
        </video>
        <button type="button" class="btn-stop-inline-video" onclick="event.stopPropagation(); stopInlineVideo('${projectId}')" title="Fechar reprodução">&times;</button>
      </div>
    `;
  }
  // 2. Google Drive Player
  else if (vSource.type === 'gdrive' || gdriveId) {
    const embedUrl = vSource.embedUrl || `https://drive.google.com/file/d/${gdriveId}/preview`;
    playerHtml = `
      <div style="position: relative; width: 100%; height: 100%; background: #000;">
        <iframe src="${embedUrl}" 
                style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" 
                allow="autoplay; encrypted-media; fullscreen" 
                allowfullscreen>
        </iframe>
        <button type="button" class="btn-stop-inline-video" onclick="event.stopPropagation(); stopInlineVideo('${projectId}')" title="Fechar reprodução">&times;</button>
      </div>
    `;
  }
  // 3. YouTube Player
  else if (vSource.type === 'youtube') {
    playerHtml = `
      <div style="position: relative; width: 100%; height: 100%; background: #000;">
        <iframe src="${vSource.embedUrl}" 
                style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
        </iframe>
        <button type="button" class="btn-stop-inline-video" onclick="event.stopPropagation(); stopInlineVideo('${projectId}')" title="Fechar reprodução">&times;</button>
      </div>
    `;
  }
  // 4. Vimeo Player
  else if (vSource.type === 'vimeo') {
    playerHtml = `
      <div style="position: relative; width: 100%; height: 100%; background: #000;">
        <iframe src="${vSource.embedUrl}" 
                style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen>
        </iframe>
        <button type="button" class="btn-stop-inline-video" onclick="event.stopPropagation(); stopInlineVideo('${projectId}')" title="Fechar reprodução">&times;</button>
      </div>
    `;
  }

  slot.innerHTML = playerHtml;
}

function stopInlineVideo(projectId) {
  const card = document.querySelector(`.project-card[data-project-id="${projectId}"]`);
  const slot = document.getElementById(`mediaSlot_${projectId}`);
  if (!card || !slot) return;

  card.classList.remove('is-playing-inline');
  if (currentlyPlayingVideoId === projectId) {
    currentlyPlayingVideoId = null;
  }

  const allProjects = getAllPortfolioProjects();
  const project = allProjects.find(p => String(p.id) === String(projectId));
  if (!project) return;

  const vSource = parseVideoSource(project.midiaUrl);
  const posterImg = project.posterUrl || vSource.posterUrl || '';
  const isVertical = project.proporcao === 'vertical';

  let badgeText = isVertical ? '▶ REELS' : '▶ TOUR HD';
  if (vSource.type === 'gdrive') badgeText = isVertical ? '📁 REELS' : '📁 VÍDEO';
  if (vSource.type === 'youtube') badgeText = vSource.isShorts ? '▶ SHORTS' : '▶ VÍDEO';

  slot.innerHTML = `
    ${posterImg ? `
      <img src="${posterImg}" alt="${project.titulo}" class="project-media" loading="lazy">
    ` : `
      <div style="width:100%; height:100%; background:#090a0f; display:flex; align-items:center; justify-content:center; color:#fff; font-size:32px;">🎥</div>
    `}
    <div class="video-play-indicator">
      <div class="video-play-btn" title="Assistir Vídeo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      </div>
      <span class="video-play-label">Assistir Vídeo</span>
    </div>
    <span class="project-media-type-badge">${badgeText}</span>
  `;
}

// ----------------------------------------------------------------------------
// 5. INSPEÇÃO DE FOTOGRAFIA (MODAL LIGHTBOX SUAVE)
// ----------------------------------------------------------------------------

function openProjectDetails(projectId) {
  const allProjects = getAllPortfolioProjects();
  const project = allProjects.find(p => String(p.id) === String(projectId));
  if (!project) return;

  const modal = document.getElementById('projectDetailModal');
  if (!modal) return;

  const titleEl = document.getElementById('projectModalTitle');
  const mediaContainer = document.getElementById('projectModalMediaContainer');
  const locationEl = document.getElementById('projectModalLocation');
  const descEl = document.getElementById('projectModalDesc');

  if (titleEl) titleEl.textContent = project.titulo;
  if (locationEl) locationEl.textContent = project.categoria || 'Marcenaria Sob Medida';
  if (descEl) descEl.textContent = project.descricao || '';

  const isVertical = project.proporcao === 'vertical';
  const modalCard = modal.querySelector('.modal-content');
  if (modalCard) {
    if (isVertical) modalCard.classList.add('is-vertical-card');
    else modalCard.classList.remove('is-vertical-card');
  }

  if (mediaContainer) {
    const isPdf = project.midiaUrl && project.midiaUrl.endsWith('.pdf');
    if (isPdf) {
      mediaContainer.innerHTML = `
        <div class="project-modal-stage stage-vertical" style="position: relative;">
          <img src="${project.posterUrl || 'assets/portfolio/pdf_page1.jpg'}" alt="${project.titulo}">
          <a href="${project.midiaUrl}" target="_blank" class="btn btn-primary btn-sm" style="position: absolute; bottom: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.5);">
            📄 Abrir Caderno Técnico PDF
          </a>
        </div>
      `;
    } else {
      mediaContainer.innerHTML = `
        <div class="project-modal-stage ${isVertical ? 'stage-vertical' : 'stage-horizontal'}">
          <img src="${project.midiaUrl}" alt="${project.titulo}">
        </div>
      `;
    }
  }

  openModal('projectDetailModal');
}

// ----------------------------------------------------------------------------
// 6. GESTÃO COMPLETA NO PAINEL ADMINISTRATIVO (CRIAÇÃO & EDIÇÃO NADA FORA DELE)
// ----------------------------------------------------------------------------

function setAdminPortfolioFilter(type, btn) {
  currentAdminPortfolioFilter = type;
  if (btn && btn.parentElement) {
    btn.parentElement.querySelectorAll('.admin-pfilter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderAdminPortfolio();
}

function handleAdminPortfolioSearch(text) {
  currentAdminSearchTerm = (text || '').toLowerCase().trim();
  renderAdminPortfolio();
}

function renderAdminPortfolio(portfolio) {
  const container = document.getElementById('adminPortfolioList');
  if (!container) return;
  container.innerHTML = '';

  const all = (portfolio && portfolio.length > 0) ? portfolio : getAllPortfolioProjects();

  // Atualiza badge de contagem
  const countBadge = document.getElementById('adminMediaCountBadge');
  if (countBadge) {
    const vids = all.filter(p => isVideoMedia(p)).length;
    countBadge.textContent = `${all.length} projetos (${vids} vídeos, ${all.length - vids} fotos)`;
  }

  // Filtragem administrativa
  let filtered = all;
  if (currentAdminPortfolioFilter === 'video') {
    filtered = all.filter(p => isVideoMedia(p));
  } else if (currentAdminPortfolioFilter === 'foto') {
    filtered = all.filter(p => !isVideoMedia(p));
  }

  if (currentAdminSearchTerm) {
    filtered = filtered.filter(p => 
      (p.titulo || '').toLowerCase().includes(currentAdminSearchTerm) ||
      (p.categoria || '').toLowerCase().includes(currentAdminSearchTerm)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; color: var(--text-muted); background: #ffffff; border-radius: var(--radius); border: 1px dashed var(--border-soft);">
        <div style="font-size: 32px; margin-bottom: 8px;">📂</div>
        <p style="font-weight: 700; color: #0f172a; margin-bottom: 4px; font-size: 15px;">Nenhuma mídia encontrada no filtro.</p>
        <p style="font-size: 13px; max-width: 440px; margin: 0 auto 16px auto;">Adicione novos vídeos ou fotos através de link ou upload direto.</p>
        <button type="button" class="btn btn-primary btn-sm" onclick="openPortfolioEditorModal()">➕ Adicionar Nova Mídia</button>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const isVideo = isVideoMedia(item);
    const isVertical = item.proporcao === 'vertical';
    const row = document.createElement('div');
    row.className = 'admin-media-card';

    let originLabel = 'Arquivo Local / Direto';
    let originClass = 'badge-neutral';
    const urlLower = (item.midiaUrl || '').toLowerCase();

    if (item.gdriveId || urlLower.includes('drive.google.com')) {
      originLabel = 'Google Drive';
      originClass = 'badge-primary';
    } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      originLabel = urlLower.includes('/shorts/') ? 'YouTube Shorts' : 'YouTube';
      originClass = 'badge-danger';
    } else if (urlLower.includes('vimeo.com')) {
      originLabel = 'Vimeo';
      originClass = 'badge-warning';
    } else if (urlLower.startsWith('data:') || urlLower.startsWith('blob:')) {
      originLabel = 'Upload Local (Base64)';
      originClass = 'badge-success';
    }

    const posterThumb = item.posterUrl || (isVideo ? parseVideoSource(item.midiaUrl).posterUrl : item.midiaUrl) || '';

    row.innerHTML = `
      <div style="width: 60px; height: 75px; border-radius: 8px; background: #0b0c10; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
        ${posterThumb ? `
          <img src="${posterThumb}" style="width:100%; height:100%; object-fit: cover;">
        ` : `
          <div style="color: #fff; font-size: 22px;">${isVideo ? '🎥' : '📷'}</div>
        `}
        ${isVideo ? `<div style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.75); color: #fff; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px;">▶</div>` : ''}
      </div>

      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 700; font-size: 15px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${item.titulo}
        </div>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
          <span class="badge ${originClass}" style="font-size: 11px;">${originLabel}</span>
          <span class="badge badge-neutral" style="font-size: 11px;">${isVideo ? '🎥 Vídeo' : '📷 Foto'} • ${isVertical ? '📱 Vertical' : '🖥️ Horizontal'}</span>
          <span class="badge badge-neutral" style="font-size: 11px;">${item.categoria || 'Geral'}</span>
        </div>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
        <button type="button" class="btn btn-outline btn-sm" onclick="openPortfolioEditorModal('${item.id}')" title="Editar este projeto" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
          <span>✏️ Editar</span>
        </button>
        <button type="button" class="btn btn-danger btn-sm" onclick="deletePortfolioItem('${item.id}')" title="Excluir projeto" style="display: inline-flex; align-items: center; gap: 4px;">
          <span>🗑️ Excluir</span>
        </button>
      </div>
    `;

    container.appendChild(row);
  });
}

// ----------------------------------------------------------------------------
// 7. MODAL UNIFICADO DE CRIAÇÃO E EDIÇÃO (CENTRALIZADO NO ADMIN)
// ----------------------------------------------------------------------------

function openPortfolioEditorModal(projectId = null) {
  if (typeof isUserAdmin === 'function' && !isUserAdmin()) {
    showToast('Apenas administradores autenticados podem gerenciar o portfólio.', 'warning');
    if (typeof openModal === 'function') openModal('loginModal');
    return;
  }

  const modal = document.getElementById('portfolioEditorModal');
  if (!modal) return;

  const form = document.getElementById('portfolioEditorForm');
  if (form) form.reset();

  editorSelectedFile = null;
  editorGeneratedPoster = null;

  const idInput = document.getElementById('editorProjectId');
  const titleInput = document.getElementById('editorProjectTitulo');
  const catInput = document.getElementById('editorProjectCategoria');
  const propVertical = document.getElementById('editorPropVertical');
  const propHorizontal = document.getElementById('editorPropHorizontal');
  const urlInput = document.getElementById('editorMidiaUrl');
  const posterInput = document.getElementById('editorPosterUrl');
  const modalTitle = document.getElementById('editorModalTitle');
  const modalSub = document.getElementById('editorModalSub');
  const submitBtn = document.getElementById('btnSubmitPortfolioEditor');
  const fileInfo = document.getElementById('editorFileSelectedInfo');

  if (fileInfo) fileInfo.style.display = 'none';

  if (projectId) {
    // MODO EDIÇÃO
    editorCurrentMode = 'edit';
    const all = getAllPortfolioProjects();
    const item = all.find(p => String(p.id) === String(projectId));
    if (!item) {
      showToast('Projeto não encontrado para edição.', 'danger');
      return;
    }

    if (idInput) idInput.value = item.id;
    if (titleInput) titleInput.value = item.titulo || '';
    if (catInput) catInput.value = item.categoria || 'Marcenaria Sob Medida';
    if (item.proporcao === 'horizontal') {
      if (propHorizontal) propHorizontal.checked = true;
    } else {
      if (propVertical) propVertical.checked = true;
    }
    if (urlInput) urlInput.value = item.midiaUrl || '';
    if (posterInput) posterInput.value = item.posterUrl || '';

    if (modalTitle) modalTitle.textContent = 'Editar Informações da Mídia';
    if (modalSub) modalSub.textContent = `ID #${item.id} • ${item.categoria}`;
    if (submitBtn) submitBtn.textContent = 'Salvar Alterações';

    switchEditorSourceTab('link');
    handleEditorUrlInput(item.midiaUrl || '');
  } else {
    // MODO CRIAÇÃO
    editorCurrentMode = 'create';
    if (idInput) idInput.value = '';
    if (modalTitle) modalTitle.textContent = 'Adicionar Nova Mídia ao Catálogo';
    if (modalSub) modalSub.textContent = 'Publicação de Vídeo ou Fotografia';
    if (submitBtn) submitBtn.textContent = 'Publicar no Catálogo';

    switchEditorSourceTab('link');
    updateEditorLivePreview();
  }

  openModal('portfolioEditorModal');
}

function switchEditorSourceTab(tab) {
  const tabLink = document.getElementById('tabSourceLink');
  const tabUpload = document.getElementById('tabSourceUpload');
  const panelLink = document.getElementById('panelSourceLink');
  const panelUpload = document.getElementById('panelSourceUpload');

  if (tab === 'link') {
    if (tabLink) tabLink.classList.add('active');
    if (tabUpload) tabUpload.classList.remove('active');
    if (panelLink) panelLink.style.display = 'block';
    if (panelUpload) panelUpload.style.display = 'none';
  } else {
    if (tabLink) tabLink.classList.remove('active');
    if (tabUpload) tabUpload.classList.add('active');
    if (panelLink) panelLink.style.display = 'none';
    if (panelUpload) panelUpload.style.display = 'block';
  }
}

function updateEditorProportion(val) {
  updateEditorLivePreview();
}

function handleEditorUrlInput(url) {
  const badge = document.getElementById('editorUrlDetectionBadge');
  if (!badge) return;

  if (!url || !url.trim()) {
    badge.style.display = 'none';
    updateEditorLivePreview();
    return;
  }

  const vSource = parseVideoSource(url);
  badge.style.display = 'block';

  if (vSource.type === 'gdrive') {
    badge.style.background = '#e0f2fe';
    badge.style.color = '#0369a1';
    badge.innerHTML = `<strong>✓ Google Drive Detectado:</strong> ID extraído (<code>${vSource.id}</code>). Transmissão automática configurada.`;
  } else if (vSource.type === 'youtube') {
    badge.style.background = '#fef2f2';
    badge.style.color = '#b91c1c';
    badge.innerHTML = `<strong>✓ YouTube Detectado:</strong> ID (<code>${vSource.id}</code>)${vSource.isShorts ? ' • Formato Shorts' : ''}`;
    if (vSource.isShorts) {
      const propV = document.getElementById('editorPropVertical');
      if (propV) propV.checked = true;
    }
  } else if (vSource.type === 'vimeo') {
    badge.style.background = '#f0fdf4';
    badge.style.color = '#15803d';
    badge.innerHTML = `<strong>✓ Vimeo Detectado:</strong> ID (<code>${vSource.id}</code>)`;
  } else if (vSource.type === 'direct') {
    badge.style.background = '#f0fdf4';
    badge.style.color = '#15803d';
    badge.innerHTML = `<strong>✓ Vídeo Direto (MP4/WebM):</strong> Reprodução de alta performance`;
  } else {
    badge.style.background = '#f8fafc';
    badge.style.color = '#475569';
    badge.innerHTML = `<strong>✓ Link Direto:</strong> Imagem ou mídia externa`;
  }

  updateEditorLivePreview();
}

function handleEditorFileSelect(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  editorSelectedFile = file;

  const fileInfo = document.getElementById('editorFileSelectedInfo');
  if (fileInfo) {
    fileInfo.style.display = 'block';
    fileInfo.textContent = `Arquivo selecionado: ${file.name} (${(file.size / (1024*1024)).toFixed(2)} MB)`;
  }

  const isVideo = file.type.startsWith('video');

  // Leitura do arquivo para DataURL
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const urlInput = document.getElementById('editorMidiaUrl');
    if (urlInput) urlInput.value = dataUrl;

    if (isVideo) {
      // Extração automática de poster para vídeo local
      extractVideoFrame(file).then(thumb => {
        if (thumb) {
          editorGeneratedPoster = thumb;
          const posterInput = document.getElementById('editorPosterUrl');
          if (posterInput && !posterInput.value) {
            posterInput.value = thumb;
          }
        }
        updateEditorLivePreview();
      });
    } else {
      updateEditorLivePreview();
    }
  };
  reader.readAsDataURL(file);
}

function handleEditorPosterFileSelect(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const posterInput = document.getElementById('editorPosterUrl');
    if (posterInput) posterInput.value = e.target.result;
    updateEditorLivePreview();
  };
  reader.readAsDataURL(file);
}

function extractVideoFrame(file) {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = Math.min(0.5, video.duration / 2);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } catch (e) {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };

      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(null);
      }, 3500);
    } catch (e) {
      resolve(null);
    }
  });
}

function updateEditorLivePreview() {
  const container = document.getElementById('editorLivePreviewContainer');
  const slot = document.getElementById('editorLivePreviewSlot');
  const typeTag = document.getElementById('editorPreviewTypeTag');
  const urlInput = document.getElementById('editorMidiaUrl');
  const posterInput = document.getElementById('editorPosterUrl');
  const propVertical = document.getElementById('editorPropVertical');

  if (!container || !slot) return;

  const url = (urlInput ? urlInput.value : '').trim();
  const poster = (posterInput ? posterInput.value : '').trim();
  const isVertical = propVertical ? propVertical.checked : true;

  if (!url) {
    container.style.display = 'none';
    slot.innerHTML = '';
    return;
  }

  container.style.display = 'block';
  const vSource = parseVideoSource(url);
  const isVideo = isVideoMedia({ midiaUrl: url, tipoMidia: vSource.type !== 'unknown' ? 'video' : 'foto' });

  if (isVideo) {
    if (typeTag) typeTag.textContent = `Vídeo • ${isVertical ? 'Vertical (9:16)' : 'Horizontal (16:9)'}`;

    if (vSource.type === 'gdrive') {
      slot.innerHTML = `
        <div style="position: relative; width: 100%; ${isVertical ? 'aspect-ratio: 9/16; max-height: 220px; max-width: 130px;' : 'aspect-ratio: 16/9; max-height: 180px;'} overflow: hidden; border-radius: 8px; background: #000;">
          <iframe src="${vSource.embedUrl}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
        </div>
      `;
    } else if (vSource.type === 'youtube') {
      slot.innerHTML = `
        <div style="position: relative; width: 100%; ${vSource.isShorts || isVertical ? 'aspect-ratio: 9/16; max-height: 220px; max-width: 130px;' : 'aspect-ratio: 16/9; max-height: 180px;'} overflow: hidden; border-radius: 8px; background: #000;">
          <iframe src="${vSource.embedUrl}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
        </div>
      `;
    } else {
      slot.innerHTML = `
        <div style="position: relative; width: 100%; ${isVertical ? 'aspect-ratio: 9/16; max-height: 220px; max-width: 130px;' : 'aspect-ratio: 16/9; max-height: 180px;'} overflow: hidden; border-radius: 8px; background: #000;">
          <video src="${url}" ${poster ? `poster="${poster}"` : ''} controls playsinline style="width: 100%; height: 100%; object-fit: contain;"></video>
        </div>
      `;
    }
  } else {
    if (typeTag) typeTag.textContent = 'Fotografia / Imagem';
    slot.innerHTML = `
      <img src="${url}" style="max-height: 180px; max-width: 100%; border-radius: 6px; object-fit: contain;" onerror="this.parentElement.innerHTML='<span style=\\'color:#ef4444; font-size:12px;\\'>Não foi possível carregar a imagem deste link</span>';">
    `;
  }
}

async function handleSavePortfolioMedia(e) {
  e.preventDefault();

  if (typeof isUserAdmin === 'function' && !isUserAdmin()) {
    showToast('Ação não autorizada. Apenas administradores podem salvar mídias.', 'danger');
    return;
  }

  const id = document.getElementById('editorProjectId').value;
  const titulo = document.getElementById('editorProjectTitulo').value.trim();
  const categoria = document.getElementById('editorProjectCategoria').value;
  const proporcao = document.getElementById('editorPropVertical').checked ? 'vertical' : 'horizontal';
  let midiaUrl = document.getElementById('editorMidiaUrl').value.trim();
  const posterUrl = document.getElementById('editorPosterUrl') ? document.getElementById('editorPosterUrl').value.trim() : '';

  if (!titulo) {
    showToast('O título do projeto é obrigatório.', 'warning');
    return;
  }
  if (!midiaUrl) {
    showToast('Informe o link ou selecione um arquivo para a mídia.', 'warning');
    return;
  }

  // Tratamento inteligente do Google Drive
  let gdriveId = extractGoogleDriveId(midiaUrl) || '';
  let gdriveLink = '';
  if (gdriveId) {
    midiaUrl = 'https://drive.google.com/file/d/' + gdriveId + '/preview';
    gdriveLink = 'https://drive.google.com/file/d/' + gdriveId + '/view?usp=sharing';
  }

  const vSource = parseVideoSource(midiaUrl);
  const tipoMidia = (vSource.type !== 'unknown' || isVideoMedia({ midiaUrl })) ? 'video' : 'foto';

  const all = getAllPortfolioProjects();

  if (editorCurrentMode === 'edit' && id) {
    // ATUALIZAÇÃO
    let item = all.find(p => String(p.id) === String(id));
    if (!item) {
      showToast('Projeto não encontrado para salvar.', 'danger');
      return;
    }

    item.titulo = titulo;
    item.categoria = categoria;
    item.tipoMidia = tipoMidia;
    item.proporcao = proporcao;
    item.midiaUrl = midiaUrl;
    if (posterUrl) item.posterUrl = posterUrl;
    if (gdriveId) {
      item.gdriveId = gdriveId;
      item.gdriveLink = gdriveLink;
    }

    showToast('Projeto atualizado com sucesso!', 'success');
  } else {
    // CRIAÇÃO DE NOVO ITEM
    const maxId = all.reduce((max, p) => Math.max(max, parseInt(p.id) || 0), 0);
    const newId = maxId + 1;

    const newItem = {
      id: newId,
      titulo: titulo,
      categoria: categoria,
      tipoMidia: tipoMidia,
      proporcao: proporcao,
      midiaUrl: midiaUrl,
      posterUrl: posterUrl || (tipoMidia === 'foto' ? midiaUrl : ''),
      gdriveId: gdriveId || null,
      gdriveLink: gdriveLink || (gdriveId ? `https://drive.google.com/file/d/${gdriveId}/view` : ''),
      descricao: `Projeto executado sob medida pela DK Revestimentos.`
    };

    all.unshift(newItem);
    showToast('Nova mídia publicada com sucesso!', 'success');
  }

  // Persistência local no banco de dados e cache
  if (typeof db !== 'undefined') db.portfolio = all;
  if (typeof saveCacheDB === 'function') saveCacheDB('portfolio', all);

  // Sincronização em nuvem com Supabase se disponível
  if (typeof sbClient !== 'undefined' && sbClient) {
    try {
      const payload = {
        id: editorCurrentMode === 'edit' ? parseInt(id) : undefined,
        titulo: titulo,
        categoria: categoria,
        tipo_midia: tipoMidia,
        proporcao: proporcao,
        midia_url: midiaUrl,
        poster_url: posterUrl || (tipoMidia === 'foto' ? midiaUrl : null),
        gdrive_id: gdriveId || null
      };
      await sbClient.from('portfolio').upsert(payload);
    } catch (err) {
      console.warn('Sync Supabase portfolio:', err);
    }
  }

  closeModal('portfolioEditorModal');
  renderAdminPortfolio();
  renderPublicCatalog();
}

async function deletePortfolioItem(id) {
  if (typeof isUserAdmin === 'function' && !isUserAdmin()) {
    showToast('Apenas administradores podem excluir projetos.', 'warning');
    return;
  }

  const all = getAllPortfolioProjects();
  const item = all.find(p => String(p.id) === String(id));
  const isVid = item ? isVideoMedia(item) : false;

  const confirmado = await customConfirm(
    `Deseja realmente excluir "${item ? item.titulo : 'este item'}" do portfólio?`, 
    isVid ? 'Excluir Vídeo' : 'Excluir Fotografia', 
    { danger: true, confirmText: 'Sim, Excluir' }
  );
  if (!confirmado) return;

  if (typeof db !== 'undefined') {
    db.portfolio = db.portfolio.filter(p => String(p.id) !== String(id));
    if (typeof saveCacheDB === 'function') saveCacheDB('portfolio', db.portfolio);
  }

  showToast('Item removido com sucesso.', 'info');
  renderAdminPortfolio();
  renderPublicCatalog();

  if (typeof sbClient !== 'undefined' && sbClient) {
    try {
      await sbClient.from('portfolio').delete().eq('id', id);
    } catch (e) {
      console.warn('Erro ao excluir no Supabase:', e);
    }
  }
}

function syncGoogleDriveFolderMedia() {
  if (typeof isUserAdmin === 'function' && !isUserAdmin()) {
    showToast('Apenas administradores podem sincronizar o Google Drive.', 'warning');
    return;
  }

  if (typeof DEFAULT_REAL_PORTFOLIO !== 'undefined' && Array.isArray(DEFAULT_REAL_PORTFOLIO)) {
    if (typeof db !== 'undefined') {
      db.portfolio = [...DEFAULT_REAL_PORTFOLIO];
      if (typeof saveCacheDB === 'function') saveCacheDB('portfolio', db.portfolio);
    }
    showToast('Pasta do Google Drive sincronizada (16 mídias ativas).', 'success');
    renderAdminPortfolio();
    renderPublicCatalog();
  }
}

// ----------------------------------------------------------------------------
// EXPORTS GLOBAIS
// ----------------------------------------------------------------------------
window.extractGoogleDriveId = extractGoogleDriveId;
window.extractYouTubeId = extractYouTubeId;
window.parseVideoSource = parseVideoSource;
window.isVideoMedia = isVideoMedia;
window.getAllPortfolioProjects = getAllPortfolioProjects;
window.setPortfolioFormatFilter = setPortfolioFormatFilter;
window.renderPublicCatalog = renderPublicCatalog;
window.togglePlayInlineVideo = togglePlayInlineVideo;
window.stopInlineVideo = stopInlineVideo;
window.openProjectDetails = openProjectDetails;
window.setAdminPortfolioFilter = setAdminPortfolioFilter;
window.handleAdminPortfolioSearch = handleAdminPortfolioSearch;
window.renderAdminPortfolio = renderAdminPortfolio;
window.openPortfolioEditorModal = openPortfolioEditorModal;
window.openEditProjectModal = openPortfolioEditorModal; // retrocompatibilidade
window.openNewMediaModal = openPortfolioEditorModal;    // retrocompatibilidade
window.switchEditorSourceTab = switchEditorSourceTab;
window.updateEditorProportion = updateEditorProportion;
window.handleEditorUrlInput = handleEditorUrlInput;
window.handleEditorFileSelect = handleEditorFileSelect;
window.handleEditorPosterFileSelect = handleEditorPosterFileSelect;
window.updateEditorLivePreview = updateEditorLivePreview;
window.handleSavePortfolioMedia = handleSavePortfolioMedia;
window.deletePortfolioItem = deletePortfolioItem;
window.syncGoogleDriveFolderMedia = syncGoogleDriveFolderMedia;
