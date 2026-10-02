// ============================================================================
// MÓDULO DE PORTFÓLIO & GALERIA ARQUITETÔNICA
// DK Revestimentos - Ateliê de Marcenaria & Revestimentos de Alto Padrão
// ============================================================================

let currentPortfolioCategory = "Todos";

// Catálogo Curado de Projetos Arquitetônicos de Alto Padrão
const DEFAULT_CURATED_PROJECTS = [
  {
    id: "p1",
    titulo: "Living Integrado & Painel Louro Freijó",
    categoria: "Painéis & Revestimentos",
    ambiente: "Living & Sala de Estar",
    localizacao: "Lago Sul, Brasília",
    materiais: "Lâmina Natural de Louro Freijó • Cristaleira com Vidro Fumê • Iluminação LED 2700K",
    descricao: "Painel ripado em madeira nobre com pórtico de transição para a área íntima, rack suspenso com cantos curvos e cristaleira com perfis em alumínio preto fosco.",
    midiaUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    tipoMidia: "foto"
  },
  {
    id: "p2",
    titulo: "Cozinha Minimalista em Carvalho Americano",
    categoria: "Cozinhas & Gourmet",
    ambiente: "Cozinha Gourmet Integrada",
    localizacao: "Setor Noroeste, Brasília",
    materiais: "Carvalho Americano Poro Aberto • Laca Cinza Acetinada • Ferragens Ocultas com Amortecimento",
    descricao: "Mobiliário planejado com ilha central revestida em madeira maciça, armários aéreos com abertura por toque e canaleta oculta para iluminação zenital.",
    midiaUrl: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=1200&auto=format&fit=crop",
    tipoMidia: "foto"
  },
  {
    id: "p3",
    titulo: "Closet Suíte Master em Laca Gianduia",
    categoria: "Dormitórios & Closets",
    ambiente: "Closet & Dormitório",
    localizacao: "Residencial Alphaville, Brasília",
    materiais: "MDF Gianduia Acetinado • Gavetas Aveludadas • Portas com Perfil Slim Reflecta",
    descricao: "Closet espaçoso sob medida com ilha central para joias e acessórios, iluminação técnica vertical embutida em cada nicho e divisórias organizadoras em couro.",
    midiaUrl: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?q=80&w=1200&auto=format&fit=crop",
    tipoMidia: "foto"
  },
  {
    id: "p4",
    titulo: "Revestimento Acústico & Adega Climatizada",
    categoria: "Salas & Livings",
    ambiente: "Espaço Gourmet & Adega",
    localizacao: "Park Way, Brasília",
    materiais: "Painel Ripado Acústico • Madeira Cumaru • Nichos Usinados sob Medida",
    descricao: "Revestimento de parede integral com isolamento acústico embutido, nichos geométricos para mais de 120 garrafas e balcão em madeira de demolição tratada.",
    midiaUrl: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=1200&auto=format&fit=crop",
    tipoMidia: "foto"
  },
  {
    id: "p5",
    titulo: "Varanda Gourmet & Deck de Madeira Maciça",
    categoria: "Áreas Externas",
    ambiente: "Área Externa & Piscina",
    localizacao: "Lago Norte, Brasília",
    materiais: "Deck em Cumaru Extra • Pergolado com Cobertura Térmica • Bancada com Armários Hidrorrepelentes",
    descricao: "Deck nivelado com fixação invisível, pergolado de madeira com acabamento em verniz náutico UV e armários sob medida com vedação contra intempéries.",
    midiaUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    tipoMidia: "foto"
  },
  {
    id: "p6",
    titulo: "Painel Ripado Geométrico & Hall Social",
    categoria: "Painéis & Revestimentos",
    ambiente: "Hall de Entrada & Circulação",
    localizacao: "Asa Sul, Brasília",
    materiais: "Lâmina de Nogueira Natural • Porta Mimetizada Pivotante • LED 2700K Indireto",
    descricao: "Composição contemporânea com porta de entrada pivotante totalmente camuflada no painel ripado, proporcionando continuidade visual e sofisticação arquitetônica.",
    midiaUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    tipoMidia: "foto"
  }
];

// Retorna todos os projetos (itens cadastrados no banco somados aos projetos curados)
function getAllPortfolioProjects() {
  const customItems = (db.portfolio || []).map(item => ({
    id: item.id,
    titulo: item.titulo,
    categoria: item.categoria || "Painéis & Revestimentos",
    ambiente: item.categoria || "Ambiente Personalizado",
    localizacao: "Brasília - DF",
    materiais: "Marcenaria Sob Medida • Revestimentos Especiais",
    descricao: item.descricao || "Projeto sob medida executado pela equipe DK Revestimentos.",
    midiaUrl: item.midiaUrl,
    tipoMidia: isVideoMedia(item) ? "video" : "foto"
  }));

  // Itens cadastrados pelo marceneiro aparecem antes, seguidos dos projetos do ateliê
  return [...customItems, ...DEFAULT_CURATED_PROJECTS];
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
  if (btnEl) btnEl.classList.add("active");
  renderPublicCatalog();
}

// Renderiza a galeria pública de projetos
function renderPublicCatalog() {
  const container = document.getElementById("portfolioCatalog");
  if (!container) return;
  container.innerHTML = "";

  const allProjects = getAllPortfolioProjects();
  const filteredProjects = currentPortfolioCategory === "Todos"
    ? allProjects
    : allProjects.filter(p => p.categoria === currentPortfolioCategory);

  if (filteredProjects.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: var(--text-muted); background: #fff; border-radius: var(--radius); border: 1px solid var(--border-soft);">
        <p style="font-size: 15px; font-weight: 600; color: #0f172a;">Nenhum projeto encontrado nesta categoria.</p>
        <p style="font-size: 13px; margin-top: 4px;">Selecione outra categoria ou entre em contato para solicitar um projeto sob medida.</p>
      </div>
    `;
    return;
  }

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
            Explorar Projeto
          </button>
        </div>
      </div>

      <div class="project-info">
        <div class="project-location">${item.localizacao || "Brasília - DF"}</div>
        <h3 class="project-title" onclick="openProjectDetails('${item.id}')" style="cursor: pointer;">${item.titulo}</h3>
        <p class="project-desc">${item.descricao || ''}</p>

        <div class="project-specs">
          <strong>Materiais:</strong> ${item.materiais || "Madeiras nobres & ferragens de amortecimento"}
        </div>

        <div class="project-footer">
          <button type="button" class="btn-inspect-project" onclick="openProjectDetails('${item.id}')">
            <span>Ver Ficha Técnica</span>
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

// Modal Lightbox com Detalhes do Projeto
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
  if (locationEl) locationEl.textContent = `${project.categoria} • ${project.localizacao || "Brasília - DF"}`;
  if (descEl) descEl.textContent = project.descricao;
  if (specsEl) {
    specsEl.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid var(--border-soft);">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); display: block;">Ambiente</span>
          <strong style="font-size: 13.5px; color: #0f172a;">${project.ambiente || project.categoria}</strong>
        </div>
        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid var(--border-soft);">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); display: block;">Materiais & Lâminas</span>
          <strong style="font-size: 13px; color: #0f172a;">${project.materiais || "Lâminas nobres e laca"}</strong>
        </div>
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
        <img src="${project.midiaUrl}" alt="${project.titulo}" style="width: 100%; max-height: 480px; object-fit: cover; background: #000;">
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
  if (tipoSelect) {
    if (categoria && categoria.includes("Cozinha")) tipoSelect.value = "Cozinhas e Espaço Gourmet";
    else if (categoria && categoria.includes("Painéis")) tipoSelect.value = "Painéis Ripados e Revestimentos";
    else if (categoria && categoria.includes("Externa")) tipoSelect.value = "Decks e Pergolados";
    else tipoSelect.value = "Marcenaria Sob Medida";
  }

  showToast(`Projeto "${titulo}" selecionado para referência.`, "info");
}

// ----------------------------------------------------------------------------
// GESTÃO NO PAINEL ADMINISTRATIVO (ADMINISTRAÇÃO DO CATÁLOGO)
// ----------------------------------------------------------------------------
function renderAdminPortfolio(portfolio) {
  const container = document.getElementById("adminPortfolioList");
  if (!container) return;
  container.innerHTML = "";

  if (!portfolio || portfolio.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 20px; color: var(--text-muted); background: #fff; border-radius: var(--radius); border: 1px dashed var(--border-soft);">
        <p style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Nenhuma foto ou vídeo adicional cadastrado na nuvem.</p>
        <p style="font-size: 13px;">O site está exibindo a galeria curada oficial de projetos da DK Revestimentos. Use o botão acima para adicionar registros da sua própria oficina.</p>
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
      showToast("Enviando mídia para o servidor de arquivos...", "info");
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
      console.warn("Storage fallback:", storageErr);
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
  showToast("Projeto adicionado ao catálogo com sucesso!", "success");
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
