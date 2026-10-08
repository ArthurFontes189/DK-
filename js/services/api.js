// ============================================================================
// SERVIÇO DE CONEXÃO COM BANCO DE DADOS (SUPABASE & REALTIME SYNC EM TEMPO REAL)
// DK Revestimentos - Arquitetura Cloud-First (Multi-Dispositivo PC & Mobile)
// ============================================================================

let sbClient = null;
let realtimeChannel = null;
let dbHealthState = {
  connected: false,
  lastCheck: null,
  tables: {
    services: { ok: false, count: 0, error: null },
    clients: { ok: false, count: 0, error: null },
    leads: { ok: false, count: 0, error: null },
    transactions: { ok: false, count: 0, error: null },
    employees: { ok: false, count: 0, error: null },
    portfolio: { ok: false, count: 0, error: null }
  }
};

// Inicializa a conexão com o Supabase e configura ouvintes em tempo real
async function initSupabase() {
  if (typeof window !== "undefined" && window.supabase && typeof SUPABASE_URL !== "undefined" && typeof SUPABASE_KEY !== "undefined" && SUPABASE_URL && SUPABASE_KEY) {
    try {
      sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: true },
        realtime: { params: { eventsPerSecond: 10 } }
      });
      console.log("☁️ Supabase Client inicializado com sucesso.");

      // 1. Testa a integridade real das tabelas na nuvem
      await testDatabaseConnection();

      // 2. Assina o canal de WebSockets para atualizações automáticas em tempo real
      subscribeRealtime();

      // 3. Busca imediatamente todos os dados da nuvem
      await fetchCloudData();

      // 4. Configura ouvintes para reconexão automática e retorno de aba no celular (wake-up)
      setupDeviceLifecycleSync();

      return true;
    } catch (e) {
      console.error("Erro ao iniciar Supabase:", e);
      updateSyncIndicator(false, e.message);
    }
  } else {
    updateSyncIndicator(false, "Credenciais ausentes ou biblioteca Supabase não carregada.");
  }
  return false;
}

// Testa a integridade e acessibilidade de cada tabela no Supabase
async function testDatabaseConnection(showToastAlert = false) {
  if (!sbClient) {
    updateSyncIndicator(false, "Offline / Sem cliente Supabase");
    return dbHealthState;
  }

  const tableNames = ["services", "clients", "leads", "transactions", "employees", "portfolio"];
  let allOk = true;
  let errorSummary = [];

  for (const tName of tableNames) {
    try {
      const { count, error } = await sbClient
        .from(tName)
        .select("*", { count: "exact", head: true });

      if (error) {
        allOk = false;
        dbHealthState.tables[tName] = { ok: false, count: 0, error: error.message };
        errorSummary.push(`${tName}: ${error.message}`);
      } else {
        dbHealthState.tables[tName] = { ok: true, count: count || 0, error: null };
      }
    } catch (err) {
      allOk = false;
      dbHealthState.tables[tName] = { ok: false, count: 0, error: err.message };
      errorSummary.push(`${tName}: ${err.message}`);
    }
  }

  dbHealthState.connected = allOk;
  dbHealthState.lastCheck = new Date();

  updateSyncIndicator(allOk, errorSummary.length > 0 ? errorSummary.join(" | ") : null);
  updateDbHealthModalUI();

  if (showToastAlert) {
    if (allOk) {
      if (typeof showToast === "function") showToast("Nuvem 100% conectada e tabelas verificadas!", "success");
    } else {
      if (typeof showToast === "function") showToast("Aviso: Existem tabelas com erro no Supabase. Clique no indicador para detalhes.", "warning");
    }
  }

  return dbHealthState;
}

// Atualiza o indicador visual de conexão na barra administrativa
function updateSyncIndicator(isConnected, errorMsg = null) {
  const el = document.getElementById("syncIndicator");
  if (!el) return;

  el.style.display = "inline-flex";
  el.style.cursor = "pointer";
  el.onclick = () => {
    if (typeof openDbHealthModal === "function") openDbHealthModal();
  };

  if (isConnected) {
    el.style.color = "#047857";
    el.style.background = "#ecfdf5";
    el.style.borderColor = "#a7f3d0";
    el.title = "Nuvem Conectada em Tempo Real! Clique para ver a saúde das tabelas.";
    el.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span> Nuvem em Tempo Real';
  } else {
    el.style.color = "#b91c1c";
    el.style.background = "#fef2f2";
    el.style.borderColor = "#fca5a5";
    el.title = errorMsg ? `Alerta de Banco: ${errorMsg}. Clique para abrir o diagnóstico e copiar o SQL.` : "Desconectado do banco em nuvem. Clique para resolver.";
    el.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; display: inline-block;"></span> ⚠️ Alerta de Nuvem (Clique)';
  }
}

// Assina eventos do PostgreSQL via WebSocket para sincronização instantânea entre PC e Celular
function subscribeRealtime() {
  if (!sbClient) return;
  try {
    if (realtimeChannel) {
      sbClient.removeChannel(realtimeChannel);
    }

    realtimeChannel = sbClient
      .channel("dk-realtime-sync-v1")
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, (p) => {
        console.log("⚡ [Realtime] Obra alterada remotamente:", p.eventType);
        fetchCloudData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, (p) => {
        console.log("⚡ [Realtime] Cliente alterado remotamente:", p.eventType);
        fetchCloudData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (p) => {
        console.log("⚡ [Realtime] Orçamento alterado remotamente:", p.eventType);
        fetchCloudData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, (p) => {
        console.log("⚡ [Realtime] Lançamento de caixa alterado remotamente:", p.eventType);
        fetchCloudData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "employees" }, (p) => {
        console.log("⚡ [Realtime] Colaborador alterado remotamente:", p.eventType);
        fetchCloudData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "portfolio" }, (p) => {
        console.log("⚡ [Realtime] Portfólio alterado remotamente:", p.eventType);
        fetchCloudData();
      })
      .subscribe((status) => {
        console.log("⚡ Canal WebSocket Supabase:", status);
        if (status === "SUBSCRIBED") {
          updateSyncIndicator(true);
        }
      });
  } catch (err) {
    console.warn("Aviso na assinatura em tempo real:", err);
  }
}

// Configura sincronização ativa no ciclo de vida do aparelho celular (ao ligar tela ou voltar à aba)
let lifecycleAttached = false;
function setupDeviceLifecycleSync() {
  if (lifecycleAttached) return;
  lifecycleAttached = true;

  // Quando o usuário volta à aba do navegador no celular ou no PC
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      console.log("📱 [Mobile Sync] Tela ativa ou aba focada. Sincronizando dados da nuvem...");
      fetchCloudData();
    }
  });

  window.addEventListener("focus", () => {
    fetchCloudData();
  });

  // Heartbeat automático a cada 12 segundos para garantir sincronia constante
  setInterval(() => {
    if (document.visibilityState === "visible" && sbClient) {
      fetchCloudData();
    }
  }, 12000);
}

// Busca todos os dados da nuvem usando Promise.allSettled para que o erro em uma tabela nunca trave as outras
async function fetchCloudData(showFeedback = false) {
  if (!sbClient) return;
  if (showFeedback && typeof showToast === "function") {
    showToast("Atualizando dados em tempo real...");
  }

  try {
    const results = await Promise.allSettled([
      sbClient.from("services").select("*").order("id", { ascending: false }),
      sbClient.from("clients").select("*").order("id", { ascending: false }),
      sbClient.from("leads").select("*").order("id", { ascending: false }),
      sbClient.from("transactions").select("*").order("id", { ascending: false }),
      sbClient.from("employees").select("*").order("id", { ascending: false }),
      sbClient.from("portfolio").select("*").order("id", { ascending: false })
    ]);

    const [sRes, cRes, lRes, tRes, eRes, pRes] = results;

    // 1. OBRAS / SERVIÇOS (Foco central do marceneiro)
    if (sRes.status === "fulfilled") {
      if (sRes.value.error) {
        console.error("Erro na tabela services do Supabase:", sRes.value.error);
        if (showFeedback && typeof showToast === "function") {
          showToast("Erro ao carregar obras: " + sRes.value.error.message, "danger");
        }
      } else if (sRes.value.data) {
        db.services = sRes.value.data.map(item => {
          let parsedWorkers = [];
          try {
            parsedWorkers = Array.isArray(item.workers) ? item.workers : (typeof item.workers === "string" ? JSON.parse(item.workers || "[]") : []);
          } catch (e) { parsedWorkers = []; }

          let parsedExpenses = [];
          try {
            parsedExpenses = Array.isArray(item.expenses) ? item.expenses : (typeof item.expenses === "string" ? JSON.parse(item.expenses || "[]") : []);
          } catch (e) { parsedExpenses = []; }

          return {
            id: item.id,
            leadId: item.lead_id,
            clienteId: item.client_id,
            cliente: item.cliente,
            cpf: item.cpf || "",
            telefone: item.telefone || "",
            endereco: item.endereco || "",
            descricao: item.descricao || "",
            materiais: item.materiais || "",
            valorTotal: parseFloat(item.valor_total) || 0,
            valorEntrada: parseFloat(item.valor_entrada) || 0,
            formaPag: item.forma_pagamento || "Pix",
            responsavel: item.responsavel || "",
            dataEntrega: item.data_entrega || "",
            status: item.status || "A Iniciar",
            workers: parsedWorkers,
            expenses: parsedExpenses
          };
        });
        saveCacheDB("services", db.services);
      }
    }

    // 2. CLIENTES
    if (cRes.status === "fulfilled" && cRes.value.data) {
      db.clients = cRes.value.data.map(item => ({
        id: item.id,
        codigoCliente: item.codigo_cliente,
        cpf: item.cpf || "",
        nome: item.nome || "Cliente",
        telefone: item.telefone || "",
        endereco: item.endereco || "",
        obs: item.obs || "",
        dataCadastro: item.data_cadastro || ""
      }));
      saveCacheDB("clients", db.clients);
    }

    // 3. ORÇAMENTOS / LEADS
    if (lRes.status === "fulfilled" && lRes.value.data) {
      db.leads = lRes.value.data.map(item => ({
        id: item.id,
        nome: item.nome || "Lead",
        telefone: item.telefone || "",
        bairro: item.bairro || "",
        tipo: item.tipo_servico || "Marcenaria",
        status: item.status || "Pendente de Contato",
        dataHora: item.data_hora || (item.created_at ? new Date(item.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "")
      }));
      saveCacheDB("leads", db.leads);
    }

    // 4. TRANSAÇÕES / CAIXA
    if (tRes.status === "fulfilled" && tRes.value.data) {
      db.transactions = tRes.value.data.map(item => ({
        id: item.id,
        tipo: item.tipo,
        clienteId: item.client_id,
        clienteNome: item.cliente_nome,
        descricao: item.descricao,
        valor: parseFloat(item.valor) || 0,
        categoria: item.categoria,
        data: item.data || ""
      }));
      saveCacheDB("transactions", db.transactions);
    }

    // 5. FUNCIONÁRIOS
    if (eRes.status === "fulfilled" && eRes.value.data) {
      db.employees = eRes.value.data.map(item => ({
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

    // 6. PORTFÓLIO & MÍDIAS (com filtro de exclusões persistentes)
    if (pRes.status === "fulfilled" && pRes.value.data && pRes.value.data.length > 0) {
      const deletedIds = new Set(JSON.parse(localStorage.getItem("marcenaria_deleted_portfolio_ids") || "[]").map(String));
      const deletedTitles = new Set(JSON.parse(localStorage.getItem("marcenaria_deleted_portfolio_titles") || "[]").map(t => (t || "").toLowerCase().trim()));

      const seeds = (typeof DEFAULT_REAL_PORTFOLIO !== "undefined" ? DEFAULT_REAL_PORTFOLIO : []);
      const seedMap = new Map();
      seeds.forEach(s => seedMap.set(String(s.id), s));

      let cloudItems = pRes.value.data.map(item => {
        const localMatch = seedMap.get(String(item.id));
        const rawUrl = item.midia_url || (localMatch ? localMatch.midiaUrl : "") || "";
        let finalMidiaUrl = (localMatch && localMatch.midiaUrl && localMatch.midiaUrl.endsWith(".mp4")) 
          ? localMatch.midiaUrl 
          : rawUrl;

        let finalPoster = (localMatch && localMatch.posterUrl) ? localMatch.posterUrl : (item.poster_url || "");
        if (finalMidiaUrl.endsWith(".pdf") && (!finalPoster || finalPoster.endsWith(".pdf"))) {
          finalPoster = "assets/portfolio/pdf_page1.jpg";
        }

        return {
          id: item.id,
          tipoMidia: item.tipo_midia || (localMatch ? localMatch.tipoMidia : "foto"),
          proporcao: item.proporcao || (localMatch ? localMatch.proporcao : "horizontal"),
          titulo: item.titulo,
          categoria: item.categoria,
          subtitulo: item.subtitulo || (localMatch ? localMatch.subtitulo : ""),
          descricao: item.descricao || (localMatch ? localMatch.descricao : ""),
          midiaUrl: finalMidiaUrl,
          posterUrl: finalPoster,
          destaque: item.destaque || (localMatch ? localMatch.destaque : false)
        };
      });

      cloudItems = cloudItems.filter(p => !deletedIds.has(String(p.id)) && !deletedTitles.has((p.titulo || "").toLowerCase().trim()));

      const seenIds = new Set(cloudItems.map(p => String(p.id)));
      const seenTitles = new Set(cloudItems.map(p => (p.titulo || "").toLowerCase().trim()));

      const missingSeeds = seeds.filter(s => 
        !seenIds.has(String(s.id)) && 
        !seenTitles.has((s.titulo || "").toLowerCase().trim()) &&
        !deletedIds.has(String(s.id)) &&
        !deletedTitles.has((s.titulo || "").toLowerCase().trim())
      );

      db.portfolio = [...cloudItems, ...missingSeeds];
      saveCacheDB("portfolio", db.portfolio);
    }

    // Atualiza a interface
    if (typeof renderPublicCatalog === "function") renderPublicCatalog();
    if (typeof renderAdmin === "function") renderAdmin();

    // Atualiza o horário da última sincronização
    const timeEl = document.getElementById("lastSyncTimeText");
    if (timeEl) {
      const now = new Date();
      timeEl.style.display = "inline";
      timeEl.textContent = `Atualizado às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
    }

    if (showFeedback && typeof showToast === "function") {
      showToast("Sincronização em tempo real concluída com sucesso!", "success");
    }
  } catch (err) {
    console.warn("Aviso na sincronização do Supabase:", err);
    if (typeof renderAdmin === "function") renderAdmin();
    updateSyncIndicator(false, err.message);
  }
}

// ============================================================================
// WRAPPERS RESILIENTES DE GRAVAÇÃO (STRICT CLOUD PERSISTENCE)
// ============================================================================

async function safeDbInsert(tableName, payload) {
  if (!sbClient) return { data: null, error: new Error("Desconectado do Supabase (Offline)") };

  let currentPayload = { ...payload };
  const keys = Object.keys(currentPayload);
  let attempts = 0;

  while (attempts < keys.length + 1) {
    attempts++;
    const res = await sbClient.from(tableName).insert([currentPayload]).select();
    if (!res.error) {
      return res;
    }

    const msg = res.error.message || "";

    // Se o erro for de coluna ausente no cache do schema do Supabase
    const match = msg.match(/Could not find the '([^']+)' column/) || msg.match(/column "([^"]+)" of relation "[^"]+" does not exist/);
    if (match && match[1] && currentPayload.hasOwnProperty(match[1])) {
      const col = match[1];
      console.warn(`Aviso: coluna '${col}' não existe na tabela '${tableName}'. Reenviando sem ela...`);
      delete currentPayload[col];
      continue;
    }

    // Se for erro de RLS (Row Level Security)
    if (msg.includes("violates row-level security policy")) {
      console.error(`Erro RLS na tabela ${tableName}:`, msg);
      if (typeof openDbHealthModal === "function") {
        openDbHealthModal(`A gravação na tabela "${tableName}" foi bloqueada pelas políticas de segurança (RLS) do Supabase.`);
      }
      return res;
    }

    // Se a tabela não existir
    if (msg.includes("does not exist")) {
      console.error(`Tabela não existe: ${tableName}`);
      if (typeof openDbHealthModal === "function") {
        openDbHealthModal(`A tabela "${tableName}" não existe no seu projeto Supabase.`);
      }
      return res;
    }

    return res;
  }
  return { data: null, error: new Error("Falha ao salvar após tentativas.") };
}

async function safeDbUpdate(tableName, payload, matchField, matchValue) {
  if (!sbClient) return { data: null, error: new Error("Desconectado do Supabase (Offline)") };

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
    const match = msg.match(/Could not find the '([^']+)' column/) || msg.match(/column "([^"]+)" of relation "[^"]+" does not exist/);
    if (match && match[1] && currentPayload.hasOwnProperty(match[1])) {
      const col = match[1];
      console.warn(`Aviso: coluna '${col}' não existe na tabela '${tableName}'. Reenviando sem ela...`);
      delete currentPayload[col];
      continue;
    }

    if (msg.includes("violates row-level security policy")) {
      console.error(`Erro RLS na tabela ${tableName}:`, msg);
      if (typeof openDbHealthModal === "function") {
        openDbHealthModal(`A atualização na tabela "${tableName}" foi bloqueada por RLS no Supabase.`);
      }
      return res;
    }

    return res;
  }
  return { data: null, error: new Error("Falha ao atualizar após tentativas.") };
}

// Modal de diagnóstico do Supabase e alinhamento SQL
function updateDbHealthModalUI() {
  const container = document.getElementById("dbHealthTableList");
  if (!container) return;

  const tNames = {
    services: "Obras em Andamento (services)",
    clients: "Cadastro de Clientes (clients)",
    leads: "Solicitações de Orçamento (leads)",
    transactions: "Fluxo de Caixa (transactions)",
    employees: "Equipe de Funcionários (employees)",
    portfolio: "Mídias do Portfólio (portfolio)"
  };

  let html = "";
  for (const [tKey, label] of Object.entries(tNames)) {
    const tInfo = dbHealthState.tables[tKey] || { ok: false, count: 0, error: "Não checado" };
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #fff; border: 1px solid var(--border-soft); border-radius: 8px; margin-bottom: 8px;">
        <div>
          <strong style="font-size: 13.5px; color: #0f172a;">${label}</strong>
          ${tInfo.error ? `<div style="font-size: 11.5px; color: #dc2626; margin-top: 2px;">${tInfo.error}</div>` : `<div style="font-size: 11.5px; color: #15803d; margin-top: 2px;">✓ Conectada (${tInfo.count} registros na nuvem)</div>`}
        </div>
        <div>
          <span class="badge ${tInfo.ok ? 'badge-success' : 'badge-danger'}" style="font-size: 11px;">
            ${tInfo.ok ? '✓ OK' : '❌ Falha / RLS'}
          </span>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function openDbHealthModal(extraMessage = "") {
  updateDbHealthModalUI();
  const alertEl = document.getElementById("dbHealthAlertMsg");
  if (alertEl) {
    if (extraMessage) {
      alertEl.style.display = "block";
      alertEl.textContent = extraMessage;
    } else {
      alertEl.style.display = "none";
    }
  }
  if (typeof openModal === "function") openModal("dbHealthModal");
}

function copySupabaseSqlSchema() {
  const sql = `-- ====================================================================
-- SCRIPT DE ALINHAMENTO DEFINITIVO DO BANCO DE DADOS (SUPABASE)
-- DK Revestimentos (Projeto: rmzhabsrcsaxqnqypoje)
-- Resolve 100% de sincronização em tempo real entre computador e celular
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.leads (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT,
    telefone TEXT,
    bairro TEXT,
    tipo_servico TEXT,
    status TEXT DEFAULT 'Pendente de Contato',
    data_hora TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tipo_servico TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pendente de Contato';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS data_hora TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.clients (
    id BIGSERIAL PRIMARY KEY,
    codigo_cliente TEXT,
    cpf TEXT,
    nome TEXT NOT NULL DEFAULT 'Cliente',
    telefone TEXT,
    endereco TEXT,
    obs TEXT,
    data_cadastro TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS codigo_cliente TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS nome TEXT DEFAULT 'Cliente';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS obs TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS data_cadastro TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.services (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT,
    client_id BIGINT,
    cliente TEXT,
    cpf TEXT,
    telefone TEXT,
    endereco TEXT,
    descricao TEXT,
    materiais TEXT,
    valor_total NUMERIC DEFAULT 0,
    valor_entrada NUMERIC DEFAULT 0,
    forma_pagamento TEXT,
    responsavel TEXT,
    data_entrega TEXT,
    status TEXT DEFAULT 'A Iniciar',
    workers JSONB DEFAULT '[]'::jsonb,
    expenses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS lead_id BIGINT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS client_id BIGINT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS cliente TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS materiais TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS valor_total NUMERIC DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS valor_entrada NUMERIC DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS forma_pagamento TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS responsavel TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS data_entrega TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'A Iniciar';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS workers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS expenses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    tipo TEXT,
    client_id BIGINT,
    cliente_nome TEXT,
    descricao TEXT,
    valor NUMERIC DEFAULT 0,
    categoria TEXT,
    data TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS tipo TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS client_id BIGINT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS cliente_nome TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS valor NUMERIC DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS categoria TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS data TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.employees (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    cargo TEXT,
    telefone TEXT,
    chave_pix TEXT,
    diaria_padrao NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Ativo',
    contrato_nome TEXT,
    contrato_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS chave_pix TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS diaria_padrao NUMERIC DEFAULT 0;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativo';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS contrato_nome TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS contrato_url TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.portfolio (
    id BIGSERIAL PRIMARY KEY,
    tipo_midia TEXT DEFAULT 'foto',
    proporcao TEXT DEFAULT 'vertical',
    titulo TEXT,
    subtitulo TEXT,
    categoria TEXT,
    descricao TEXT,
    midia_url TEXT,
    poster_url TEXT,
    gdrive_id TEXT,
    destaque BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS tipo_midia TEXT DEFAULT 'foto';
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS proporcao TEXT DEFAULT 'vertical';
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS titulo TEXT;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS subtitulo TEXT;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS categoria TEXT;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS midia_url TEXT;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS gdrive_id TEXT;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT false;
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.leads TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.clients TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.services TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.transactions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.employees TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.portfolio TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads, public.clients, public.services, public.transactions, public.portfolio, public.employees;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
END $$;

NOTIFY pgrst, 'reload schema';`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(sql).then(() => {
      if (typeof showToast === "function") showToast("Script SQL copiado para a área de transferência!", "success");
    }).catch(() => {
      prompt("Copie o script SQL abaixo:", sql);
    });
  } else {
    prompt("Copie o script SQL abaixo:", sql);
  }
}

// Exportações globais
window.sbClient = sbClient;
window.initSupabase = initSupabase;
window.fetchCloudData = fetchCloudData;
window.subscribeRealtime = subscribeRealtime;
window.safeDbInsert = safeDbInsert;
window.safeDbUpdate = safeDbUpdate;
window.testDatabaseConnection = testDatabaseConnection;
window.openDbHealthModal = openDbHealthModal;
window.copySupabaseSqlSchema = copySupabaseSqlSchema;
