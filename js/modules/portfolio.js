// ============================================================================
// MÓDULO DE PORTFÓLIO & GALERIA REAL
// DK Revestimentos - Ateliê de Marcenaria & Revestimentos
// Exclusivamente com projetos e mídias reais cadastradas pelo marceneiro
// ============================================================================

let currentPortfolioCategory = "Todos";

// Retorna apenas os projetos reais cadastrados pelo usuário no banco/armazenamento
function getAllPortfolioProjects() {
  return (db.portfolio || []).map(item => ({
    id: item.id,
    titulo: item.titulo || "Projeto Sob Medida",
    categoria: item.categoria || "Marcenaria Sob Medida",
    ambiente: item.categoria || "Ambiente Personalizado",
    descricao: item.descricao || "",
    midiaUrl: item.midiaUrl || "",
    tipoMidia: isVideoMedia(item) ? "video" : "foto"
  }));
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

// Filtra a galeria por categoria
function filterPortfolio(categoria, btnEl) {
  currentPortfolioCategory = categoria;
  document.querySelectorAll(".portfolio-filter-btn").forEach(btn => btn.classList.remove("active"));
  if (btnEl) {
    btnEl.classList.add("active");
  } else {
    // Se ativado programaticamente (ex: voltar para "Todos")
    const allBtn = Array.from(document.querySelectorAll(".portfolio-filter-btn")).find(b => b.textContent.includes("Todos"));
    if (allBtn) allBtn.classList.add("active");
  }
  renderPublicCatalog();
}

// Renderiza a galeria pública de projetos reais
function renderPublicCatalog() {
  const container = document.getElementById("portfolioCatalog");
  if (!container) return;
  container.innerHTML = "";

  const allProjects = getAllPortfolioProjects();

  // Caso ainda não haja nenhum projeto real cadastrado no sistema
  if (allProjects.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px 24px; background: #ffffff; border: 1px solid var(--border-soft); border-radius: var(--radius); box-shadow: var(--shadow-subtle);">
        <div style="width: 52px; height: 52px; border-radius: 12px; background: rgba(138, 79, 38, 0.08); color: var(--wood-primary); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <h3 style="font-size: 19px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Galeria de Projetos em Atualização</h3>
        <p style="font-size: 14.5px; color: var(--text-muted); max-width: 520px; margin: 0 auto 20px auto; line-height: 1.6;">
          Estamos organizando e publicando as fotos e vídeos das obras mais recentes da DK Revestimentos. Para conhecer trabalhos executados ou solicitar um projeto sob medida, fale conosco diretamente no WhatsApp.
        </p>
        <a href="#solicitar" class="btn btn-whatsapp" style="font-weight: 700; padding: 12px 24px;">
          Solicitar Fotos de Projetos no WhatsApp
        </a>
      </div>
    `;
    return;
  }

  // Filtragem dos projetos reais pela categoria selecionada
  const filteredProjects = currentPortfolioCategory === "Todos"
    ? allProjects
    : allProjects.filter(p => p.categoria.toLowerCase() === currentPortfolioCategory.toLowerCase());

  // Se a categoria selecionada não tiver itens no momento
  if (filteredProjects.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 45px 20px; color: var(--text-muted); background: #ffffff; border-radius: var(--radius); border: 1px solid var(--border-soft);">
        <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 4px;">Nenhum projeto encontrado na categoria "${currentPortfolioCategory}".</p>
        <p style="font-size: 13.5px; margin-bottom: 16px;">Selecione outra categoria para visualizar nossos trabalhos.</p>
        <button type="button" class="btn btn-outline btn-sm" onclick="filterPortfolio('Todos', null)">
          Ver Todos os Projetos
        </button>
      </div>
    `;
    return;
  }

  // Renderiza cada projeto real
  filteredProjects.forEach(item => {
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
        <span class="project-category-badge">${item.categoria}</span>
        ${mediaTag}
        <div class="project-media-overlay">
          <button type="button" class="btn btn-outline btn-sm" style="color: #fff; border-color: rgba(255,255,255,0.4); background: rgba(0,0,0,0.4);">
            Visualizar
          </button>
        </div>
      </div>

      <div class="project-info">
        <h3 class="project-title" onclick="openProjectDetails('${item.id}')" style="cursor: pointer;">${item.titulo}</h3>
        ${item.descricao ? `<p class="project-desc">${item.descricao}</p>` : ''}

        <div class="project-footer" style="margin-top: auto; padding-top: 14px;">
          <button type="button" class="btn-inspect-project" onclick="openProjectDetails('${item.id}')">
            <span>Ver em Detalhes</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="prefillBudget('${item.titulo}', '${item.categoria}')" style="font-size: 11.5px; padding: 5px 12px;">
            Orçar Similar
          </button>
        </div>
      </div>
    `;

    // Reproduzir vídeo curto ao passar o mouse se for vídeo
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
      <div style="background: #f8fafc; padding: 12px 14px; border-radius: 8px; border: 1px solid var(--border-soft);">
        <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); display: block;">Categoria</span>
        <strong style="font-size: 13.5px; color: #0f172a;">${project.categoria}</strong>
      </div>
    `;
  }

  if (mediaContainer) {
    const isVideo = isVideoMedia(project);
    if (isVideo) {
      mediaContainer.innerHTML = `
        <video src="${project.midiaUrl}" controls autoplay playsinline style="width: 100%; max-height: 480px; object-fit: contain; background: #000;"></video>
      `;
    } else {
      mediaContainer.innerHTML = `
        <img src="${project.midiaUrl}" alt="${project.titulo}" style="width: 100%; max-height: 480px; object-fit: contain; background: #000;">
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
  const section = document.getElementById("solicitar");
  if (section) section.scrollIntoView({ behavior: "smooth" });
  
  const nomeInput = document.getElementById("leadNome");
  if (nomeInput) {
    setTimeout(() => nomeInput.focus(), 300);
  }

  const tipoSelect = document.getElementById("leadTipo");
  if (tipoSelect && categoria) {
    const catLower = categoria.toLowerCase();
    if (catLower.includes("cozinha")) tipoSelect.value = "Cozinhas e Espaço Gourmet";
    else if (catLower.includes("pain")) tipoSelect.value = "Painéis Ripados e Revestimentos";
    else if (catLower.includes("deck") || catLower.includes("extern")) tipoSelect.value = "Decks e Pergolados";
    else if (catLower.includes("closet") || catLower.includes("dormit")) tipoSelect.value = "Closets e Suítes";
    else tipoSelect.value = "Marcenaria Sob Medida Completa";
  }

  showToast(`Projeto selecionado para referência no orçamento.`, "info");
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
    midiaUrl: finalMediaUrl
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
