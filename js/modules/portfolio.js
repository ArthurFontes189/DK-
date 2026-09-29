// ============================================================================
// MÓDULO DO CATÁLOGO DE TRABALHOS (VÍDEOS E FOTOS VERTICAIS)
// ============================================================================

function renderPublicCatalog() {
  const container = document.getElementById("portfolioCatalog");
  if (!container) return;
  container.innerHTML = "";

  if (db.portfolio.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Nenhum trabalho cadastrado no catálogo.</p>`;
    return;
  }

  db.portfolio.forEach(item => {
    const isVideo = item.tipoMidia === "video" || (item.midiaUrl && item.midiaUrl.endsWith(".mp4"));
    const card = document.createElement("div");
    card.className = "portfolio-card-vertical";

    let mediaHtml = "";
    if (isVideo) {
      mediaHtml = `
        <div class="media-container-vertical">
          <span class="media-type-badge">▶ VÍDEO</span>
          <video class="portfolio-media" controls playsinline loop muted poster="${item.posterUrl || ''}">
            <source src="${item.midiaUrl}" type="video/mp4">
            Seu navegador não suporta a tag de vídeo.
          </video>
        </div>
      `;
    } else {
      mediaHtml = `
        <div class="media-container-vertical">
          <span class="media-type-badge">📷 FOTO</span>
          <img src="${item.midiaUrl}" alt="${item.titulo}" class="portfolio-media" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=800&q=80'">
        </div>
      `;
    }

    card.innerHTML = `
      ${mediaHtml}
      <div class="portfolio-info">
        <span class="badge badge-gold" style="align-self: flex-start;">${item.categoria}</span>
        <h4>${item.titulo}</h4>
        <p>${item.descricao}</p>
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

  if (portfolio.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted); background: #fff; border-radius: var(--radius); border: 1px solid var(--border-soft);">Nenhuma mídia cadastrada no catálogo.</div>`;
    return;
  }

  portfolio.forEach(item => {
    const isVideo = item.tipoMidia === "video" || (item.midiaUrl && item.midiaUrl.endsWith(".mp4"));
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
          ? `<span style="color:#fff; font-size:18px;">▶</span>`
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

function openNewPhotoModal() {
  document.getElementById("photoForm").reset();
  document.getElementById("mediaBase64").value = "";
  document.getElementById("mediaPreviewContainer").style.display = "none";
  openModal("photoModal");
}

function toggleMediaInputType(tipo) {
  const input = document.getElementById("mediaFileInput");
  input.accept = tipo === "video" ? "video/mp4,video/*" : "image/*";
}

function previewMediaFile(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const isVid = file.type.startsWith("video");
    const reader = new FileReader();

    reader.onload = function(e) {
      document.getElementById("mediaBase64").value = e.target.result;
      const slot = document.getElementById("mediaPreviewSlot");
      if (isVid) {
        slot.innerHTML = `<video src="${e.target.result}" controls style="width: 160px; height: 260px; object-fit: cover; border-radius: 8px;"></video>`;
      } else {
        slot.innerHTML = `<img src="${e.target.result}" style="width: 160px; height: 260px; object-fit: cover; border-radius: 8px;">`;
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
  const tipo = document.getElementById("mediaTipo").value;
  
  const fileData = document.getElementById("mediaBase64").value;
  const urlData = document.getElementById("mediaUrlInput").value.trim();

  const finalMediaUrl = fileData || urlData;
  if (!finalMediaUrl) {
    alert("Por favor, selecione um arquivo ou informe uma URL de vídeo/foto.");
    return;
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
  if (!confirm("Deseja remover esta mídia do catálogo?")) return;
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
