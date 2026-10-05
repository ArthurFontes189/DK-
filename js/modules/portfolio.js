// ============================================================================
// MÓDULO DE PORTFÓLIO & GALERIA ARQUITETÔNICA MULTIFORMATO (ALTO PADRÃO)
// DK Revestimentos - Ateliê de Marcenaria & Revestimentos
// Suporte Completo a Vídeos e Fotos Verticais (9:16/Reels) e Horizontais (16:9/Widescreen)
// Integração Nativa com Google Drive, YouTube, Vimeo e Arquivos Locais
// ============================================================================

let currentPortfolioFilter = 'all';

// ----------------------------------------------------------------------------
// 1. PARSERS E IDENTIFICADORES INTELIGENTES DE VÍDEO & GOOGLE DRIVE
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
      viewUrl: 'https://drive.google.com/file/d/' + driveId + '/view?usp=sharing',
      posterUrl: 'https://lh3.googleusercontent.com/u/0/d/' + driveId,
      originalUrl: url
    };
  }

  // 2. YouTube / Shorts
  const ytId = extractYouTubeId(url);
  if (ytId) {
    const isShorts = url.toLowerCase().includes('/shorts/');
    return {
      type: 'youtube',
      isShorts: isShorts,
      id: ytId,
      embedUrl: 'https://www.youtube-nocookie.com/embed/' + ytId + '?autoplay=1&rel=0&modestbranding=1&playsinline=1',
      posterUrl: 'https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg',
      maxPosterUrl: 'https://img.youtube.com/vi/' + ytId + '/maxresdefault.jpg',
      originalUrl: url
    };
  }

  // 3. Vimeo
  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return {
      type: 'vimeo',
      id: vimeoId,
      embedUrl: 'https://player.vimeo.com/video/' + vimeoId + '?autoplay=1',
      posterUrl: 'https://vumbnail.com/' + vimeoId + '.jpg',
      originalUrl: url
    };
  }

  // 4. Vídeo Nativo / Direto (MP4, MOV, WebM, Cloud Storage, Blob, Base64)
  const lower = url.toLowerCase();
  if (
    lower.startsWith('data:video') || 
    lower.startsWith('blob:') || 
    lower.endsWith('.mp4') || 
    lower.endsWith('.mov') || 
    lower.endsWith('.webm') || 
    lower.includes('/video/') || 
    lower.includes('.mp4?') ||
    lower.includes('storage/v1/object/public')
  ) {
    return {
      type: 'direct',
      id: null,
      embedUrl: null,
      posterUrl: null,
      originalUrl: url
    };
  }

  return { type: 'unknown', id: null, embedUrl: null, posterUrl: null, originalUrl: url };
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

// Extrai automaticamente um frame em alta resolução de arquivo de vídeo para usar como poster
function extractVideoThumbnail(file) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';

      let resolved = false;

      video.onloadeddata = function() {
        video.currentTime = Math.min(1.0, video.duration > 0.5 ? 0.5 : 0.1);
      };

      video.onseeked = function() {
        if (resolved) return;
        resolved = true;
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

      video.onerror = function() {
        if (!resolved) {
          resolved = true;
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          URL.revokeObjectURL(url);
          resolve(null);
        }
      }, 4000);
    } catch (e) {
      resolve(null);
    }
  });
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ----------------------------------------------------------------------------
// 2. HIERARQUIA VISUAL E ORDENAÇÃO DE PROJETOS
// ----------------------------------------------------------------------------

function getProjectHierarchyScore(item) {
  let score = 70;
  const isVideo = isVideoMedia(item);
  const tipoReg = (item.tipoRegistro || item.tipo_registro || '').toLowerCase();
  const text = ((item.titulo || '') + ' ' + (item.descricao || '') + ' ' + (item.categoria || '') + ' ' + tipoReg).toLowerCase();

  // 1. Ambientes finalizados (Vídeos e fotos de ambientes concluídos são prioridade)
  if (tipoReg === 'ambiente_finalizado' || text.includes('finalizado') || text.includes('concluído') || text.includes('concluido')) {
    return isVideo ? 110 : 100;
  }

  // 2. Fotos amplas e tours pelo espaço
  if (tipoReg === 'foto_ampla' || text.includes('amplo') || text.includes('geral') || text.includes('tour') || text.includes('visão')) {
    return isVideo ? 95 : 85;
  }

  // 3. Detalhes de acabamento e marcenaria fina
  if (tipoReg === 'detalhe_acabamento' || text.includes('detalhe') || text.includes('puxador') || text.includes('ripa') || text.includes('iluminação')) {
    return 65;
  }

  // 4. Processo / fabricação / oficina
  if (tipoReg === 'processo_fabricacao' || text.includes('processo') || text.includes('oficina') || text.includes('usinagem') || text.includes('canteiro')) {
    return 40;
  }

  return score;
}

function getAllPortfolioProjects() {
  const sourceList = (db.portfolio && db.portfolio.length > 0) ? db.portfolio : (window.DEFAULT_REAL_PORTFOLIO || []);

  const items = sourceList.map(item => {
    const isVideo = isVideoMedia(item);
    let prop = item.proporcao || 'horizontal';
    
    // Auto-detecta proporção se não estiver explícito
    if (!item.proporcao) {
      const vSource = parseVideoSource(item.midiaUrl || item.midia_url || '');
      if (vSource.isShorts) {
        prop = 'vertical';
      } else if (item.midiaUrl && (item.midiaUrl.includes('WA0053') || item.midiaUrl.includes('WA0024') || item.midiaUrl.includes('WA0006') || item.midiaUrl.includes('WA0015') || item.midiaUrl.includes('WA0016') || item.midiaUrl.includes('WA0019') || item.midiaUrl.includes('WA0020') || item.midiaUrl.includes('WA0022'))) {
        prop = 'vertical';
      }
    }

    return {
      id: item.id,
      titulo: item.titulo || 'Ambiente Sob Medida',
      categoria: item.categoria || 'Marcenaria Sob Medida',
      ambiente: item.categoria || 'Ambiente Personalizado',
      descricao: item.descricao || '',
      midiaUrl: item.midiaUrl || item.midia_url || '',
      posterUrl: item.posterUrl || item.poster_url || '',
      gdriveId: item.gdriveId || item.gdrive_id || extractGoogleDriveId(item.midiaUrl || item.midia_url || ''),
      gdriveLink: item.gdriveLink || item.gdrive_link || '',
      proporcao: prop,
      tipoMidia: isVideo ? 'video' : 'foto',
      tipoRegistro: item.tipoRegistro || item.tipo_registro || ''
    };
  });

  // Ordena por hierarquia visual e ID decrescente
  items.sort((a, b) => {
    const scoreA = getProjectHierarchyScore(a);
    const scoreB = getProjectHierarchyScore(b);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return Number(b.id) - Number(a.id);
  });

  return items;
}

// ----------------------------------------------------------------------------
// 3. RENDERIZAÇÃO DO CATÁLOGO PÚBLICO (MASONRY MODULAR & FILTROS DE FORMATO)
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

  // Calcula contadores para a barra de formatos
  const totalCount = allProjects.length;
  const videoCount = allProjects.filter(p => isVideoMedia(p)).length;
  const verticalCount = allProjects.filter(p => p.proporcao === 'vertical').length;
  const horizontalCount = allProjects.filter(p => p.proporcao === 'horizontal').length;

  // Renderiza barra de filtros de formato harmoniosa
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
        <span>✨ Todos os Projetos</span>
        <span class="count-pill">${totalCount}</span>
      </button>
      <button type="button" class="portfolio-format-btn ${currentPortfolioFilter === 'video' ? 'active' : ''}" onclick="setPortfolioFormatFilter('video', this)">
        <span>🎥 Vídeos & Tours</span>
        <span class="count-pill">${videoCount}</span>
      </button>
      <button type="button" class="portfolio-format-btn ${currentPortfolioFilter === 'vertical' ? 'active' : ''}" onclick="setPortfolioFormatFilter('vertical', this)">
        <span>📱 Verticais (Reels)</span>
        <span class="count-pill">${verticalCount}</span>
      </button>
      <button type="button" class="portfolio-format-btn ${currentPortfolioFilter === 'horizontal' ? 'active' : ''}" onclick="setPortfolioFormatFilter('horizontal', this)">
        <span>🖥️ Panorâmicas</span>
        <span class="count-pill">${horizontalCount}</span>
      </button>
    </div>
  `;

  // Aplica o filtro selecionado
  let filteredProjects = allProjects;
  if (currentPortfolioFilter === 'video') {
    filteredProjects = allProjects.filter(p => isVideoMedia(p));
  } else if (currentPortfolioFilter === 'vertical') {
    filteredProjects = allProjects.filter(p => p.proporcao === 'vertical');
  } else if (currentPortfolioFilter === 'horizontal') {
    filteredProjects = allProjects.filter(p => p.proporcao === 'horizontal');
  }

  if (filteredProjects.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 60px 24px; background: #ffffff; border: 1px solid var(--border-soft); border-radius: var(--radius); box-shadow: var(--shadow-subtle);">
        <h3 style="font-size: 19px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Nenhum projeto encontrado nesta categoria</h3>
        <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 20px;">Selecione outra opção acima para visualizar os projetos da marcenaria.</p>
        <button type="button" class="btn btn-outline btn-sm" onclick="setPortfolioFormatFilter('all')">Ver Todos os Trabalhos</button>
      </div>
    `;
    return;
  }

  // Renderiza cada card com sua proporção natural no layout Masonry
  filteredProjects.forEach(item => {
    const isVideo = isVideoMedia(item);
    const isVertical = item.proporcao === 'vertical';
    const card = document.createElement('div');
    card.className = `project-card ${isVertical ? 'card-proporcao-vertical' : 'card-proporcao-horizontal'} ${isVideo ? 'card-tipo-video' : 'card-tipo-foto'}`;

    let mediaTag = '';
    let badgeText = '';

    if (isVideo) {
      const vSource = parseVideoSource(item.midiaUrl);
      const posterImg = item.posterUrl || vSource.posterUrl || '';

      if (vSource.type === 'gdrive') {
        badgeText = isVertical ? '📁 DRIVE • REELS' : '📁 DRIVE • VÍDEO';
      } else if (vSource.type === 'youtube' && vSource.isShorts) {
        badgeText = '▶ YOUTUBE SHORTS';
      } else if (vSource.type === 'youtube') {
        badgeText = '▶ YOUTUBE';
      } else {
        badgeText = isVertical ? '▶ REELS VERTICAL' : '▶ TOUR WIDESCREEN';
      }

      mediaTag = `
        <div class="project-media-wrapper-aspect ${isVertical ? 'aspect-vertical-9-16' : 'aspect-horizontal-16-11'}">
          ${posterImg ? `
            <img src="${posterImg}" alt="${item.titulo}" class="project-media" loading="lazy">
          ` : `
            <video class="project-media" muted loop playsinline preload="metadata">
              <source src="${item.midiaUrl}">
            </video>
          `}
          <div class="video-play-indicator">
            <div class="video-play-btn" title="Assistir Vídeo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
            <span class="video-play-label">Assistir Vídeo</span>
          </div>
          <span class="project-media-type-badge">${badgeText}</span>
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
    }

    card.innerHTML = `
      <div class="project-media-wrap" onclick="openProjectDetails('${item.id}')" style="cursor: pointer;">
        ${mediaTag}
        <div class="project-media-overlay">
          <button type="button" class="btn btn-outline-light btn-sm" style="background: rgba(14, 15, 19, 0.7); border-color: rgba(255, 255, 255, 0.35); font-size: 12px;">
            ${isVideo ? '▶ Reproduzir Vídeo' : 'Inspecionar Projeto'}
          </button>
        </div>
      </div>

      <div class="project-info">
        <h3 class="project-title" onclick="openProjectDetails('${item.id}')" style="cursor: pointer;">${item.titulo}</h3>
        ${item.descricao ? `<p class="project-desc">${item.descricao}</p>` : ''}

        <div class="project-footer" style="margin-top: auto; padding-top: 14px;">
          <button type="button" class="btn-inspect-project" onclick="openProjectDetails('${item.id}')">
            <span>${isVideo ? 'Assistir Vídeo do Projeto' : 'Ver Detalhes do Projeto'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="prefillBudget('${item.titulo}', '${item.categoria}')" style="font-size: 12px; padding: 6px 14px;">
            Consultar Semelhante
          </button>
        </div>
      </div>
    `;

    // Preview sutil de vídeo local direto no hover (desktop)
    if (isVideo && !item.midiaUrl.includes('drive.google.com') && !item.midiaUrl.includes('youtube.com')) {
      const vid = card.querySelector('video');
      if (vid) {
        card.addEventListener('mouseenter', () => vid.play().catch(() => {}));
        card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
      }
    }

    container.appendChild(card);
  });
}

// ----------------------------------------------------------------------------
// 4. MODAL LIGHTBOX COM PLAYER ADAPTATIVO (GOOGLE DRIVE, YOUTUBE, MP4)
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
  const specsEl = document.getElementById('projectModalSpecs');
  const actionBtn = document.getElementById('projectModalActionBtn');

  if (titleEl) titleEl.textContent = project.titulo;
  if (locationEl) locationEl.textContent = project.categoria || 'Marcenaria Sob Medida';
  if (descEl) descEl.textContent = project.descricao || 'Projeto executado sob medida pela DK Revestimentos.';

  const isVideo = isVideoMedia(project);
  const isVertical = project.proporcao === 'vertical';

  // Ajusta a largura e proporção do modal de forma totalmente responsiva
  const modalCard = modal.querySelector('.modal-content');
  if (modalCard) {
    if (isVertical) {
      modalCard.classList.add('is-vertical-card');
    } else {
      modalCard.classList.remove('is-vertical-card');
    }
    modalCard.style.maxWidth = '';
  }

  if (specsEl) {
    const driveBtnHtml = project.gdriveLink ? `
      <a href="${project.gdriveLink}" target="_blank" class="btn btn-outline btn-sm" style="font-size: 11.5px; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;">
        <span>📁 Abrir no Google Drive</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </a>
    ` : '';

    specsEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
        <div style="background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-soft);">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); display: block;">Categoria</span>
          <strong style="font-size: 13.5px; color: #0f172a;">${project.categoria}</strong>
        </div>
        <div style="background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-soft);">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); display: block;">Proporção & Formato</span>
          <strong style="font-size: 13.5px; color: #0f172a;">${isVideo ? '🎥 Vídeo' : '📷 Foto'} • ${isVertical ? '📱 Vertical (9:16)' : '🖥️ Horizontal (16:9)'}</strong>
        </div>
      </div>
      ${driveBtnHtml ? `<div style="text-align: right; margin-top: 4px;">${driveBtnHtml}</div>` : ''}
    `;
  }

  if (mediaContainer) {
    mediaContainer.innerHTML = '';

    if (isVideo) {
      const isDirectFile = project.midiaUrl && (project.midiaUrl.endsWith('.mp4') || project.midiaUrl.endsWith('.mov') || project.midiaUrl.endsWith('.webm') || project.midiaUrl.startsWith('blob:') || project.midiaUrl.startsWith('data:'));
      const gdriveFallbackUrl = project.gdriveId ? ('https://drive.google.com/file/d/' + project.gdriveId + '/preview') : '';

      if (isDirectFile) {
        // Player HTML5 Nativo em Alta Resolucao Original (Sem compressao secundaria de 360p do Google Drive)
        mediaContainer.innerHTML = `
          <div class="project-modal-stage ${isVertical ? 'stage-vertical' : 'stage-horizontal'}">
            <video src="${project.midiaUrl}" 
                   ${project.posterUrl ? `poster="${project.posterUrl}"` : ''} 
                   controls autoplay playsinline 
                   style="width: 100%; height: 100%; object-fit: contain;"
                   onerror="if ('${gdriveFallbackUrl}') { this.style.display='none'; this.parentElement.innerHTML = '<iframe src=\'${gdriveFallbackUrl}\' title=\'${project.titulo}\' style=\'position:absolute;top:0;left:0;width:100%;height:100%;border:0;\' allow=\'autoplay; encrypted-media; fullscreen\' allowfullscreen></iframe>'; }">
            </video>
          </div>
        `;
      } else {
        const vSource = parseVideoSource(project.midiaUrl || gdriveFallbackUrl);

        if (vSource.type === 'gdrive') {
          // Player Oficial do Google Drive (Preview Embed)
          mediaContainer.innerHTML = `
            <div class="project-modal-stage ${isVertical ? 'stage-vertical' : 'stage-horizontal'}">
              <iframe src="${vSource.embedUrl}" 
                      title="${project.titulo}"
                      allow="autoplay; encrypted-media; fullscreen" 
                      allowfullscreen>
              </iframe>
            </div>
          `;
        } else if (vSource.type === 'youtube') {
          // Player Oficial do YouTube (Full HD / 4K / Shorts)
          const isShorts = vSource.isShorts || isVertical;
          mediaContainer.innerHTML = `
            <div class="project-modal-stage ${isShorts ? 'stage-vertical' : 'stage-horizontal'}">
              <iframe src="${vSource.embedUrl}" 
                      title="${project.titulo}"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowfullscreen>
              </iframe>
            </div>
          `;
        } else if (vSource.type === 'vimeo') {
          mediaContainer.innerHTML = `
            <div class="project-modal-stage ${isVertical ? 'stage-vertical' : 'stage-horizontal'}">
              <iframe src="${vSource.embedUrl}" 
                      title="${project.titulo}"
                      allow="autoplay; fullscreen; picture-in-picture" 
                      allowfullscreen>
              </iframe>
            </div>
          `;
        } else {
          mediaContainer.innerHTML = `
            <div class="project-modal-stage ${isVertical ? 'stage-vertical' : 'stage-horizontal'}">
              <video src="${project.midiaUrl}" 
                     ${project.posterUrl ? `poster="${project.posterUrl}"` : ''} 
                     controls autoplay playsinline>
              </video>
            </div>
          `;
        }
      }
    } else {
      // Fotografia ou Documento
      if (project.midiaUrl && project.midiaUrl.endsWith('.pdf')) {
        mediaContainer.innerHTML = `
          <div class="project-modal-stage stage-vertical" style="position: relative;">
            <img src="${project.posterUrl || 'assets/portfolio/pdf_page1.jpg'}" alt="${project.titulo}">
            <a href="${project.midiaUrl}" target="_blank" class="btn btn-primary btn-sm" style="position: absolute; bottom: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.5); z-index: 10;">
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
  }

  if (actionBtn) {
    actionBtn.onclick = () => {
      closeProjectDetailsModal();
      prefillBudget(project.titulo, project.categoria);
    };
  }

  openModal('projectDetailModal');
}

function closeProjectDetailsModal() {
  const mediaContainer = document.getElementById('projectModalMediaContainer');
  if (mediaContainer) {
    mediaContainer.innerHTML = '';
  }
  closeModal('projectDetailModal');
}

function prefillBudget(titulo, categoria) {
  const section = document.getElementById('contato') || document.getElementById('solicitar');
  if (section) section.scrollIntoView({ behavior: 'smooth' });

  const nomeInput = document.getElementById('leadNome');
  if (nomeInput) {
    setTimeout(() => nomeInput.focus(), 300);
  }

  const tipoSelect = document.getElementById('leadTipo');
  if (tipoSelect && categoria) {
    const catLower = categoria.toLowerCase();
    if (catLower.includes('cozinha') || catLower.includes('closet') || catLower.includes('dormit') || catLower.includes('suíte') || catLower.includes('suite')) {
      tipoSelect.value = 'Cozinhas, Closets & Suítes';
    } else if (catLower.includes('pain') || catLower.includes('revest')) {
      tipoSelect.value = 'Painéis & Revestimentos';
    } else if (catLower.includes('deck') || catLower.includes('extern') || catLower.includes('pergol')) {
      tipoSelect.value = 'Ambientes Externos';
    } else {
      tipoSelect.value = 'Marcenaria Sob Medida';
    }
  }

  const msgInput = document.getElementById('leadMensagem');
  if (msgInput && titulo) {
    msgInput.value = `Gostaria de um projeto com referência semelhante a: ${titulo}`;
  }

  showToast('Projeto selecionado para referência.', 'info');
}

// ----------------------------------------------------------------------------
// 5. GESTÃO NO PAINEL ADMINISTRATIVO (ADMINISTRAÇÃO DO CATÁLOGO DE MÍDIAS)
// ----------------------------------------------------------------------------

function renderAdminPortfolio(portfolio) {
  const container = document.getElementById('adminPortfolioList');
  if (!container) return;
  container.innerHTML = '';

  const list = (portfolio && portfolio.length > 0) ? portfolio : getAllPortfolioProjects();

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-muted); background: #fff; border-radius: var(--radius); border: 1px dashed var(--border-soft);">
        <div style="font-size: 32px; margin-bottom: 8px;">🎥</div>
        <p style="font-weight: 700; color: #0f172a; margin-bottom: 4px; font-size: 15px;">Nenhum vídeo ou foto cadastrado ainda.</p>
        <p style="font-size: 13px; max-width: 440px; margin: 0 auto 16px auto;">Adicione vídeos diretamente pelo Google Drive (Links de compartilhamento), YouTube ou upload direto.</p>
        <button type="button" class="btn btn-primary btn-sm" onclick="openNewMediaModal('gdrive')">+ Adicionar Vídeo do Google Drive</button>
      </div>
    `;
    return;
  }

  list.forEach(item => {
    const isVideo = isVideoMedia(item);
    const isVertical = item.proporcao === 'vertical';
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '14px';
    row.style.background = '#fff';
    row.style.padding = '14px 18px';
    row.style.borderRadius = '10px';
    row.style.marginBottom = '10px';
    row.style.border = '1px solid var(--border-soft)';

    let thumbHtml = '';
    let typeBadgeHtml = '';

    if (isVideo) {
      const vSource = parseVideoSource(item.midiaUrl || item.midia_url || '');
      const poster = item.posterUrl || item.poster_url || vSource.posterUrl || '';
      
      let platformLabel = 'Vídeo MP4';
      if (vSource.type === 'gdrive' || (item.midiaUrl && item.midiaUrl.includes('drive.google.com'))) {
        platformLabel = 'Google Drive';
      } else if (vSource.type === 'youtube' && vSource.isShorts) {
        platformLabel = 'YouTube Shorts';
      } else if (vSource.type === 'youtube') {
        platformLabel = 'YouTube';
      } else if (vSource.type === 'vimeo') {
        platformLabel = 'Vimeo';
      }

      typeBadgeHtml = `
        <span class="badge badge-warning" style="font-size: 11px;">▶ ${platformLabel}</span>
        <span class="badge badge-neutral" style="font-size: 11px;">${isVertical ? '📱 Vertical' : '🖥️ Horizontal'}</span>
      `;

      thumbHtml = `
        <div style="width: 58px; height: 75px; border-radius: 8px; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0;">
          ${poster ? `<img src="${poster}" style="width:100%; height:100%; object-fit:cover;">` : `<div style="color:#fff; font-size: 20px;">🎥</div>`}
          <div style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.75); color: #fff; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px;">▶</div>
        </div>
      `;
    } else {
      typeBadgeHtml = `
        <span class="badge badge-neutral" style="font-size: 11px;">📷 Fotografia</span>
        <span class="badge badge-neutral" style="font-size: 11px;">${isVertical ? '📱 Vertical' : '🖥️ Horizontal'}</span>
      `;
      thumbHtml = `
        <div style="width: 58px; height: 75px; border-radius: 8px; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <img src="${item.midiaUrl || item.midia_url}" style="width:100%; height:100%; object-fit:cover;">
        </div>
      `;
    }

    row.innerHTML = `
      ${thumbHtml}
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 700; font-size: 15px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.titulo}</div>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px; flex-wrap: wrap;">
          ${typeBadgeHtml}
          <span class="badge badge-neutral" style="font-size: 11px;">${item.categoria || 'Geral'}</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button type="button" class="btn btn-outline btn-sm" onclick="openProjectDetails('${item.id}')" title="Assistir ou Inspecionar">
          ${isVideo ? 'Assistir' : 'Ver'}
        </button>
        <button type="button" class="btn btn-danger btn-sm" onclick="deletePortfolioItem('${item.id}')" title="Excluir Mídia">
          Excluir
        </button>
      </div>
    `;
    container.appendChild(row);
  });
}

// ----------------------------------------------------------------------------
// 6. MODAL DE CADASTRO EMBUTIDO (COM SUPORTE DEDICADO AO GOOGLE DRIVE)
// ----------------------------------------------------------------------------

let currentSelectedFile = null;
let currentGeneratedPoster = null;

function openNewMediaModal(initialType = 'gdrive') {
  const form = document.getElementById('photoForm');
  if (form) form.reset();

  currentSelectedFile = null;
  currentGeneratedPoster = null;

  const base64Input = document.getElementById('mediaBase64');
  if (base64Input) base64Input.value = '';

  const posterBase64Input = document.getElementById('mediaPosterBase64');
  if (posterBase64Input) posterBase64Input.value = '';

  const progress = document.getElementById('mediaUploadProgress');
  if (progress) progress.style.display = 'none';

  selectMediaType(initialType);
  clearSelectedMedia();

  openModal('photoModal');
}

function openNewPhotoModal() {
  openNewMediaModal('gdrive');
}

function selectMediaType(tipo) {
  const mediaTipoInput = document.getElementById('mediaTipo');
  if (mediaTipoInput) mediaTipoInput.value = (tipo === 'foto') ? 'foto' : 'video';

  const tabGdrive = document.getElementById('tabSelectGdrive');
  const tabVideo = document.getElementById('tabSelectVideo');
  const tabFoto = document.getElementById('tabSelectFoto');

  const gdriveBox = document.getElementById('gdriveSourceOptions');
  const otherVideoBox = document.getElementById('videoSourceOptions');
  const fotoBox = document.getElementById('fotoSourceOptions');

  // Remove active de todas as abas
  if (tabGdrive) tabGdrive.classList.remove('active');
  if (tabVideo) tabVideo.classList.remove('active');
  if (tabFoto) tabFoto.classList.remove('active');

  // Esconde todas as seções
  if (gdriveBox) gdriveBox.style.display = 'none';
  if (otherVideoBox) otherVideoBox.style.display = 'none';
  if (fotoBox) fotoBox.style.display = 'none';

  if (tipo === 'gdrive') {
    if (tabGdrive) tabGdrive.classList.add('active');
    if (gdriveBox) gdriveBox.style.display = 'block';
  } else if (tipo === 'video' || tipo === 'outro_video') {
    if (tabVideo) tabVideo.classList.add('active');
    if (otherVideoBox) otherVideoBox.style.display = 'block';
    selectVideoSource('url');
  } else {
    if (tabFoto) tabFoto.classList.add('active');
    if (fotoBox) fotoBox.style.display = 'block';
  }
}

function selectVideoSource(source) {
  const pillUrl = document.getElementById('pillSourceUrl');
  const pillUpload = document.getElementById('pillSourceUpload');
  const urlBox = document.getElementById('videoSourceUrlBox');
  const uploadBox = document.getElementById('videoSourceUploadBox');

  if (source === 'url') {
    if (pillUrl) pillUrl.classList.add('active');
    if (pillUpload) pillUpload.classList.remove('active');
    if (urlBox) urlBox.style.display = 'block';
    if (uploadBox) uploadBox.style.display = 'none';
  } else {
    if (pillUrl) pillUrl.classList.remove('active');
    if (pillUpload) pillUpload.classList.add('active');
    if (urlBox) urlBox.style.display = 'none';
    if (uploadBox) uploadBox.style.display = 'block';
  }
}

// Detecção e preview automático ao colar link do Google Drive
function handleGdriveUrlChange(url) {
  const feedback = document.getElementById('gdriveUrlFeedback');
  const previewContainer = document.getElementById('gdrivePreviewContainer');
  const previewSlot = document.getElementById('gdrivePreviewSlot');

  if (!url || !url.trim()) {
    if (feedback) feedback.style.display = 'none';
    if (previewContainer) previewContainer.style.display = 'none';
    return;
  }

  const driveId = extractGoogleDriveId(url);

  if (driveId) {
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.background = '#ecfdf5';
      feedback.style.color = '#065f46';
      feedback.style.border = '1px solid #a7f3d0';
      feedback.innerHTML = `<strong>✓ Vídeo do Google Drive Reconhecido:</strong> ID do Arquivo: <code>${driveId}</code>`;
    }

    const embedUrl = 'https://drive.google.com/file/d/' + driveId + '/preview';
    const isVertical = document.getElementById('gdriveProporcaoVertical') && document.getElementById('gdriveProporcaoVertical').checked;

    if (previewContainer && previewSlot) {
      previewContainer.style.display = 'block';
      previewSlot.innerHTML = `
        <div style="position: relative; width: 100%; ${isVertical ? 'aspect-ratio: 9/16; max-height: 320px; max-width: 240px; margin: 0 auto;' : 'aspect-ratio: 16/9; max-height: 240px;'} overflow: hidden; border-radius: 8px; background: #000;">
          <iframe src="${embedUrl}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
        </div>
      `;
    }
  } else {
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.background = '#fffbeb';
      feedback.style.color = '#92400e';
      feedback.style.border = '1px solid #fde68a';
      feedback.innerHTML = `Link não reconhecido. Certifique-se de colar um link no formato: <code>https://drive.google.com/file/d/SEU_ID/view...</code>`;
    }
    if (previewContainer) previewContainer.style.display = 'none';
  }
}

function updateGdriveProportionPreview() {
  const gdriveInput = document.getElementById('gdriveUrlInput');
  if (gdriveInput && gdriveInput.value) {
    handleGdriveUrlChange(gdriveInput.value);
  }
}

// Detecção e preview de YouTube / Shorts / Vimeo / MP4
function handleVideoUrlChange(url) {
  const feedback = document.getElementById('videoUrlFeedback');
  const previewContainer = document.getElementById('mediaPreviewContainer');
  const previewSlot = document.getElementById('mediaPreviewSlot');
  const posterContainer = document.getElementById('videoPosterContainer');
  const posterSlot = document.getElementById('posterMiniPreview');
  const posterNote = document.getElementById('posterSourceNote');

  if (!url || !url.trim()) {
    if (feedback) feedback.style.display = 'none';
    if (previewContainer) previewContainer.style.display = 'none';
    return;
  }

  const vSource = parseVideoSource(url);

  if (vSource.type === 'youtube') {
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.background = '#ecfdf5';
      feedback.style.color = '#065f46';
      feedback.style.border = '1px solid #a7f3d0';
      feedback.innerHTML = `<strong>✓ Vídeo do YouTube Identificado:</strong> ID: <code>${vSource.id}</code> ${vSource.isShorts ? '(Formato Shorts Vertical)' : ''}`;
    }

    if (previewContainer && previewSlot) {
      previewContainer.style.display = 'block';
      previewSlot.innerHTML = `
        <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; background: #000;">
          <iframe src="${vSource.embedUrl}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
        </div>
      `;
    }

    if (posterContainer && posterSlot) {
      posterContainer.style.display = 'block';
      posterSlot.innerHTML = `<img src="${vSource.posterUrl}" style="width:100%; height:100%; object-fit:cover;">`;
      if (posterNote) posterNote.textContent = 'Capa em alta resolução capturada do YouTube';
    }

    const posterField = document.getElementById('mediaPosterBase64');
    if (posterField) posterField.value = vSource.posterUrl;

  } else if (vSource.type === 'vimeo') {
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.background = '#ecfdf5';
      feedback.style.color = '#065f46';
      feedback.style.border = '1px solid #a7f3d0';
      feedback.innerHTML = `<strong>✓ Vídeo do Vimeo Identificado:</strong> ID: <code>${vSource.id}</code>`;
    }
    if (previewContainer && previewSlot) {
      previewContainer.style.display = 'block';
      previewSlot.innerHTML = `
        <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; background: #000;">
          <iframe src="${vSource.embedUrl}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
        </div>
      `;
    }
    if (posterContainer && posterSlot) {
      posterContainer.style.display = 'block';
      posterSlot.innerHTML = `<img src="${vSource.posterUrl}" style="width:100%; height:100%; object-fit:cover;">`;
      if (posterNote) posterNote.textContent = 'Capa obtida do Vimeo';
    }
    const posterField = document.getElementById('mediaPosterBase64');
    if (posterField) posterField.value = vSource.posterUrl;

  } else if (vSource.type === 'direct') {
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.background = '#f0fdf4';
      feedback.style.color = '#15803d';
      feedback.style.border = '1px solid #bbf7d0';
      feedback.innerHTML = `<strong>✓ Link direto de vídeo reconhecido</strong>`;
    }
    if (previewContainer && previewSlot) {
      previewContainer.style.display = 'block';
      previewSlot.innerHTML = `
        <video src="${vSource.originalUrl}" controls playsinline style="width: 100%; max-height: 280px; object-fit: contain; background: #000; border-radius: 8px;"></video>
      `;
    }
    if (posterContainer) posterContainer.style.display = 'none';
  } else {
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.background = '#fffbeb';
      feedback.style.color = '#92400e';
      feedback.style.border = '1px solid #fde68a';
      feedback.innerHTML = `Insira um link do YouTube, YouTube Shorts, Vimeo ou link direto .mp4`;
    }
    if (previewContainer) previewContainer.style.display = 'none';
    if (posterContainer) posterContainer.style.display = 'none';
  }
}

// Upload direto de arquivo com extração automática de poster
async function previewMediaFile(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    currentSelectedFile = file;

    const previewContainer = document.getElementById('mediaPreviewContainer');
    const previewSlot = document.getElementById('mediaPreviewSlot');
    const previewLabel = document.getElementById('mediaPreviewLabel');
    const posterContainer = document.getElementById('videoPosterContainer');
    const posterSlot = document.getElementById('posterMiniPreview');
    const posterNote = document.getElementById('posterSourceNote');

    if (previewContainer) previewContainer.style.display = 'block';
    if (previewLabel) {
      previewLabel.textContent = `Arquivo Selecionado: ${file.name} (${formatBytes(file.size)})`;
    }

    const objectUrl = URL.createObjectURL(file);
    if (previewSlot) {
      previewSlot.innerHTML = `
        <video src="${objectUrl}" controls playsinline style="width: 100%; max-height: 280px; object-fit: contain; background: #000; border-radius: 8px;"></video>
      `;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast('Vídeo grande selecionado (' + formatBytes(file.size) + '). Para vídeos longos, recomendamos usar o link do Google Drive.', 'info');
    }

    if (posterContainer) {
      posterContainer.style.display = 'block';
      if (posterSlot) posterSlot.innerHTML = `<span style="color:#64748b; font-size:10px;">Gerando...</span>`;
    }

    const posterDataUrl = await extractVideoThumbnail(file);
    if (posterDataUrl) {
      currentGeneratedPoster = posterDataUrl;
      const posterField = document.getElementById('mediaPosterBase64');
      if (posterField) posterField.value = posterDataUrl;
      if (posterSlot) {
        posterSlot.innerHTML = `<img src="${posterDataUrl}" style="width:100%; height:100%; object-fit:cover;">`;
      }
      if (posterNote) {
        posterNote.textContent = '✓ Foto de capa extraída automaticamente do vídeo';
      }
    } else {
      if (posterNote) {
        posterNote.textContent = 'Capa padrão será utilizada';
      }
    }
  }
}

function previewFotoFile(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    currentSelectedFile = file;

    const container = document.getElementById('fotoPreviewContainer');
    const slot = document.getElementById('fotoPreviewSlot');
    if (container) container.style.display = 'block';

    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Input = document.getElementById('mediaBase64');
      if (base64Input) base64Input.value = e.target.result;
      if (slot) {
        slot.innerHTML = `<img src="${e.target.result}" style="max-height: 240px; border-radius: 8px; object-fit: contain; max-width: 100%; border: 1px solid var(--border-soft);">`;
      }
    };
    reader.readAsDataURL(file);
  }
}

function handleFotoUrlChange(url) {
  const container = document.getElementById('fotoPreviewContainer');
  const slot = document.getElementById('fotoPreviewSlot');
  if (!url || !url.trim()) {
    if (container) container.style.display = 'none';
    return;
  }
  if (container) container.style.display = 'block';
  if (slot) {
    slot.innerHTML = `<img src="${url.trim()}" style="max-height: 240px; border-radius: 8px; object-fit: contain; max-width: 100%; border: 1px solid var(--border-soft);" onerror="this.style.display='none'">`;
  }
}

function clearSelectedMedia() {
  currentSelectedFile = null;
  currentGeneratedPoster = null;

  const gdriveInput = document.getElementById('gdriveUrlInput');
  if (gdriveInput) gdriveInput.value = '';

  const gdrivePosterInput = document.getElementById('gdrivePosterInput');
  if (gdrivePosterInput) gdrivePosterInput.value = '';

  const fileInput = document.getElementById('mediaFileInput');
  if (fileInput) fileInput.value = '';

  const fotoInput = document.getElementById('fotoFileInput');
  if (fotoInput) fotoInput.value = '';

  const urlInput = document.getElementById('mediaUrlInput');
  if (urlInput) urlInput.value = '';

  const fotoUrlInput = document.getElementById('fotoUrlInput');
  if (fotoUrlInput) fotoUrlInput.value = '';

  const base64Input = document.getElementById('mediaBase64');
  if (base64Input) base64Input.value = '';

  const posterBase64Input = document.getElementById('mediaPosterBase64');
  if (posterBase64Input) posterBase64Input.value = '';

  const gdrivePreview = document.getElementById('gdrivePreviewContainer');
  if (gdrivePreview) gdrivePreview.style.display = 'none';

  const previewContainer = document.getElementById('mediaPreviewContainer');
  if (previewContainer) previewContainer.style.display = 'none';

  const previewSlot = document.getElementById('mediaPreviewSlot');
  if (previewSlot) previewSlot.innerHTML = '';

  const fotoPreviewContainer = document.getElementById('fotoPreviewContainer');
  if (fotoPreviewContainer) fotoPreviewContainer.style.display = 'none';

  const gdriveFeedback = document.getElementById('gdriveUrlFeedback');
  if (gdriveFeedback) gdriveFeedback.style.display = 'none';

  const videoFeedback = document.getElementById('videoUrlFeedback');
  if (videoFeedback) videoFeedback.style.display = 'none';
}

// ----------------------------------------------------------------------------
// 7. SALVAR MÍDIA (GOOGLE DRIVE, YOUTUBE OU ARQUIVO)
// ----------------------------------------------------------------------------

async function handleSaveMedia(e) {
  e.preventDefault();

  const titulo = document.getElementById('photoTitulo').value.trim();
  const cat = document.getElementById('photoCategoria').value;
  const desc = document.getElementById('photoDesc').value.trim();
  const tipoMidia = document.getElementById('mediaTipo').value || 'video';
  const tipoRegEl = document.getElementById('photoTipoRegistro');
  const tipoRegistro = tipoRegEl ? tipoRegEl.value : '';

  let finalMediaUrl = '';
  let finalPosterUrl = (document.getElementById('mediaPosterBase64') ? document.getElementById('mediaPosterBase64').value : '') || '';
  let finalProporcao = 'horizontal';
  let gdriveId = '';
  let gdriveLink = '';

  const submitBtn = document.getElementById('btnSubmitMedia');
  const progressBox = document.getElementById('mediaUploadProgress');
  const progressBar = document.getElementById('uploadProgressBar');
  const progressText = document.getElementById('uploadProgressText');
  const progressPercent = document.getElementById('uploadProgressPercent');

  const setProgress = (text, percent) => {
    if (progressBox) progressBox.style.display = 'block';
    if (progressText) progressText.textContent = text;
    if (progressPercent) progressPercent.textContent = `${percent}%`;
    if (progressBar) progressBar.style.width = `${percent}%`;
  };

  // 1. Google Drive
  const activeGdriveTab = document.getElementById('tabSelectGdrive') && document.getElementById('tabSelectGdrive').classList.contains('active');
  if (activeGdriveTab) {
    const rawGdriveUrl = document.getElementById('gdriveUrlInput') ? document.getElementById('gdriveUrlInput').value.trim() : '';
    gdriveId = extractGoogleDriveId(rawGdriveUrl);

    if (!gdriveId) {
      showToast('Por favor, informe um link válido do Google Drive.', 'warning');
      return;
    }

    finalMediaUrl = 'https://drive.google.com/file/d/' + gdriveId + '/preview';
    gdriveLink = 'https://drive.google.com/file/d/' + gdriveId + '/view?usp=sharing';

    const propVertical = document.getElementById('gdriveProporcaoVertical') && document.getElementById('gdriveProporcaoVertical').checked;
    finalProporcao = propVertical ? 'vertical' : 'horizontal';

    const customPoster = document.getElementById('gdrivePosterInput') ? document.getElementById('gdrivePosterInput').value.trim() : '';
    if (customPoster) {
      finalPosterUrl = customPoster;
    } else if (!finalPosterUrl) {
      finalPosterUrl = 'https://lh3.googleusercontent.com/u/0/d/' + gdriveId;
    }
  } 
  // 2. Outros Vídeos (YouTube / MP4)
  else if (tipoMidia === 'video') {
    const videoUrl = document.getElementById('mediaUrlInput') ? document.getElementById('mediaUrlInput').value.trim() : '';
    if (videoUrl) {
      finalMediaUrl = videoUrl;
      const vSource = parseVideoSource(videoUrl);
      if (!finalPosterUrl && vSource.posterUrl) {
        finalPosterUrl = vSource.posterUrl;
      }
      if (vSource.isShorts) {
        finalProporcao = 'vertical';
      } else {
        const propVertical = document.getElementById('videoProporcaoVertical') && document.getElementById('videoProporcaoVertical').checked;
        finalProporcao = propVertical ? 'vertical' : 'horizontal';
      }
    }
  } 
  // 3. Foto
  else {
    const fotoUrl = document.getElementById('fotoUrlInput') ? document.getElementById('fotoUrlInput').value.trim() : '';
    const fotoBase64 = document.getElementById('mediaBase64') ? document.getElementById('mediaBase64').value : '';
    finalMediaUrl = fotoUrl || fotoBase64;
    finalPosterUrl = finalMediaUrl;

    const propVertical = document.getElementById('fotoProporcaoVertical') && document.getElementById('fotoProporcaoVertical').checked;
    finalProporcao = propVertical ? 'vertical' : 'horizontal';
  }

  if (!finalMediaUrl && !currentSelectedFile) {
    showToast('Por favor, informe o link do Google Drive / vídeo ou selecione um arquivo.', 'warning');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publicando projeto...';
  }

  try {
    // Upload de arquivo local para Supabase Storage se houver arquivo físico selecionado
    if (currentSelectedFile && typeof sbClient !== 'undefined' && sbClient && sbClient.storage) {
      setProgress('Enviando mídia para o servidor...', 30);

      const isVid = currentSelectedFile.type.startsWith('video');
      const fileExt = currentSelectedFile.name.split('.').pop() || (isVid ? 'mp4' : 'jpg');
      const cleanFileName = `midia_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `uploads/${isVid ? 'videos' : 'fotos'}/${cleanFileName}`;

      const { data: uploadRes, error: uploadErr } = await sbClient.storage
        .from('portfolio')
        .upload(filePath, currentSelectedFile, { cacheControl: '3600', upsert: true });

      if (!uploadErr && uploadRes) {
        const { data: pubData } = sbClient.storage.from('portfolio').getPublicUrl(filePath);
        if (pubData && pubData.publicUrl) {
          finalMediaUrl = pubData.publicUrl;
        }
      }

      if (currentGeneratedPoster && currentGeneratedPoster.startsWith('data:image')) {
        setProgress('Otimizando foto de capa do vídeo...', 70);
        try {
          const res = await fetch(currentGeneratedPoster);
          const blob = await res.blob();
          const posterPath = `uploads/posters/poster_${Date.now()}.jpg`;
          const { data: pUploadRes } = await sbClient.storage
            .from('portfolio')
            .upload(posterPath, blob, { contentType: 'image/jpeg', upsert: true });

          if (pUploadRes) {
            const { data: pPubData } = sbClient.storage.from('portfolio').getPublicUrl(posterPath);
            if (pPubData && pPubData.publicUrl) {
              finalPosterUrl = pPubData.publicUrl;
            }
          }
        } catch (ePoster) {
          console.warn('Erro ao salvar poster na nuvem:', ePoster);
        }
      }
    } else if (currentSelectedFile && !finalMediaUrl) {
      setProgress('Processando mídia localmente...', 50);
      const isVid = currentSelectedFile.type.startsWith('video');
      if (isVid && currentSelectedFile.size > 4 * 1024 * 1024) {
        finalMediaUrl = URL.createObjectURL(currentSelectedFile);
      } else {
        finalMediaUrl = await new Promise((res) => {
          const reader = new FileReader();
          reader.onload = e => res(e.target.result);
          reader.readAsDataURL(currentSelectedFile);
        });
      }
      if (!finalPosterUrl && currentGeneratedPoster) {
        finalPosterUrl = currentGeneratedPoster;
      }
    }

    setProgress('Gravando dados do projeto...', 90);

    const newMedia = {
      id: Date.now(),
      tipoMidia: activeGdriveTab ? 'video' : tipoMidia,
      titulo: titulo,
      categoria: cat,
      descricao: desc,
      midiaUrl: finalMediaUrl,
      posterUrl: finalPosterUrl,
      proporcao: finalProporcao,
      gdriveId: gdriveId,
      gdriveLink: gdriveLink,
      tipoRegistro: tipoRegistro
    };

    if (typeof sbClient !== 'undefined' && sbClient) {
      try {
        const { data: resData, error: mErr } = await safeDbInsert('portfolio', {
          tipo_midia: newMedia.tipoMidia,
          titulo: titulo,
          categoria: cat,
          descricao: desc,
          midia_url: finalMediaUrl,
          poster_url: finalPosterUrl,
          proporcao: finalProporcao,
          gdrive_id: gdriveId
        });

        if (!mErr && resData && resData[0]) {
          newMedia.id = resData[0].id;
        }
      } catch (e) {
        console.warn('Erro ao inserir no Supabase:', e);
      }
    }

    db.portfolio.unshift(newMedia);
    saveCacheDB('portfolio', db.portfolio);

    setProgress('Publicado com sucesso!', 100);

    setTimeout(() => {
      closeModal('photoModal');
      showToast(newMedia.tipoMidia === 'video' ? 'Vídeo publicado no portfólio com sucesso!' : 'Fotografia publicada no portfólio com sucesso!', 'success');
      renderAdminPortfolio(db.portfolio);
      renderPublicCatalog();
    }, 400);

  } catch (err) {
    console.error('Erro ao salvar projeto:', err);
    showToast('Ocorreu um erro ao processar o projeto. Tente novamente.', 'danger');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Publicar no Catálogo';
    }
  }
}

// ----------------------------------------------------------------------------
// 8. EXCLUIR MÍDIA DO PORTFÓLIO
// ----------------------------------------------------------------------------

async function deletePortfolioItem(id) {
  const allProjects = getAllPortfolioProjects();
  const item = allProjects.find(p => String(p.id) === String(id));
  const isVid = item ? isVideoMedia(item) : false;

  const confirmado = await customConfirm(
    `Deseja realmente remover este ${isVid ? 'vídeo' : 'projeto'} do catálogo público?`, 
    isVid ? 'Remover Vídeo do Portfólio' : 'Remover Projeto', 
    { danger: true, confirmText: 'Sim, Remover' }
  );
  if (!confirmado) return;

  db.portfolio = db.portfolio.filter(p => String(p.id) !== String(id));
  saveCacheDB('portfolio', db.portfolio);
  showToast(isVid ? 'Vídeo removido do catálogo.' : 'Projeto removido do catálogo.', 'info');
  renderAdminPortfolio(db.portfolio);
  renderPublicCatalog();

  if (typeof sbClient !== 'undefined' && sbClient) {
    try {
      await sbClient.from('portfolio').delete().eq('id', id);
    } catch (e) {
      console.error('Erro ao excluir no Supabase:', e);
    }
  }
}


// Sincroniza todas as mídias da pasta oficial do Google Drive
function syncGoogleDriveFolderMedia() {
  const seeds = (typeof DEFAULT_REAL_PORTFOLIO !== 'undefined' ? DEFAULT_REAL_PORTFOLIO : []);
  if (seeds.length === 0) return;

  const existingGdriveIds = new Set(seeds.map(p => p.gdriveId).filter(Boolean));
  const userAddedItems = (db.portfolio || []).filter(p => !p.gdriveId || !existingGdriveIds.has(p.gdriveId));

  db.portfolio = [...seeds, ...userAddedItems];
  saveCacheDB('portfolio', db.portfolio);
  showToast('Todas as 16 mídias da pasta do Google Drive foram sincronizadas no catálogo!', 'success');
  renderAdminPortfolio(db.portfolio);
  renderPublicCatalog();
}

// ----------------------------------------------------------------------------
// EXPORTS GLOBAIS
// ----------------------------------------------------------------------------
window.extractGoogleDriveId = extractGoogleDriveId;
window.parseVideoSource = parseVideoSource;
window.extractYouTubeId = extractYouTubeId;
window.extractVimeoId = extractVimeoId;
window.extractVideoThumbnail = extractVideoThumbnail;
window.isVideoMedia = isVideoMedia;
window.getAllPortfolioProjects = getAllPortfolioProjects;
window.setPortfolioFormatFilter = setPortfolioFormatFilter;
window.renderPublicCatalog = renderPublicCatalog;
window.openProjectDetails = openProjectDetails;
window.closeProjectDetailsModal = closeProjectDetailsModal;
window.prefillBudget = prefillBudget;
window.renderAdminPortfolio = renderAdminPortfolio;
window.openNewMediaModal = openNewMediaModal;
window.openNewPhotoModal = openNewPhotoModal;
window.selectMediaType = selectMediaType;
window.selectVideoSource = selectVideoSource;
window.handleGdriveUrlChange = handleGdriveUrlChange;
window.updateGdriveProportionPreview = updateGdriveProportionPreview;
window.handleVideoUrlChange = handleVideoUrlChange;
window.previewMediaFile = previewMediaFile;
window.previewFotoFile = previewFotoFile;
window.handleFotoUrlChange = handleFotoUrlChange;
window.clearSelectedMedia = clearSelectedMedia;
window.handleSaveMedia = handleSaveMedia;
window.deletePortfolioItem = deletePortfolioItem;

window.syncGoogleDriveFolderMedia = syncGoogleDriveFolderMedia;
