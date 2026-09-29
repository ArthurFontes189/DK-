// ============================================================================
// MÓDULO DE GESTÃO DE CLIENTES OFICIAIS (COM CÓDIGO E CPF)
// ============================================================================

// Formatação automática de CPF (000.000.000-00)
function maskCPF(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

// Gera código sequencial amigável (CLI-0001, CLI-0002...)
function generateClientCode(clientsList) {
  const count = clientsList.length + 1;
  return "CLI-" + String(count).padStart(4, "0");
}

// Renderiza a listagem de clientes e seus balanços financeiros
function renderClients(clients, services, transactions) {
  const container = document.getElementById("clientsList");
  if (!container) return;
  container.innerHTML = "";

  if (clients.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); background: #fff; border-radius: var(--radius); border: 1px solid var(--border-soft);">Nenhum cliente registrado ainda. Os clientes são criados automaticamente ao abrir a primeira ficha de serviço.</div>`;
    return;
  }

  clients.forEach(cli => {
    const cliServices = (services || []).filter(s => {
      if (!s) return false;
      if (s.clienteId && cli.id && s.clienteId == cli.id) return true;
      if (cli.cpf && s.cpf && s.cpf === cli.cpf) return true;
      if (s.cliente && cli.nome && String(s.cliente).toLowerCase() === String(cli.nome).toLowerCase()) return true;
      return false;
    });
    const totalContratado = cliServices.reduce((acc, s) => acc + (s.valorTotal || 0), 0);
    
    const cliTransactions = (transactions || []).filter(t => {
      if (!t) return false;
      if (t.clienteId && cli.id && t.clienteId == cli.id) return true;
      if (t.clienteNome && cli.nome && String(t.clienteNome).toLowerCase() === String(cli.nome).toLowerCase()) return true;
      return false;
    });
    const totalPago = cliTransactions.reduce((acc, t) => acc + (t.valor || 0), 0);
    const saldoDevedor = totalContratado - totalPago;

    const cleanTel = cli.telefone ? cli.telefone.replace(/\D/g, "") : "";
    const waLink = `https://api.whatsapp.com/send?phone=55${cleanTel}`;
    const codigoFormatado = cli.codigoCliente || `CLI-${String(cli.id).slice(-4)}`;

    const card = document.createElement("div");
    card.className = "client-card";
    card.innerHTML = `
      <div class="client-card-header">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge badge-gold" style="font-size: 11px;">${codigoFormatado}</span>
            <h4 style="font-size: 16.5px; font-weight: 700;">${cli.nome}</h4>
          </div>
          <div style="font-size: 12px; color: #64748b; margin-top: 3px;">
            <strong>CPF:</strong> ${cli.cpf ? cli.cpf : "Não informado"}
          </div>
          <a href="${waLink}" target="_blank" class="lead-phone">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.18 8.18 0 0 1-5.82 2.41h-.01c-1.46 0-2.9-.39-4.16-1.13l-.3-.18-3.1 1.01.83-3.02-.19-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m4.53 11.66c-.25-.13-1.48-.73-1.71-.81-.23-.09-.4-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.26-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.09-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.48-.61 1.69-1.19.21-.59.21-1.09.15-1.19-.06-.1-.23-.16-.48-.28z"/></svg>
            ${cli.telefone}
          </a>
        </div>
        <span class="badge badge-neutral">${cliServices.length} serviço(s)</span>
      </div>

      <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
        ${cli.endereco ? `📍 ${cli.endereco}<br>` : ""}
        ${cli.obs ? `📝 <em>${cli.obs}</em><br>` : ""}
        <span style="font-size: 11.5px; color: #94a3b8;">Cadastrado em: ${cli.dataCadastro || "Recentemente"}</span>
      </div>

      <div style="background: #fbf9f6; border: 1px solid var(--border-soft); border-radius: 8px; padding: 12px; margin-bottom: 14px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Total Contratado:</span>
          <strong>R$ ${totalContratado.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--success);">
          <span>Total Pago:</span>
          <strong>R$ ${totalPago.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; color: ${saldoDevedor > 0 ? 'var(--danger)' : 'var(--text-muted)'}; font-weight: 700;">
          <span>Saldo Devedor:</span>
          <span>R$ ${saldoDevedor.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</span>
        </div>
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="openNewServiceForClient(${cli.id})">+ Nova Ficha</button>
        <button class="btn btn-outline btn-sm" onclick="editClient(${cli.id})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteClient(${cli.id})">Excluir</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function editClient(cliId) {
  const cli = db.clients.find(c => c.id == cliId);
  if (!cli) return;

  document.getElementById("cliId").value = cli.id;
  document.getElementById("cliNome").value = cli.nome;
  document.getElementById("cliTelefone").value = cli.telefone;
  document.getElementById("cliEndereco").value = cli.endereco || "";
  document.getElementById("cliObs").value = cli.obs || "";
  document.getElementById("clientModalTitle").textContent = "Editar Cliente: " + cli.nome;
  openModal("clientModal");
}

async function handleSaveClient(e) {
  e.preventDefault();
  const id = document.getElementById("cliId").value;
  const nome = document.getElementById("cliNome").value.trim();
  const telefone = document.getElementById("cliTelefone").value.trim();
  const endereco = document.getElementById("cliEndereco").value.trim();
  const obs = document.getElementById("cliObs").value.trim();
  const dataCad = new Date().toLocaleDateString("pt-BR");

  let clientRecord = null;
  if (id) {
    const index = db.clients.findIndex(c => c.id == id);
    if (index !== -1) {
      db.clients[index].nome = nome;
      db.clients[index].telefone = telefone;
      db.clients[index].endereco = endereco;
      db.clients[index].obs = obs;
      clientRecord = db.clients[index];
    }
  } else {
    const cod = generateClientCode(db.clients);
    clientRecord = {
      id: Date.now(),
      codigoCliente: cod,
      nome,
      telefone,
      endereco,
      obs,
      dataCadastro: dataCad
    };
    db.clients.unshift(clientRecord);
  }

  saveCacheDB("clients", db.clients);
  closeModal("clientModal");
  showToast("Cliente salvo com sucesso!");
  renderAdmin();

  if (sbClient && clientRecord) {
    try {
      if (id) {
        const { error } = await safeDbUpdate("clients", { nome, telefone, endereco, obs }, "id", id);
        if (error) alert("Aviso: Erro ao sincronizar cliente na nuvem: " + error.message);
      } else {
        const { data, error } = await safeDbInsert("clients", {
          codigo_cliente: clientRecord.codigoCliente,
          nome,
          telefone,
          endereco,
          obs,
          data_cadastro: dataCad
        });
        if (error) alert("Aviso: Erro ao gravar cliente no banco: " + error.message);
        if (data && data[0]) clientRecord.id = data[0].id;
      }
    } catch (e) {
      console.error("Erro Supabase:", e);
    }
  }
}

async function deleteClient(cliId) {
  if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
  db.clients = db.clients.filter(c => c.id != cliId);
  saveCacheDB("clients", db.clients);
  showToast("Cliente excluído.");
  renderAdmin();

  if (sbClient) {
    try {
      const { error } = await sbClient.from("clients").delete().eq("id", cliId);
      if (error) alert("Erro ao excluir cliente no banco: " + error.message);
    } catch (e) {
      console.error("Erro Supabase:", e);
    }
  }
}
