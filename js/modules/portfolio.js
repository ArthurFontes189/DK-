// ============================================================================
// MÓDULO DO CATÁLOGO DE TRABALHOS (VÍDEOS E FOTOS VERTICAIS)
// DK Construtora & Serviços
// ============================================================================

// Detecção precisa e robusta se um item é vídeo ou foto
function isVideoMedia(item) {
  if (!item) return false;
  if (item.tipoMidia === "video") return true;
  const url = (item.midiaUrl || "").toLowerCase();
  if (
    url.startsWith("data:video") || 
    url.endsWith(".mp4") || 
    url.endsWith(".mov") || 
    url.endsWith(".webm") || 
    url.includes("/video/") ||
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  ) {
    return true;
  }
  return false;
}

function renderPublicCatalog() {
  const container = document.getElementById("portfolioCatalog");
  if (!container) return;
  container.innerHTML = "";

  if (!db.portfolio || db.portfolio.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Nenhum trabalho cadastrado no catálogo.</p>`;
    return;
  }

  db.portfolio.forEach(item => {
    const isVideo = isVideoMedia(item);
    const card = document.createElement("div");
    card.className = "portfolio-card-vertical";

    let mediaHtml = "";
    if (isVideo) {
      mediaHtml = `
        <div class="media-container-vertical">
          <span class="media-type-badge">▶ VÍDEO</span>
          <video class="portfolio-media" controls playsinline loop muted poster="${item.posterUrl || ''}" preload="metadata">
            <source src="${item.midiaUrl}">
            Seu navegador não suporta a tag de vídeo.
          </video>
        </div>
      `;
    } else {
      // NUNCA mais carrega foto falsa do Unsplash no onerror!
      mediaHtml = `
        <div class="media-container-vertical">
          <span class="media-type-badge">📷 FOTO</span>
          <img src="${item.midiaUrl}" alt="${item.titulo || 'Trabalho DK'}" class="portfolio-media" loading="lazy" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=\'display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:13px;background:#18191c;\'>📷 Imagem não disponível</div>';">
        </div>
      `;
    }

    card.innerHTML = `
      ${mediaHtml}
      <div class="portfolio-info">
        <span class="badge badge-gold" style="align-self: flex-start;">${item.categoria || 'Serviços'}</span>
        <h4>${item.titulo}</h4>
        <p>${item.descricao || ''}</p>
        <button class="btn btn-outline btn-sm" onclick="prefillBudget('${item.titulo}')">Quero um Projeto Similar</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function prefillBudget(titulo) {
  document.getElementById("solicitar").scrollIntoView({ behavior: "smooth" });
  document.getElementById("leadNome").focus();
  showToast(`Serviço "${titulo}" selecionado.`);
}

function renderAdminPortfolio(portfolio) {
  const container = document.getElementById("adminPortfolioList");
  if (!container) return;
  container.innerHTML = "";

  if (!portfolio || portfolio.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted); background: #fff; border-radius: var(--radius); border: 1px solid var(--border-soft);">Nenhuma mídia cadastrada no catálogo.</div>`;
    return;
  }

  portfolio.forEach(item => {
    const isVideo = isVideoMedia(item);
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "14px";
    row.style.background = "#fff";
    row.style.padding = "12px 18px";
    row.style.borderRadius = "10px";
    row.style.marginBottom = "10px";
    row.style.border = "1px solid var(--border-soft)";
    row.innerHTML = `
      <div style="width: 50px; height: 75px; border-radius: 8px; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        ${isVideo 
          ? `<video src="${item.midiaUrl}" style="width:100%; height:100%; object-fit:cover;" muted></video>`
          : `<img src="${item.midiaUrl}" style="width:100%; height:100%; object-fit:cover;">`
        }
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 14.5px;">${item.titulo}</div>
        <div style="font-size: 12.5px; color: var(--text-muted);">${isVideo ? "▶ Vídeo Vertical" : "📷 Foto Vertical"} • ${item.categoria}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="deletePortfolioItem(${item.id})">Excluir</button>
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

// Preview inteligente que detecta automaticamente se é foto ou vídeo
function previewMediaFile(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    currentSelectedFile = file;
    const isVid = file.type.startsWith("video");
    
    // Alinha o select automaticamente com o tipo do arquivo escolhido
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

// Salva a foto/vídeo tentando primeiro o Supabase Storage para arquivos grandes
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
    alert("Por favor, selecione um arquivo de foto/vídeo ou informe uma URL.");
    return;
  }

  // Se o usuário selecionou um arquivo, tenta enviar ao Supabase Storage (se disponível)
  if (currentSelectedFile && sbClient && sbClient.storage) {
    try {
      showToast("Enviando mídia para o servidor...");
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
          console.log("Arquivo salvo com sucesso no Supabase Storage:", finalMediaUrl);
        }
      } else {
        console.warn("Aviso do Storage (salvando inline):", uploadErr ? uploadErr.message : "sem resposta");
      }
    } catch (storageErr) {
      console.warn("Storage bypass:", storageErr);
    }
  }

  // Detecção final para garantir tipo correto
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

  if (sbClient) {
    try {
      const { data: resData, error: mErr } = await safeDbInsert("portfolio", {
        tipo_midia: tipo,
        titulo: titulo,
        categoria: cat,
        descricao: desc,
        midia_url: finalMediaUrl
      });

      if (mErr) {
        alert("Erro ao salvar mídia no banco: " + mErr.message);
        return;
      }
      if (resData && resData[0]) newMedia.id = resData[0].id;
    } catch (e) {
      alert("Falha de conexão ao salvar mídia: " + e.message);
      return;
    }
  }

  db.portfolio.unshift(newMedia);
  saveCacheDB("portfolio", db.portfolio);
  closeModal("photoModal");
  showToast("Mídia adicionada ao catálogo com sucesso!");
  renderAdminPortfolio(db.portfolio);
  renderPublicCatalog();
}

async function deletePortfolioItem(id) {
  const confirmado = await customConfirm("Deseja realmente remover esta mídia do catálogo público?", "Remover Mídia", { danger: true, confirmText: "Sim, Remover" });
  if (!confirmado) return;
  db.portfolio = db.portfolio.filter(p => p.id != id);
  saveCacheDB("portfolio", db.portfolio);
  showToast("Mídia removida.");
  renderAdminPortfolio(db.portfolio);
  renderPublicCatalog();

  if (sbClient) {
    try {
      const { error } = await sbClient.from("portfolio").delete().eq("id", id);
      if (error) alert("Erro ao excluir do banco: " + error.message);
    } catch (e) {
      console.error("Erro Supabase:", e);
    }
  }
}
