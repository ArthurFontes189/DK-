// ============================================================================
// MÓDULO DE GERENCIAMENTO DE OBRAS & PRODUÇÃO
// Inclui Alocação de Funcionários, Diárias, Contratos e Caixa Centralizado por Obra
// DK Revestimentos
// ============================================================================

let currentServiceFilter = "Todos";
let currentInspectingObraId = null;
let currentObraTab = "equipe"; // "equipe", "caixa", "detalhes"

function filterServices(status, btn) {
  currentServiceFilter = status;
  document.querySelectorAll("#serviceFiltersBar .filter-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderServices(db.services);
}

function populateClientSelectOptions(selectedCliId) {
  const select = document.getElementById("srvClienteSelect");
  if (!select) return;
  select.innerHTML = '<option value="">+ Não, é um Novo Cliente (cadastrar com esta obra)</option>';

  db.clients.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    const cod = c.codigoCliente || `CLI-${String(c.id).slice(-4)}`;
    opt.textContent = `${cod} - ${c.nome} ${c.cpf ? "(" + c.cpf + ")" : ""}`;
    if (selectedCliId && c.id == selectedCliId) opt.selected = true;
    select.appendChild(opt);
  });
}

function handleSelectClientInService(cliId) {
  if (!cliId) {
    document.getElementById("srvCliente").value = "";
    document.getElementById("srvCpf").value = "";
    document.getElementById("srvTelefone").value = "";
    document.getElementById("srvEndereco").value = "";
    return;
  }
  const client = db.clients.find(c => c.id == cliId);
  if (client) {
    document.getElementById("srvCliente").value = client.nome;
    document.getElementById("srvCpf").value = client.cpf || "";
    document.getElementById("srvTelefone").value = client.telefone;
    document.getElementById("srvEndereco").value = client.endereco || "";
  }
}

function openNewServiceModal() {
  document.getElementById("serviceForm").reset();
  document.getElementById("srvId").value = "";
  document.getElementById("srvLeadId").value = "";
  populateClientSelectOptions(null);
  document.getElementById("serviceModalTitle").textContent = "Nova Obra / Ficha de Produção";
  openModal("serviceModal");
}

function openNewServiceForClient(cliId) {
  const cli = db.clients.find(c => c.id == cliId);
  if (!cli) return;

  document.getElementById("serviceForm").reset();
  document.getElementById("srvId").value = "";
  document.getElementById("srvLeadId").value = "";

  populateClientSelectOptions(cli.id);
  handleSelectClientInService(cli.id);

  document.getElementById("serviceModalTitle").textContent = "Nova Obra para: " + cli.nome;
  openModal("serviceModal");
}

function createServiceFromLead(leadId) {
  const lead = db.leads.find(l => l.id == leadId);
  if (!lead) {
    showToast("Solicitação não encontrada.", "warning");
    return;
  }

  document.getElementById("serviceForm").reset();
  document.getElementById("srvId").value = "";
  document.getElementById("srvLeadId").value = lead.id;

  const existingClient = db.clients.find(c => c.telefone && c.telefone.replace(/\D/g, "") === lead.telefone.replace(/\D/g, ""));
  if (existingClient) {
    populateClientSelectOptions(existingClient.id);
    handleSelectClientInService(existingClient.id);
  } else {
    populateClientSelectOptions(null);
    document.getElementById("srvCliente").value = lead.nome;
    document.getElementById("srvTelefone").value = lead.telefone;
    document.getElementById("srvEndereco").value = lead.bairro || "";
  }

  document.getElementById("srvDescricao").value = `${lead.tipo}`;
  document.getElementById("serviceModalTitle").textContent = "Criar Obra & Registrar Cliente: " + lead.nome;

  switchAdminTab("servicos");
  openModal("serviceModal");
}

function editService(srvId) {
  const srv = db.services.find(s => s.id == srvId);
  if (!srv) {
    showToast("Obra não encontrada.", "warning");
    return;
  }

  document.getElementById("serviceForm").reset();
  document.getElementById("srvId").value = srv.id;
  document.getElementById("srvLeadId").value = srv.leadId || "";

  populateClientSelectOptions(srv.clienteId || null);

  document.getElementById("srvCliente").value = srv.cliente || "";
  document.getElementById("srvCpf").value = srv.cpf || "";
  document.getElementById("srvTelefone").value = srv.telefone || "";
  if (document.getElementById("srvEndereco")) {
    document.getElementById("srvEndereco").value = srv.endereco || "";
  }

  document.getElementById("srvDescricao").value = srv.descricao || "";
  document.getElementById("srvMateriais").value = srv.materiais || "";
  document.getElementById("srvValorTotal").value = srv.valorTotal || "";
  document.getElementById("srvValorEntrada").value = srv.valorEntrada || "";
  document.getElementById("srvFormaPag").value = srv.formaPag || "Pix";
  document.getElementById("srvResponsavel").value = srv.responsavel || "";
  document.getElementById("srvDataEntrega").value = srv.dataEntrega || "";
  document.getElementById("srvStatus").value = srv.status || "A Iniciar";

  document.getElementById("serviceModalTitle").textContent = "Editar Obra: " + (srv.cliente || "Produção");
  openModal("serviceModal");
}

async function handleSaveService(e) {
  e.preventDefault();
  const id = document.getElementById("srvId").value;
  const leadId = document.getElementById("srvLeadId").value;
  const selectedCliId = document.getElementById("srvClienteSelect").value;

  const clienteNome = document.getElementById("srvCliente").value.trim();
  const cpf = document.getElementById("srvCpf").value.trim();
  const telefone = document.getElementById("srvTelefone").value.trim();
  const endereco = document.getElementById("srvEndereco") ? document.getElementById("srvEndereco").value.trim() : "";
  const valorTotal = parseFloat(document.getElementById("srvValorTotal").value) || 0;
  const valorEntrada = parseFloat(document.getElementById("srvValorEntrada").value) || 0;

  if (!clienteNome) {
    showToast("Informe o nome do cliente da obra.", "warning");
    return;
  }

  // 1. Resolver ou cadastrar cliente
  let finalCliId = selectedCliId ? parseInt(selectedCliId) : null;
  let clientRecord = null;

  if (finalCliId) {
    clientRecord = db.clients.find(c => c.id == finalCliId);
    if (clientRecord && cpf && !clientRecord.cpf) {
      clientRecord.cpf = cpf;
      saveCacheDB("clients", db.clients);
      if (sbClient) sbClient.from("clients").update({ cpf }).eq("id", finalCliId).then(() => {});
    }
  } else {
    if (cpf) clientRecord = db.clients.find(c => c.cpf === cpf);
    if (!clientRecord && telefone) {
      clientRecord = db.clients.find(c => c.telefone && c.telefone.replace(/\D/g, "") === telefone.replace(/\D/g, ""));
    }

    if (clientRecord) {
      finalCliId = clientRecord.id;
      if (cpf && !clientRecord.cpf) {
        clientRecord.cpf = cpf;
        saveCacheDB("clients", db.clients);
        if (sbClient) sbClient.from("clients").update({ cpf }).eq("id", finalCliId).then(() => {});
      }
    } else {
      const now = new Date();
      const cliDataHora = now.toLocaleDateString("pt-BR");
      const autoCodigo = `CLI-${now.getFullYear()}${String(now.getMonth()+1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newCli = {
        id: Date.now(),
        codigoCliente: autoCodigo,
        cpf: cpf || "",
        nome: clienteNome,
        telefone: telefone,
        endereco: endereco,
        obs: "Criado automaticamente através do fechamento da obra.",
        dataCadastro: cliDataHora
      };

      if (sbClient) {
        try {
          const { data: cData, error: cErr } = await safeDbInsert("clients", {
            codigo_cliente: autoCodigo,
            cpf: cpf || "",
            nome: clienteNome,
            telefone: telefone,
            endereco: endereco,
            obs: newCli.obs,
            data_cadastro: cliDataHora
          });
          if (cErr) {
            alert("Erro ao gravar cliente no banco em nuvem: " + cErr.message + "\n\nA obra não pôde ser salva sem o cliente no banco.");
            return;
          } else if (cData && cData[0]) {
            newCli.id = cData[0].id;
          }
        } catch (err) {
          alert("Falha de conexão com a nuvem ao criar cliente: " + err.message);
          return;
        }
      }

      finalCliId = newCli.id;
      db.clients.unshift(newCli);
      saveCacheDB("clients", db.clients);
      renderClients(db.clients, db.services, db.transactions);
    }
  }

  const srvData = {
    leadId: leadId ? parseInt(leadId) : null,
    clienteId: finalCliId,
    cliente: clienteNome,
    cpf: cpf,
    telefone: telefone,
    endereco: endereco,
    descricao: document.getElementById("srvDescricao").value.trim(),
    materiais: document.getElementById("srvMateriais").value.trim(),
    valorTotal: valorTotal,
    valorEntrada: valorEntrada,
    formaPag: document.getElementById("srvFormaPag").value,
    responsavel: document.getElementById("srvResponsavel").value.trim(),
    dataEntrega: document.getElementById("srvDataEntrega").value,
    status: document.getElementById("srvStatus").value
  };

  if (id) {
    // Atualização de Obra existente
    const srvIndex = db.services.findIndex(s => s.id == id);
    if (srvIndex !== -1) {
      const existingWorkers = db.services[srvIndex].workers || [];
      const existingExpenses = db.services[srvIndex].expenses || [];
      
      if (sbClient) {
        try {
          const { error: sErr } = await safeDbUpdate("services", {
            client_id: finalCliId,
            cliente: clienteNome,
            cpf: cpf,
            telefone: telefone,
            endereco: endereco,
            descricao: srvData.descricao,
            materiais: srvData.materiais,
            valor_total: srvData.valorTotal,
            valor_entrada: srvData.valorEntrada,
            forma_pagamento: srvData.formaPag,
            responsavel: srvData.responsavel,
            data_entrega: srvData.dataEntrega,
            status: srvData.status
          }, "id", id);

          if (sErr) {
            alert("Erro ao atualizar obra na nuvem: " + sErr.message);
            return;
          }
        } catch (err) {
          alert("Falha de conexão ao atualizar obra: " + err.message);
          return;
        }
      }

      db.services[srvIndex] = { ...db.services[srvIndex], ...srvData, workers: existingWorkers, expenses: existingExpenses };
      saveCacheDB("services", db.services);
      showToast("Obra atualizada e sincronizada na nuvem!", "success");
    }
  } else {
    // Nova Obra
    const newService = { 
      id: Date.now(), 
      ...srvData, 
      workers: [], 
      expenses: [] 
    };

    if (sbClient) {
      try {
        const { data: sData, error: sErr } = await safeDbInsert("services", {
          lead_id: srvData.leadId,
          client_id: finalCliId,
          cliente: clienteNome,
          cpf: cpf,
          telefone: telefone,
          endereco: endereco,
          descricao: srvData.descricao,
          materiais: srvData.materiais,
          valor_total: srvData.valorTotal,
          valor_entrada: srvData.valorEntrada,
          forma_pagamento: srvData.formaPag,
          responsavel: srvData.responsavel,
          data_entrega: srvData.dataEntrega,
          status: srvData.status,
          workers: [],
          expenses: []
        });

        if (sErr) {
          alert("❌ Erro ao salvar obra no banco Supabase: " + sErr.message + "\n\nA obra NÃO foi gravada para evitar divergência entre PC e celular.");
          return;
        } else if (sData && sData[0]) {
          newService.id = sData[0].id;
        }
      } catch (err) {
        alert("Falha de conexão ao salvar obra na nuvem: " + err.message);
        return;
      }
    }

    db.services.unshift(newService);
    saveCacheDB("services", db.services);

    // Se houve entrada financeira, lança no caixa
    if (valorEntrada > 0) {
      const now = new Date();
      const txEntrada = {
        id: Date.now() + 1,
        tipo: "Entrada",
        clientId: finalCliId,
        clienteNome: clienteNome,
        descricao: `Sinal / Entrada da Obra (${srvData.descricao.slice(0, 30)})`,
        valor: valorEntrada,
        categoria: "Entrada de Serviços",
        data: now.toLocaleDateString("pt-BR")
      };
      db.transactions.unshift(txEntrada);
      saveCacheDB("transactions", db.transactions);
      if (sbClient) {
        safeDbInsert("transactions", {
          tipo: "Entrada",
          client_id: finalCliId,
          cliente_nome: clienteNome,
          descricao: txEntrada.descricao,
          valor: valorEntrada,
          categoria: txEntrada.categoria,
          data: txEntrada.data
        }).then(() => {});
      }
    }

    // Se veio de um Lead/Orçamento, remove da lista de orçamentos pendentes
    if (leadId) {
      db.leads = db.leads.filter(l => l.id != leadId);
      saveCacheDB("leads", db.leads);
      if (sbClient) sbClient.from("leads").delete().eq("id", leadId).then(() => {});
      renderLeads(db.leads);
    }

    showToast("Obra salva e sincronizada na nuvem com sucesso!", "success");
  }

  closeModal("serviceModal");
  renderServices(db.services);
  renderClients(db.clients, db.services, db.transactions);
  renderFinanceiro(db.transactions);
  if (typeof fetchCloudData === "function") fetchCloudData();
}

async function deleteService(srvId) {
  const srv = db.services.find(s => s.id == srvId);
  const nomeObra = srv ? `${srv.cliente} (#SRV-${String(srv.id).slice(-4)})` : "esta obra";

  const confirmado = await customConfirm(
    `Tem certeza que deseja excluir permanentemente a obra de "${nomeObra}"?

Todos os registros de diárias e despesas vinculadas a esta obra serão removidos.`,
    "Excluir Obra",
    { danger: true, confirmText: "Sim, Excluir" }
  );

  if (!confirmado) return;

  db.services = db.services.filter(s => s.id != srvId);
  saveCacheDB("services", db.services);
  renderServices(db.services);
  renderClients(db.clients, db.services, db.transactions);
  showToast("Obra excluída com sucesso!", "success");

  if (sbClient) {
    try {
      const { error } = await sbClient.from("services").delete().eq("id", srvId);
      if (error) showToast("Erro ao excluir do banco: " + error.message, "error");
    } catch (e) {
      console.error(e);
    }
  }

  // Se o modal de inspeção estiver aberto para esta obra, fecha
  if (currentInspectingObraId == srvId) {
    closeModal("obraInspectModal");
  }
}

async function updateServiceStatus(srvId, newStatus) {
  const srv = db.services.find(s => s.id == srvId);
  if (srv) {
    srv.status = newStatus;
    saveCacheDB("services", db.services);
    renderServices(db.services);
    showToast(`Status da obra atualizado para: ${newStatus}`, "info");

    if (currentInspectingObraId == srvId) {
      renderObraInspection();
    }

    if (sbClient) {
      try {
        await sbClient.from("services").update({ status: newStatus }).eq("id", srvId);
      } catch (e) {
        console.warn(e);
      }
    }
  }
}

async function quickPayFullService(srvId) {
  const srv = db.services.find(s => s.id == srvId);
  if (!srv) return;

  const saldoRestante = (srv.valorTotal || 0) - (srv.valorEntrada || 0);
  if (saldoRestante <= 0) {
    showToast("Esta obra já está totalmente quitada!", "info");
    return;
  }

  const confirmar = await customConfirm(
    `Confirmar recebimento do saldo restante de R$ ${saldoRestante.toLocaleString('pt-BR', {minimumFractionDigits: 2})} do cliente "${srv.cliente}"?

O valor será gravado no Caixa da Obra e no Caixa Geral como entrada quitada.`,
    "Confirmar Quitação de Saldo",
    { confirmText: "Confirmar Quitação", icon: "success" }
  );

  if (!confirmar) return;

  srv.valorEntrada = srv.valorTotal;
  saveCacheDB("services", db.services);

  const now = new Date();
  const txQuita = {
    id: Date.now(),
    tipo: "Entrada",
    clientId: srv.clienteId,
    clienteNome: srv.cliente,
    descricao: `Quitação Final de Obra (#SRV-${String(srv.id).slice(-4)}): ${srv.descricao.slice(0, 30)}`,
    valor: saldoRestante,
    categoria: "Quitação de Serviços",
    data: now.toLocaleDateString("pt-BR")
  };

  db.transactions.unshift(txQuita);
  saveCacheDB("transactions", db.transactions);

  if (sbClient) {
    try {
      await sbClient.from("services").update({ valor_entrada: srv.valorTotal }).eq("id", srvId);
      await safeDbInsert("transactions", {
        tipo: "Entrada",
        client_id: srv.clienteId,
        cliente_nome: srv.cliente,
        descricao: txQuita.descricao,
        valor: saldoRestante,
        categoria: txQuita.categoria,
        data: txQuita.data
      });
    } catch (e) {
      console.warn(e);
    }
  }

  const concluir = await customConfirm(
    "Deseja também alterar o status da obra para 'Concluído'?",
    "Conclusão de Obra",
    { confirmText: "Sim, Concluir Obra", icon: "info" }
  );

  if (concluir) {
    await updateServiceStatus(srvId, "Concluído");
  }

  renderServices(db.services);
  renderFinanceiro(db.transactions);
  if (currentInspectingObraId == srvId) renderObraInspection();
  showToast("Quitação de saldo registrada com sucesso!", "success");
}

// ============================================================================
// PAINEL DE INSPEÇÃO DETALHADA DA OBRA (HUB 360°)
// ============================================================================

function openObraInspection(srvId) {
  currentInspectingObraId = srvId;
  const srv = db.services.find(s => s.id == srvId);
  if (!srv) {
    showToast("Obra não encontrada.", "warning");
    return;
  }

  if (!Array.isArray(srv.workers)) srv.workers = [];
  if (!Array.isArray(srv.expenses)) srv.expenses = [];

  currentObraTab = "equipe";
  renderObraInspection();
  openModal("obraInspectModal");
}

function switchObraTab(tabName, el) {
  currentObraTab = tabName;
  document.querySelectorAll("#obraInspectModal .obra-tab-btn").forEach(b => b.classList.remove("active"));
  if (el) el.classList.add("active");
  renderObraTabContent();
}

function calculateObraMetrics(srv) {
  const valorTotal = Number(srv.valorTotal) || 0;
  const valorEntrada = Number(srv.valorEntrada) || 0;
  const saldoRestante = Math.max(0, valorTotal - valorEntrada);

  const workers = srv.workers || [];
  const expenses = srv.expenses || [];

  const custoDiarias = workers.reduce((acc, w) => {
    const total = Number(w.totalDiarias) || (Number(w.valorDiaria) * Number(w.diasTrabalhados)) || 0;
    return acc + total;
  }, 0);

  const custoInsumos = expenses.reduce((acc, exp) => acc + (Number(exp.valor) || 0), 0);
  const custoTotal = custoDiarias + custoInsumos;
  const lucroPrevisto = valorTotal - custoTotal;
  const margemLucro = valorTotal > 0 ? ((lucroPrevisto / valorTotal) * 100).toFixed(1) : "0.0";

  return {
    valorTotal,
    valorEntrada,
    saldoRestante,
    custoDiarias,
    custoInsumos,
    custoTotal,
    lucroPrevisto,
    margemLucro
  };
}

function renderObraInspection() {
  const srv = db.services.find(s => s.id == currentInspectingObraId);
  if (!srv) return;

  const metrics = calculateObraMetrics(srv);

  // 1. Cabeçalho da Obra
  const titleEl = document.getElementById("inspectObraTitle");
  if (titleEl) {
    titleEl.textContent = `🏗️ Obra #SRV-${String(srv.id).slice(-4)} — ${srv.cliente}`;
  }

  const subEl = document.getElementById("inspectObraSub");
  if (subEl) {
    subEl.innerHTML = `
      <span>📍 ${srv.endereco || "Local da obra a confirmar"}</span> • 
      <span>📞 ${srv.telefone || "Sem telefone"}</span> • 
      <span>📅 Entrega: <strong>${srv.dataEntrega || "A combinar"}</strong></span>
    `;
  }

  // Seletor de status no cabeçalho
  const statusSelect = document.getElementById("inspectObraStatusSelect");
  if (statusSelect) {
    statusSelect.value = srv.status || "A Iniciar";
    statusSelect.onchange = (e) => updateServiceStatus(srv.id, e.target.value);
  }

  // 2. Barra de KPIs Financeiros da Obra
  const kpisContainer = document.getElementById("inspectObraKpis");
  if (kpisContainer) {
    const isLucroPositivo = metrics.lucroPrevisto >= 0;
    kpisContainer.innerHTML = `
      <div class="obra-kpi-card">
        <div class="kpi-label">Valor Fechado</div>
        <div class="kpi-num" style="color: #0f172a;">R$ ${metrics.valorTotal.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</div>
        <div class="kpi-sub">Recebido: R$ ${metrics.valorEntrada.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</div>
      </div>

      <div class="obra-kpi-card">
        <div class="kpi-label">📦 Gastos com Insumos</div>
        <div class="kpi-num" style="color: #ea580c;">R$ ${metrics.custoInsumos.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</div>
        <div class="kpi-sub">${(srv.expenses || []).length} compras registradas</div>
      </div>

      <div class="obra-kpi-card">
        <div class="kpi-label">👷 Gastos com Diárias</div>
        <div class="kpi-num" style="color: #d97706;">R$ ${metrics.custoDiarias.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</div>
        <div class="kpi-sub">${(srv.workers || []).length} colaboradores alocados</div>
      </div>

      <div class="obra-kpi-card" style="background: ${isLucroPositivo ? '#f0fdf4' : '#fef2f2'}; border-color: ${isLucroPositivo ? '#bbf7d0' : '#fecaca'};">
        <div class="kpi-label">📈 Lucro Líquido Previsto</div>
        <div class="kpi-num" style="color: ${isLucroPositivo ? '#16a34a' : '#dc2626'}; font-weight: 800;">
          R$ ${metrics.lucroPrevisto.toLocaleString("pt-BR", {minimumFractionDigits: 2})}
        </div>
        <div class="kpi-sub" style="font-weight: 700; color: ${isLucroPositivo ? '#15803d' : '#b91c1c'};">
          Margem: ${metrics.margemLucro}%
        </div>
      </div>
    `;
  }

  renderObraTabContent();
}

function renderObraTabContent() {
  const srv = db.services.find(s => s.id == currentInspectingObraId);
  if (!srv) return;

  const contentContainer = document.getElementById("inspectObraTabContent");
  if (!contentContainer) return;

  const metrics = calculateObraMetrics(srv);

  if (currentObraTab === "equipe") {
    // ABA: EQUIPE & DIÁRIAS DA OBRA
    const workers = srv.workers || [];

    let workersHtml = "";
    if (workers.length === 0) {
      workersHtml = `
        <div style="text-align: center; padding: 36px 20px; color: var(--text-muted); background: #f8fafc; border-radius: 12px; border: 1px dashed var(--border-soft);">
          <div style="font-size: 28px; margin-bottom: 6px;">👷</div>
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">Nenhum funcionário alocado nesta obra</div>
          <p style="font-size: 12.5px; margin-bottom: 16px;">Vincule marceneiros, montadores e ajudantes com diárias e contratos específicos desta obra.</p>
          <button type="button" class="btn btn-primary btn-sm" onclick="openAddWorkerModal('${srv.id}')">+ Alocar Primeiro Colaborador</button>
        </div>
      `;
    } else {
      workersHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h4 style="font-size: 15px; font-weight: 700; color: #1e293b;">Equipe Alocada (${workers.length})</h4>
          <button type="button" class="btn btn-primary btn-sm" onclick="openAddWorkerModal('${srv.id}')">+ Alocar Colaborador</button>
        </div>
        <div class="obra-workers-table-wrapper">
          <table class="obra-table">
            <thead>
              <tr>
                <th>Colaborador / Função</th>
                <th>Valor da Diária</th>
                <th>Dias Trabalhados</th>
                <th>Total a Pagar</th>
                <th>Status Pagamento</th>
                <th>Contrato de Trabalho</th>
                <th style="text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${workers.map(w => {
                const total = Number(w.totalDiarias) || (Number(w.valorDiaria) * Number(w.diasTrabalhados)) || 0;
                const isPago = w.statusPagamento === "Pago";
                return `
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: #0f172a; font-size: 13.5px;">${w.nome}</div>
                      <div style="font-size: 12px; color: #64748b;">${w.cargo || "Especialista"}</div>
                    </td>
                    <td>
                      <strong style="color: #334155;">R$ ${(Number(w.valorDiaria) || 0).toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong>
                    </td>
                    <td>
                      <span class="badge badge-neutral" style="font-size: 12.5px; padding: 4px 8px;">${w.diasTrabalhados || 1} dias</span>
                    </td>
                    <td>
                      <strong style="color: var(--wood-primary); font-size: 14px;">R$ ${total.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong>
                    </td>
                    <td>
                      <button type="button" class="badge ${isPago ? 'badge-success' : 'badge-warning'}" style="cursor: pointer; border: none; padding: 5px 10px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;" onclick="toggleWorkerPaymentStatus('${srv.id}', '${w.id}')" title="Clique para alternar o status">
                        <span>${isPago ? '✓ Quitado' : '⏳ Pendente'}</span>
                      </button>
                    </td>
                    <td>
                      ${w.contratoData ? `
                        <button type="button" class="btn btn-outline btn-sm" style="padding: 3px 8px; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;" onclick="viewWorkerContract('${srv.id}', '${w.id}')">
                          <span>📄 Ver Contrato</span>
                        </button>
                      ` : `
                        <span style="font-size: 11.5px; color: #94a3b8; font-style: italic;">Sem anexo</span>
                      `}
                    </td>
                    <td style="text-align: right;">
                      <button type="button" class="btn btn-outline btn-sm" style="padding: 4px 8px; font-size: 12px;" onclick="editWorkerInObra('${srv.id}', '${w.id}')">✏️</button>
                      <button type="button" class="btn btn-danger btn-sm" style="padding: 4px 8px; font-size: 12px; margin-left: 4px;" onclick="deleteWorkerFromObra('${srv.id}', '${w.id}')">🗑️</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    contentContainer.innerHTML = workersHtml;

  } else if (currentObraTab === "caixa") {
    // ABA: CAIXA CENTRALIZADO DA OBRA
    const expenses = srv.expenses || [];
    const workers = srv.workers || [];

    contentContainer.innerHTML = `
      <!-- 1. Ganhos do Cliente -->
      <div class="obra-finance-box" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-size: 15px; font-weight: 700; color: #166534; display: flex; align-items: center; gap: 6px;">
            <span>💰 Ganhos do Cliente (Receitas da Obra)</span>
          </h4>
          ${metrics.saldoRestante > 0 ? `
            <button type="button" class="btn btn-sm" style="background: #16a34a; color: #fff; font-weight: 700;" onclick="quickPayFullService('${srv.id}')">
              + Quitar Saldo Restante (R$ ${metrics.saldoRestante.toLocaleString("pt-BR", {minimumFractionDigits: 2})})
            </button>
          ` : `
            <span class="badge badge-success">✓ Obra 100% Paga pelo Cliente</span>
          `}
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 13.5px;">
          <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid var(--border-soft);">
            <div style="font-size: 11.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Valor Total Fechado</div>
            <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">R$ ${metrics.valorTotal.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</div>
          </div>
          <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid var(--border-soft);">
            <div style="font-size: 11.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Entrada / Sinal Recebido</div>
            <div style="font-size: 18px; font-weight: 800; color: #16a34a; margin-top: 4px;">R$ ${metrics.valorEntrada.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</div>
          </div>
          <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid var(--border-soft);">
            <div style="font-size: 11.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Saldo a Receber</div>
            <div style="font-size: 18px; font-weight: 800; color: ${metrics.saldoRestante > 0 ? '#dc2626' : '#64748b'}; margin-top: 4px;">
              R$ ${metrics.saldoRestante.toLocaleString("pt-BR", {minimumFractionDigits: 2})}
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Gastos com Insumos e Materiais -->
      <div class="obra-finance-box" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h4 style="font-size: 15px; font-weight: 700; color: #9a3412;">📦 Gastos com Insumos & Materiais</h4>
            <div style="font-size: 12px; color: #64748b;">MDF, ferragens, tintas, fitas de borda, fretes e insumos específicos desta obra.</div>
          </div>
          <button type="button" class="btn btn-outline btn-sm" style="font-weight: 700;" onclick="openAddExpenseModal('${srv.id}')">+ Lançar Compra de Insumo</button>
        </div>

        ${expenses.length === 0 ? `
          <div style="text-align: center; padding: 24px; color: var(--text-muted); background: #fff; border-radius: 8px; border: 1px dashed var(--border-soft); font-size: 13px;">
            Nenhum insumo ou material lançado para esta obra ainda.
          </div>
        ` : `
          <div class="obra-workers-table-wrapper">
            <table class="obra-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição do Insumo</th>
                  <th>Categoria</th>
                  <th>Fornecedor</th>
                  <th>Valor</th>
                  <th style="text-align: right;">Ação</th>
                </tr>
              </thead>
              <tbody>
                ${expenses.map(exp => `
                  <tr>
                    <td style="font-size: 12px; color: #64748b;">${exp.data || "—"}</td>
                    <td style="font-weight: 600; color: #1e293b;">${exp.descricao}</td>
                    <td><span class="badge badge-neutral" style="font-size: 11px;">${exp.categoria || "Material"}</span></td>
                    <td style="font-size: 12.5px; color: #475569;">${exp.fornecedor || "—"}</td>
                    <td style="font-weight: 700; color: #c2410c;">R$ ${(Number(exp.valor) || 0).toLocaleString("pt-BR", {minimumFractionDigits: 2})}</td>
                    <td style="text-align: right;">
                      <button type="button" class="btn btn-danger btn-sm" style="padding: 3px 6px; font-size: 11px;" onclick="deleteExpenseFromObra('${srv.id}', '${exp.id}')">Excluir</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- 3. Balanço e Demonstrativo do Lucro Líquido da Obra -->
      <div style="background: #18191c; color: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.18);">
        <h4 style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
          <span>Demonstrativo do Caixa da Obra</span>
          <span style="font-size: 13px; font-weight: 600; color: #94a3b8;">DRE Simplificado</span>
        </h4>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
            <span style="color: #94a3b8;">(+) Total Faturado da Obra:</span>
            <strong style="color: #4ade80;">R$ ${metrics.valorTotal.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
            <span style="color: #94a3b8;">(-) Custos com Insumos e Materiais:</span>
            <strong style="color: #fb923c;">R$ ${metrics.custoInsumos.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
            <span style="color: #94a3b8;">(-) Custos com Diárias de Funcionários:</span>
            <strong style="color: #fbbf24;">R$ ${metrics.custoDiarias.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 6px; font-size: 16px;">
            <span style="font-weight: 700; color: #ffffff;">(=) Lucro Líquido Previsto da Obra:</span>
            <strong style="color: ${metrics.lucroPrevisto >= 0 ? '#4ade80' : '#f87171'}; font-size: 18px;">
              R$ ${metrics.lucroPrevisto.toLocaleString("pt-BR", {minimumFractionDigits: 2})} (${metrics.margemLucro}%)
            </strong>
          </div>
        </div>
      </div>
    `;

  } else if (currentObraTab === "detalhes") {
    // ABA: DETALHES DO PROJETO & CONTRATO DO CLIENTE
    contentContainer.innerHTML = `
      <div style="background: #fff; border: 1px solid var(--border-soft); border-radius: 12px; padding: 20px; margin-bottom: 18px;">
        <h4 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Especificações Técnicas do Projeto</h4>
        <div style="margin-bottom: 16px;">
          <label style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px;">O que será produzido / executado:</label>
          <div style="font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-line; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid var(--border-soft);">
            ${srv.descricao || "Sem descrição informada."}
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px;">Materiais, Ferragens e Acabamentos:</label>
          <div style="font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-line; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid var(--border-soft);">
            ${srv.materiais || "Sem materiais especificados."}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 13px;">
          <div>
            <strong>Responsável da Oficina:</strong> ${srv.responsavel || "Não atribuído"}
          </div>
          <div>
            <strong>Forma de Pagamento:</strong> ${srv.formaPag || "Pix"}
          </div>
          <div>
            <strong>Prazo de Entrega:</strong> ${srv.dataEntrega || "A combinar"}
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button type="button" class="btn btn-outline" onclick="editService('${srv.id}')">✏️ Editar Informações Básicas da Ficha</button>
      </div>
    `;
  }
}

// ============================================================================
// ALOCAÇÃO DE FUNCIONÁRIOS NA OBRA (COM DIÁRIAS, DIAS E CONTRATO)
// ============================================================================

function openAddWorkerModal(srvId) {
  const srv = db.services.find(s => s.id == srvId);
  if (!srv) return;

  const form = document.getElementById("workerForm");
  if (form) form.reset();

  document.getElementById("workerSrvId").value = srvId;
  document.getElementById("workerId").value = "";
  document.getElementById("workerExistingContratoData").value = "";
  document.getElementById("workerExistingContratoNome").value = "";

  const preview = document.getElementById("workerContratoPreview");
  if (preview) preview.innerHTML = `<span style="color: var(--text-muted); font-size: 12px;">Nenhum contrato anexado</span>`;

  // Preenche select com os funcionários cadastrados na empresa
  const empSelect = document.getElementById("workerEmployeeSelect");
  if (empSelect) {
    empSelect.innerHTML = '<option value="">-- Selecione da Base de Funcionários (ou digite abaixo) --</option>';
    (db.employees || []).forEach(emp => {
      const opt = document.createElement("option");
      opt.value = emp.id;
      opt.textContent = `${emp.nome} (${emp.cargo || "Especialista"}) — Diária Base: R$ ${(emp.diariaPadrao || 0).toFixed(2)}`;
      empSelect.appendChild(opt);
    });
  }

  document.getElementById("workerModalTitle").textContent = `Alocar Colaborador na Obra de ${srv.cliente}`;
  openModal("workerModal");
}

function handleWorkerSelectChange(empId) {
  if (!empId) return;
  const emp = (db.employees || []).find(e => e.id == empId);
  if (emp) {
    document.getElementById("workerNome").value = emp.nome || "";
    document.getElementById("workerCargo").value = emp.cargo || "Marceneiro";
    document.getElementById("workerDiaria").value = emp.diariaPadrao || 0;
    if (emp.contratoData) {
      document.getElementById("workerExistingContratoData").value = emp.contratoData;
      document.getElementById("workerExistingContratoNome").value = emp.contratoNome || "Contrato_Padrao.pdf";
      const preview = document.getElementById("workerContratoPreview");
      if (preview) {
        preview.innerHTML = `<span style="color: var(--wood-primary); font-size: 12px; font-weight: 600;">✓ Contrato padrão herdado (${emp.contratoNome || "Arquivo"})</span>`;
      }
    }
  }
}

function editWorkerInObra(srvId, workerId) {
  const srv = db.services.find(s => s.id == srvId);
  if (!srv || !Array.isArray(srv.workers)) return;

  const w = srv.workers.find(item => item.id == workerId);
  if (!w) return;

  document.getElementById("workerForm").reset();
  document.getElementById("workerSrvId").value = srvId;
  document.getElementById("workerId").value = w.id;
  document.getElementById("workerNome").value = w.nome || "";
  document.getElementById("workerCargo").value = w.cargo || "Marceneiro";
  document.getElementById("workerDiaria").value = w.valorDiaria || 0;
  document.getElementById("workerDias").value = w.diasTrabalhados || 1;
  document.getElementById("workerStatusPagamento").value = w.statusPagamento || "Pendente";
  document.getElementById("workerExistingContratoData").value = w.contratoData || "";
  document.getElementById("workerExistingContratoNome").value = w.contratoNome || "";

  const preview = document.getElementById("workerContratoPreview");
  if (preview) {
    if (w.contratoData) {
      preview.innerHTML = `<span style="color: var(--wood-primary); font-size: 12px; font-weight: 600;">📄 ${w.contratoNome || "Contrato Anexado"}</span>`;
    } else {
      preview.innerHTML = `<span style="color: var(--text-muted); font-size: 12px;">Nenhum contrato anexado</span>`;
    }
  }

  document.getElementById("workerModalTitle").textContent = `Editar Alocação: ${w.nome}`;
  openModal("workerModal");
}

async function handleSaveWorker(e) {
  e.preventDefault();
  const srvId = document.getElementById("workerSrvId").value;
  const workerId = document.getElementById("workerId").value;
  const srv = db.services.find(s => s.id == srvId);
  if (!srv) return;

  if (!Array.isArray(srv.workers)) srv.workers = [];

  const nome = document.getElementById("workerNome").value.trim();
  const cargo = document.getElementById("workerCargo").value.trim();
  const valorDiaria = parseFloat(document.getElementById("workerDiaria").value) || 0;
  const diasTrabalhados = parseFloat(document.getElementById("workerDias").value) || 1;
  const statusPagamento = document.getElementById("workerStatusPagamento").value;
  const totalDiarias = valorDiaria * diasTrabalhados;

  const fileInput = document.getElementById("workerContratoFile");
  let contratoData = document.getElementById("workerExistingContratoData").value;
  let contratoNome = document.getElementById("workerExistingContratoNome").value;

  if (fileInput && fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    contratoNome = file.name;
    try {
      contratoData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.warn("Erro ao ler contrato da obra:", err);
    }
  }

  if (workerId) {
    // Edição
    const idx = srv.workers.findIndex(w => w.id == workerId);
    if (idx !== -1) {
      srv.workers[idx] = {
        ...srv.workers[idx],
        nome,
        cargo,
        valorDiaria,
        diasTrabalhados,
        totalDiarias,
        statusPagamento,
        contratoData,
        contratoNome
      };
      showToast("Alocação de colaborador atualizada!", "success");
    }
  } else {
    // Nova alocação
    const newWorker = {
      id: Date.now(),
      nome,
      cargo,
      valorDiaria,
      diasTrabalhados,
      totalDiarias,
      statusPagamento,
      contratoData,
      contratoNome
    };
    srv.workers.push(newWorker);
    showToast("Colaborador alocado na obra!", "success");
  }

  saveCacheDB("services", db.services);
  closeModal("workerModal");
  renderObraInspection();
  renderServices(db.services);

  if (typeof sbClient !== "undefined" && sbClient) {
    sbClient.from("services").update({ workers: srv.workers }).eq("id", srv.id).then(() => {
      console.log("Equipe da obra sincronizada no Supabase.");
    }).catch(e => console.error("Erro workers Supabase:", e));
  }
}

async function deleteWorkerFromObra(srvId, workerId) {
  const srv = db.services.find(s => s.id == srvId);
  if (!srv || !Array.isArray(srv.workers)) return;

  const w = srv.workers.find(item => item.id == workerId);
  const nomeW = w ? w.nome : "este colaborador";

  const confirmado = await customConfirm(
    `Deseja remover "${nomeW}" da equipe desta obra?

O cálculo das diárias será atualizado no caixa da obra.`,
    "Remover Colaborador da Obra",
    { danger: true, confirmText: "Sim, Remover" }
  );

  if (!confirmado) return;

  srv.workers = srv.workers.filter(item => item.id != workerId);
  saveCacheDB("services", db.services);
  renderObraInspection();
  renderServices(db.services);

  if (typeof sbClient !== "undefined" && sbClient) {
    sbClient.from("services").update({ workers: srv.workers }).eq("id", srv.id).then(() => {}).catch(e => console.error(e));
  }
  showToast("Colaborador removido da obra!", "success");
}

function toggleWorkerPaymentStatus(srvId, workerId) {
  const srv = db.services.find(s => s.id == srvId);
  if (!srv || !Array.isArray(srv.workers)) return;

  const w = srv.workers.find(item => item.id == workerId);
  if (!w) return;

  w.statusPagamento = (w.statusPagamento === "Pago") ? "Pendente" : "Pago";
  saveCacheDB("services", db.services);
  renderObraInspection();
  showToast(`Diárias de ${w.nome} marcadas como: ${w.statusPagamento}`, "info");
}

function viewWorkerContract(srvId, workerId) {
  const srv = db.services.find(s => s.id == srvId);
  if (!srv || !Array.isArray(srv.workers)) return;

  const w = srv.workers.find(item => item.id == workerId);
  if (!w || !w.contratoData) {
    showToast("Nenhum contrato anexado para este colaborador nesta obra.", "info");
    return;
  }

  const win = window.open();
  if (win) {
    if (w.contratoData.startsWith("data:application/pdf")) {
      win.document.write(`<iframe src="${w.contratoData}" style="width:100%; height:100%; border:none;"></iframe>`);
    } else if (w.contratoData.startsWith("data:image")) {
      win.document.write(`<div style="display:flex; justify-content:center; align-items:center; min-height:100vh; background:#111;"><img src="${w.contratoData}" style="max-width:100%; max-height:100vh; object-fit:contain;"/></div>`);
    } else {
      const a = document.createElement("a");
      a.href = w.contratoData;
      a.download = w.contratoNome || "contrato_trabalho";
      a.click();
    }
  } else {
    showToast("Permita popups no navegador para visualizar o documento.", "warning");
  }
}

// ============================================================================
// LANÇAMENTO DE GASTOS DE INSUMOS E MATERIAIS DA OBRA
// ============================================================================

function openAddExpenseModal(srvId) {
  const srv = db.services.find(s => s.id == srvId);
  if (!srv) return;

  const form = document.getElementById("expenseForm");
  if (form) form.reset();

  document.getElementById("expenseSrvId").value = srvId;
  document.getElementById("expenseData").value = new Date().toLocaleDateString("pt-BR");
  document.getElementById("expenseModalTitle").textContent = `Lançar Insumo na Obra: ${srv.cliente}`;
  openModal("expenseModal");
}

async function handleSaveExpense(e) {
  e.preventDefault();
  const srvId = document.getElementById("expenseSrvId").value;
  const srv = db.services.find(s => s.id == srvId);
  if (!srv) return;

  if (!Array.isArray(srv.expenses)) srv.expenses = [];

  const descricao = document.getElementById("expenseDescricao").value.trim();
  const categoria = document.getElementById("expenseCategoria").value;
  const fornecedor = document.getElementById("expenseFornecedor").value.trim();
  const valor = parseFloat(document.getElementById("expenseValor").value) || 0;
  const data = document.getElementById("expenseData").value || new Date().toLocaleDateString("pt-BR");
  const lancarCaixaGeral = document.getElementById("expenseLancarCaixaGeral").checked;

  const newExpense = {
    id: Date.now(),
    descricao,
    categoria,
    fornecedor,
    valor,
    data
  };

  srv.expenses.unshift(newExpense);
  saveCacheDB("services", db.services);

  // Se o usuário optou por lançar também no Caixa Geral da empresa
  if (lancarCaixaGeral && valor > 0) {
    const tx = {
      id: Date.now() + 2,
      tipo: "Saída",
      clientId: srv.clienteId,
      clienteNome: srv.cliente,
      descricao: `Insumo Obra (#SRV-${String(srv.id).slice(-4)}): ${descricao}`,
      valor: valor,
      categoria: "Insumos & Materiais",
      data: data
    };
    db.transactions.unshift(tx);
    saveCacheDB("transactions", db.transactions);
    renderFinanceiro(db.transactions);
    if (sbClient) {
      safeDbInsert("transactions", {
        tipo: "Saída",
        client_id: srv.clienteId,
        cliente_nome: srv.cliente,
        descricao: tx.descricao,
        valor: valor,
        categoria: tx.categoria,
        data: data
      }).then(() => {});
    }
  }

  closeModal("expenseModal");
  renderObraInspection();
  renderServices(db.services);
  showToast("Insumo registrado no caixa da obra!", "success");

  if (typeof sbClient !== "undefined" && sbClient) {
    sbClient.from("services").update({ expenses: srv.expenses }).eq("id", srv.id).then(() => {
      console.log("Insumos da obra sincronizados no Supabase.");
    }).catch(e => console.error("Erro expenses Supabase:", e));
  }
}

async function deleteExpenseFromObra(srvId, expenseId) {
  const srv = db.services.find(s => s.id == srvId);
  if (!srv || !Array.isArray(srv.expenses)) return;

  const exp = srv.expenses.find(e => e.id == expenseId);
  const desc = exp ? exp.descricao : "este insumo";

  const confirmado = await customConfirm(
    `Deseja excluir o gasto "${desc}" desta obra?`,
    "Excluir Insumo",
    { danger: true, confirmText: "Sim, Excluir" }
  );

  if (!confirmado) return;

  srv.expenses = srv.expenses.filter(e => e.id != expenseId);
  saveCacheDB("services", db.services);
  renderObraInspection();
  renderServices(db.services);
  showToast("Insumo removido da obra!", "success");
}

// ============================================================================
// RENDERIZAÇÃO DA LISTA GERAL DE OBRAS (PAINEL GERENCIAMENTO DE OBRAS)
// ============================================================================

function renderServices(services) {
  const container = document.getElementById("servicesList");
  if (!container) return;
  container.innerHTML = "";

  const filteredServices = currentServiceFilter === "Todos"
    ? services
    : services.filter(s => s.status === currentServiceFilter);

  const totalTxt = document.getElementById("servicesTotalTxt");
  if (totalTxt) {
    totalTxt.textContent = `${filteredServices.length} de ${services.length} obras exibidas`;
  }

  if (filteredServices.length === 0) {
    container.innerHTML = `
      <div class="admin-empty-state">
        <div class="empty-icon">🏗️</div>
        <h4>Nenhuma obra encontrada</h4>
        <p>Não há obras ou fichas de produção cadastradas no filtro <strong>"${currentServiceFilter}"</strong>.</p>
      </div>`;
    return;
  }

  filteredServices.forEach(srv => {
    let badgeColor = "badge-neutral";
    if (srv.status === "A Iniciar") badgeColor = "badge-warning";
    else if (srv.status === "Em Produção / Oficina") badgeColor = "badge-info";
    else if (srv.status === "Em Montagem / Obra") badgeColor = "badge-warning";
    else if (srv.status === "Concluído") badgeColor = "badge-success";

    const metrics = calculateObraMetrics(srv);
    const workersCount = (srv.workers || []).length;
    const expensesCount = (srv.expenses || []).length;

    const card = document.createElement("div");
    card.className = "service-sheet-card obra-card";
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div>
          <div style="font-size: 11px; font-weight: 700; color: var(--wood-primary); text-transform: uppercase;">OBRA #SRV-${String(srv.id).slice(-4)}</div>
          <h4 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-top: 1px;">${srv.cliente}</h4>
          <span style="font-size: 12.5px; color: #64748b; font-weight: 500;">📱 ${srv.telefone || "Sem telefone"}</span>
        </div>
        <span class="badge ${badgeColor}">${srv.status || "A Iniciar"}</span>
      </div>

      <div style="background: #ffffff; border: 1px solid var(--border-soft); border-radius: 8px; padding: 6px 10px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <span style="font-size: 11.5px; font-weight: 700; color: var(--text-muted);">Status da Obra:</span>
        <select class="form-control" style="width: auto; padding: 4px 8px; font-size: 12px; font-weight: 600;" onchange="updateServiceStatus('${srv.id}', this.value)">
          <option value="A Iniciar" ${srv.status === "A Iniciar" ? "selected" : ""}>⏳ A Iniciar</option>
          <option value="Em Produção / Oficina" ${srv.status === "Em Produção / Oficina" ? "selected" : ""}>🔨 Em Produção</option>
          <option value="Em Montagem / Obra" ${srv.status === "Em Montagem / Obra" ? "selected" : ""}>🚚 Em Montagem</option>
          <option value="Concluído" ${srv.status === "Concluído" ? "selected" : ""}>✅ Concluído</option>
        </select>
      </div>

      <div class="sheet-row" style="margin-bottom: 8px;">
        <span class="sheet-label">Projeto / O que será feito:</span>
        <div class="sheet-val" style="font-size: 13px; line-height: 1.4; max-height: 52px; overflow: hidden; text-overflow: ellipsis;">${srv.descricao}</div>
      </div>

      <!-- Caixa Resumo da Obra -->
      <div style="background: #fbf9f6; border: 1px solid var(--border-soft); border-radius: 10px; padding: 12px; margin: 12px 0; font-size: 12.5px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #64748b;">Valor Fechado:</span>
          <strong style="color: #0f172a; font-size: 13.5px;">R$ ${metrics.valorTotal.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #ea580c;">
          <span>Insumos (${expensesCount}) + Diárias (${workersCount}):</span>
          <strong>R$ ${metrics.custoTotal.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 4px; border-top: 1px dashed var(--border-soft); color: ${metrics.lucroPrevisto >= 0 ? '#16a34a' : '#dc2626'}; font-weight: 700;">
          <span>Lucro Líquido Previsto:</span>
          <span>R$ ${metrics.lucroPrevisto.toLocaleString("pt-BR", {minimumFractionDigits: 2})} (${metrics.margemLucro}%)</span>
        </div>
      </div>

      <!-- Botão Principal de Inspeção -->
      <button type="button" class="btn btn-primary btn-sm btn-inspect-obra" onclick="openObraInspection('${srv.id}')">
        <span>🔍 Inspecionar Obra / Abrir Painel Completo</span>
      </button>

      <div style="display: flex; gap: 8px; margin-top: 8px;">
        <button type="button" class="btn btn-outline btn-sm" style="flex: 1;" onclick="editService('${srv.id}')">✏️ Editar Ficha</button>
        <button type="button" class="btn btn-danger btn-sm" onclick="deleteService('${srv.id}')">Excluir</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Exportar funções globalmente
window.renderServices = renderServices;
window.filterServices = filterServices;
window.populateClientSelectOptions = populateClientSelectOptions;
window.handleSelectClientInService = handleSelectClientInService;
window.openNewServiceModal = openNewServiceModal;
window.openNewServiceForClient = openNewServiceForClient;
window.createServiceFromLead = createServiceFromLead;
window.editService = editService;
window.handleSaveService = handleSaveService;
window.deleteService = deleteService;
window.updateServiceStatus = updateServiceStatus;
window.quickPayFullService = quickPayFullService;

window.openObraInspection = openObraInspection;
window.switchObraTab = switchObraTab;
window.renderObraInspection = renderObraInspection;

window.openAddWorkerModal = openAddWorkerModal;
window.handleWorkerSelectChange = handleWorkerSelectChange;
window.editWorkerInObra = editWorkerInObra;
window.handleSaveWorker = handleSaveWorker;
window.deleteWorkerFromObra = deleteWorkerFromObra;
window.toggleWorkerPaymentStatus = toggleWorkerPaymentStatus;
window.viewWorkerContract = viewWorkerContract;

window.openAddExpenseModal = openAddExpenseModal;
window.handleSaveExpense = handleSaveExpense;
window.deleteExpenseFromObra = deleteExpenseFromObra;
