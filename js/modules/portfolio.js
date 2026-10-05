// ============================================================================
// MÓDULO DE PORTFÓLIO & GALERIA ARQUITETÔNICA (REFATORADO)
// DK Revestimentos - Ateliê de Marcenaria & Revestimentos
// Suporte Avançado a Vídeos (YouTube, Shorts, Vimeo, MP4 Direto, Upload com Poster Automático)
// ============================================================================

// ----------------------------------------------------------------------------
// PARSERS E UTILITÁRIOS INTELIGENTES DE VÍDEO
// ----------------------------------------------------------------------------

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

  // YouTube / YouTube Shorts
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

  // Vimeo
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

  // Vídeo Nativo / Direto (MP4, MOV, WebM, Cloud Storage, Blob, Base64)
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
    url.includes('vimeo.com')
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
// HIERARQUIA VISUAL E ORDENAÇÃO DE PROJETOS
// ----------------------------------------------------------------------------

function getProjectHierarchyScore(item) {
  let score = 70;
  const isVideo = isVideoMedia(item);
  const tipoReg = (item.tipoRegistro || '').toLowerCase();
  const text = ((item.titulo || '') + ' ' + (item.descricao || '') + ' ' + (item.categoria || '') + ' ' + tipoReg).toLowerCase();

  // 1. Ambientes finalizados (Vídeos e fotos de ambientes prontos são o ápice para conversão)
  if (tipoReg === 'ambiente_finalizado' || text.includes('finalizado') || text.includes('concluído') || text.includes('concluido')) {
    return isVideo ? 105 : 100;
  }

  // 2. Fotos amplas e tours pelo espaço
  if (tipoReg === 'foto_ampla' || text.includes('amplo') || text.includes('geral') || text.includes('tour') || text.includes('visão')) {
    return isVideo ? 90 : 85;
  }

  // 3. Detalhes de acabamento e marcenaria fina
  if (tipoReg === 'detalhe_acabamento' || text.includes('detalhe') || text.includes('puxador') || text.includes('ripa') || text.includes('iluminação')) {
    return 65;
  }

  // 4. Processo / fabricação / oficina
  if (tipoReg === 'processo_fabricacao' || text.includes('processo') || text.includes('oficina') || text.includes('usinagem')) {
    return 40;
  }

  return score;
}

function getAllPortfolioProjects() {
  const items = (db.portfolio || []).map(item => ({
    id: item.id,
    titulo: item.titulo || 'Ambiente Sob Medida',
    categoria: item.categoria || 'Marcenaria Sob Medida',
    ambiente: item.categoria || 'Ambiente Personalizado',
    descricao: item.descricao || '',
    midiaUrl: item.midiaUrl || item.midia_url || '',
    posterUrl: item.posterUrl || item.poster_url || '',
    tipoMidia: isVideoMedia(item) ? 'video' : 'foto',
    tipoRegistro: item.tipoRegistro || ''
  }));

  // Ordena por hierarquia visual e recência
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

function filterPortfolio(categoria, btnEl) {
  renderPublicCatalog();
}

// ----------------------------------------------------------------------------
// RENDERIZAÇÃO DO CATÁLOGO PÚBLICO (COM SUPORTE REFINADO A VÍDEOS)
// ----------------------------------------------------------------------------

function renderPublicCatalog() {
  const container = document.getElementById('portfolioCatalog');
  if (!container) return;
  container.innerHTML = '';

  const allProjects = getAllPortfolioProjects();

  if (allProjects.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 24px; background: #ffffff; border: 1px solid var(--border-soft); border-radius: var(--radius); box-shadow: var(--shadow-subtle);">
        <div style="width: 52px; height: 52px; border-radius: 12px; background: rgba(138, 79, 38, 0.08); color: var(--wood-primary); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <h3 style="font-size: 19px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Catálogo de Obras em Atualização</h3>
        <p style="font-size: 14.5px; color: var(--text-muted); max-width: 520px; margin: 0 auto 24px auto; line-height: 1.65;">
          Estamos selecionando e publicando as fotografias e vídeos das obras mais recentes da DK Revestimentos. Para receber fotos de projetos concluídos ou conversar sobre seu espaço, entre em contato direto.
        </p>
        <a href="#contato" class="btn btn-whatsapp" style="font-weight: 700; padding: 12px 26px;">
          Solicitar Fotos de Projetos no WhatsApp
        </a>
      </div>
    `;
    return;
  }

  allProjects.forEach(item => {
    const isVideo = isVideoMedia(item);
    const card = document.createElement('div');
    card.className = 'project-card';

    let mediaTag = '';
    let badgeText = '▶ VÍDEO';

    if (isVideo) {
      const vSource = parseVideoSource(item.midiaUrl);
      const posterImg = item.posterUrl || vSource.posterUrl || '';

      if (vSource.type === 'youtube' && vSource.isShorts) {
        badgeText = '▶ SHORTS';
      } else if (vSource.type === 'youtube') {
        badgeText = '▶ YOUTUBE';
      }

      mediaTag = `
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
      `;
    } else {
      mediaTag = `
        <img src="${item.midiaUrl}" alt="${item.titulo}" class="project-media" loading="lazy">
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

    // Preview sutil de vídeo MP4 direto no hover (desktop)
    if (isVideo) {
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
// MODAL LIGHTBOX / PLAYER DE PROJETO (FOTOS E VÍDEOS YOUTUBE / VIMEO / MP4)
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

  if (specsEl) {
    specsEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-soft);">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); display: block;">Categoria</span>
          <strong style="font-size: 13.5px; color: #0f172a;">${project.categoria}</strong>
        </div>
        <div style="background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-soft);">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); display: block;">Formato</span>
          <strong style="font-size: 13.5px; color: #0f172a;">${isVideo ? '🎥 Vídeo do Projeto' : '📷 Fotografia em Alta'}</strong>
        </div>
      </div>
    `;
  }

  if (mediaContainer) {
    mediaContainer.innerHTML = '';

    if (isVideo) {
      const vSource = parseVideoSource(project.midiaUrl);

      if (vSource.type === 'youtube') {
        const isShorts = vSource.isShorts;
        mediaContainer.innerHTML = `
          <div style="position: relative; width: 100%; ${isShorts ? 'max-width: 360px; margin: 0 auto; aspect-ratio: 9/16;' : 'padding-bottom: 56.25%; height: 0;'} overflow: hidden; border-radius: 12px; background: #000;">
            <iframe src="${vSource.embedUrl}" 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen>
            </iframe>
          </div>
        `;
      } else if (vSource.type === 'vimeo') {
        mediaContainer.innerHTML = `
          <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; background: #000;">
            <iframe src="${vSource.embedUrl}" 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowfullscreen>
            </iframe>
          </div>
        `;
      } else {
        mediaContainer.innerHTML = `
          <video src="${project.midiaUrl}" 
                 ${project.posterUrl ? `poster="${project.posterUrl}"` : ''} 
                 controls autoplay playsinline 
                 style="width: 100%; max-height: 520px; object-fit: contain; background: #000; border-radius: 12px;">
          </video>
        `;
      }
    } else {
      mediaContainer.innerHTML = `
        <img src="${project.midiaUrl}" alt="${project.titulo}" style="width: 100%; max-height: 520px; object-fit: contain; background: #000; border-radius: 12px;">
      `;
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
// GESTÃO NO PAINEL ADMINISTRATIVO (ADMINISTRAÇÃO DO CATÁLOGO DE MÍDIAS)
// ----------------------------------------------------------------------------

function renderAdminPortfolio(portfolio) {
  const container = document.getElementById('adminPortfolioList');
  if (!container) return;
  container.innerHTML = '';

  if (!portfolio || portfolio.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-muted); background: #fff; border-radius: var(--radius); border: 1px dashed var(--border-soft);">
        <div style="font-size: 32px; margin-bottom: 8px;">🎥</div>
        <p style="font-weight: 700; color: #0f172a; margin-bottom: 4px; font-size: 15px;">Nenhum vídeo ou foto cadastrado ainda.</p>
        <p style="font-size: 13px; max-width: 440px; margin: 0 auto 16px auto;">Publique vídeos dos ambientes concluídos (YouTube, Shorts ou upload direto) ou fotografias de alta qualidade.</p>
        <button type="button" class="btn btn-primary btn-sm" onclick="openNewMediaModal('video')">+ Adicionar Primeiro Vídeo</button>
      </div>
    `;
    return;
  }

  portfolio.forEach(item => {
    const isVideo = isVideoMedia(item);
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
      if (vSource.type === 'youtube' && vSource.isShorts) platformLabel = 'YouTube Shorts';
      else if (vSource.type === 'youtube') platformLabel = 'YouTube';
      else if (vSource.type === 'vimeo') platformLabel = 'Vimeo';

      typeBadgeHtml = `<span class="badge badge-warning" style="font-size: 11px;">▶ ${platformLabel}</span>`;

      thumbHtml = `
        <div style="width: 60px; height: 75px; border-radius: 8px; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0;">
          ${poster ? `<img src="${poster}" style="width:100%; height:100%; object-fit:cover;">` : `<div style="color:#fff; font-size: 20px;">🎥</div>`}
          <div style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.75); color: #fff; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px;">▶</div>
        </div>
      `;
    } else {
      typeBadgeHtml = `<span class="badge badge-neutral" style="font-size: 11px;">📷 Fotografia</span>`;
      thumbHtml = `
        <div style="width: 60px; height: 75px; border-radius: 8px; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <img src="${item.midiaUrl || item.midia_url}" style="width:100%; height:100%; object-fit:cover;">
        </div>
      `;
    }

    row.innerHTML = `
      ${thumbHtml}
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 700; font-size: 15px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.titulo}</div>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
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
// MODAL DE CADASTRO AVANÇADO DE VÍDEOS E FOTOS
// ----------------------------------------------------------------------------

let currentSelectedFile = null;
let currentGeneratedPoster = null;

function openNewMediaModal(initialType = 'video') {
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
  selectVideoSource('url');
  clearSelectedMedia();

  openModal('photoModal');
}

// Mantido para compatibilidade
function openNewPhotoModal() {
  openNewMediaModal('video');
}

function selectMediaType(tipo) {
  const mediaTipoInput = document.getElementById('mediaTipo');
  if (mediaTipoInput) mediaTipoInput.value = tipo;

  const tabVideo = document.getElementById('tabSelectVideo');
  const tabFoto = document.getElementById('tabSelectFoto');
  const videoBox = document.getElementById('videoSourceOptions');
  const fotoBox = document.getElementById('fotoSourceOptions');

  if (tipo === 'video') {
    if (tabVideo) tabVideo.classList.add('active');
    if (tabFoto) tabFoto.classList.remove('active');
    if (videoBox) videoBox.style.display = 'block';
    if (fotoBox) fotoBox.style.display = 'none';
  } else {
    if (tabVideo) tabVideo.classList.remove('active');
    if (tabFoto) tabFoto.classList.add('active');
    if (videoBox) videoBox.style.display = 'none';
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

// Detecção e preview automático ao colar/digitar link de vídeo
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

// Upload direto de arquivo de vídeo com extração de thumbnail automática
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

    // Cria instantaneamente ObjectURL para player de teste imediato
    const objectUrl = URL.createObjectURL(file);
    if (previewSlot) {
      previewSlot.innerHTML = `
        <video src="${objectUrl}" controls playsinline style="width: 100%; max-height: 280px; object-fit: contain; background: #000; border-radius: 8px;"></video>
      `;
    }

    // Alerta de tamanho amigável
    if (file.size > 25 * 1024 * 1024) {
      showToast('Vídeo grande selecionado (' + formatBytes(file.size) + '). O upload pode levar alguns instantes.', 'info');
    }

    // Extrai frame para capa (poster) automaticamente
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
      document.getElementById('mediaBase64').value = e.target.result;
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

  const previewContainer = document.getElementById('mediaPreviewContainer');
  if (previewContainer) previewContainer.style.display = 'none';

  const previewSlot = document.getElementById('mediaPreviewSlot');
  if (previewSlot) previewSlot.innerHTML = '';

  const fotoPreviewContainer = document.getElementById('fotoPreviewContainer');
  if (fotoPreviewContainer) fotoPreviewContainer.style.display = 'none';

  const feedback = document.getElementById('videoUrlFeedback');
  if (feedback) feedback.style.display = 'none';
}

// ----------------------------------------------------------------------------
// SALVAR MÍDIA (VÍDEO OU FOTO) COM SUPORTE CLOUD & FALLBACK LOCAL
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

  if (tipoMidia === 'video') {
    const videoUrl = document.getElementById('mediaUrlInput') ? document.getElementById('mediaUrlInput').value.trim() : '';
    if (videoUrl) {
      finalMediaUrl = videoUrl;
      const vSource = parseVideoSource(videoUrl);
      if (!finalPosterUrl && vSource.posterUrl) {
        finalPosterUrl = vSource.posterUrl;
      }
    }
  } else {
    const fotoUrl = document.getElementById('fotoUrlInput') ? document.getElementById('fotoUrlInput').value.trim() : '';
    const fotoBase64 = document.getElementById('mediaBase64') ? document.getElementById('mediaBase64').value : '';
    finalMediaUrl = fotoUrl || fotoBase64;
  }

  if (!finalMediaUrl && !currentSelectedFile) {
    showToast('Por favor, informe a URL do vídeo/foto ou escolha um arquivo do dispositivo.', 'warning');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processando publicação...';
  }

  try {
    // Caso haja arquivo local para upload no Supabase Storage
    if (currentSelectedFile && typeof sbClient !== 'undefined' && sbClient && sbClient.storage) {
      setProgress('Enviando mídia para o servidor na nuvem...', 30);

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
      } else {
        console.warn('Supabase storage upload error:', uploadErr);
      }

      // Se houver poster gerado em base64, converte para blob e faz upload da capa
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
      // Fallback offline caso não haja Supabase Storage configurado
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
    }

    setProgress('Salvando registro no banco de dados...', 90);

    const newMedia = {
      id: Date.now(),
      tipoMidia: tipoMidia,
      titulo: titulo,
      categoria: cat,
      descricao: desc,
      midiaUrl: finalMediaUrl,
      posterUrl: finalPosterUrl,
      tipoRegistro: tipoRegistro
    };

    if (typeof sbClient !== 'undefined' && sbClient) {
      try {
        const { data: resData, error: mErr } = await safeDbInsert('portfolio', {
          tipo_midia: tipoMidia,
          titulo: titulo,
          categoria: cat,
          descricao: desc,
          midia_url: finalMediaUrl,
          poster_url: finalPosterUrl
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

    setProgress('Concluído!', 100);

    setTimeout(() => {
      closeModal('photoModal');
      showToast(tipoMidia === 'video' ? 'Vídeo publicado no portfólio com sucesso!' : 'Fotografia publicada no portfólio com sucesso!', 'success');
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
// EXCLUIR MÍDIA DO PORTFÓLIO
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

// ----------------------------------------------------------------------------
// EXPORTS GLOBAIS
// ----------------------------------------------------------------------------
window.parseVideoSource = parseVideoSource;
window.extractYouTubeId = extractYouTubeId;
window.extractVimeoId = extractVimeoId;
window.extractVideoThumbnail = extractVideoThumbnail;
window.isVideoMedia = isVideoMedia;
window.getAllPortfolioProjects = getAllPortfolioProjects;
window.renderPublicCatalog = renderPublicCatalog;
window.filterPortfolio = filterPortfolio;
window.openProjectDetails = openProjectDetails;
window.closeProjectDetailsModal = closeProjectDetailsModal;
window.prefillBudget = prefillBudget;
window.renderAdminPortfolio = renderAdminPortfolio;
window.openNewMediaModal = openNewMediaModal;
window.openNewPhotoModal = openNewPhotoModal;
window.selectMediaType = selectMediaType;
window.selectVideoSource = selectVideoSource;
window.handleVideoUrlChange = handleVideoUrlChange;
window.previewMediaFile = previewMediaFile;
window.previewFotoFile = previewFotoFile;
window.handleFotoUrlChange = handleFotoUrlChange;
window.clearSelectedMedia = clearSelectedMedia;
window.handleSaveMedia = handleSaveMedia;
window.deletePortfolioItem = deletePortfolioItem;
