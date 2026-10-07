// ============================================================================
// MÓDULO DE PORTFÓLIO & CATÁLOGO VISUAL DE ALTO PADRÃO (DK REVESTIMENTOS)
// Foco em Apresentação Visual Premium, Obras Reais, Categorias e Geração de Contato
// ============================================================================

let currentCategoryFilter = 'all';
let currentAdminPortfolioFilter = 'all';
let currentAdminSearchTerm = '';
let editorCurrentMode = 'create'; // 'create' | 'edit'

const PORTFOLIO_CATEGORIES = [
  { id: 'all', label: 'TODOS' },
  { id: 'MARCENARIA', label: 'MARCENARIA' },
  { id: 'MÓVEIS SOB MEDIDA', label: 'MÓVEIS SOB MEDIDA' },
  { id: 'ÁREAS EXTERNAS', label: 'ÁREAS EXTERNAS' },
  { id: 'MADEIRA & REVESTIMENTOS', label: 'MADEIRA & REVESTIMENTOS' },
  { id: 'PROJETOS ESPECIAIS', label: 'PROJETOS ESPECIAIS' }
];

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


function fallbackToDrivePreview(videoEl, fallbackUrl) {
  if (!fallbackUrl || !videoEl || !videoEl.parentElement) return;
  console.warn("Vídeo local indisponível, alternando automaticamente para player do Google Drive:", fallbackUrl);
  videoEl.parentElement.innerHTML = `
    <iframe src="${fallbackUrl}" 
            style="width: 100%; height: 100%; border: 0; display: block;" 
            allow="autoplay; encrypted-media; fullscreen" 
            allowfullscreen>
    </iframe>
  `;
}
window.fallbackToDrivePreview = fallbackToDrivePreview;

function parseVideoSource(url) {
  if (!url) return { type: 'unknown', id: null, embedUrl: null, posterUrl: null, originalUrl: '' };
  url = url.trim();

  // 1. YouTube & YouTube Shorts
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

  // 2. Arquivo Direto MP4/WebM/MOV/Blob/DataURL
  if (url.startsWith('data:video') || url.startsWith('blob:') || url.match(/\.(mp4|mov|webm|m4v)($|\?)/i)) {
    return {
      type: 'direct',
      id: null,
      embedUrl: url,
      posterUrl: null,
      originalUrl: url
    };
  }

  // 3. Google Drive
  const driveId = extractGoogleDriveId(url);
  if (driveId && (url.includes('drive.google.com') || url.includes('docs.google.com') || url.length >= 25)) {
    return {
      type: 'gdrive',
      id: driveId,
      embedUrl: 'https://drive.google.com/file/d/' + driveId + '/preview',
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
// 2. RECUPERAÇÃO DE PROJETOS E ESTADO
// ----------------------------------------------------------------------------

function getAllPortfolioProjects() {
  const deletedIds = new Set(JSON.parse(localStorage.getItem('marcenaria_deleted_portfolio_ids') || '[]').map(String));
  const deletedTitles = new Set(JSON.parse(localStorage.getItem('marcenaria_deleted_portfolio_titles') || '[]').map(t => (t || '').toLowerCase().trim()));

  const filterDeleted = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(p => !deletedIds.has(String(p.id)) && !deletedTitles.has((p.titulo || '').toLowerCase().trim()));
  };

  if (typeof db !== 'undefined' && db.portfolio && Array.isArray(db.portfolio) && db.portfolio.length > 0) {
    return filterDeleted(db.portfolio);
  }
  try {
    const cached = localStorage.getItem('marcenaria_portfolio');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const clean = filterDeleted(parsed);
        if (typeof db !== 'undefined') db.portfolio = clean;
        return clean;
      }
    }
  } catch (e) {}

  if (typeof DEFAULT_REAL_PORTFOLIO !== 'undefined' && Array.isArray(DEFAULT_REAL_PORTFOLIO)) {
    const clean = filterDeleted(DEFAULT_REAL_PORTFOLIO);
    if (typeof db !== 'undefined') db.portfolio = clean;
    return clean;
  }
  return [];
}

// ----------------------------------------------------------------------------
// 3. SEÇÃO DE DESTAQUES (COMPOSIÇÃO DE ALTO IMPACTO VISUAL)
// ----------------------------------------------------------------------------

function renderFeaturedHighlights() {
  const container = document.getElementById('portfolioHighlightsGrid');
  if (!container) return;

  const allProjects = getAllPortfolioProjects();
  if (allProjects.length === 0) return;

  // Seleciona os 4 projetos de maior impacto visual para destaque
  // 1. Deck em Madeira Maciça (ID 7)
  // 2. Portão e Painel em Madeira (ID 5)
  // 3. Painel Ripado em Madeira (ID 2)
  // 4. Oratório em Madeira Ripada (ID 14)
  const primaryProject = allProjects.find(p => p.id === 7) || allProjects[0];
  const sideProject1 = allProjects.find(p => p.id === 5) || allProjects[1];
  const sideProject2 = allProjects.find(p => p.id === 2) || allProjects[2];
  const sideProject3 = allProjects.find(p => p.id === 14) || allProjects[3];

  const sideProjects = [sideProject1, sideProject2, sideProject3].filter(Boolean);

  let sideHtml = '';
  sideProjects.forEach(item => {
    const isVideo = isVideoMedia(item);
    const poster = item.posterUrl || (isVideo ? parseVideoSource(item.midiaUrl).posterUrl : item.midiaUrl) || '';

    sideHtml += `
      <div class="featured-card featured-card-side" onclick="openProjectDetails('${item.id}')" style="cursor: pointer;">
        <div class="featured-card-media-wrap">
          <img src="${poster}" alt="${item.titulo}" class="featured-card-img" loading="lazy">
          <div class="featured-card-hover-overlay"></div>
          ${isVideo ? `
            <span class="card-video-indicator">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>VER VÍDEO</span>
            </span>
          ` : ''}
          <div class="featured-card-meta">
            <span class="featured-card-category">${item.categoria}</span>
            <h4 class="featured-card-title">${item.titulo}</h4>
            ${item.subtitulo ? `<p class="featured-card-desc">${item.subtitulo}</p>` : ''}
            <div class="featured-card-cta">
              <span>VER PROJETO</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  const isPrimaryVideo = isVideoMedia(primaryProject);
  const primaryPoster = primaryProject.posterUrl || primaryProject.midiaUrl || '';

  container.innerHTML = `
    <!-- Card Destaque Principal -->
    <div class="featured-card featured-card-primary" onclick="openProjectDetails('${primaryProject.id}')" style="cursor: pointer;">
      <div class="featured-card-media-wrap">
        <img src="${primaryPoster}" alt="${primaryProject.titulo}" class="featured-card-img" loading="lazy">
        <div class="featured-card-hover-overlay"></div>
        <span class="featured-spotlight-pill">★ Obra em Destaque</span>
        ${isPrimaryVideo ? `
          <span class="card-video-indicator">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>VER VÍDEO</span>
          </span>
        ` : ''}
        <div class="featured-card-meta">
          <span class="featured-card-category">${primaryProject.categoria}</span>
          <h4 class="featured-card-title">${primaryProject.titulo}</h4>
          <p class="featured-card-desc">${primaryProject.subtitulo || primaryProject.descricao}</p>
          <div class="featured-card-cta">
            <span>VER PROJETO</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Coluna Lateral de Destaques -->
    <div class="featured-side-stack">
      ${sideHtml}
    </div>
  `;
}

// ----------------------------------------------------------------------------
// 4. FILTROS E GALERIA COMPLETA DE TRABALHOS
// ----------------------------------------------------------------------------

function setPortfolioCategoryFilter(catId, btnEl) {
  currentCategoryFilter = catId;
  const wrap = document.getElementById('portfolioCategoryBar');
  if (wrap) {
    wrap.querySelectorAll('.portfolio-cat-btn').forEach(btn => btn.classList.remove('active'));
  }
  if (btnEl) btnEl.classList.add('active');
  renderPublicCatalog();
}

function renderCategoryFilterBar() {
  const barWrap = document.getElementById('portfolioCategoryBar');
  if (!barWrap) return;

  const allProjects = getAllPortfolioProjects();

  let html = '<div class="portfolio-category-bar">';
  PORTFOLIO_CATEGORIES.forEach(cat => {
    let count = 0;
    if (cat.id === 'all') {
      count = allProjects.length;
    } else {
      count = allProjects.filter(p => p.categoria === cat.id).length;
    }

    const isActive = (currentCategoryFilter === cat.id) ? 'active' : '';
    html += `
      <button type="button" class="portfolio-cat-btn ${isActive}" onclick="setPortfolioCategoryFilter('${cat.id}', this)">
        <span>${cat.label}</span>
        <span class="cat-count-pill">${count}</span>
      </button>
    `;
  });
  html += '</div>';

  barWrap.innerHTML = html;
}

function renderPublicCatalog() {
  renderFeaturedHighlights();
  renderCategoryFilterBar();

  const container = document.getElementById('portfolioCatalog');
  if (!container) return;
  container.innerHTML = '';

  const allProjects = getAllPortfolioProjects();

  // Filtragem estrita por categoria
  let filtered = allProjects;
  if (currentCategoryFilter !== 'all') {
    filtered = allProjects.filter(p => p.categoria === currentCategoryFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 60px 24px; background: #ffffff; border: 1px solid var(--border-soft); border-radius: var(--radius); box-shadow: var(--shadow-subtle);">
        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Nenhum projeto cadastrado nesta categoria</h3>
        <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 16px;">Selecione outra opção acima para visualizar os trabalhos da marcenaria.</p>
        <button type="button" class="btn btn-outline btn-sm" onclick="setPortfolioCategoryFilter('all')">Ver Todos os Trabalhos</button>
      </div>
    `;
    return;
  }

  // Renderiza cards de alta qualidade
  filtered.forEach(item => {
    const isVideo = isVideoMedia(item);
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-project-id', item.id);
    card.onclick = () => openProjectDetails(item.id);

    const imgSrc = (item.midiaUrl && item.midiaUrl.endsWith('.pdf')) 
      ? (item.posterUrl || 'assets/portfolio/pdf_page1.jpg') 
      : (item.posterUrl || (isVideo ? parseVideoSource(item.midiaUrl).posterUrl : item.midiaUrl) || item.midiaUrl);

    card.innerHTML = `
      <div class="project-media-wrap">
        <img src="${imgSrc}" alt="${item.titulo}" class="project-media" loading="lazy">
        <div class="card-hover-overlay"></div>
        ${isVideo ? `
          <span class="card-video-indicator">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>VER VÍDEO</span>
          </span>
        ` : ''}
      </div>

      <div class="project-info">
        <span class="project-category-tag">${item.categoria}</span>
        <h3 class="project-title">${item.titulo}</h3>
        ${item.subtitulo ? `<p class="project-subtitle">${item.subtitulo}</p>` : ''}
        <div class="project-card-action">
          <span>VER PROJETO</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ----------------------------------------------------------------------------
// 5. VISUALIZAÇÃO AMPLIADA (MODAL LIGHTBOX ELEGANTE COM CTA DE ORÇAMENTO)
// ----------------------------------------------------------------------------

let currentModalProjectId = null;
let currentModalVideoActive = false;

function openProjectDetails(projectId) {
  const allProjects = getAllPortfolioProjects();
  const project = allProjects.find(p => String(p.id) === String(projectId));
  if (!project) return;

  currentModalProjectId = projectId;
  currentModalVideoActive = false;

  const modal = document.getElementById('projectDetailModal');
  if (!modal) return;

  const titleEl = document.getElementById('projectModalTitle');
  const mediaContainer = document.getElementById('projectModalMediaContainer');
  const locationEl = document.getElementById('projectModalLocation');
  const descEl = document.getElementById('projectModalDesc');
  const videoActionEl = document.getElementById('projectModalVideoAction');
  const actionBtn = document.getElementById('projectModalActionBtn');

  if (titleEl) titleEl.textContent = project.titulo;
  if (locationEl) locationEl.textContent = project.categoria || 'Marcenaria';
  if (descEl) descEl.textContent = project.subtitulo || project.descricao || 'Projeto e execução sob medida pela equipe da DK Revestimentos.';

  const isVideo = isVideoMedia(project);
  const isVertical = project.proporcao === 'vertical';

  const modalCard = modal.querySelector('.modal-content');
  if (modalCard) {
    if (isVertical) modalCard.classList.add('is-vertical-card');
    else modalCard.classList.remove('is-vertical-card');
  }

  // Renderização da Mídia Ampliada
  if (mediaContainer) {
    mediaContainer.innerHTML = '';
    const isPdf = project.midiaUrl && project.midiaUrl.endsWith('.pdf');

    if (isPdf) {
      mediaContainer.innerHTML = `
        <div class="project-modal-stage stage-vertical" style="position: relative;">
          <img src="${project.posterUrl || 'assets/portfolio/pdf_page1.jpg'}" alt="${project.titulo}">
          <a href="${project.midiaUrl}" target="_blank" class="btn btn-primary btn-sm" style="position: absolute; bottom: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.5);">
            📄 Abrir Desenho Técnico PDF
          </a>
        </div>
      `;
      if (videoActionEl) videoActionEl.style.display = 'none';
    } else if (isVideo) {
      const vSource = parseVideoSource(project.midiaUrl);
      const stageClass = isVertical ? 'stage-vertical' : 'stage-horizontal';
      const stageStyle = isVertical 
        ? 'position: relative; width: min(100%, 380px); height: min(54vh, 520px); min-height: 320px; aspect-ratio: 9/16; background: #000; margin: 0 auto; overflow: hidden; border-radius: 12px; display: flex; align-items: center; justify-content: center;'
        : 'position: relative; width: 100%; height: min(48vh, 460px); min-height: 240px; aspect-ratio: 16/9; background: #000; margin: 0 auto; overflow: hidden; border-radius: 12px; display: flex; align-items: center; justify-content: center;';

      const poster = project.posterUrl || (vSource.type === 'youtube' ? vSource.posterUrl : '');
      const gdriveId = project.gdriveId || extractGoogleDriveId(project.midiaUrl) || extractGoogleDriveId(project.gdriveLink || '');
      const gdrivePreview = gdriveId ? `https://drive.google.com/file/d/${gdriveId}/preview` : '';
      const gdriveView = project.gdriveLink || (gdriveId ? `https://drive.google.com/file/d/${gdriveId}/view?usp=sharing` : '');

      if (vSource.type === 'youtube') {
        mediaContainer.innerHTML = `
          <div class="project-modal-stage ${stageClass}" id="modalVideoPlayerSlot" style="${stageStyle}">
            <iframe src="${vSource.embedUrl}" 
                    style="width: 100%; height: 100%; border: 0; display: block;" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen>
            </iframe>
          </div>
        `;
      } else if (vSource.type === 'gdrive' || (!project.midiaUrl.endsWith('.mp4') && gdrivePreview)) {
        // Player Google Drive embutido via Iframe com permissões totais
        const embedUrl = vSource.embedUrl || gdrivePreview;
        mediaContainer.innerHTML = `
          <div class="project-modal-stage ${stageClass}" id="modalVideoPlayerSlot" style="${stageStyle}">
            <iframe src="${embedUrl}" 
                    style="width: 100%; height: 100%; border: 0; display: block;" 
                    allow="autoplay; encrypted-media; fullscreen" 
                    allowfullscreen>
            </iframe>
          </div>
        `;
      } else {
        // Vídeo Direto (MP4 Local ou Remoto) com Fallback Dinâmico
        const fallbackAttr = gdrivePreview 
          ? `onerror="if (typeof fallbackToDrivePreview === 'function') fallbackToDrivePreview(this, '${gdrivePreview}');"`
          : '';

        mediaContainer.innerHTML = `
          <div class="project-modal-stage ${stageClass}" id="modalVideoPlayerSlot" style="${stageStyle}">
            <video id="modalActiveVideo" 
                   src="${project.midiaUrl}" 
                   ${poster ? `poster="${poster}"` : ''} 
                   controls 
                   playsinline 
                   preload="auto" 
                   style="width: 100%; height: 100%; object-fit: contain; background: #000; display: block;"
                   ${fallbackAttr}>
              <source src="${project.midiaUrl}" type="video/mp4">
              Seu navegador não suporta reprodução direta de vídeo.
            </video>
          </div>
        `;

        // Inicia a reprodução direta quando o modal abre
        setTimeout(() => {
          const vid = document.getElementById('modalActiveVideo');
          if (vid) {
            const p = vid.play();
            if (p !== undefined) {
              p.catch(err => {
                console.log('Autoplay direto pausado para interação do usuário:', err);
              });
            }
          }
        }, 150);
      }

      if (videoActionEl) {
        videoActionEl.style.display = 'flex';
        videoActionEl.style.alignItems = 'center';
        videoActionEl.style.justifyContent = 'center';
        videoActionEl.style.gap = '10px';
        videoActionEl.style.flexWrap = 'wrap';

        let actionsHtml = `
          <button type="button" class="btn btn-outline btn-sm" onclick="playActiveModalVideo()" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px; font-size: 13px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>▶ REINICIAR / REPRODUZIR</span>
          </button>
        `;

        if (gdriveView) {
          actionsHtml += `
            <a href="${gdriveView}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="font-size: 12.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;" title="Assistir no Google Drive">
              <span>📁 Abrir no Drive ↗</span>
            </a>
          `;
        }

        videoActionEl.innerHTML = actionsHtml;
      }
    } else {
      if (videoActionEl) videoActionEl.style.display = 'none';
      mediaContainer.innerHTML = `
        <div class="project-modal-stage ${isVertical ? 'stage-vertical' : 'stage-horizontal'}">
          <img src="${project.midiaUrl}" alt="${project.titulo}">
        </div>
      `;
    }
  }

  // Ação do Botão de Orçamento ou Edição (se estiver no admin)
  if (actionBtn) {
    actionBtn.onclick = () => {
      if (document.getElementById('adminArea') && document.getElementById('adminArea').style.display !== 'none') {
        closeModal('projectDetailModal');
        if (typeof openPortfolioEditorModal === 'function') openPortfolioEditorModal(project.id);
      } else {
        handleProjectModalBudget(project.titulo, project.categoria);
      }
    };
  }

  // Ação do Botão WhatsApp
  const modalWaBtn = document.getElementById('projectModalWhatsAppBtn');
  if (modalWaBtn) {
    const waText = encodeURIComponent(`Olá! Vi o projeto *${project.titulo}* (${project.categoria || 'Marcenaria'}) no site da DK Revestimentos e gostaria de solicitar um orçamento.`);
    const waPhone = (typeof MARANARIA_WHATSAPP !== 'undefined') ? MARANARIA_WHATSAPP : '5561999999999';
    modalWaBtn.href = `https://api.whatsapp.com/send?phone=${waPhone}&text=${waText}`;
  }

  openModal('projectDetailModal');
}

function playActiveModalVideo() {
  if (!currentModalProjectId) return;
  const allProjects = getAllPortfolioProjects();
  const project = allProjects.find(p => String(p.id) === String(currentModalProjectId));
  if (!project || !isVideoMedia(project)) return;

  const slot = document.getElementById('modalVideoPlayerSlot');
  if (!slot) return;

  const isVertical = project.proporcao === 'vertical';
  const vSource = parseVideoSource(project.midiaUrl);
  const isDirectFile = vSource.type === 'direct' || (project.midiaUrl && project.midiaUrl.endsWith('.mp4'));
  const gdriveId = project.gdriveId || extractGoogleDriveId(project.midiaUrl) || extractGoogleDriveId(project.gdriveLink || '');
  const gdrivePreview = gdriveId ? `https://drive.google.com/file/d/${gdriveId}/preview` : '';

  const stageClass = isVertical ? 'stage-vertical' : 'stage-horizontal';
  const stageStyle = isVertical 
    ? 'position: relative; width: min(100%, 380px); height: min(54vh, 520px); min-height: 320px; aspect-ratio: 9/16; background: #000; margin: 0 auto; overflow: hidden; border-radius: 12px; display: flex; align-items: center; justify-content: center;'
    : 'position: relative; width: 100%; height: min(48vh, 460px); min-height: 240px; aspect-ratio: 16/9; background: #000; margin: 0 auto; overflow: hidden; border-radius: 12px; display: flex; align-items: center; justify-content: center;';

  slot.className = `project-modal-stage ${stageClass}`;
  slot.setAttribute('style', stageStyle);

  if (vSource.type === 'youtube') {
    slot.innerHTML = `
      <iframe src="${vSource.embedUrl}" 
              style="width: 100%; height: 100%; border: 0; display: block;" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen>
      </iframe>
    `;
  } else if (vSource.type === 'gdrive' || (!isDirectFile && gdrivePreview)) {
    const embedUrl = vSource.embedUrl || gdrivePreview;
    slot.innerHTML = `
      <iframe src="${embedUrl}" 
              style="width: 100%; height: 100%; border: 0; display: block;" 
              allow="autoplay; encrypted-media; fullscreen" 
              allowfullscreen>
      </iframe>
    `;
  } else if (isDirectFile) {
    const fallbackAttr = gdrivePreview 
      ? `onerror="if (typeof fallbackToDrivePreview === 'function') fallbackToDrivePreview(this, '${gdrivePreview}');"`
      : '';
    slot.innerHTML = `
      <video id="modalActiveVideo" 
             src="${project.midiaUrl}" 
             ${project.posterUrl ? `poster="${project.posterUrl}"` : ''} 
             controls autoplay playsinline preload="auto" 
             style="width: 100%; height: 100%; object-fit: contain; background: #000; display: block;"
             ${fallbackAttr}>
        <source src="${project.midiaUrl}" type="video/mp4">
        Seu navegador não suporta reprodução direta de vídeo.
      </video>
    `;
    const vid = slot.querySelector('video');
    if (vid) {
      const p = vid.play();
      if (p !== undefined) p.catch(e => console.log('Autoplay prevented:', e));
    }
  }
}

function handleProjectModalBudget(titulo, categoria) {
  closeModal('projectDetailModal');

  // Preenche dados do formulário de contato
  prefillBudget(titulo, categoria);
}

function prefillBudget(titulo, categoria) {
  const form = document.getElementById('leadForm');
  const tipoSelect = document.getElementById('leadTipo');
  const msgArea = document.getElementById('leadMensagem');

  if (tipoSelect) {
    // Busca opção mais compatível
    for (let i = 0; i < tipoSelect.options.length; i++) {
      const opt = tipoSelect.options[i];
      if (opt.value.toLowerCase().includes((categoria || '').toLowerCase()) || 
          (categoria || '').toLowerCase().includes(opt.value.toLowerCase())) {
        tipoSelect.selectedIndex = i;
        break;
      }
    }
  }

  if (msgArea) {
    msgArea.value = `Olá! Tenho interesse em desenvolver um projeto sob medida para meu espaço, inspirado no trabalho "${titulo}" (${categoria}).`;
  }

  // Rola até a seção de contato com destaque
  const contatoSec = document.getElementById('contato');
  if (contatoSec) {
    contatoSec.scrollIntoView({ behavior: 'smooth' });
    const nomeInput = document.getElementById('leadNome');
    if (nomeInput) {
      setTimeout(() => nomeInput.focus(), 600);
    }
  }
}

// ----------------------------------------------------------------------------
// 6. GESTÃO CENTRALIZADA NO PAINEL ADMINISTRATIVO (NADA FORA DELE)
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

  const countBadge = document.getElementById('adminMediaCountBadge');
  if (countBadge) {
    const vids = all.filter(p => isVideoMedia(p)).length;
    countBadge.textContent = `${all.length} projetos (${vids} vídeos, ${all.length - vids} fotos)`;
  }

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
        <p style="font-weight: 700; color: #0f172a; margin-bottom: 4px; font-size: 15px;">Nenhuma mídia encontrada com o filtro atual.</p>
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

    let originLabel = 'Arquivo Local';
    let originClass = 'badge-neutral';
    const urlLower = (item.midiaUrl || '').toLowerCase();

    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      originLabel = urlLower.includes('/shorts/') ? 'YouTube Shorts' : 'YouTube';
      originClass = 'badge-danger';
    } else if (urlLower.startsWith('data:') || urlLower.startsWith('blob:')) {
      originLabel = 'Upload Local (Aparelho)';
      originClass = 'badge-success';
    } else if (urlLower.startsWith('assets/')) {
      originLabel = 'Arquivo Local';
      originClass = 'badge-neutral';
    } else if (urlLower.includes('drive.google.com')) {
      originLabel = 'Link Externo';
      originClass = 'badge-primary';
    }

    let posterThumb = '';
    if (item.midiaUrl && item.midiaUrl.endsWith('.pdf')) {
      posterThumb = item.posterUrl || 'assets/portfolio/pdf_page1.jpg';
    } else if (item.posterUrl && !item.posterUrl.endsWith('.pdf')) {
      posterThumb = item.posterUrl;
    } else if (isVideo) {
      posterThumb = parseVideoSource(item.midiaUrl).posterUrl || '';
    } else {
      posterThumb = item.midiaUrl || '';
    }
    if (posterThumb.endsWith('.pdf')) {
      posterThumb = 'assets/portfolio/pdf_page1.jpg';
    }

    row.innerHTML = `
      <div style="width: 60px; height: 75px; border-radius: 8px; background: #0b0c10; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
        ${posterThumb ? `
          <img src="${posterThumb}" alt="${item.titulo}" style="width:100%; height:100%; object-fit: cover;" onerror="this.onerror=null; this.src='assets/portfolio/pdf_page1.jpg';">
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
          <span class="badge badge-neutral" style="font-size: 11px; font-weight: 700;">${item.categoria || 'Geral'}</span>
        </div>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
        <button type="button" class="btn btn-outline btn-sm" onclick="openProjectDetails('${item.id}')" title="Visualizar na íntegra" style="font-weight: 600;">
          <span>👁️ Ver</span>
        </button>
        <button type="button" class="btn btn-primary btn-sm" onclick="openPortfolioEditorModal('${item.id}')" title="Editar informações do projeto" style="font-weight: 600;">
          <span>✏️ Editar</span>
        </button>
        <button type="button" class="btn btn-danger btn-sm" onclick="deletePortfolioItem('${item.id}')" title="Excluir projeto">
          <span>🗑️ Excluir</span>
        </button>
      </div>
    `;

    container.appendChild(row);
  });
}

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
    editorCurrentMode = 'edit';
    const all = getAllPortfolioProjects();
    const item = all.find(p => String(p.id) === String(projectId));
    if (!item) {
      showToast('Projeto não encontrado para edição.', 'danger');
      return;
    }

    if (idInput) idInput.value = item.id;
    if (titleInput) titleInput.value = item.titulo || '';
    if (catInput) catInput.value = item.categoria || 'MARCENARIA';
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
    badge.innerHTML = `<strong>✓ Google Drive Detectado:</strong> ID extraído (<code>${vSource.id}</code>).`;
  } else if (vSource.type === 'youtube') {
    badge.style.background = '#fef2f2';
    badge.style.color = '#b91c1c';
    badge.innerHTML = `<strong>✓ YouTube Detectado:</strong> ID (<code>${vSource.id}</code>)${vSource.isShorts ? ' • Shorts' : ''}`;
    if (vSource.isShorts) {
      const propV = document.getElementById('editorPropVertical');
      if (propV) propV.checked = true;
    }
  } else {
    badge.style.background = '#f8fafc';
    badge.style.color = '#475569';
    badge.innerHTML = `<strong>✓ Link Direto:</strong> Arquivo externo`;
  }

  updateEditorLivePreview();
}

function handleEditorFileSelect(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];

  const fileInfo = document.getElementById('editorFileSelectedInfo');
  if (fileInfo) {
    fileInfo.style.display = 'block';
    fileInfo.textContent = `Arquivo selecionado: ${file.name} (${(file.size / (1024*1024)).toFixed(2)} MB)`;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const urlInput = document.getElementById('editorMidiaUrl');
    if (urlInput) urlInput.value = dataUrl;
    updateEditorLivePreview();
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
    if (typeTag) typeTag.textContent = 'Fotografia';
    slot.innerHTML = `
      <img src="${url}" style="max-height: 180px; max-width: 100%; border-radius: 6px; object-fit: contain;">
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
    let item = all.find(p => String(p.id) === String(id));
    if (!item) {
      showToast('Projeto não encontrado para salvar.', 'danger');
      return;
    }

    item.titulo = titulo.toUpperCase();
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
    const maxId = all.reduce((max, p) => Math.max(max, parseInt(p.id) || 0), 0);
    const newId = maxId + 1;

    const newItem = {
      id: newId,
      titulo: titulo.toUpperCase(),
      subtitulo: `Projeto executado sob medida para ${categoria.toLowerCase()}`,
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

  if (typeof db !== 'undefined') db.portfolio = all;
  if (typeof saveCacheDB === 'function') saveCacheDB('portfolio', all);

  if (typeof sbClient !== 'undefined' && sbClient) {
    try {
      const payload = {
        id: editorCurrentMode === 'edit' ? parseInt(id) : undefined,
        titulo: titulo.toUpperCase(),
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

  const confirmado = await customConfirm(
    `Deseja realmente remover "${item ? item.titulo : 'este projeto'}" do catálogo?`, 
    'Remover Projeto', 
    { danger: true, confirmText: 'Sim, Remover' }
  );
  if (!confirmado) return;

  // 1. Grava no registro permanente de exclusões (Tombstone) para nunca mais ressuscitar
  const deletedIds = JSON.parse(localStorage.getItem('marcenaria_deleted_portfolio_ids') || '[]');
  if (!deletedIds.includes(String(id))) {
    deletedIds.push(String(id));
    localStorage.setItem('marcenaria_deleted_portfolio_ids', JSON.stringify(deletedIds));
  }
  if (item && item.titulo) {
    const deletedTitles = JSON.parse(localStorage.getItem('marcenaria_deleted_portfolio_titles') || '[]');
    const normTitle = (item.titulo || '').toLowerCase().trim();
    if (!deletedTitles.includes(normTitle)) {
      deletedTitles.push(normTitle);
      localStorage.setItem('marcenaria_deleted_portfolio_titles', JSON.stringify(deletedTitles));
    }
  }

  // 2. Remove da memória e do cache local
  if (typeof db !== 'undefined') {
    db.portfolio = db.portfolio.filter(p => String(p.id) !== String(id));
    if (typeof saveCacheDB === 'function') saveCacheDB('portfolio', db.portfolio);
  }

  showToast('Projeto removido do catálogo.', 'info');
  renderAdminPortfolio();
  renderPublicCatalog();

  // 3. Exclui do banco de dados na nuvem (Supabase)
  if (typeof sbClient !== 'undefined' && sbClient) {
    try {
      await sbClient.from('portfolio').delete().eq('id', id);
    } catch (e) {
      console.warn('Erro ao excluir no Supabase:', e);
    }
  }
}

function refreshAdminPortfolio() {
  if (typeof isUserAdmin === 'function' && !isUserAdmin()) {
    showToast('Apenas administradores podem atualizar o portfólio.', 'warning');
    return;
  }
  if (typeof fetchCloudData === 'function') {
    fetchCloudData(true).then(() => {
      showToast('Portfólio atualizado.', 'success');
      renderAdminPortfolio();
      renderPublicCatalog();
    });
  } else {
    renderAdminPortfolio();
    renderPublicCatalog();
    showToast('Portfólio atualizado.', 'success');
  }
}
function syncGoogleDriveFolderMedia() {
  refreshAdminPortfolio();
}

// ----------------------------------------------------------------------------
// EXPORTS GLOBAIS
// ----------------------------------------------------------------------------
window.extractGoogleDriveId = extractGoogleDriveId;
window.extractYouTubeId = extractYouTubeId;
window.parseVideoSource = parseVideoSource;
window.isVideoMedia = isVideoMedia;
window.getAllPortfolioProjects = getAllPortfolioProjects;
window.renderFeaturedHighlights = renderFeaturedHighlights;
window.setPortfolioCategoryFilter = setPortfolioCategoryFilter;
window.renderCategoryFilterBar = renderCategoryFilterBar;
window.renderPublicCatalog = renderPublicCatalog;
window.openProjectDetails = openProjectDetails;
window.playActiveModalVideo = playActiveModalVideo;
window.handleProjectModalBudget = handleProjectModalBudget;
window.prefillBudget = prefillBudget;
window.setAdminPortfolioFilter = setAdminPortfolioFilter;
window.handleAdminPortfolioSearch = handleAdminPortfolioSearch;
window.renderAdminPortfolio = renderAdminPortfolio;
window.openPortfolioEditorModal = openPortfolioEditorModal;
window.openEditProjectModal = openPortfolioEditorModal;
window.openNewMediaModal = openPortfolioEditorModal;
window.switchEditorSourceTab = switchEditorSourceTab;
window.updateEditorProportion = updateEditorProportion;
window.handleEditorUrlInput = handleEditorUrlInput;
window.handleEditorFileSelect = handleEditorFileSelect;
window.handleEditorPosterFileSelect = handleEditorPosterFileSelect;
window.updateEditorLivePreview = updateEditorLivePreview;
window.handleSavePortfolioMedia = handleSavePortfolioMedia;
window.deletePortfolioItem = deletePortfolioItem;
window.refreshAdminPortfolio = refreshAdminPortfolio;
window.syncGoogleDriveFolderMedia = syncGoogleDriveFolderMedia;
