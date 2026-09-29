// ============================================================================
// MÓDULO DE FICHAS TÉCNICAS DE SERVIÇOS (ORDENS DE PRODUÇÃO & MONTAGEM)
// ============================================================================

let currentServiceFilter = "Todos";

function filterServices(status, btn) {
  currentServiceFilter = status;
  document.querySelectorAll("#serviceFiltersBar .filter-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderServices(db.services);
}

function populateClientSelectOptions(selectedCliId) {
  const select = document.getElementById("srvClienteSelect");
  if (!select) return;
  select.innerHTML = '<option value="">+ Não, é um Novo Cliente (cadastrar com esta ficha)</option>';

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
  document.getElementById("serviceModalTitle").textContent = "Nova Ficha de Serviço";
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
  document.getElementById("serviceModalTitle").textContent = "Nova Ficha para: " + cli.nome;
  openModal("serviceModal");
}

function createServiceFromLead(leadId) {
  const lead = db.leads.find(l => l.id == leadId);
  if (!lead) {
    alert("Solicitação não encontrada.");
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
  document.getElementById("serviceModalTitle").textContent = "Criar Ficha & Registrar Cliente: " + lead.nome;

  openModal("serviceModal");
}

function editService(srvId) {
  const srv = db.services.find(s => s.id == srvId);
  if (!srv) {
    alert("Ficha de serviço não encontrada.");
    return;
  }

  document.getElementById("serviceForm").reset();
  document.getElementById("srvId").value = srv.id;
  document.getElementById("srvLeadId").value = srv.leadId || "";
  populateClientSelectOptions(srv.clienteId || null);

  document.getElementById("srvCliente").value = srv.cliente || "";
  document.getElementById("srvCpf").value = srv.cpf || "";
  document.getElementById("srvTelefone").value = srv.telefone || "";
  document.getElementById("srvEndereco").value = srv.endereco || "";
  document.getElementById("srvDescricao").value = srv.descricao || "";
  document.getElementById("srvMateriais").value = srv.materiais || "";
  document.getElementById("srvValorTotal").value = srv.valorTotal || "";
  document.getElementById("srvValorEntrada").value = srv.valorEntrada || "";
  document.getElementById("srvFormaPag").value = srv.formaPag || "";
  document.getElementById("srvResponsavel").value = srv.responsavel || "";
  document.getElementById("srvDataEntrega").value = srv.dataEntrega || "";
  document.getElementById("srvStatus").value = srv.status || "A Iniciar";

  document.getElementById("serviceModalTitle").textContent = "Editar Ficha: " + srv.cliente;
  openModal("serviceModal");
}

// Gravação estrita no banco com validação de cliente e exclusão atômica de lead
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
      const codigoCli = generateClientCode(db.clients);
      clientRecord = {
        id: Date.now(),
        codigoCliente: codigoCli,
        cpf: cpf,
        nome: clienteNome,
        telefone: telefone,
        endereco: endereco,
        obs: "Cadastrado via 1ª Ficha de Serviço",
        dataCadastro: new Date().toLocaleDateString("pt-BR")
      };

      if (sbClient) {
        try {
          const { data: cData, error: cErr } = await safeDbInsert("clients", {
            codigo_cliente: codigoCli,
            cpf: cpf,
            nome: clienteNome,
            telefone: telefone,
            endereco: endereco,
            obs: clientRecord.obs,
            data_cadastro: clientRecord.dataCadastro
          });

          if (cErr) {
            alert("Erro ao gravar cliente no banco de dados: " + cErr.message);
            return;
          }
          if (cData && cData[0]) clientRecord.id = cData[0].id;
        } catch (err) {
          alert("Falha de conexão ao criar cliente: " + err.message);
          return;
        }
      }

      db.clients.unshift(clientRecord);
      saveCacheDB("clients", db.clients);
      finalCliId = clientRecord.id;
    }
  }

  // 2. Gravar Ficha de Serviço
  const srvPayload = {
    lead_id: leadId ? parseInt(leadId) : null,
    client_id: finalCliId,
    cliente: clienteNome,
    cliente_nome: clienteNome,
    telefone: telefone,
    descricao: document.getElementById("srvDescricao").value.trim(),
    materiais: document.getElementById("srvMateriais").value.trim(),
    valor_total: valorTotal,
    valor_entrada: valorEntrada,
    forma_pagamento: document.getElementById("srvFormaPag").value.trim(),
    responsavel: document.getElementById("srvResponsavel").value.trim(),
    data_entrega: document.getElementById("srvDataEntrega").value,
    status: document.getElementById("srvStatus").value
  };

  const srvLocal = {
    id: id ? parseInt(id) : Date.now(),
    leadId: srvPayload.lead_id,
    clienteId: srvPayload.client_id,
    cliente: srvPayload.cliente,
    cpf: cpf,
    telefone: srvPayload.telefone,
    endereco: endereco,
    descricao: srvPayload.descricao,
    materiais: srvPayload.materiais,
    valorTotal: srvPayload.valor_total,
    valorEntrada: srvPayload.valor_entrada,
    formaPag: srvPayload.forma_pagamento,
    responsavel: srvPayload.responsavel,
    dataEntrega: srvPayload.data_entrega,
    status: srvPayload.status
  };

  if (sbClient) {
    try {
      if (id) {
        const { error: sErr } = await safeDbUpdate("services", srvPayload, "id", id);
        if (sErr) {
          alert("Erro ao atualizar ficha no banco: " + sErr.message);
          return;
        }
      } else {
        const { data: sData, error: sErr } = await safeDbInsert("services", srvPayload);
        if (sErr) {
          alert("Erro ao gravar ficha no banco de dados: " + sErr.message);
          return;
        }
        if (sData && sData[0]) srvLocal.id = sData[0].id;
      }
    } catch (err) {
      alert("Falha de conexão ao salvar ficha: " + err.message);
      return;
    }
  }

  if (id) {
    const index = db.services.findIndex(s => s.id == id);
    if (index !== -1) db.services[index] = srvLocal;
  } else {
    db.services.unshift(srvLocal);

    // 3. Remoção do lead de orçamentos se originou de um lead
    if (leadId) {
      db.leads = db.leads.filter(l => l.id != leadId);
      saveCacheDB("leads", db.leads);
      if (sbClient) sbClient.from("leads").delete().eq("id", leadId).then(() => {});
    }

    // Entrada no caixa se houver sinal
    if (valorEntrada > 0) {
      const newTx = {
        id: Date.now() + 1,
        tipo: "Entrada",
        clienteId: finalCliId,
        clienteNome: clienteNome,
        descricao: `Entrada recebida - ${clienteNome}`,
        valor: valorEntrada,
        categoria: "Recebimento de Cliente",
        data: new Date().toISOString().split("T")[0]
      };
      db.transactions.unshift(newTx);
      saveCacheDB("transactions", db.transactions);

      if (sbClient) {
        safeDbInsert("transactions", {
          tipo: "Entrada",
          client_id: finalCliId,
          cliente_nome: clienteNome,
          descricao: newTx.descricao,
          valor: valorEntrada,
          categoria: "Recebimento de Cliente",
          data: newTx.data
        }).then(() => {});
      }
    }
  }

  saveCacheDB("services", db.services);
  closeModal("serviceModal");
  showToast("Ficha salva no banco com sucesso! Cliente registrado.");
  renderAdmin();
}

async function deleteService(srvId) {
  if (!confirm("Tem certeza que deseja excluir esta ficha de serviço?")) return;
  db.services = db.services.filter(s => s.id != srvId);
  saveCacheDB("services", db.services);
  showToast("Ficha de serviço excluída.");
  renderAdmin();

  if (sbClient) {
    try {
      const { error } = await sbClient.from("services").delete().eq("id", srvId);
      if (error) alert("Erro ao excluir do banco: " + error.message);
    } catch (e) {
      console.error("Erro Supabase:", e);
    }
  }
}

async function updateServiceStatus(srvId, newStatus) {
  const srv = db.services.find(s => s.id == srvId);
  if (srv) {
    srv.status = newStatus;
    saveCacheDB("services", db.services);
    showToast(`Status atualizado para "${newStatus}"!`);
    renderServices(db.services);

    if (sbClient) {
      try {
        const { error } = await sbClient.from("services").update({ status: newStatus }).eq("id", srvId);
        if (error) console.error("Erro ao atualizar status:", error);
      } catch (e) {
        console.error("Erro Supabase:", e);
      }
    }
  }
}

// Quitação rápida de saldo com lançamento direto no Caixa
async function quickPayFullService(srvId) {
  const srv = db.services.find(s => s.id == srvId);
  if (!srv) return;

  const saldoRestante = (srv.valorTotal || 0) - (srv.valorEntrada || 0);
  if (saldoRestante <= 0) {
    alert("Este serviço já está totalmente quitado!");
    return;
  }

  const confirmar = confirm(`Confirmar recebimento do saldo restante de R$ ${saldoRestante.toLocaleString('pt-BR', {minimumFractionDigits: 2})} de ${srv.cliente}?\n\nO valor será gravado no Caixa como entrada quitada.`);
  if (!confirmar) return;

  srv.valorEntrada = srv.valorTotal;
  const txDataHoje = new Date().toISOString().split("T")[0];
  const txDesc = `Quitação de saldo final - ${srv.cliente} (${srv.descricao.substring(0, 30)}...)`;

  const newTx = {
    id: Date.now(),
    tipo: "Entrada",
    clienteId: srv.clienteId || null,
    clienteNome: srv.cliente,
    descricao: txDesc,
    valor: saldoRestante,
    categoria: "Recebimento de Cliente",
    data: txDataHoje
  };

  db.transactions.unshift(newTx);

  if (srv.status !== "Concluído") {
    const concluir = confirm("Deseja também alterar o status da obra para 'Concluído'?");
    if (concluir) srv.status = "Concluído";
  }

  saveCacheDB("services", db.services);
  saveCacheDB("transactions", db.transactions);
  showToast("Serviço marcado como 100% quitado e caixa atualizado!");
  renderAdmin();

  if (sbClient) {
    try {
      await Promise.all([
        sbClient.from("services").update({
          valor_entrada: srv.valorTotal,
          status: srv.status
        }).eq("id", srv.id),
        sbClient.from("transactions").insert([{
          tipo: "Entrada",
          client_id: srv.clienteId || null,
          cliente_nome: srv.cliente,
          descricao: txDesc,
          valor: saldoRestante,
          categoria: "Recebimento de Cliente",
          data: txDataHoje
        }])
      ]);
    } catch (e) {
      console.error("Erro ao sincronizar quitação no Supabase:", e);
    }
  }
}

function renderServices(services) {
  const container = document.getElementById("servicesList");
  if (!container) return;
  container.innerHTML = "";

  const filteredServices = currentServiceFilter === "Todos"
    ? services
    : services.filter(s => s.status === currentServiceFilter);

  const totalTxt = document.getElementById("servicesTotalTxt");
  if (totalTxt) {
    totalTxt.textContent = `${filteredServices.length} de ${services.length} serviços exibidos`;
  }

  if (filteredServices.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); background: #fff; border-radius: var(--radius); border: 1px solid var(--border-soft);">Nenhum serviço encontrado no filtro "${currentServiceFilter}".</div>`;
    return;
  }

  filteredServices.forEach(srv => {
    let badgeColor = "badge-neutral";
    if (srv.status === "A Iniciar") badgeColor = "badge-warning";
    else if (srv.status === "Em Produção / Oficina") badgeColor = "badge-info";
    else if (srv.status === "Em Montagem / Obra") badgeColor = "badge-warning";
    else if (srv.status === "Concluído") badgeColor = "badge-success";

    const saldoRestante = (srv.valorTotal || 0) - (srv.valorEntrada || 0);

    const card = document.createElement("div");
    card.className = "service-sheet-card";
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div>
          <h4 style="font-size: 16.5px; font-weight: 700;">${srv.cliente}</h4>
          <span style="font-size: 13px; color: var(--wood-primary); font-weight: 600;">${srv.telefone}</span>
        </div>
        <span class="badge ${badgeColor}">${srv.status}</span>
      </div>

      <div style="background: #ffffff; border: 1px solid var(--border-soft); border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Mudar Status:</span>
        <select class="form-control" style="width: auto; padding: 5px 10px; font-size: 12.5px; font-weight: 600;" onchange="updateServiceStatus(${srv.id}, this.value)">
          <option value="A Iniciar" ${srv.status === "A Iniciar" ? "selected" : ""}>⏳ A Iniciar</option>
          <option value="Em Produção / Oficina" ${srv.status === "Em Produção / Oficina" ? "selected" : ""}>🔨 Em Produção</option>
          <option value="Em Montagem / Obra" ${srv.status === "Em Montagem / Obra" ? "selected" : ""}>🚚 Em Montagem</option>
          <option value="Concluído" ${srv.status === "Concluído" ? "selected" : ""}>✅ Concluído</option>
        </select>
      </div>

      <div class="sheet-row">
        <span class="sheet-label">O que será feito:</span>
        <div class="sheet-val">${srv.descricao}</div>
      </div>

      <div class="sheet-row">
        <span class="sheet-label">Materiais e Acabamentos:</span>
        <div class="sheet-val">${srv.materiais}</div>
      </div>

      <div style="background: #fbf9f6; border: 1px solid var(--border-soft); border-radius: 8px; padding: 12px; margin: 12px 0; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Valor Fechado:</span>
          <strong>R$ ${(srv.valorTotal || 0).toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--success);">
          <span>Entrada Paga:</span>
          <span>R$ ${(srv.valorEntrada || 0).toLocaleString("pt-BR", {minimumFractionDigits: 2})}</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: ${saldoRestante > 0 ? 'var(--danger)' : 'var(--text-muted)'}; font-weight: 700;">
          <span>Saldo a Receber:</span>
          <span>R$ ${saldoRestante.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</span>
        </div>
      </div>

      ${saldoRestante > 0 ? `
        <button class="btn btn-sm" style="background: #ecfdf5; color: #166534; border: 1px solid #a7f3d0; font-weight: 700; width: 100%; margin-bottom: 12px;" onclick="quickPayFullService(${srv.id})">
          💰 Marcar como Totalmente Pago (+ R$ ${saldoRestante.toLocaleString("pt-BR", {minimumFractionDigits: 2})})
        </button>
      ` : `
        <div style="text-align: center; background: #ecfdf5; color: #166534; border: 1px solid #a7f3d0; padding: 6px; border-radius: 8px; font-size: 12px; font-weight: 700; margin-bottom: 12px;">
          ✓ Serviço Totalmente Quitado (100% Pago)
        </div>
      `}

      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; color: var(--text-muted); margin-bottom: 14px;">
        <span>👷 <strong>Responsável:</strong> ${srv.responsavel || "Não atribuído"}</span>
        <span>📅 <strong>Entrega:</strong> ${srv.dataEntrega || "A combinar"}</span>
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="editService(${srv.id})">✏️ Editar Ficha</button>
        <button class="btn btn-danger btn-sm" onclick="deleteService(${srv.id})">Excluir</button>
      </div>
    `;
    container.appendChild(card);
  });
}
