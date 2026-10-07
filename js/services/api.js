// ============================================================================
// SERVIÇO DE CONEXÃO COM BANCO DE DADOS (SUPABASE & REALTIME SYNC)
// ============================================================================

let sbClient = null;
let realtimeChannel = null;

// Inicializa a conexão com o Supabase
function initSupabase() {
  if (window.supabase && SUPABASE_URL && SUPABASE_KEY) {
    try {
      sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      updateSyncIndicator(true);
      subscribeRealtime();
      fetchCloudData();
      return true;
    } catch (e) {
      console.error("Erro ao iniciar Supabase:", e);
      updateSyncIndicator(false);
    }
  } else {
    updateSyncIndicator(false);
  }
  return false;
}

// Atualiza o indicador visual de conexão na barra administrativa
function updateSyncIndicator(isConnected) {
  const el = document.getElementById("syncIndicator");
  if (!el) return;
  if (isConnected) {
    el.style.display = "inline-flex";
    el.style.color = "#4ade80";
    el.style.background = "rgba(34, 197, 94, 0.15)";
    el.style.borderColor = "rgba(34, 197, 94, 0.3)";
    el.title = "Conectado ao Supabase (PostgreSQL na nuvem)";
    el.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: #4ade80; display: inline-block;"></span> Banco Sincronizado';
  } else {
    el.style.display = "inline-flex";
    el.style.color = "#f59e0b";
    el.style.background = "rgba(245, 158, 11, 0.15)";
    el.style.borderColor = "rgba(245, 158, 11, 0.3)";
    el.title = "Operando com banco de dados local (localStorage). Clique em 🔄 para tentar reconectar à nuvem.";
    el.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span> Modo Offline';
  }
}

// Ouve eventos do PostgreSQL em tempo real via WebSocket
function subscribeRealtime() {
  if (!sbClient) return;
  try {
    if (realtimeChannel) {
      sbClient.removeChannel(realtimeChannel);
    }
    realtimeChannel = sbClient
      .channel('public-db-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('⚡ Notificação em tempo real recebida:', payload.eventType, payload.table);
        fetchCloudData();
      })
      .subscribe();
  } catch (err) {
    console.warn('Realtime subscription:', err);
  }
}

// Busca todos os dados da nuvem e atualiza a interface
async function fetchCloudData(showFeedback = false) {
  if (!sbClient) return;
  if (showFeedback) showToast("Buscando dados atualizados do banco...");

  try {
    const [pRes, lRes, cRes, sRes, tRes, eRes] = await Promise.all([
      sbClient.from("portfolio").select("*").order("id", { ascending: false }),
      sbClient.from("leads").select("*").order("id", { ascending: false }),
      sbClient.from("clients").select("*").order("id", { ascending: false }),
      sbClient.from("services").select("*").order("id", { ascending: false }),
      sbClient.from("transactions").select("*").order("id", { ascending: false }),
      sbClient.from("employees").select("*").order("id", { ascending: false }).catch(err => ({ data: [] }))
    ]);

    if (pRes.data && pRes.data.length > 0) {
      const seeds = (typeof DEFAULT_REAL_PORTFOLIO !== 'undefined' ? DEFAULT_REAL_PORTFOLIO : []);
      const seedMap = new Map();
      seeds.forEach(s => seedMap.set(String(s.id), s));

      const cloudItems = pRes.data.map(item => {
        const localMatch = seedMap.get(String(item.id));
        return {
          id: item.id,
          tipoMidia: item.tipo_midia || (localMatch ? localMatch.tipoMidia : 'foto'),
          proporcao: item.proporcao || (localMatch ? localMatch.proporcao : 'horizontal'),
          titulo: item.titulo,
          categoria: item.categoria,
          subtitulo: item.subtitulo || (localMatch ? localMatch.subtitulo : ''),
          descricao: item.descricao || (localMatch ? localMatch.descricao : ''),
          // Preserva sempre o arquivo local MP4 quando existir localmente
          midiaUrl: (localMatch && localMatch.midiaUrl.endsWith('.mp4')) ? localMatch.midiaUrl : (item.midia_url || (localMatch ? localMatch.midiaUrl : '')),
          posterUrl: (localMatch && localMatch.posterUrl) ? localMatch.posterUrl : (item.poster_url || ''),
          destaque: item.destaque || (localMatch ? localMatch.destaque : False)
        };
      });

      // Deduplica estritamente por ID e por Título Normalizado
      const seenIds = new Set(cloudItems.map(p => String(p.id)));
      const seenTitles = new Set(cloudItems.map(p => (p.titulo || '').toLowerCase().trim()));

      const missingSeeds = seeds.filter(s => 
        !seenIds.has(String(s.id)) && !seenTitles.has((s.titulo || '').toLowerCase().trim())
      );

      db.portfolio = [...cloudItems, ...missingSeeds];
      saveCacheDB("portfolio", db.portfolio);
    } else {
      db.portfolio = [...(typeof DEFAULT_REAL_PORTFOLIO !== 'undefined' ? DEFAULT_REAL_PORTFOLIO : [])];
      saveCacheDB("portfolio", db.portfolio);
    }

    if (lRes.data) {
      db.leads = lRes.data.map(item => ({
        id: item.id,
        nome: item.nome,
        telefone: item.telefone,
        bairro: item.bairro,
        tipo: item.tipo_servico,
        status: item.status,
        dataHora: item.data_hora || (item.created_at ? new Date(item.created_at).toLocaleString("pt-BR", {dateStyle: "short", timeStyle: "short"}) : "")
      }));
      saveCacheDB("leads", db.leads);
    }

    if (cRes.data) {
      db.clients = cRes.data.map(item => ({
        id: item.id,
        codigoCliente: item.codigo_cliente,
        cpf: item.cpf,
        nome: item.nome,
        telefone: item.telefone,
        endereco: item.endereco,
        obs: item.obs,
        dataCadastro: item.data_cadastro
      }));
      saveCacheDB("clients", db.clients);
    }

    if (sRes.data) {
      db.services = sRes.data.map(item => ({
        id: item.id,
        leadId: item.lead_id,
        clienteId: item.client_id,
        cliente: item.cliente,
        cpf: item.cpf,
        telefone: item.telefone,
        endereco: item.endereco,
        descricao: item.descricao,
        materiais: item.materiais,
        valorTotal: parseFloat(item.valor_total) || 0,
        valorEntrada: parseFloat(item.valor_entrada) || 0,
        formaPag: item.forma_pagamento,
        responsavel: item.responsavel,
        dataEntrega: item.data_entrega,
        status: item.status
      }));
      saveCacheDB("services", db.services);
    }

    if (tRes.data) {
      db.transactions = tRes.data.map(item => ({
        id: item.id,
        tipo: item.tipo,
        clienteId: item.client_id,
        clienteNome: item.cliente_nome,
        descricao: item.descricao,
        valor: parseFloat(item.valor) || 0,
        categoria: item.categoria,
        data: item.data
      }));
      saveCacheDB("transactions", db.transactions);
    }

    if (eRes && eRes.data) {
      db.employees = eRes.data.map(item => ({
        id: item.id,
        nome: item.nome,
        cargo: item.cargo,
        telefone: item.telefone,
        chavePix: item.chave_pix,
        diariaPadrao: parseFloat(item.diaria_padrao) || 0,
        status: item.status || "Ativo",
        contratoNome: item.contrato_nome,
        contratoData: item.contrato_url || "",
        dataCadastro: item.created_at ? new Date(item.created_at).toLocaleDateString("pt-BR") : ""
      }));
      saveCacheDB("employees", db.employees);
    }

    renderPublicCatalog();
    if (isAdminLoggedIn) renderAdmin();
    if (showFeedback) showToast("Dados atualizados com sucesso!");
  } catch (err) {
    console.error("Erro ao sincronizar banco:", err);
    if (showFeedback) alert("Erro ao sincronizar dados: " + err.message);
  }
}

// ============================================================================
// WRAPPERS RESILIENTES DE GRAVAÇÃO (PREVINE ERROS DE SCHEMA E COLUNAS AUSENTES)
// ============================================================================

async function safeDbInsert(tableName, payload) {
  if (!sbClient) return { data: null, error: new Error("Offline") };

  let currentPayload = { ...payload };
  const keys = Object.keys(currentPayload);
  let attempts = 0;

  while (attempts < keys.length + 1) {
    attempts++;
    const res = await sbClient.from(tableName).insert([currentPayload]).select();
    if (!res.error) {
      return res;
    }

    // Se o erro for de coluna ausente no cache do schema do Supabase
    const msg = res.error.message || "";
    const match = msg.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && currentPayload.hasOwnProperty(match[1])) {
      const col = match[1];
      console.warn(`Aviso: coluna '${col}' não existe na tabela '${tableName}'. Reenviando sem ela...`);
      delete currentPayload[col];
      continue;
    }

    // Se for erro de RLS (Row Level Security)
    if (msg.includes("violates row-level security policy")) {
      console.error(`Erro RLS na tabela ${tableName}:`, msg);
      alert(`Aviso: O Supabase bloqueou a gravação na tabela "${tableName}" por segurança (RLS). Execute o script de alinhamento SQL no painel do Supabase para liberar o acesso.`);
      return res;
    }

    return res;
  }
  return { data: null, error: new Error("Falha ao salvar após tentativas.") };
}

async function safeDbUpdate(tableName, payload, matchField, matchValue) {
  if (!sbClient) return { data: null, error: new Error("Offline") };

  let currentPayload = { ...payload };
  const keys = Object.keys(currentPayload);
  let attempts = 0;

  while (attempts < keys.length + 1) {
    attempts++;
    const res = await sbClient.from(tableName).update(currentPayload).eq(matchField, matchValue).select();
    if (!res.error) {
      return res;
    }

    const msg = res.error.message || "";
    const match = msg.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && currentPayload.hasOwnProperty(match[1])) {
      const col = match[1];
      console.warn(`Aviso: coluna '${col}' não existe na tabela '${tableName}'. Reenviando sem ela...`);
      delete currentPayload[col];
      continue;
    }

    if (msg.includes("violates row-level security policy")) {
      console.error(`Erro RLS na tabela ${tableName}:`, msg);
      alert(`Aviso: O Supabase bloqueou a atualização na tabela "${tableName}" por segurança (RLS). Execute o script de alinhamento SQL no painel do Supabase.`);
      return res;
    }

    return res;
  }
  return { data: null, error: new Error("Falha ao atualizar após tentativas.") };
}
