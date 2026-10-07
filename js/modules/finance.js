// ============================================================================
// MÓDULO DE FLUXO DE CAIXA (RECEBIMENTOS, DESPESAS E SALDO)
// ============================================================================

function populateTxClientSelect(selectedCliId) {
  const select = document.getElementById("txClienteId");
  if (!select) return;
  select.innerHTML = '<option value="">-- Sem vínculo específico (Avulso) --</option>';

  db.clients.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.nome}`;
    if (selectedCliId && c.id == selectedCliId) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderFinanceiro(transactions) {
  const container = document.getElementById("transactionsList");
  if (!container) return;
  container.innerHTML = "";

  let totalIn = 0;
  let totalOut = 0;

  transactions.forEach(t => {
    if (t.tipo === "Entrada") totalIn += (t.valor || 0);
    else totalOut += (t.valor || 0);
  });

  const saldo = totalIn - totalOut;
  document.getElementById("saldoTotal").textContent = "R$ " + saldo.toLocaleString("pt-BR", {minimumFractionDigits: 2});
  document.getElementById("entradasTotal").textContent = "R$ " + totalIn.toLocaleString("pt-BR", {minimumFractionDigits: 2});
  document.getElementById("saidasTotal").textContent = "R$ " + totalOut.toLocaleString("pt-BR", {minimumFractionDigits: 2});

  if (transactions.length === 0) {
    container.innerHTML = `
      <div class="admin-empty-state">
        <div class="empty-icon">💰</div>
        <h4>Nenhuma movimentação registrada</h4>
        <p>Não há entradas ou saídas lançadas no fluxo de caixa no momento.</p>
      </div>`;
    return;
  }

  transactions.forEach(tx => {
    const item = document.createElement("div");
    item.className = "tx-item";
    item.innerHTML = `
      <div>
        <h5 style="font-size: 14.5px; font-weight: 700;">${tx.descricao}</h5>
        <span style="font-size: 12.5px; color: var(--text-muted);">
          ${tx.clienteNome ? `<strong>Cliente:</strong> ${tx.clienteNome} • ` : ""}
          ${tx.categoria} • ${tx.data}
        </span>
      </div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <div class="tx-val ${tx.tipo === 'Entrada' ? 'in' : 'out'}">
          ${tx.tipo === 'Entrada' ? '+' : '-'} R$ ${(tx.valor || 0).toLocaleString("pt-BR", {minimumFractionDigits: 2})}
        </div>
        <button onclick="deleteTx(${tx.id})" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:18px;">&times;</button>
      </div>
    `;
    container.appendChild(item);
  });
}

function openNewTxModal(tipo) {
  document.getElementById("txForm").reset();
  document.getElementById("txTipo").value = tipo;
  document.getElementById("txModalTitle").textContent = tipo === "Entrada" ? "Registrar Recebimento (+)" : "Registrar Despesa (-)";
  document.getElementById("txData").value = new Date().toISOString().split("T")[0];

  const clientGroup = document.getElementById("txClientGroup");
  if (clientGroup) {
    clientGroup.style.display = tipo === "Entrada" ? "block" : "none";
  }
  populateTxClientSelect(null);
  openModal("txModal");
}

async function handleSaveTx(e) {
  e.preventDefault();
  const tipo = document.getElementById("txTipo").value;
  const desc = document.getElementById("txDescricao").value.trim();
  const valor = parseFloat(document.getElementById("txValor").value) || 0;
  const cat = document.getElementById("txCategoria").value;
  const data = document.getElementById("txData").value;
  const cliId = document.getElementById("txClienteId").value;

  let cliNome = null;
  if (cliId) {
    const found = db.clients.find(c => c.id == cliId);
    if (found) cliNome = found.nome;
  }

  const newTx = {
    id: Date.now(),
    tipo,
    clienteId: cliId ? parseInt(cliId) : null,
    clienteNome: cliNome,
    descricao: desc,
    valor,
    categoria: cat,
    data: data || new Date().toISOString().split("T")[0]
  };

  if (sbClient) {
    try {
      const { data: resData, error: txErr } = await safeDbInsert("transactions", {
        tipo,
        client_id: newTx.clienteId,
        cliente_nome: cliNome,
        descricao: desc,
        valor,
        categoria: cat,
        data: newTx.data
      });

      if (txErr) {
        alert("Erro ao gravar lançamento no banco: " + txErr.message);
        return;
      }
      if (resData && resData[0]) newTx.id = resData[0].id;
    } catch (e) {
      alert("Falha de conexão ao gravar no caixa: " + e.message);
      return;
    }
  }

  db.transactions.unshift(newTx);
  saveCacheDB("transactions", db.transactions);
  closeModal("txModal");
  showToast("Lançamento no caixa realizado com sucesso!");
  renderAdmin();
}

async function deleteTx(txId) {
  const confirmado = await customConfirm("Deseja realmente apagar este lançamento do caixa?", "Excluir Lançamento", { danger: true, confirmText: "Sim, Apagar" });
  if (!confirmado) return;
  db.transactions = db.transactions.filter(t => t.id != txId);
  saveCacheDB("transactions", db.transactions);
  renderFinanceiro(db.transactions);

  if (sbClient) {
    try {
      const { error } = await sbClient.from("transactions").delete().eq("id", txId);
      if (error) alert("Erro ao excluir do banco: " + error.message);
    } catch (e) {
      console.error("Erro Supabase:", e);
    }
  }
}
