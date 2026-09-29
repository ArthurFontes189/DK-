// ============================================================================
// SERVIÇO DE CACHE E ESTADO EM MEMÓRIA (OFFLINE-FIRST CAPABILITY)
// ============================================================================

// Estado reativo central em memória
let db = {
  leads: [],
  clients: [],
  services: [],
  transactions: [],
  portfolio: []
};

// Lê do cache local para renderização instantânea enquanto a nuvem sincroniza
function loadCachedDB() {
  try {
    db.leads = JSON.parse(localStorage.getItem("marcenaria_leads") || "[]");
    db.clients = JSON.parse(localStorage.getItem("marcenaria_clients") || "[]");
    db.services = JSON.parse(localStorage.getItem("marcenaria_services") || "[]");
    db.transactions = JSON.parse(localStorage.getItem("marcenaria_transactions") || "[]");
    db.portfolio = JSON.parse(localStorage.getItem("marcenaria_portfolio") || "[]");
  } catch (e) {
    console.warn("Erro ao ler cache local:", e);
  }
  return db;
}

// Grava snapshot no cache local
function saveCacheDB(key, data) {
  try {
    localStorage.setItem("marcenaria_" + key, JSON.stringify(data));
  } catch (e) {
    console.warn("Erro ao salvar cache:", e);
  }
}
