// ============================================================================
// MÓDULO DE PORTFÓLIO & GALERIA ARQUITETÔNICA
// DK Revestimentos - Ateliê de Marcenaria & Revestimentos
// Exclusivamente com projetos e mídias reais cadastradas pelo marceneiro
// Priorização rigorosa: Ambientes Concluídos > Fotos Amplas > Detalhes > Processo > Vídeo
// ============================================================================

// Calcula a pontuação de hierarquia visual para colocar resultados finais no topo
function getProjectHierarchyScore(item) {
  let score = 90;
  const isVideo = isVideoMedia(item);
  const text = ((item.titulo || '') + ' ' + (item.descricao || '') + ' ' + (item.categoria || '') + ' ' + (item.tipoRegistro || '')).toLowerCase();

  // 5. Vídeos quando existirem
  if (isVideo) {
    return 20;
  }

  // 4. Processo / fabricação / oficina (depriorizado para o final da galeria)
  if (
    text.includes("processo") || 
    text.includes("fabrica") || 
    text.includes("oficina") || 
    text.includes("usinagem") || 
    text.includes("chapa") || 
    text.includes("produção") || 
    text.includes("producao") || 
    text.includes("bruto") || 
    text.includes("montagem em andamento")
  ) {
    return 40;
  }

  // 3. Detalhes construtivos e acabamento fino
  if (
    text.includes("detalhe") || 
    text.includes("puxador") || 
    text.includes("fechamento") || 
    text.includes("gaveta") || 
    text.includes("ripa") || 
    text.includes("textura") || 
    text.includes("encaixe")
  ) {
    return 60;
  }

  // 2. Fotos amplas do projeto
  if (
    text.includes("amplo") || 
    text.includes("geral") || 
    text.includes("integrado") || 
    text.includes("visão") || 
    text.includes("perspectiva")
  ) {
    return 80;
  }

  // 1. Ambientes finalizados e concluídos (prioridade absoluta para clientes exigentes)
  if (
    text.includes("finalizado") || 
    text.includes("concluído") || 
    text.includes("concluido") || 
    text.includes("sala") || 
    text.includes("living") || 
    text.includes("cozinha") || 
    text.includes("closet") || 
    text.includes("dormitório") || 
    text.includes("suite") || 
    text.includes("suíte") || 
    text.includes("varanda") || 
    text.includes("painel") || 
    text.includes("revestimento") || 
    text.includes("apartamento") || 
    text.includes("residencia") || 
    text.includes("residência") || 
    text.includes("ambiente")
  ) {
    return 100;
  }

  return score;
}

// Retorna projetos reais ordenados pela hierarquia de excelência visual
function getAllPortfolioProjects() {
  const items = (db.portfolio || []).map(item => ({
    id: item.id,
    titulo: item.titulo || "Ambiente Sob Medida",
    categoria: item.categoria || "Marcenaria Sob Medida",
    ambiente: item.categoria || "Ambiente Personalizado",
    descricao: item.descricao || "",
    midiaUrl: item.midiaUrl || "",
    tipoMidia: isVideoMedia(item) ? "video" : "foto",
    tipoRegistro: item.tipoRegistro || ""
  }));

  // Ordena para que ambientes prontos e fotos amplas apareçam sempre primeiro
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

function isVideoMedia(item) {
  if (!item) return false;
  if (item.tipoMidia === "video") return true;
  const url = (item.midiaUrl || "").toLowerCase();
  return (
    url.startsWith("data:video") || 
    url.endsWith(".mp4") || 
    url.endsWith(".mov") || 
    url.endsWith(".webm") || 
    url.includes("/video/") ||
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  );
}

// Mantido para compatibilidade sem poluir o layout
function filterPortfolio(categoria, btnEl) {
  renderPublicCatalog();
}

// Renderiza o catálogo editorial de projetos reais (sem filtros ou badges poluentes)
function renderPublicCatalog() {
  const container = document.getElementById("portfolioCatalog");
  if (!container) return;
  container.innerHTML = "";

  const allProjects = getAllPortfolioProjects();

  // Caso ainda não haja nenhum projeto real cadastrado no sistema
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
          Estamos selecionando e publicando as fotografias das obras mais recentes da DK Revestimentos. Para receber fotos de projetos concluídos ou conversar sobre seu espaço, entre em contato direto.
        </p>
        <a href="#contato" class="btn btn-whatsapp" style="font-weight: 700; padding: 12px 26px;">
          Solicitar Fotos de Projetos no WhatsApp
        </a>
      </div>
    `;
    return;
  }

  // Renderiza cada projeto real com fotografia limpa (sem badge de filtro na imagem)
  allProjects.forEach(item => {
    const isVideo = isVideoMedia(item);
    const card = document.createElement("div");
    card.className = "project-card";

    let mediaTag = "";
    if (isVideo) {
      mediaTag = `
        <video class="project-media" muted loop playsinline preload="metadata">
          <source src="${item.midiaUrl}">
        </video>
        <span class="project-media-type-badge">▶ VÍDEO</span>
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
            Inspecionar Projeto
          </button>
        </div>
      </div>

      <div class="project-info">
        <h3 class="project-title" onclick="openProjectDetails('${item.id}')" style="cursor: pointer;">${item.titulo}</h3>
        ${item.descricao ? `<p class="project-desc">${item.descricao}</p>` : ''}

        <div class="project-footer" style="margin-top: auto; padding-top: 14px;">
          <button type="button" class="btn-inspect-project" onclick="openProjectDetails('${item.id}')">
            <span>Ver Detalhes do Projeto</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="prefillBudget('${item.titulo}', '${item.categoria}')" style="font-size: 12px; padding: 6px 14px;">
            Consultar Semelhante
          </button>
        </div>
      </div>
    `;

    if (isVideo) {
      const vid = card.querySelector("video");
      if (vid) {
        card.addEventListener("mouseenter", () => vid.play().catch(() => {}));
        card.addEventListener("mouseleave", () => vid.pause());
      }
    }

    container.appendChild(card);
  });
}

// Modal Lightbox com Detalhes do Projeto Real
function openProjectDetails(projectId) {
  const allProjects = getAllPortfolioProjects();
  const project = allProjects.find(p => String(p.id) === String(projectId));
  if (!project) return;

  const modal = document.getElementById("projectDetailModal");
  if (!modal) return;

  const titleEl = document.getElementById("projectModalTitle");
  const mediaContainer = document.getElementById("projectModalMediaContainer");
  const locationEl = document.getElementById("projectModalLocation");
  const descEl = document.getElementById("projectModalDesc");
  const specsEl = document.getElementById("projectModalSpecs");
  const actionBtn = document.getElementById("projectModalActionBtn");

  if (titleEl) titleEl.textContent = project.titulo;
  if (locationEl) locationEl.textContent = project.categoria || "Marcenaria Sob Medida";
  if (descEl) descEl.textContent = project.descricao || "Projeto sob medida executado pela DK Revestimentos.";
  
  if (specsEl) {
    specsEl.innerHTML = `
      <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-soft);">
        <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); display: block;">Categoria</span>
        <strong style="font-size: 13.5px; color: #0f172a;">${project.categoria}</strong>
      </div>
    `;
  }

  if (mediaContainer) {
    const isVideo = isVideoMedia(project);
    if (isVideo) {
      mediaContainer.innerHTML = `
        <video src="${project.midiaUrl}" controls autoplay playsinline style="width: 100%; max-height: 490px; object-fit: contain; background: #000;"></video>
      `;
    } else {
      mediaContainer.innerHTML = `
        <img src="${project.midiaUrl}" alt="${project.titulo}" style="width: 100%; max-height: 490px; object-fit: contain; background: #000;">
      `;
    }
  }

  if (actionBtn) {
    actionBtn.onclick = () => {
      closeModal("projectDetailModal");
      prefillBudget(project.titulo, project.categoria);
    };
  }

  openModal("projectDetailModal");
}

function prefillBudget(titulo, categoria) {
  const section = document.getElementById("contato") || document.getElementById("solicitar");
  if (section) section.scrollIntoView({ behavior: "smooth" });
  
  const nomeInput = document.getElementById("leadNome");
  if (nomeInput) {
    setTimeout(() => nomeInput.focus(), 300);
  }

  const tipoSelect = document.getElementById("leadTipo");
  if (tipoSelect && categoria) {
    const catLower = categoria.toLowerCase();
    if (catLower.includes("cozinha") || catLower.includes("closet") || catLower.includes("dormit") || catLower.includes("suíte") || catLower.includes("suite")) {
      tipoSelect.value = "Cozinhas, Closets & Suítes";
    } else if (catLower.includes("pain") || catLower.includes("revest")) {
      tipoSelect.value = "Painéis & Revestimentos";
    } else if (catLower.includes("deck") || catLower.includes("extern") || catLower.includes("pergol")) {
      tipoSelect.value = "Ambientes Externos";
    } else {
      tipoSelect.value = "Marcenaria Sob Medida";
    }
  }

  const msgInput = document.getElementById("leadMensagem");
  if (msgInput && titulo) {
    msgInput.value = `Gostaria de um projeto com referência semelhante a: ${titulo}`;
  }

  showToast(`Projeto selecionado para referência.`, "info");
}

// ----------------------------------------------------------------------------
// GESTÃO NO PAINEL ADMINISTRATIVO (ADMINISTRAÇÃO DO CATÁLOGO REAL)
// ----------------------------------------------------------------------------
function renderAdminPortfolio(portfolio) {
  const container = document.getElementById("adminPortfolioList");
  if (!container) return;
  container.innerHTML = "";

  if (!portfolio || portfolio.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 20px; color: var(--text-muted); background: #fff; border-radius: var(--radius); border: 1px dashed var(--border-soft);">
        <p style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Nenhuma foto ou vídeo cadastrado.</p>
        <p style="font-size: 13px;">Use o botão "Adicionar Foto / Vídeo" acima para cadastrar os trabalhos reais executados pela marcenaria.</p>
      </div>
    `;
    return;
  }

  portfolio.forEach(item => {
    const isVideo = isVideoMedia(item);
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "14px";
    row.style.background = "#fff";
    row.style.padding = "14px 18px";
    row.style.borderRadius = "10px";
    row.style.marginBottom = "10px";
    row.style.border = "1px solid var(--border-soft)";
    row.innerHTML = `
      <div style="width: 56px; height: 75px; border-radius: 8px; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        ${isVideo 
          ? `<video src="${item.midiaUrl}" style="width:100%; height:100%; object-fit:cover;" muted></video>`
          : `<img src="${item.midiaUrl}" style="width:100%; height:100%; object-fit:cover;">`
        }
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 15px; color: #0f172a;">${item.titulo}</div>
        <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
          ${isVideo ? "▶ Vídeo" : "📷 Fotografia"} • <span class="badge badge-neutral" style="font-size: 11px;">${item.categoria || "Geral"}</span>
        </div>
      </div>
      <button type="button" class="btn btn-danger btn-sm" onclick="deletePortfolioItem('${item.id}')">Excluir</button>
    `;
    container.appendChild(row);
  });
}

let currentSelectedFile = null;

function openNewPhotoModal() {
  document.getElementById("photoForm").reset();
  document.getElementById("mediaBase64").value = "";
  document.getElementById("mediaPreviewContainer").style.display = "none";
  currentSelectedFile = null;
  openModal("photoModal");
}

function toggleMediaInputType(tipo) {
  const input = document.getElementById("mediaFileInput");
  if (input) {
    input.accept = tipo === "video" ? "video/mp4,video/*" : "image/*";
  }
}

function previewMediaFile(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    currentSelectedFile = file;
    const isVid = file.type.startsWith("video");
    
    const mediaTipoSelect = document.getElementById("mediaTipo");
    if (mediaTipoSelect) {
      mediaTipoSelect.value = isVid ? "video" : "foto";
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById("mediaBase64").value = e.target.result;
      const slot = document.getElementById("mediaPreviewSlot");
      if (isVid) {
        slot.innerHTML = `<video src="${e.target.result}" controls playsinline muted style="width: 160px; height: 260px; object-fit: cover; border-radius: 8px; background: #000;"></video>`;
      } else {
        slot.innerHTML = `<img src="${e.target.result}" style="width: 160px; height: 260px; object-fit: cover; border-radius: 8px; background: #000;">`;
      }
      document.getElementById("mediaPreviewContainer").style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

async function handleSaveMedia(e) {
  e.preventDefault();
  const titulo = document.getElementById("photoTitulo").value.trim();
  const cat = document.getElementById("photoCategoria").value;
  const desc = document.getElementById("photoDesc").value.trim();
  let tipo = document.getElementById("mediaTipo").value;
  const tipoRegEl = document.getElementById("photoTipoRegistro");
  const tipoRegistro = tipoRegEl ? tipoRegEl.value : "";
  
  const fileData = document.getElementById("mediaBase64").value;
  const urlData = document.getElementById("mediaUrlInput").value.trim();

  let finalMediaUrl = urlData || fileData;
  if (!finalMediaUrl && !currentSelectedFile) {
    showToast("Por favor, selecione um arquivo de foto/vídeo ou informe uma URL.", "warning");
    return;
  }

  if (currentSelectedFile && typeof sbClient !== "undefined" && sbClient && sbClient.storage) {
    try {
      showToast("Enviando mídia para o armazenamento...", "info");
      const fileExt = currentSelectedFile.name.split('.').pop() || (currentSelectedFile.type.startsWith("video") ? "mp4" : "jpg");
      const cleanFileName = `midia_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `uploads/${cleanFileName}`;

      const { data: uploadRes, error: uploadErr } = await sbClient.storage
        .from('portfolio')
        .upload(filePath, currentSelectedFile, { cacheControl: '3600', upsert: true });

      if (!uploadErr && uploadRes) {
        const { data: pubData } = sbClient.storage.from('portfolio').getPublicUrl(filePath);
        if (pubData && pubData.publicUrl) {
          finalMediaUrl = pubData.publicUrl;
        }
      }
    } catch (storageErr) {
      console.warn("Storage upload fallback:", storageErr);
    }
  }

  if (currentSelectedFile && currentSelectedFile.type.startsWith("video")) {
    tipo = "video";
  } else if (finalMediaUrl.startsWith("data:video") || finalMediaUrl.endsWith(".mp4")) {
    tipo = "video";
  }

  const newMedia = {
    id: Date.now(),
    tipoMidia: tipo,
    titulo: titulo,
    categoria: cat,
    descricao: desc,
    midiaUrl: finalMediaUrl,
    tipoRegistro: tipoRegistro
  };

  if (typeof sbClient !== "undefined" && sbClient) {
    try {
      const { data: resData, error: mErr } = await safeDbInsert("portfolio", {
        tipo_midia: tipo,
        titulo: titulo,
        categoria: cat,
        descricao: desc,
        midia_url: finalMediaUrl
      });

      if (!mErr && resData && resData[0]) {
        newMedia.id = resData[0].id;
      }
    } catch (e) {
      console.warn("Supabase insert media:", e);
    }
  }

  db.portfolio.unshift(newMedia);
  saveCacheDB("portfolio", db.portfolio);
  closeModal("photoModal");
  showToast("Projeto adicionado ao portfólio com sucesso!", "success");
  renderAdminPortfolio(db.portfolio);
  renderPublicCatalog();
}

async function deletePortfolioItem(id) {
  const confirmado = await customConfirm("Deseja realmente remover esta mídia do catálogo público?", "Remover Mídia", { danger: true, confirmText: "Sim, Remover" });
  if (!confirmado) return;
  db.portfolio = db.portfolio.filter(p => p.id != id);
  saveCacheDB("portfolio", db.portfolio);
  showToast("Mídia removida do catálogo.", "info");
  renderAdminPortfolio(db.portfolio);
  renderPublicCatalog();

  if (typeof sbClient !== "undefined" && sbClient) {
    try {
      await sbClient.from("portfolio").delete().eq("id", id);
    } catch (e) {
      console.error("Erro Supabase:", e);
    }
  }
}

window.renderPublicCatalog = renderPublicCatalog;
window.filterPortfolio = filterPortfolio;
window.openProjectDetails = openProjectDetails;
window.prefillBudget = prefillBudget;
window.renderAdminPortfolio = renderAdminPortfolio;
window.openNewPhotoModal = openNewPhotoModal;
window.toggleMediaInputType = toggleMediaInputType;
window.previewMediaFile = previewMediaFile;
window.handleSaveMedia = handleSaveMedia;
window.deletePortfolioItem = deletePortfolioItem;
