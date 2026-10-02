// ============================================================================
// MÓDULO DE CRM: CAPTAÇÃO E ATENDIMENTO DE ORÇAMENTOS (LEADS)
// ============================================================================

let currentLeadFilter = "Todos";

function filterLeads(status, btn) {
  currentLeadFilter = status;
  document.querySelectorAll("#leadFiltersBar .filter-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderLeads(db.leads);
}

// Formulário público do cliente no site
async function handleLeadSubmit(e) {
  e.preventDefault();
  const nome = document.getElementById("leadNome").value.trim();
  const tel = document.getElementById("leadTel").value.trim();
  const bairro = document.getElementById("leadBairro").value.trim();
  const tipo = document.getElementById("leadTipo").value;

  const now = new Date();
  const dataHora = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", {hour: "2-digit", minute:"2-digit"});

  // Gravação estrita no banco Supabase via safeDbInsert
  if (sbClient) {
    try {
      const payload = {
        nome,
        telefone: tel,
        bairro,
        tipo_servico: tipo,
        status: "Pendente de Contato",
        data_hora: dataHora
      };

      let { data, error } = await safeDbInsert("leads", payload);

      if (error) {
        alert("Erro ao gravar orçamento no banco de dados: " + error.message);
        return;
      }
      if (data && data[0]) {
        db.leads.unshift({
          id: data[0].id,
          nome,
          telefone: tel,
          bairro,
          tipo,
          status: "Pendente de Contato",
          dataHora: data[0].data_hora || (data[0].created_at ? new Date(data[0].created_at).toLocaleString("pt-BR") : dataHora)
        });
        saveCacheDB("leads", db.leads);
      }
    } catch (err) {
      alert("Erro de conexão ao salvar: " + err.message);
      return;
    }
  } else {
    const localLead = { id: Date.now(), nome, telefone: tel, bairro, tipo, status: "Pendente de Contato", dataHora };
    db.leads.unshift(localLead);
    saveCacheDB("leads", db.leads);
  }

  document.getElementById("leadForm").reset();

  const textoMsg = `Olá! Meu nome é *${nome}*.\nGostaria de um orçamento com a *DK Revestimentos* para: *${tipo}*.\nLocal: ${bairro || "Não informado"}\n(Solicitado pelo site)`;
  const waUrl = `https://api.whatsapp.com/send?phone=${MARANARIA_WHATSAPP}&text=${encodeURIComponent(textoMsg)}`;
  showToast("Solicitação registrada no banco com sucesso!");
  setTimeout(() => { window.open(waUrl, "_blank"); }, 600);
}

// Renderiza a lista de leads no Painel do Marceneiro
function renderLeads(leads) {
  const container = document.getElementById("leadsList");
  if (!container) return;
  container.innerHTML = "";

  const pending = leads.filter(l => l.status === "Pendente de Contato").length;
  document.getElementById("pendingCount").textContent = pending;

  const filteredLeads = currentLeadFilter === "Todos" 
    ? leads 
    : leads.filter(l => l.status === currentLeadFilter);

  document.getElementById("leadsTotalTxt").textContent = `${filteredLeads.length} de ${leads.length} solicitações exibidas`;

  if (filteredLeads.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); background: #fff; border-radius: var(--radius); border: 1px solid var(--border-soft);">Nenhuma solicitação encontrada no filtro "${currentLeadFilter}".</div>`;
    return;
  }

  filteredLeads.forEach(lead => {
    let badgeClass = "badge-neutral";
    if (lead.status === "Pendente de Contato") badgeClass = "badge-warning";
    else if (lead.status === "Em Negociação") badgeClass = "badge-info";
    else if (lead.status === "Fechado") badgeClass = "badge-success";
    else if (lead.status === "Perdido") badgeClass = "badge-danger";

    const cleanTel = lead.telefone ? lead.telefone.replace(/\D/g, "") : "";
    const waLink = `https://api.whatsapp.com/send?phone=55${cleanTel}&text=${encodeURIComponent("Olá " + lead.nome + ", tudo bem? Aqui é da DK Revestimentos sobre o seu pedido de orçamento.")}`;

    const card = document.createElement("div");
    card.className = "lead-card";
    card.innerHTML = `
      <div class="lead-header">
        <div>
          <div class="lead-name">${lead.nome}</div>
          <a href="${waLink}" target="_blank" class="lead-phone">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.18 8.18 0 0 1-5.82 2.41h-.01c-1.46 0-2.9-.39-4.16-1.13l-.3-.18-3.1 1.01.83-3.02-.19-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m4.53 11.66c-.25-.13-1.48-.73-1.71-.81-.23-.09-.4-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.26-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.09-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.48-.61 1.69-1.19.21-.59.21-1.09.15-1.19-.06-.1-.23-.16-.48-.28z"/></svg>
            ${lead.telefone}
          </a>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
          <span class="badge ${badgeClass}">${lead.status}</span>
          <button type="button" class="btn-delete-lead" onclick="deleteLead('${lead.id}')" title="Excluir solicitação" aria-label="Excluir solicitação">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="lead-meta">
        <strong>Interesse:</strong> ${lead.tipo} ${lead.bairro ? "• " + lead.bairro : ""}<br>
        <span style="color:#94a3b8; font-size:11.5px;">Recebido em: ${lead.dataHora || "Data não registrada"}</span>
      </div>

      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Status do Atendimento:</label>
        <select class="form-control" style="padding: 7px 10px; font-size: 13px;" onchange="updateLeadStatus('${lead.id}', this.value)">
          <option value="Pendente de Contato" ${lead.status === "Pendente de Contato" ? "selected" : ""}>⏳ Pendente de Contato</option>
          <option value="Em Negociação" ${lead.status === "Em Negociação" ? "selected" : ""}>💬 Em Negociação</option>
          <option value="Fechado" ${lead.status === "Fechado" ? "selected" : ""}>✅ Fechado</option>
          <option value="Perdido" ${lead.status === "Perdido" ? "selected" : ""}>❌ Não Fechou / Perdido</option>
        </select>
      </div>

      <div class="lead-actions">
        <a href="${waLink}" target="_blank" class="btn btn-whatsapp btn-sm" style="flex: 1;">Chamar WhatsApp</a>
        <button class="btn btn-primary btn-sm" style="flex: 1.2;" onclick="createServiceFromLead('${lead.id}')" title="Fecha o serviço, registra o cliente com CPF e remove da lista de orçamentos">
          🔨 Criar Ficha do Cliente
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Atualiza o status de atendimento de um lead
async function updateLeadStatus(id, newStatus) {
  const lead = db.leads.find(l => l.id == id);
  if (lead) {
    lead.status = newStatus;
    saveCacheDB("leads", db.leads);
    showToast("Status da solicitação atualizado!");
    renderLeads(db.leads);

    if (sbClient) {
      try {
        const { error } = await sbClient.from("leads").update({ status: newStatus }).eq("id", id);
        if (error) console.error("Erro ao atualizar status:", error);
      } catch (e) {
        console.error("Erro Supabase:", e);
      }
    }
  }
}


// Exclui permanentemente uma solicitação/lead com confirmação prévia
async function deleteLead(id) {
  const lead = db.leads.find(l => l.id == id);
  const leadNome = lead ? lead.nome : "esta solicitação";
  
  const confirmado = await customConfirm(`Deseja realmente excluir a solicitação de "${leadNome}"?\nEsta ação removerá o pedido permanentemente.`, "Excluir Solicitação", { danger: true, confirmText: "Sim, Excluir" });
  if (!confirmado) return;

  // 1. Remover do banco local / cache
  db.leads = db.leads.filter(l => l.id != id);
  saveCacheDB("leads", db.leads);
  renderLeads(db.leads);
  showToast("Solicitação excluída com sucesso!");

  // 2. Remover do Supabase se estiver conectado
  if (sbClient) {
    try {
      const { error } = await sbClient.from("leads").delete().eq("id", id);
      if (error) {
        console.error("Erro ao excluir solicitação no Supabase:", error);
      }
    } catch (err) {
      console.error("Exceção ao excluir no Supabase:", err);
    }
  }
}
window.deleteLead = deleteLead;
